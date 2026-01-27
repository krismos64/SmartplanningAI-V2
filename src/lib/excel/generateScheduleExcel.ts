/**
 * Generateur Excel pour l'export du planning
 *
 * @description Genere un fichier .xlsx avec 3 feuilles :
 * - Planning detaille (employes, dates, horaires, types)
 * - Resume par employe (heures totales par type)
 * - Statistiques globales
 * @ticket SP-404
 */

import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  scheduleTypeLabels,
  scheduleStatusLabels,
} from '@/lib/validations/schedule'
import type { ScheduleType, ScheduleStatus } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

export interface ScheduleForExcel {
  id: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  type: string
  status: string
  title: string | null
  description: string | null
  location: string | null
  employee: { firstName: string; lastName: string; weeklyHours: number }
  team: { name: string } | null
}

export interface ExcelGeneratorOptions {
  schedules: ScheduleForExcel[]
  period: { start: Date; end: Date }
  companyName: string
}

// ============================================================================
// Helpers
// ============================================================================

function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  const startMinutes = (startH ?? 0) * 60 + (startM ?? 0)
  const endMinutes = (endH ?? 0) * 60 + (endM ?? 0)
  return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100
}

function generateSummaryByEmployee(schedules: ScheduleForExcel[]) {
  const byEmployee = new Map<
    string,
    {
      total: number
      count: number
      byType: Record<string, number>
      weeklyHours: number
    }
  >()

  for (const s of schedules) {
    const name = `${s.employee.lastName} ${s.employee.firstName}`
    const duration = calculateDuration(s.startTime, s.endTime)

    if (!byEmployee.has(name)) {
      byEmployee.set(name, {
        total: 0,
        count: 0,
        byType: {},
        weeklyHours: s.employee.weeklyHours,
      })
    }

    const emp = byEmployee.get(name)!
    // Ne pas compter les repos dans le total heures travaillées
    if (s.type !== 'REST') {
      emp.total += duration
    }
    emp.count += 1
    emp.byType[s.type] = (emp.byType[s.type] || 0) + duration
  }

  return Array.from(byEmployee.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, data]) => ({
      Employé: name,
      'Heures contrat': data.weeklyHours,
      'Total heures': Number(data.total.toFixed(2)),
      Différence: Number((data.total - data.weeklyHours).toFixed(2)),
      'Nb shifts': data.count,
      Travail: Number((data.byType['WORK'] || 0).toFixed(2)),
      Réunion: Number((data.byType['MEETING'] || 0).toFixed(2)),
      Pause: Number((data.byType['BREAK'] || 0).toFixed(2)),
      Formation: Number((data.byType['TRAINING'] || 0).toFixed(2)),
      Télétravail: Number((data.byType['REMOTE'] || 0).toFixed(2)),
      Astreinte: Number((data.byType['ON_CALL'] || 0).toFixed(2)),
      'Heures sup.': Number((data.byType['OVERTIME'] || 0).toFixed(2)),
      'Repos (jours)': Number((data.byType['REST'] || 0).toFixed(2)),
    }))
}

function generateStatistics(
  schedules: ScheduleForExcel[],
  period: { start: Date; end: Date },
  companyName: string
): (string | number)[][] {
  const totalHours = schedules.reduce(
    (acc, s) => acc + calculateDuration(s.startTime, s.endTime),
    0
  )
  const uniqueEmployees = new Set(
    schedules.map((s) => `${s.employee.firstName}${s.employee.lastName}`)
  ).size

  return [
    ['Statistiques du Planning', ''],
    ['', ''],
    ['Entreprise', companyName],
    [
      'Période',
      `${format(period.start, 'dd/MM/yyyy')} - ${format(period.end, 'dd/MM/yyyy')}`,
    ],
    ['', ''],
    ['Total shifts', schedules.length],
    ['Total heures', Number(totalHours.toFixed(2))],
    ['Employés concernés', uniqueEmployees],
    [
      'Moyenne heures/employé',
      uniqueEmployees > 0
        ? Number((totalHours / uniqueEmployees).toFixed(2))
        : 0,
    ],
    ['', ''],
    ['Généré le', format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })],
  ]
}

// ============================================================================
// Fonction principale
// ============================================================================

export function generateScheduleExcel({
  schedules,
  period,
  companyName,
}: ExcelGeneratorOptions): Buffer {
  const wb = XLSX.utils.book_new()

  // === Feuille 1 : Planning détaillé ===
  const planningData = schedules.map((s) => ({
    Employé: `${s.employee.lastName} ${s.employee.firstName}`,
    Date: format(new Date(s.startDate), 'dd/MM/yyyy', { locale: fr }),
    Jour: format(new Date(s.startDate), 'EEEE', { locale: fr }),
    Début: s.startTime,
    Fin: s.endTime,
    'Durée (h)': calculateDuration(s.startTime, s.endTime),
    Type: scheduleTypeLabels[s.type as ScheduleType] || s.type,
    Statut: scheduleStatusLabels[s.status as ScheduleStatus] || s.status,
    Équipe: s.team?.name || '-',
    Lieu: s.location || '-',
    Description: s.description || '-',
  }))

  const wsPlanning = XLSX.utils.json_to_sheet(planningData)
  wsPlanning['!cols'] = [
    { wch: 22 }, // Employé
    { wch: 12 }, // Date
    { wch: 10 }, // Jour
    { wch: 8 }, // Début
    { wch: 8 }, // Fin
    { wch: 10 }, // Durée
    { wch: 14 }, // Type
    { wch: 12 }, // Statut
    { wch: 18 }, // Équipe
    { wch: 15 }, // Lieu
    { wch: 30 }, // Description
  ]
  XLSX.utils.book_append_sheet(wb, wsPlanning, 'Planning')

  // === Feuille 2 : Résumé par employé ===
  const summaryByEmployee = generateSummaryByEmployee(schedules)
  const wsSummary = XLSX.utils.json_to_sheet(summaryByEmployee)
  wsSummary['!cols'] = [
    { wch: 22 }, // Employé
    { wch: 14 }, // Heures contrat
    { wch: 12 }, // Total heures
    { wch: 12 }, // Différence
    { wch: 10 }, // Nb shifts
    { wch: 14 }, // Travail
    { wch: 14 }, // Réunion
    { wch: 14 }, // Pause
    { wch: 14 }, // Formation
    { wch: 14 }, // Télétravail
    { wch: 14 }, // Astreinte
    { wch: 14 }, // Heures sup.
    { wch: 14 }, // Repos (jours)
  ]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé')

  // === Feuille 3 : Statistiques globales ===
  const stats = generateStatistics(schedules, period, companyName)
  const wsStats = XLSX.utils.aoa_to_sheet(stats)
  wsStats['!cols'] = [{ wch: 25 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiques')

  return Buffer.from(
    XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as ArrayBuffer
  )
}
