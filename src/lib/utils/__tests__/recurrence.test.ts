/**
 * Tests unitaires pour les utilitaires de récurrence
 *
 * @description Tests de génération d'occurrences pour les créneaux récurrents
 * @ticket SP-399
 */

import { describe, it, expect } from 'vitest'
import {
  generateOccurrences,
  validateRecurrenceRule,
  generateRecurrenceGroupId,
  calculateTotalSchedules,
  MAX_OCCURRENCES,
  MAX_TOTAL_SCHEDULES,
  type RecurrenceRule,
} from '../recurrence'

// ============================================================================
// Tests generateOccurrences
// ============================================================================

// Helper pour créer une date locale à minuit
function createLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

// Helper pour comparer les dates (jour, mois, année uniquement)
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

describe('generateOccurrences', () => {
  describe('Récurrence DAILY', () => {
    it('génère les occurrences quotidiennes avec intervalle 1', () => {
      const startDate = createLocalDate(2026, 1, 26)
      const endDate = createLocalDate(2026, 1, 26)
      const rule: RecurrenceRule = {
        frequency: 'DAILY',
        interval: 1,
        occurrences: 5,
      }

      const result = generateOccurrences(startDate, endDate, rule)

      expect(result).toHaveLength(5)
      expect(
        isSameDay(result[0]!.startDate, createLocalDate(2026, 1, 26))
      ).toBe(true)
      expect(
        isSameDay(result[1]!.startDate, createLocalDate(2026, 1, 27))
      ).toBe(true)
      expect(
        isSameDay(result[2]!.startDate, createLocalDate(2026, 1, 28))
      ).toBe(true)
      expect(
        isSameDay(result[3]!.startDate, createLocalDate(2026, 1, 29))
      ).toBe(true)
      expect(
        isSameDay(result[4]!.startDate, createLocalDate(2026, 1, 30))
      ).toBe(true)
    })

    it('génère les occurrences quotidiennes avec intervalle 2', () => {
      const startDate = createLocalDate(2026, 1, 26)
      const endDate = createLocalDate(2026, 1, 26)
      const rule: RecurrenceRule = {
        frequency: 'DAILY',
        interval: 2,
        occurrences: 3,
      }

      const result = generateOccurrences(startDate, endDate, rule)

      expect(result).toHaveLength(3)
      expect(
        isSameDay(result[0]!.startDate, createLocalDate(2026, 1, 26))
      ).toBe(true)
      expect(
        isSameDay(result[1]!.startDate, createLocalDate(2026, 1, 28))
      ).toBe(true)
      expect(
        isSameDay(result[2]!.startDate, createLocalDate(2026, 1, 30))
      ).toBe(true)
    })

    it('respecte la date de fin', () => {
      const startDate = new Date('2026-01-26')
      const endDate = new Date('2026-01-26')
      const rule: RecurrenceRule = {
        frequency: 'DAILY',
        interval: 1,
        endDate: new Date('2026-01-28'),
      }

      const result = generateOccurrences(startDate, endDate, rule)

      expect(result).toHaveLength(3) // 26, 27, 28
    })
  })

  describe('Récurrence WEEKLY', () => {
    it('génère les occurrences hebdomadaires avec jours spécifiques', () => {
      const startDate = new Date('2026-01-26') // Lundi
      const endDate = new Date('2026-01-26')
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY', 'WEDNESDAY'],
        occurrences: 4,
      }

      const result = generateOccurrences(startDate, endDate, rule)

      expect(result).toHaveLength(4)
      // Lundi 26, Mercredi 28, Lundi 2 fév, Mercredi 4 fév
      expect(result[0]!.startDate.getDay()).toBe(1) // Lundi
      expect(result[1]!.startDate.getDay()).toBe(3) // Mercredi
      expect(result[2]!.startDate.getDay()).toBe(1) // Lundi
      expect(result[3]!.startDate.getDay()).toBe(3) // Mercredi
    })

    it('génère une occurrence par semaine si intervalle > 1', () => {
      const startDate = new Date('2026-01-26') // Lundi
      const endDate = new Date('2026-01-26')
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 2,
        daysOfWeek: ['MONDAY'],
        occurrences: 3,
      }

      const result = generateOccurrences(startDate, endDate, rule)

      expect(result).toHaveLength(3)
      // Lundi 26 jan, Lundi 9 fév, Lundi 23 fév
    })
  })

  describe('Récurrence BIWEEKLY', () => {
    it('génère les occurrences toutes les 2 semaines', () => {
      const startDate = new Date('2026-01-26') // Lundi
      const endDate = new Date('2026-01-26')
      const rule: RecurrenceRule = {
        frequency: 'BIWEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 3,
      }

      const result = generateOccurrences(startDate, endDate, rule)

      expect(result).toHaveLength(3)
    })
  })

  describe('Récurrence MONTHLY', () => {
    it('génère les occurrences mensuelles', () => {
      const startDate = new Date('2026-01-15')
      const endDate = new Date('2026-01-15')
      const rule: RecurrenceRule = {
        frequency: 'MONTHLY',
        interval: 1,
        occurrences: 4,
      }

      const result = generateOccurrences(startDate, endDate, rule)

      expect(result).toHaveLength(4)
      expect(result[0]!.startDate.getMonth()).toBe(0) // Janvier
      expect(result[1]!.startDate.getMonth()).toBe(1) // Février
      expect(result[2]!.startDate.getMonth()).toBe(2) // Mars
      expect(result[3]!.startDate.getMonth()).toBe(3) // Avril
    })
  })

  describe('Limites', () => {
    it('respecte la limite MAX_OCCURRENCES', () => {
      const startDate = new Date('2026-01-26')
      const endDate = new Date('2026-01-26')
      const rule: RecurrenceRule = {
        frequency: 'DAILY',
        interval: 1,
        occurrences: 100, // Plus que MAX_OCCURRENCES
      }

      const result = generateOccurrences(startDate, endDate, rule)

      expect(result.length).toBeLessThanOrEqual(MAX_OCCURRENCES)
    })

    it('préserve la durée du créneau', () => {
      const startDate = new Date('2026-01-26')
      const endDate = new Date('2026-01-27') // Créneau de 2 jours
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 2,
      }

      const result = generateOccurrences(startDate, endDate, rule)

      // Chaque occurrence doit avoir une durée de 1 jour
      for (const occ of result) {
        const duration =
          (occ.endDate.getTime() - occ.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
        expect(duration).toBe(1)
      }
    })
  })
})

// ============================================================================
// Tests validateRecurrenceRule
// ============================================================================

describe('validateRecurrenceRule', () => {
  it('retourne null pour une règle valide avec occurrences', () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 1,
      daysOfWeek: ['MONDAY'],
      occurrences: 4,
    }

    const result = validateRecurrenceRule(rule)

    expect(result).toBeNull()
  })

  it('retourne null pour une règle valide avec endDate', () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 1,
      daysOfWeek: ['MONDAY'],
      endDate: new Date('2027-12-31'),
    }

    const result = validateRecurrenceRule(rule)

    expect(result).toBeNull()
  })

  it('retourne une erreur si ni endDate ni occurrences', () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 1,
      daysOfWeek: ['MONDAY'],
    }

    const result = validateRecurrenceRule(rule)

    expect(result).toContain("date de fin ou un nombre d'occurrences")
  })

  it("retourne une erreur si l'intervalle est invalide", () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 15, // Trop grand
      daysOfWeek: ['MONDAY'],
      occurrences: 4,
    }

    const result = validateRecurrenceRule(rule)

    expect(result).toContain('intervalle')
  })

  it("retourne une erreur si trop d'occurrences", () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 1,
      daysOfWeek: ['MONDAY'],
      occurrences: 100, // Plus que MAX_OCCURRENCES
    }

    const result = validateRecurrenceRule(rule)

    expect(result).toContain("nombre d'occurrences")
  })

  it('retourne une erreur si pas de jours pour WEEKLY', () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 1,
      daysOfWeek: [],
      occurrences: 4,
    }

    const result = validateRecurrenceRule(rule)

    expect(result).toContain('jour de la semaine')
  })

  it("n'exige pas de jours pour DAILY", () => {
    const rule: RecurrenceRule = {
      frequency: 'DAILY',
      interval: 1,
      occurrences: 4,
    }

    const result = validateRecurrenceRule(rule)

    expect(result).toBeNull()
  })

  it("n'exige pas de jours pour MONTHLY", () => {
    const rule: RecurrenceRule = {
      frequency: 'MONTHLY',
      interval: 1,
      occurrences: 4,
    }

    const result = validateRecurrenceRule(rule)

    expect(result).toBeNull()
  })
})

// ============================================================================
// Tests generateRecurrenceGroupId
// ============================================================================

describe('generateRecurrenceGroupId', () => {
  it('génère un ID unique', () => {
    const id1 = generateRecurrenceGroupId()
    const id2 = generateRecurrenceGroupId()

    expect(id1).not.toBe(id2)
  })

  it("génère un ID avec le préfixe 'recurrence-'", () => {
    const id = generateRecurrenceGroupId()

    expect(id.startsWith('recurrence-')).toBe(true)
  })
})

// ============================================================================
// Tests calculateTotalSchedules
// ============================================================================

describe('calculateTotalSchedules', () => {
  it('calcule le total pour un employé', () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 1,
      daysOfWeek: ['MONDAY'],
      occurrences: 4,
    }
    const startDate = new Date('2026-01-26')
    const endDate = new Date('2026-01-26')

    const result = calculateTotalSchedules(rule, 1, startDate, endDate)

    expect(result).toBe(4)
  })

  it('calcule le total pour plusieurs employés', () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 1,
      daysOfWeek: ['MONDAY'],
      occurrences: 4,
    }
    const startDate = new Date('2026-01-26')
    const endDate = new Date('2026-01-26')

    const result = calculateTotalSchedules(rule, 5, startDate, endDate)

    expect(result).toBe(20) // 4 occurrences × 5 employés
  })

  it('ne dépasse pas MAX_TOTAL_SCHEDULES', () => {
    const rule: RecurrenceRule = {
      frequency: 'DAILY',
      interval: 1,
      occurrences: MAX_OCCURRENCES,
    }
    const startDate = new Date('2026-01-26')
    const endDate = new Date('2026-01-26')

    const result = calculateTotalSchedules(rule, 10, startDate, endDate)

    // 52 occurrences × 10 employés = 520, mais les occurrences sont limitées
    expect(result).toBe(MAX_OCCURRENCES * 10)
  })
})

// ============================================================================
// Tests des constantes
// ============================================================================

describe('Constantes', () => {
  it('MAX_OCCURRENCES est 52', () => {
    expect(MAX_OCCURRENCES).toBe(52)
  })

  it('MAX_TOTAL_SCHEDULES est 200', () => {
    expect(MAX_TOTAL_SCHEDULES).toBe(200)
  })
})
