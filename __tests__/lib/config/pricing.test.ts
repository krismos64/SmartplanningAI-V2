/**
 * Tests unitaires pour les constantes et fonctions pricing
 *
 * @ticket SP-355
 */

import { describe, it, expect } from 'vitest'
import {
  PRICING,
  INCLUDED_FEATURES,
  calculateMonthlyPrice,
  calculateYearlyPrice,
  formatPrice,
} from '@/lib/config/pricing'

describe('Pricing Config', () => {
  describe('PRICING constants', () => {
    it('a un prix par employé de 2,90€', () => {
      expect(PRICING.PRICE_PER_EMPLOYEE).toBe(2.9)
    })

    it('a une devise EUR', () => {
      expect(PRICING.CURRENCY).toBe('EUR')
    })

    it('a un minimum de 1 employé', () => {
      expect(PRICING.MIN_EMPLOYEES).toBe(1)
    })

    it('a un maximum de 250 employés', () => {
      expect(PRICING.MAX_EMPLOYEES).toBe(250)
    })

    it('a un essai de 21 jours', () => {
      expect(PRICING.TRIAL_DAYS).toBe(21)
    })

    it('est sans engagement', () => {
      expect(PRICING.NO_COMMITMENT).toBe(true)
    })

    it('est sans carte bancaire', () => {
      expect(PRICING.NO_CREDIT_CARD).toBe(true)
    })
  })

  describe('calculateMonthlyPrice', () => {
    it('calcule correctement pour 1 employé', () => {
      expect(calculateMonthlyPrice(1)).toBe(2.9)
    })

    it('calcule correctement pour 10 employés (défaut)', () => {
      expect(calculateMonthlyPrice(10)).toBe(29)
    })

    it('calcule correctement pour 50 employés', () => {
      expect(calculateMonthlyPrice(50)).toBe(145)
    })

    it('calcule correctement pour 250 employés (max)', () => {
      expect(calculateMonthlyPrice(250)).toBe(725)
    })

    it('clamp la valeur au minimum (0 → 1)', () => {
      expect(calculateMonthlyPrice(0)).toBe(2.9)
    })

    it('clamp la valeur au minimum (négatif → 1)', () => {
      expect(calculateMonthlyPrice(-5)).toBe(2.9)
    })

    it('clamp la valeur au maximum (300 → 250)', () => {
      expect(calculateMonthlyPrice(300)).toBe(725)
    })

    it('arrondit les décimaux', () => {
      expect(calculateMonthlyPrice(7.6)).toBe(23.2)
    })
  })

  describe('calculateYearlyPrice', () => {
    it('calcule le prix annuel pour 1 employé', () => {
      expect(calculateYearlyPrice(1)).toBe(34.8)
    })

    it('calcule le prix annuel pour 10 employés', () => {
      expect(calculateYearlyPrice(10)).toBe(348)
    })

    it('est cohérent avec mensuel × 12', () => {
      const monthly = calculateMonthlyPrice(25)
      expect(calculateYearlyPrice(25)).toBe(
        Math.round(monthly * 12 * 100) / 100
      )
    })
  })

  describe('formatPrice', () => {
    it('formate un prix entier', () => {
      const result = formatPrice(29)
      expect(result).toContain('29')
      expect(result).toContain('€')
    })

    it('formate un prix décimal', () => {
      const result = formatPrice(2.9)
      expect(result).toContain('2')
      expect(result).toContain('90')
      expect(result).toContain('€')
    })

    it('formate zéro', () => {
      const result = formatPrice(0)
      expect(result).toContain('0')
      expect(result).toContain('€')
    })
  })

  describe('INCLUDED_FEATURES', () => {
    it('contient au moins 8 features', () => {
      expect(INCLUDED_FEATURES.length).toBeGreaterThanOrEqual(8)
    })

    it('contient des features clés', () => {
      const features = [...INCLUDED_FEATURES]
      expect(features.some((f) => f.toLowerCase().includes('planning'))).toBe(
        true
      )
      expect(features.some((f) => f.toLowerCase().includes('congé'))).toBe(
        true
      )
      expect(features.some((f) => f.toLowerCase().includes('rgpd'))).toBe(true)
    })
  })
})
