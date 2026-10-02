/**
 * Utilitaires métier pour le module Leave Management
 *
 * @ticket SP-409
 * @description Calcul de jours ouvrés, vérification de solde, labels
 */

import { LeaveType } from '@prisma/client'
import type { WorkingDaysMode } from '@/lib/validations/leave'
import { addCalendarDays, toCalendarDay } from '@/lib/utils/schedule-date'

// ─── Interface LeaveBalance (miroir Prisma) ─────────────────────────

export interface LeaveBalanceData {
  paidLeaveTotal: number
  paidLeaveUsed: number
  rttTotal: number
  rttUsed: number
}

// ─── Calcul de jours ouvrés ─────────────────────────────────────────

/**
 * Calcule le nombre de jours ouvrés entre deux dates
 *
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @param halfDay - Si true, retourne 0.5
 * @param mode - Mode de calcul selon le type d'entreprise
 * @returns Nombre de jours ouvrés
 */
export function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  halfDay: boolean = false,
  mode: WorkingDaysMode = 'MON_FRI'
): number {
  if (halfDay) return 0.5

  // SP-609 : parcours en jours calendaires de Paris. setHours et getDay
  // suivaient le fuseau du processus : en production (UTC), un congé du lundi
  // au vendredi saisi au calendrier, stocké à 22:00 UTC la veille, était
  // compté du dimanche au jeudi, soit 4 jours au lieu de 5.
  let count = 0
  let current = toCalendarDay(startDate)
  const end = toCalendarDay(endDate)

  while (current <= end) {
    const dayOfWeek = current.getUTCDay() // 0 = Dimanche, 6 = Samedi

    const isWorkingDay =
      mode === 'ALL_DAYS'
        ? true
        : mode === 'MON_SAT'
          ? dayOfWeek !== 0
          : dayOfWeek !== 0 && dayOfWeek !== 6

    if (isWorkingDay) count++
    current = addCalendarDays(current, 1)
  }

  return count
}

// ─── Vérification de solde ──────────────────────────────────────────

/**
 * Vérifie si un employé a un solde suffisant pour sa demande
 */
export function hasEnoughBalance(
  balance: LeaveBalanceData,
  type: LeaveType,
  days: number
): boolean {
  if (type === LeaveType.PAID_LEAVE) {
    return balance.paidLeaveTotal - balance.paidLeaveUsed >= days
  }
  if (type === LeaveType.RTT) {
    return balance.rttTotal - balance.rttUsed >= days
  }
  // Les autres types ne décomptent pas de solde
  return true
}

/**
 * Calcule le solde restant
 */
export function getRemainingBalance(balance: LeaveBalanceData): {
  paidLeave: number
  rtt: number
} {
  return {
    paidLeave: balance.paidLeaveTotal - balance.paidLeaveUsed,
    rtt: balance.rttTotal - balance.rttUsed,
  }
}
