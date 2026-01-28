/**
 * Tests des utilitaires Leave Management
 *
 * @ticket SP-409
 */

import { describe, it, expect } from 'vitest'
import { calculateWorkingDays, hasEnoughBalance, getRemainingBalance } from '../leave-utils'
import type { LeaveBalanceData } from '../leave-utils'

// Helper : crée une date à un jour précis
// 2026-01-05 = lundi
const monday = new Date(2026, 0, 5)
const tuesday = new Date(2026, 0, 6)
const friday = new Date(2026, 0, 9)
const saturday = new Date(2026, 0, 10)
const sunday = new Date(2026, 0, 11)
const nextFriday = new Date(2026, 0, 16)

describe('calculateWorkingDays', () => {
  describe('Mode MON_FRI (bureaux)', () => {
    it('compte 5 jours pour une semaine complète (lun-ven)', () => {
      expect(calculateWorkingDays(monday, friday, false, 'MON_FRI')).toBe(5)
    })

    it('exclut samedi et dimanche', () => {
      // lun à dim = 5 jours ouvrés (lun-ven)
      expect(calculateWorkingDays(monday, sunday, false, 'MON_FRI')).toBe(5)
    })

    it('retourne 0.5 pour une demi-journée', () => {
      expect(calculateWorkingDays(monday, monday, true, 'MON_FRI')).toBe(0.5)
    })

    it('retourne 10 jours pour deux semaines', () => {
      expect(calculateWorkingDays(monday, nextFriday, false, 'MON_FRI')).toBe(10)
    })
  })

  describe('Mode MON_SAT (commerce 6j)', () => {
    it('compte 6 jours pour lun-sam', () => {
      expect(calculateWorkingDays(monday, saturday, false, 'MON_SAT')).toBe(6)
    })

    it('exclut uniquement le dimanche', () => {
      // lun à dim = 6 jours (lun-sam)
      expect(calculateWorkingDays(monday, sunday, false, 'MON_SAT')).toBe(6)
    })

    it('compte le samedi comme jour travaillé', () => {
      expect(calculateWorkingDays(saturday, saturday, false, 'MON_SAT')).toBe(1)
    })
  })

  describe('Mode ALL_DAYS (commerce 7j/7)', () => {
    it('compte 7 jours pour une semaine complète', () => {
      expect(calculateWorkingDays(monday, sunday, false, 'ALL_DAYS')).toBe(7)
    })

    it('compte samedi et dimanche', () => {
      expect(calculateWorkingDays(saturday, sunday, false, 'ALL_DAYS')).toBe(2)
    })
  })

  describe('Cas limites', () => {
    it('retourne 1 pour même jour début et fin (jour ouvré)', () => {
      expect(calculateWorkingDays(monday, monday, false, 'MON_FRI')).toBe(1)
    })

    it('retourne 0 pour même jour si dimanche en mode MON_FRI', () => {
      expect(calculateWorkingDays(sunday, sunday, false, 'MON_FRI')).toBe(0)
    })

    it('retourne 0 pour samedi en mode MON_FRI', () => {
      expect(calculateWorkingDays(saturday, saturday, false, 'MON_FRI')).toBe(0)
    })

    it('gère correctement les mois avec 31 jours', () => {
      // Janvier 2026 : 31 jours, 22 jours ouvrés (MON_FRI)
      const jan1 = new Date(2026, 0, 1) // jeudi
      const jan31 = new Date(2026, 0, 31) // samedi
      const result = calculateWorkingDays(jan1, jan31, false, 'MON_FRI')
      expect(result).toBe(22)
    })

    it('gère correctement le passage d\'année', () => {
      const dec31 = new Date(2025, 11, 31) // mercredi
      const jan2 = new Date(2026, 0, 2) // vendredi
      const result = calculateWorkingDays(dec31, jan2, false, 'MON_FRI')
      expect(result).toBe(3) // mer, jeu, ven
    })
  })
})

describe('hasEnoughBalance', () => {
  const balance: LeaveBalanceData = {
    paidLeaveTotal: 25,
    paidLeaveUsed: 20,
    rttTotal: 10,
    rttUsed: 8,
  }

  it('retourne true si solde CP suffisant', () => {
    expect(hasEnoughBalance(balance, 'PAID_LEAVE', 5)).toBe(true)
  })

  it('retourne false si solde CP insuffisant', () => {
    expect(hasEnoughBalance(balance, 'PAID_LEAVE', 6)).toBe(false)
  })

  it('retourne true si solde RTT suffisant', () => {
    expect(hasEnoughBalance(balance, 'RTT', 2)).toBe(true)
  })

  it('retourne false si solde RTT insuffisant', () => {
    expect(hasEnoughBalance(balance, 'RTT', 3)).toBe(false)
  })

  it('retourne true pour SICK_LEAVE même sans solde', () => {
    expect(hasEnoughBalance(balance, 'SICK_LEAVE', 100)).toBe(true)
  })

  it('retourne true pour UNPAID_LEAVE', () => {
    expect(hasEnoughBalance(balance, 'UNPAID_LEAVE', 100)).toBe(true)
  })

  it('retourne true pour FAMILY_EVENT', () => {
    expect(hasEnoughBalance(balance, 'FAMILY_EVENT', 100)).toBe(true)
  })
})

describe('getRemainingBalance', () => {
  it('calcule correctement le solde restant', () => {
    const balance: LeaveBalanceData = {
      paidLeaveTotal: 25,
      paidLeaveUsed: 10,
      rttTotal: 12,
      rttUsed: 5,
    }
    const remaining = getRemainingBalance(balance)
    expect(remaining.paidLeave).toBe(15)
    expect(remaining.rtt).toBe(7)
  })

  it('retourne 0 si tout est consommé', () => {
    const balance: LeaveBalanceData = {
      paidLeaveTotal: 25,
      paidLeaveUsed: 25,
      rttTotal: 10,
      rttUsed: 10,
    }
    const remaining = getRemainingBalance(balance)
    expect(remaining.paidLeave).toBe(0)
    expect(remaining.rtt).toBe(0)
  })
})
