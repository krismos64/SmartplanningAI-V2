/**
 * Tests de validation de la migration schema SP-350 (per-seat model)
 *
 * Vérifie que les enums, types et configurations sont cohérents
 * après la migration SubscriptionPlan: FREE/PER_SEAT
 *
 * @ticket SP-350
 */

import { describe, it, expect } from 'vitest'
import {
  subscriptionPlanEnum,
  subscriptionStatusEnum,
  subscriptionPlanLabels,
  subscriptionStatusLabels,
} from '@/lib/validations/company'
import { PRICING } from '@/lib/config/pricing'

describe('SP-350: Schema Migration per-seat', () => {
  // ==========================================================================
  // SubscriptionPlan enum
  // ==========================================================================

  describe('SubscriptionPlan enum (FREE + PER_SEAT)', () => {
    it('devrait accepter FREE', () => {
      expect(subscriptionPlanEnum.parse('FREE')).toBe('FREE')
    })

    it('devrait accepter PER_SEAT', () => {
      expect(subscriptionPlanEnum.parse('PER_SEAT')).toBe('PER_SEAT')
    })

    it('devrait rejeter les anciens plans supprimés', () => {
      const oldPlans = ['STARTER', 'BUSINESS', 'ENTERPRISE', 'PROFESSIONAL']
      oldPlans.forEach((plan) => {
        expect(() => subscriptionPlanEnum.parse(plan)).toThrow()
      })
    })

    it('devrait avoir exactement 2 valeurs', () => {
      expect(subscriptionPlanEnum.options).toHaveLength(2)
      expect(subscriptionPlanEnum.options).toEqual(['FREE', 'PER_SEAT'])
    })
  })

  // ==========================================================================
  // SubscriptionStatus enum
  // ==========================================================================

  describe('SubscriptionStatus enum (avec INCOMPLETE)', () => {
    it('devrait inclure INCOMPLETE (nouveau SP-350)', () => {
      expect(subscriptionStatusEnum.parse('INCOMPLETE')).toBe('INCOMPLETE')
    })

    it('devrait conserver tous les statuts existants', () => {
      const existingStatuses = [
        'TRIAL',
        'ACTIVE',
        'PAST_DUE',
        'CANCELED',
        'EXPIRED',
      ]
      existingStatuses.forEach((status) => {
        expect(subscriptionStatusEnum.parse(status)).toBe(status)
      })
    })

    it('devrait avoir exactement 6 valeurs', () => {
      expect(subscriptionStatusEnum.options).toHaveLength(6)
    })
  })

  // ==========================================================================
  // Labels FR
  // ==========================================================================

  describe('Labels français', () => {
    it('devrait avoir un label pour chaque plan', () => {
      expect(Object.keys(subscriptionPlanLabels)).toHaveLength(2)
      expect(subscriptionPlanLabels.FREE).toBeDefined()
      expect(subscriptionPlanLabels.PER_SEAT).toBeDefined()
    })

    it('devrait avoir un label pour chaque statut (y compris INCOMPLETE)', () => {
      expect(Object.keys(subscriptionStatusLabels)).toHaveLength(6)
      expect(subscriptionStatusLabels.INCOMPLETE).toBe('Paiement incomplet')
    })

    it('le label PER_SEAT devrait mentionner le prix', () => {
      expect(subscriptionPlanLabels.PER_SEAT).toContain('2,90')
      expect(subscriptionPlanLabels.PER_SEAT).toContain('employé')
    })
  })

  // ==========================================================================
  // PRICING config cohérence
  // ==========================================================================

  describe('PRICING config cohérence avec per-seat', () => {
    it('devrait avoir un prix par employé de 2.90€', () => {
      expect(PRICING.PRICE_PER_EMPLOYEE).toBe(2.9)
    })

    it('devrait avoir un essai de 21 jours', () => {
      expect(PRICING.TRIAL_DAYS).toBe(21)
    })

    it('devrait utiliser EUR comme devise', () => {
      expect(PRICING.CURRENCY).toBe('EUR')
    })

    it('le prix en centimes devrait être 290', () => {
      expect(Math.round(PRICING.PRICE_PER_EMPLOYEE * 100)).toBe(290)
    })

    it('devrait avoir des limites employés cohérentes', () => {
      expect(PRICING.MIN_EMPLOYEES).toBe(1)
      expect(PRICING.MAX_EMPLOYEES).toBe(250)
      expect(PRICING.DEFAULT_EMPLOYEES).toBe(10)
    })
  })

  // ==========================================================================
  // Cohérence inter-modules
  // ==========================================================================

  describe('Cohérence inter-modules', () => {
    it('les plans Zod devraient correspondre aux labels', () => {
      const planValues = subscriptionPlanEnum.options
      const labelKeys = Object.keys(subscriptionPlanLabels)
      expect(planValues.sort()).toEqual(labelKeys.sort())
    })

    it('les statuts Zod devraient correspondre aux labels', () => {
      const statusValues = subscriptionStatusEnum.options
      const labelKeys = Object.keys(subscriptionStatusLabels)
      expect(statusValues.sort()).toEqual(labelKeys.sort())
    })
  })
})
