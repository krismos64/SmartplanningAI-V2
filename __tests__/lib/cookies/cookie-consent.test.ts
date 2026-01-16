/**
 * Tests unitaires pour les fonctions de gestion du consentement cookies
 *
 * @ticket SP-283
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getConsent,
  setConsent,
  clearConsent,
  hasConsented,
  isCategoryAccepted,
  acceptAll,
  rejectAll,
  getPreferences,
  formatConsentDate,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  DEFAULT_PREFERENCES,
  ACCEPT_ALL_PREFERENCES,
  CookieConsent,
} from '@/lib/cookies'

// Mock de document.cookie
let mockCookies: { [key: string]: string } = {}

const mockDocumentCookie = {
  get: vi.fn(() => {
    return Object.entries(mockCookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')
  }),
  set: vi.fn((cookie: string) => {
    const [nameValue] = cookie.split(';')
    const [name, value] = nameValue.split('=')
    if (value === '' || cookie.includes('max-age=0')) {
      delete mockCookies[name]
    } else {
      mockCookies[name] = value
    }
  }),
}

describe('cookie-consent', () => {
  beforeEach(() => {
    // Reset mock cookies
    mockCookies = {}

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      get: mockDocumentCookie.get,
      set: mockDocumentCookie.set,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getConsent', () => {
    it('retourne null si aucun cookie existe', () => {
      expect(getConsent()).toBeNull()
    })

    it('retourne le consentement si le cookie existe', () => {
      const consent: CookieConsent = {
        version: CONSENT_VERSION,
        timestamp: '2026-01-16T10:00:00.000Z',
        preferences: DEFAULT_PREFERENCES,
      }
      mockCookies[CONSENT_COOKIE_NAME] = encodeURIComponent(
        JSON.stringify(consent)
      )

      const result = getConsent()
      expect(result).not.toBeNull()
      expect(result?.version).toBe(CONSENT_VERSION)
      expect(result?.preferences.essential).toBe(true)
    })

    it('retourne null si le cookie est invalide', () => {
      mockCookies[CONSENT_COOKIE_NAME] = 'invalid-json'
      expect(getConsent()).toBeNull()
    })

    it('retourne null si la structure est incorrecte', () => {
      const invalidConsent = { version: 1, timestamp: '2026-01-16' }
      mockCookies[CONSENT_COOKIE_NAME] = encodeURIComponent(
        JSON.stringify(invalidConsent)
      )
      expect(getConsent()).toBeNull()
    })
  })

  describe('setConsent', () => {
    it('sauvegarde les preferences dans un cookie', () => {
      setConsent(ACCEPT_ALL_PREFERENCES)

      expect(mockDocumentCookie.set).toHaveBeenCalled()
      expect(mockCookies[CONSENT_COOKIE_NAME]).toBeDefined()

      const savedConsent = JSON.parse(
        decodeURIComponent(mockCookies[CONSENT_COOKIE_NAME])
      )
      expect(savedConsent.version).toBe(CONSENT_VERSION)
      expect(savedConsent.preferences.analytics).toBe(true)
      expect(savedConsent.preferences.functional).toBe(true)
    })

    it('force toujours essential a true', () => {
      setConsent({ essential: true, analytics: false, functional: false })

      const savedConsent = JSON.parse(
        decodeURIComponent(mockCookies[CONSENT_COOKIE_NAME])
      )
      expect(savedConsent.preferences.essential).toBe(true)
    })

    it('ajoute un timestamp', () => {
      setConsent(DEFAULT_PREFERENCES)

      const savedConsent = JSON.parse(
        decodeURIComponent(mockCookies[CONSENT_COOKIE_NAME])
      )
      expect(savedConsent.timestamp).toBeDefined()
      expect(new Date(savedConsent.timestamp).getTime()).not.toBeNaN()
    })
  })

  describe('clearConsent', () => {
    it('supprime le cookie de consentement', () => {
      const consent: CookieConsent = {
        version: CONSENT_VERSION,
        timestamp: '2026-01-16T10:00:00.000Z',
        preferences: DEFAULT_PREFERENCES,
      }
      mockCookies[CONSENT_COOKIE_NAME] = encodeURIComponent(
        JSON.stringify(consent)
      )

      clearConsent()

      expect(mockCookies[CONSENT_COOKIE_NAME]).toBeUndefined()
    })
  })

  describe('hasConsented', () => {
    it('retourne false si aucun consentement', () => {
      expect(hasConsented()).toBe(false)
    })

    it('retourne true si un consentement existe', () => {
      const consent: CookieConsent = {
        version: CONSENT_VERSION,
        timestamp: '2026-01-16T10:00:00.000Z',
        preferences: DEFAULT_PREFERENCES,
      }
      mockCookies[CONSENT_COOKIE_NAME] = encodeURIComponent(
        JSON.stringify(consent)
      )

      expect(hasConsented()).toBe(true)
    })
  })

  describe('isCategoryAccepted', () => {
    it('retourne true pour essential meme sans consentement', () => {
      expect(isCategoryAccepted('essential')).toBe(true)
    })

    it('retourne false pour analytics sans consentement', () => {
      expect(isCategoryAccepted('analytics')).toBe(false)
    })

    it('retourne la valeur du consentement si existe', () => {
      const consent: CookieConsent = {
        version: CONSENT_VERSION,
        timestamp: '2026-01-16T10:00:00.000Z',
        preferences: { essential: true, analytics: true, functional: false },
      }
      mockCookies[CONSENT_COOKIE_NAME] = encodeURIComponent(
        JSON.stringify(consent)
      )

      expect(isCategoryAccepted('analytics')).toBe(true)
      expect(isCategoryAccepted('functional')).toBe(false)
    })
  })

  describe('acceptAll', () => {
    it('accepte toutes les categories', () => {
      acceptAll()

      const savedConsent = JSON.parse(
        decodeURIComponent(mockCookies[CONSENT_COOKIE_NAME])
      )
      expect(savedConsent.preferences.essential).toBe(true)
      expect(savedConsent.preferences.analytics).toBe(true)
      expect(savedConsent.preferences.functional).toBe(true)
    })
  })

  describe('rejectAll', () => {
    it('refuse tous les cookies non essentiels', () => {
      rejectAll()

      const savedConsent = JSON.parse(
        decodeURIComponent(mockCookies[CONSENT_COOKIE_NAME])
      )
      expect(savedConsent.preferences.essential).toBe(true)
      expect(savedConsent.preferences.analytics).toBe(false)
      expect(savedConsent.preferences.functional).toBe(false)
    })
  })

  describe('getPreferences', () => {
    it('retourne les preferences par defaut sans consentement', () => {
      const prefs = getPreferences()
      expect(prefs).toEqual(DEFAULT_PREFERENCES)
    })

    it('retourne les preferences sauvegardees', () => {
      const consent: CookieConsent = {
        version: CONSENT_VERSION,
        timestamp: '2026-01-16T10:00:00.000Z',
        preferences: ACCEPT_ALL_PREFERENCES,
      }
      mockCookies[CONSENT_COOKIE_NAME] = encodeURIComponent(
        JSON.stringify(consent)
      )

      const prefs = getPreferences()
      expect(prefs).toEqual(ACCEPT_ALL_PREFERENCES)
    })
  })

  describe('formatConsentDate', () => {
    it('formate une date ISO en format francais', () => {
      const result = formatConsentDate('2026-01-16T10:30:00.000Z')
      // Le format dépend du timezone, mais doit contenir la date
      expect(result).toContain('16/01/2026')
      expect(result).toContain('à')
    })

    it('retourne "Date inconnue" pour une date invalide', () => {
      const result = formatConsentDate('invalid-date')
      expect(result).toBe('Date inconnue')
    })

    it('gere les dates avec differents fuseaux horaires', () => {
      const result = formatConsentDate('2026-06-15T14:45:00.000Z')
      expect(result).toContain('2026')
    })
  })
})
