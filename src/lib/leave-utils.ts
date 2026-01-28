/**
 * Utilitaires métier pour le module Leave Management
 *
 * @ticket SP-409
 * @description Calcul de jours ouvrés, vérification de solde, labels
 */

import { LeaveType } from '@prisma/client'
import type { WorkingDaysMode } from '@/lib/validations/leave'

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

  let count = 0
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    const dayOfWeek = current.getDay() // 0 = Dimanche, 6 = Samedi

    const isWorkingDay =
      mode === 'ALL_DAYS'
        ? true
        : mode === 'MON_SAT'
          ? dayOfWeek !== 0
          : dayOfWeek !== 0 && dayOfWeek !== 6

    if (isWorkingDay) count++
    current.setDate(current.getDate() + 1)
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
