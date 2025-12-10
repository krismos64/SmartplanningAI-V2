/**
 * Service de base pour les statistiques Dashboard
 *
 * Fonctions utilitaires partagees entre tous les services de stats :
 * - Calcul des tendances entre periodes
 * - Generation des periodes de dates
 * - Verification des acces multi-tenant
 * - Calcul des heures entre deux horaires
 *
 * @ticket SP-144
 * @see Context7 - Prisma Best Practices Data Access Layer
 */

import { prisma } from '@/lib/prisma'
import type { DateRange } from './types'

// ============================================================================
// Calculs de dates
// ============================================================================

/**
 * Calcule le pourcentage de tendance entre deux valeurs
 *
 * @param current - Valeur de la periode courante
 * @param previous - Valeur de la periode precedente
 * @returns Pourcentage de variation (arrondi)
 *
 * @example
 * calculateTrend(120, 100) // 20 (augmentation de 20%)
 * calculateTrend(80, 100)  // -20 (diminution de 20%)
 * calculateTrend(100, 0)   // 100 (croissance infinie → 100%)
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Retourne la periode par defaut (mois courant)
 *
 * @returns DateRange du 1er au dernier jour du mois courant
 */
export function getDefaultDateRange(): DateRange {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  from.setHours(0, 0, 0, 0)

  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  to.setHours(23, 59, 59, 999)

  return { from, to }
}

/**
 * Calcule la periode precedente pour comparaison
 *
 * @param range - Periode courante
 * @returns Periode precedente de meme duree
 *
 * @example
 * // Si range = janvier 2025
 * // Retourne decembre 2024
 */
export function getPreviousPeriod(range: DateRange): DateRange {
  const duration = range.to.getTime() - range.from.getTime()
  return {
    from: new Date(range.from.getTime() - duration - 1),
    to: new Date(range.from.getTime() - 1),
  }
}

/**
 * Retourne le debut de la semaine (lundi) pour une date donnee
 *
 * @param date - Date de reference
 * @returns Date du lundi de la semaine
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Ajustement pour que lundi = 0
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const weekStart = new Date(d.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Retourne la fin de la semaine (dimanche) pour une date donnee
 *
 * @param date - Date de reference
 * @returns Date du dimanche de la semaine
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

/**
 * Retourne le debut de l'annee pour une date donnee
 *
 * @param date - Date de reference
 * @returns 1er janvier de l'annee
 */
export function getYearStart(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0)
}

/**
 * Retourne les X derniers mois sous forme de labels
 *
 * @param count - Nombre de mois (defaut: 6)
 * @returns Array de labels au format "Jan", "Fev", etc.
 */
export function getLastMonthsLabels(count: number = 6): string[] {
  const months = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Août',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ]
  const result: string[] = []
  const now = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12
    const month = months[monthIndex]
    if (month) {
      result.push(month)
    }
  }

  return result
}

// ============================================================================
// Calculs d'heures
// ============================================================================

/**
 * Calcule les heures entre deux horaires (format HH:mm)
 *
 * @param startTime - Heure de debut (format "HH:mm")
 * @param endTime - Heure de fin (format "HH:mm")
 * @returns Nombre d'heures (decimal)
 *
 * @example
 * calculateHoursBetween("09:00", "17:00") // 8
 * calculateHoursBetween("09:00", "12:30") // 3.5
 */
export function calculateHoursBetween(
  startTime: string,
  endTime: string
): number {
  const startParts = startTime.split(':').map(Number)
  const endParts = endTime.split(':').map(Number)

  const startHour = startParts[0] ?? 0
  const startMin = startParts[1] ?? 0
  const endHour = endParts[0] ?? 0
  const endMin = endParts[1] ?? 0

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  // Gestion du cas ou endTime < startTime (shift de nuit)
  const diff =
    endMinutes >= startMinutes
      ? endMinutes - startMinutes
      : 24 * 60 - startMinutes + endMinutes

  return diff / 60
}

/**
 * Arrondit un nombre a une decimale
 *
 * @param value - Valeur a arrondir
 * @returns Valeur arrondie
 */
export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

// ============================================================================
// Verification des acces multi-tenant
// ============================================================================

/**
 * Verifie qu'un utilisateur a acces a une entreprise
 *
 * @param userId - ID de l'utilisateur
 * @param companyId - ID de l'entreprise
 * @returns true si l'acces est autorise
 *
 * Regles :
 * - SYSTEM_ADMIN : acces a toutes les entreprises
 * - Autres roles : uniquement leur propre entreprise
 */
export async function verifyCompanyAccess(
  userId: string,
  companyId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      companyId: true,
    },
  })

  if (!user) return false

  // SYSTEM_ADMIN a acces a tout
  if (user.role === 'SYSTEM_ADMIN') return true

  // Autres roles : uniquement leur entreprise
  return user.companyId === companyId
}

/**
 * Verifie qu'un utilisateur est bien un employe de l'entreprise
 *
 * @param employeeId - ID de l'employe
 * @param companyId - ID de l'entreprise
 * @returns true si l'employe appartient a l'entreprise
 */
export async function verifyEmployeeBelongsToCompany(
  employeeId: string,
  companyId: string
): Promise<boolean> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { companyId: true },
  })

  return employee?.companyId === companyId
}

/**
 * Verifie qu'un manager gere bien une equipe
 *
 * @param managerId - ID de l'employe manager
 * @param teamId - ID de l'equipe
 * @returns true si le manager gere l'equipe
 */
export async function verifyManagerOfTeam(
  managerId: string,
  teamId: string
): Promise<boolean> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { managerId: true },
  })

  return team?.managerId === managerId
}

// ============================================================================
// Formatage des dates pour les charts
// ============================================================================

/**
 * Formate une date en string lisible pour les charts
 *
 * @param date - Date a formater
 * @param format - Format souhaite ('day', 'month', 'short')
 * @returns Date formatee
 */
export function formatDateForChart(
  date: Date,
  format: 'day' | 'month' | 'short' = 'short'
): string {
  const options: Intl.DateTimeFormatOptions =
    format === 'day'
      ? { day: '2-digit', month: '2-digit' }
      : format === 'month'
        ? { month: 'short', year: '2-digit' }
        : { day: '2-digit', month: 'short' }

  return date.toLocaleDateString('fr-FR', options)
}

/**
 * Genere les labels des jours de la semaine en francais
 */
export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

/**
 * Calcule le nombre de jours ouvrés entre deux dates
 *
 * @param startDate - Date de debut
 * @param endDate - Date de fin
 * @returns Nombre de jours ouvrés
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    const day = current.getDay()
    // Exclure samedi (6) et dimanche (0)
    if (day !== 0 && day !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}
