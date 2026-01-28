/**
 * Tests des schémas de validation Leave Management
 *
 * @ticket SP-409
 */

import { describe, it, expect } from 'vitest'
import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
  updateLeaveBalanceSchema,
  leaveRequestFiltersSchema,
} from '../leave'

// Helper : date dans le futur (72h)
const futureDate = (daysFromNow: number) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(12, 0, 0, 0)
  return d
}

const validCreateInput = {
  type: 'PAID_LEAVE' as const,
  startDate: futureDate(5),
  endDate: futureDate(10),
  halfDay: false,
  reason: 'Vacances',
  employeeId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
}

// Génère un CUID valide pour les tests
const cuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx'

describe('Leave Validations', () => {
  // ─── createLeaveRequestSchema ───────────────────────────────────

  describe('createLeaveRequestSchema', () => {
    it('valide une demande correcte', () => {
      const result = createLeaveRequestSchema.safeParse(validCreateInput)
      expect(result.success).toBe(true)
    })

    it('refuse si date fin avant date début', () => {
      const result = createLeaveRequestSchema.safeParse({
        ...validCreateInput,
        startDate: futureDate(10),
        endDate: futureDate(5),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('endDate'))).toBe(true)
      }
    })

    it('refuse si halfDay sans halfDayPeriod', () => {
      const result = createLeaveRequestSchema.safeParse({
        ...validCreateInput,
        halfDay: true,
        halfDayPeriod: null,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('halfDayPeriod'))).toBe(true)
      }
    })

    it('valide halfDay avec halfDayPeriod AM', () => {
      const result = createLeaveRequestSchema.safeParse({
        ...validCreateInput,
        halfDay: true,
        halfDayPeriod: 'AM',
      })
      expect(result.success).toBe(true)
    })

    it('refuse si délai < 48h (sauf SICK_LEAVE)', () => {
      const result = createLeaveRequestSchema.safeParse({
        ...validCreateInput,
        startDate: new Date(), // maintenant = < 48h
        endDate: futureDate(1),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('startDate'))).toBe(true)
      }
    })

    it('accepte SICK_LEAVE sans délai 48h', () => {
      const tomorrow = new Date()
      tomorrow.setHours(tomorrow.getHours() + 1)
      const result = createLeaveRequestSchema.safeParse({
        ...validCreateInput,
        type: 'SICK_LEAVE',
        startDate: tomorrow,
        endDate: futureDate(3),
      })
      expect(result.success).toBe(true)
    })

    it('accepte FAMILY_EVENT sans délai 48h', () => {
      const tomorrow = new Date()
      tomorrow.setHours(tomorrow.getHours() + 1)
      const result = createLeaveRequestSchema.safeParse({
        ...validCreateInput,
        type: 'FAMILY_EVENT',
        startDate: tomorrow,
        endDate: futureDate(3),
      })
      expect(result.success).toBe(true)
    })

    it('refuse un employeeId invalide', () => {
      const result = createLeaveRequestSchema.safeParse({
        ...validCreateInput,
        employeeId: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('refuse une raison de plus de 500 caractères', () => {
      const result = createLeaveRequestSchema.safeParse({
        ...validCreateInput,
        reason: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })
  })

  // ─── updateLeaveRequestSchema ───────────────────────────────────

  describe('updateLeaveRequestSchema', () => {
    it('valide un refus avec commentaire', () => {
      const result = updateLeaveRequestSchema.safeParse({
        status: 'REJECTED',
        reviewComment: 'Effectifs insuffisants',
      })
      expect(result.success).toBe(true)
    })

    it('refuse un refus sans commentaire', () => {
      const result = updateLeaveRequestSchema.safeParse({
        status: 'REJECTED',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('reviewComment'))).toBe(true)
      }
    })

    it('refuse un refus avec commentaire vide', () => {
      const result = updateLeaveRequestSchema.safeParse({
        status: 'REJECTED',
        reviewComment: '',
      })
      expect(result.success).toBe(false)
    })

    it('accepte une approbation sans commentaire', () => {
      const result = updateLeaveRequestSchema.safeParse({
        status: 'APPROVED',
      })
      expect(result.success).toBe(true)
    })

    it('accepte une annulation sans commentaire', () => {
      const result = updateLeaveRequestSchema.safeParse({
        status: 'CANCELLED',
      })
      expect(result.success).toBe(true)
    })
  })

  // ─── updateLeaveBalanceSchema ───────────────────────────────────

  describe('updateLeaveBalanceSchema', () => {
    it('refuse si paidLeaveUsed > paidLeaveTotal', () => {
      const result = updateLeaveBalanceSchema.safeParse({
        paidLeaveTotal: 25,
        paidLeaveUsed: 30,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('paidLeaveUsed'))).toBe(true)
      }
    })

    it('refuse si rttUsed > rttTotal', () => {
      const result = updateLeaveBalanceSchema.safeParse({
        rttTotal: 10,
        rttUsed: 15,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('rttUsed'))).toBe(true)
      }
    })

    it('valide des valeurs correctes', () => {
      const result = updateLeaveBalanceSchema.safeParse({
        paidLeaveTotal: 25,
        paidLeaveUsed: 10,
        rttTotal: 12,
        rttUsed: 5,
      })
      expect(result.success).toBe(true)
    })

    it('refuse un total négatif', () => {
      const result = updateLeaveBalanceSchema.safeParse({
        paidLeaveTotal: -1,
      })
      expect(result.success).toBe(false)
    })

    it('refuse un total CP > 100', () => {
      const result = updateLeaveBalanceSchema.safeParse({
        paidLeaveTotal: 101,
      })
      expect(result.success).toBe(false)
    })
  })

  // ─── leaveRequestFiltersSchema ──────────────────────────────────

  describe('leaveRequestFiltersSchema', () => {
    it('valide un filtre vide', () => {
      const result = leaveRequestFiltersSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('valide un filtre complet', () => {
      const result = leaveRequestFiltersSchema.safeParse({
        status: 'PENDING',
        type: 'PAID_LEAVE',
        employeeId: cuid,
        startDate: new Date(),
        endDate: new Date(),
      })
      expect(result.success).toBe(true)
    })

    it('refuse un status invalide', () => {
      const result = leaveRequestFiltersSchema.safeParse({
        status: 'INVALID',
      })
      expect(result.success).toBe(false)
    })
  })
})
