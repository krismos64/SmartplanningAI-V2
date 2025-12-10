/**
 * Tests unitaires pour les utilitaires de formatage
 *
 * @ticket SP-142
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  formatNumber,
  formatPercent,
  formatCurrency,
  formatHours,
  formatDays,
  formatCompact,
  formatTrend,
  formatRelativeDate,
} from '@/lib/utils/formatters'

describe('formatters', () => {
  describe('formatNumber', () => {
    it('formate les entiers avec separateurs de milliers', () => {
      expect(formatNumber(1234567)).toMatch(/1\s*234\s*567/)
    })

    it('formate les petits nombres sans separateur', () => {
      expect(formatNumber(123)).toBe('123')
    })

    it('formate avec decimales specifiees', () => {
      expect(formatNumber(1234.567, 2)).toMatch(/1\s*234,57/)
    })

    it('gere zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('gere les nombres negatifs', () => {
      expect(formatNumber(-1234)).toMatch(/-1\s*234/)
    })
  })

  describe('formatPercent', () => {
    it('formate un pourcentage simple', () => {
      expect(formatPercent(75)).toMatch(/75,0\s*%/)
    })

    it('formate avec decimales personnalisees', () => {
      expect(formatPercent(75.55, 2)).toMatch(/75,55\s*%/)
    })

    it('formate un ratio 0-1 en pourcentage', () => {
      expect(formatPercent(0.755, 1, true)).toMatch(/75,5\s*%/)
    })

    it('gere 0%', () => {
      expect(formatPercent(0)).toMatch(/0,0\s*%/)
    })

    it('gere 100%', () => {
      expect(formatPercent(100)).toMatch(/100,0\s*%/)
    })
  })

  describe('formatCurrency', () => {
    it('formate en euros sans decimales par defaut', () => {
      const result = formatCurrency(1234)
      expect(result).toMatch(/1\s*234/)
      expect(result).toContain('€')
    })

    it('formate avec decimales', () => {
      const result = formatCurrency(1234.56, 2)
      expect(result).toMatch(/1\s*234,56/)
      expect(result).toContain('€')
    })

    it('arrondit les montants', () => {
      const result = formatCurrency(1234.56)
      expect(result).toMatch(/1\s*235/)
    })

    it('gere zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
      expect(result).toContain('€')
    })
  })

  describe('formatHours', () => {
    it('formate les heures entieres', () => {
      expect(formatHours(8)).toBe('8h')
    })

    it('formate les demi-heures', () => {
      expect(formatHours(7.5)).toBe('7h30')
    })

    it('formate les quarts d heure', () => {
      expect(formatHours(7.25)).toBe('7h15')
    })

    it('formate sans minutes si demande', () => {
      expect(formatHours(7.5, false)).toMatch(/7,5h/)
    })

    it('gere zero', () => {
      expect(formatHours(0)).toBe('0h')
    })

    it('formate les grands nombres d heures', () => {
      expect(formatHours(160)).toMatch(/160h/)
    })
  })

  describe('formatDays', () => {
    it('formate les jours entiers', () => {
      expect(formatDays(5)).toBe('5 j')
    })

    it('formate les demi-journees', () => {
      expect(formatDays(2.5)).toBe('2,5 j')
    })

    it('gere zero', () => {
      expect(formatDays(0)).toBe('0 j')
    })
  })

  describe('formatCompact', () => {
    it('formate les milliers', () => {
      const result = formatCompact(1500)
      expect(result).toMatch(/1,5\s*k/i)
    })

    it('formate les millions', () => {
      const result = formatCompact(1500000)
      expect(result).toMatch(/1,5\s*M/i)
    })

    it('ne compacte pas les petits nombres', () => {
      expect(formatCompact(999)).toBe('999')
    })
  })

  describe('formatTrend', () => {
    it('formate une tendance positive avec signe +', () => {
      expect(formatTrend(12.5)).toMatch(/\+12,5\s*%/)
    })

    it('formate une tendance negative avec signe -', () => {
      expect(formatTrend(-5.3)).toMatch(/-5,3\s*%/)
    })

    it('formate zero sans signe', () => {
      expect(formatTrend(0)).toMatch(/0,0\s*%/)
    })

    it('respecte les decimales personnalisees', () => {
      expect(formatTrend(12.555, 2)).toMatch(/\+12,56\s*%/)
    })
  })

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      // Mock la date actuelle
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('retourne "Aujourd\'hui" pour la date du jour', () => {
      expect(formatRelativeDate(new Date('2024-06-15'))).toBe("Aujourd'hui")
    })

    it('retourne "Demain" pour le lendemain', () => {
      expect(formatRelativeDate(new Date('2024-06-16'))).toBe('Demain')
    })

    it('retourne "Hier" pour la veille', () => {
      expect(formatRelativeDate(new Date('2024-06-14'))).toBe('Hier')
    })

    it('retourne "Dans X jours" pour les dates proches', () => {
      expect(formatRelativeDate(new Date('2024-06-18'))).toBe('Dans 3 jours')
    })

    it('retourne "Il y a X jours" pour les dates passees proches', () => {
      expect(formatRelativeDate(new Date('2024-06-12'))).toBe('Il y a 3 jours')
    })

    it('retourne une date formatee pour les dates lointaines', () => {
      const result = formatRelativeDate(new Date('2024-07-20'))
      expect(result).toMatch(/20\s*juil\.?/)
    })

    it('gere les strings ISO', () => {
      expect(formatRelativeDate('2024-06-15')).toBe("Aujourd'hui")
    })

    it('retourne "-" pour null', () => {
      expect(formatRelativeDate(null)).toBe('-')
    })
  })
})
