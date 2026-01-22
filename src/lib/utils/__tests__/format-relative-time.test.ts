/**
 * Tests unitaires - formatRelativeTime
 *
 * @ticket SP-264 - Phase 4 - Recent Pages
 *
 * 12 tests couvrant :
 * - Formatage "À l'instant" (< 30 secondes)
 * - Formatage en minutes
 * - Formatage en heures
 * - Formatage en jours
 * - Formatage > 1 semaine (date)
 * - Cas limites (valeurs invalides)
 * - Version longue
 */

import { describe, it, expect } from 'vitest'
import {
  formatRelativeTime,
  formatRelativeTimeLong,
} from '../format-relative-time'

describe('formatRelativeTime', () => {
  // =========================================================================
  // TESTS "À L'INSTANT"
  // =========================================================================

  describe("À l'instant (< 30 secondes)", () => {
    it('should return "À l\'instant" for 0 seconds', () => {
      const now = Date.now()
      expect(formatRelativeTime(now, now)).toBe("À l'instant")
    })

    it('should return "À l\'instant" for 10 seconds ago', () => {
      const now = Date.now()
      const tenSecondsAgo = now - 10 * 1000
      expect(formatRelativeTime(tenSecondsAgo, now)).toBe("À l'instant")
    })

    it('should return "À l\'instant" for 29 seconds ago', () => {
      const now = Date.now()
      const twentyNineSecondsAgo = now - 29 * 1000
      expect(formatRelativeTime(twentyNineSecondsAgo, now)).toBe("À l'instant")
    })
  })

  // =========================================================================
  // TESTS MINUTES
  // =========================================================================

  describe('Minutes (30 sec - 1 heure)', () => {
    it('should return "Il y a 1 min" for 1 minute ago', () => {
      const now = Date.now()
      const oneMinuteAgo = now - 60 * 1000
      expect(formatRelativeTime(oneMinuteAgo, now)).toBe('Il y a 1 min')
    })

    it('should return "Il y a 5 min" for 5 minutes ago', () => {
      const now = Date.now()
      const fiveMinutesAgo = now - 5 * 60 * 1000
      expect(formatRelativeTime(fiveMinutesAgo, now)).toBe('Il y a 5 min')
    })

    it('should return "Il y a 59 min" for 59 minutes ago', () => {
      const now = Date.now()
      const fiftyNineMinutesAgo = now - 59 * 60 * 1000
      expect(formatRelativeTime(fiftyNineMinutesAgo, now)).toBe('Il y a 59 min')
    })
  })

  // =========================================================================
  // TESTS HEURES
  // =========================================================================

  describe('Heures (1 - 24 heures)', () => {
    it('should return "Il y a 1h" for 1 hour ago', () => {
      const now = Date.now()
      const oneHourAgo = now - 60 * 60 * 1000
      expect(formatRelativeTime(oneHourAgo, now)).toBe('Il y a 1h')
    })

    it('should return "Il y a 2h" for 2 hours ago', () => {
      const now = Date.now()
      const twoHoursAgo = now - 2 * 60 * 60 * 1000
      expect(formatRelativeTime(twoHoursAgo, now)).toBe('Il y a 2h')
    })

    it('should return "Il y a 23h" for 23 hours ago', () => {
      const now = Date.now()
      const twentyThreeHoursAgo = now - 23 * 60 * 60 * 1000
      expect(formatRelativeTime(twentyThreeHoursAgo, now)).toBe('Il y a 23h')
    })
  })

  // =========================================================================
  // TESTS JOURS
  // =========================================================================

  describe('Jours (1 - 7 jours)', () => {
    it('should return "Il y a 1j" for 1 day ago', () => {
      const now = Date.now()
      const oneDayAgo = now - 24 * 60 * 60 * 1000
      expect(formatRelativeTime(oneDayAgo, now)).toBe('Il y a 1j')
    })

    it('should return "Il y a 3j" for 3 days ago', () => {
      const now = Date.now()
      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000
      expect(formatRelativeTime(threeDaysAgo, now)).toBe('Il y a 3j')
    })

    it('should return "Il y a 6j" for 6 days ago', () => {
      const now = Date.now()
      const sixDaysAgo = now - 6 * 24 * 60 * 60 * 1000
      expect(formatRelativeTime(sixDaysAgo, now)).toBe('Il y a 6j')
    })
  })

  // =========================================================================
  // TESTS > 1 SEMAINE
  // =========================================================================

  describe("Plus d'une semaine", () => {
    it('should return date format for 8 days ago', () => {
      const now = Date.now()
      const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000
      const result = formatRelativeTime(eightDaysAgo, now)

      // Vérifier que c'est une date (format "14 janv." par exemple)
      expect(result).toMatch(/^\d{1,2}\s[a-zéû]+\.?$/i)
    })

    it('should return date format for 30 days ago', () => {
      const now = Date.now()
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
      const result = formatRelativeTime(thirtyDaysAgo, now)

      // Vérifier que c'est une date
      expect(result).toMatch(/^\d{1,2}\s[a-zéû]+\.?$/i)
    })
  })

  // =========================================================================
  // TESTS CAS LIMITES
  // =========================================================================

  describe('Cas limites', () => {
    it('should return "Date inconnue" for NaN', () => {
      expect(formatRelativeTime(NaN)).toBe('Date inconnue')
    })

    it('should return "Date inconnue" for 0', () => {
      expect(formatRelativeTime(0)).toBe('Date inconnue')
    })

    it('should return "Date inconnue" for negative timestamp', () => {
      expect(formatRelativeTime(-1000)).toBe('Date inconnue')
    })

    it('should return "Date inconnue" for Infinity', () => {
      expect(formatRelativeTime(Infinity)).toBe('Date inconnue')
    })

    it('should handle future timestamps as "À l\'instant"', () => {
      const now = Date.now()
      const future = now + 10000
      // Un timestamp futur donne des secondes négatives, donc < 30
      expect(formatRelativeTime(future, now)).toBe("À l'instant")
    })
  })
})

// =========================================================================
// TESTS VERSION LONGUE
// =========================================================================

describe('formatRelativeTimeLong', () => {
  it('should return "À l\'instant" for recent timestamps', () => {
    const now = Date.now()
    expect(formatRelativeTimeLong(now, now)).toBe("À l'instant")
  })

  it('should return "Il y a 1 minute" for 1 minute ago', () => {
    const now = Date.now()
    const oneMinuteAgo = now - 60 * 1000
    expect(formatRelativeTimeLong(oneMinuteAgo, now)).toBe('Il y a 1 minute')
  })

  it('should return "Il y a 5 minutes" for 5 minutes ago', () => {
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000
    expect(formatRelativeTimeLong(fiveMinutesAgo, now)).toBe('Il y a 5 minutes')
  })

  it('should return "Il y a 1 heure" for 1 hour ago', () => {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    expect(formatRelativeTimeLong(oneHourAgo, now)).toBe('Il y a 1 heure')
  })

  it('should return "Il y a 2 heures" for 2 hours ago', () => {
    const now = Date.now()
    const twoHoursAgo = now - 2 * 60 * 60 * 1000
    expect(formatRelativeTimeLong(twoHoursAgo, now)).toBe('Il y a 2 heures')
  })

  it('should return "Il y a 1 jour" for 1 day ago', () => {
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    expect(formatRelativeTimeLong(oneDayAgo, now)).toBe('Il y a 1 jour')
  })

  it('should return "Il y a 3 jours" for 3 days ago', () => {
    const now = Date.now()
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000
    expect(formatRelativeTimeLong(threeDaysAgo, now)).toBe('Il y a 3 jours')
  })

  it('should return full date format for > 1 week', () => {
    const now = Date.now()
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000
    const result = formatRelativeTimeLong(twoWeeksAgo, now)

    // Vérifier que c'est une date longue (format "mercredi 8 janvier")
    expect(result).toMatch(/^[a-zéû]+\s\d{1,2}\s[a-zéû]+$/i)
  })
})
