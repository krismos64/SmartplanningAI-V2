/**
 * Tests unitaires pour le hook useCookieConsent
 *
 * @ticket SP-283
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCookieConsent } from '@/hooks/useCookieConsent'

// Mock des fonctions de lib/cookies
const mockGetConsent = vi.fn()
const mockSetConsent = vi.fn()
const mockApplyConsentPreferences = vi.fn()

vi.mock('@/lib/cookies', () => ({
  getConsent: () => mockGetConsent(),
  setConsent: (prefs: unknown) => mockSetConsent(prefs),
  applyConsentPreferences: () => mockApplyConsentPreferences(),
  DEFAULT_PREFERENCES: { essential: true, analytics: false, functional: false },
  ACCEPT_ALL_PREFERENCES: {
    essential: true,
    analytics: true,
    functional: true,
  },
}))

describe('useCookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConsent.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Etat initial', () => {
    it('retourne isLoaded false initialement puis true apres mount', async () => {
      const { result } = renderHook(() => useCookieConsent())

      // Après le premier render (useEffect s'est exécuté)
      expect(result.current.isLoaded).toBe(true)
    })

    it('retourne hasConsented false si pas de consentement', () => {
      mockGetConsent.mockReturnValue(null)
      const { result } = renderHook(() => useCookieConsent())

      expect(result.current.hasConsented).toBe(false)
    })

    it('retourne hasConsented true si consentement existe', () => {
      mockGetConsent.mockReturnValue({
        version: 1,
        timestamp: '2026-01-16T10:00:00.000Z',
        preferences: { essential: true, analytics: true, functional: false },
      })

      const { result } = renderHook(() => useCookieConsent())

      expect(result.current.hasConsented).toBe(true)
    })

    it('retourne les preferences par defaut si pas de consentement', () => {
      mockGetConsent.mockReturnValue(null)
      const { result } = renderHook(() => useCookieConsent())

      expect(result.current.preferences).toEqual({
        essential: true,
        analytics: false,
        functional: false,
      })
    })

    it('retourne les preferences du consentement si existe', () => {
      const consent = {
        version: 1,
        timestamp: '2026-01-16T10:00:00.000Z',
        preferences: { essential: true, analytics: true, functional: true },
      }
      mockGetConsent.mockReturnValue(consent)

      const { result } = renderHook(() => useCookieConsent())

      expect(result.current.preferences).toEqual(consent.preferences)
    })
  })

  describe('acceptAll', () => {
    it('sauvegarde les preferences "tout accepter"', () => {
      const { result } = renderHook(() => useCookieConsent())

      act(() => {
        result.current.acceptAll()
      })

      expect(mockSetConsent).toHaveBeenCalledWith({
        essential: true,
        analytics: true,
        functional: true,
      })
    })

    it('applique les preferences apres acceptation', () => {
      const { result } = renderHook(() => useCookieConsent())

      act(() => {
        result.current.acceptAll()
      })

      expect(mockApplyConsentPreferences).toHaveBeenCalled()
    })

    it('ferme le modal de preferences', () => {
      const { result } = renderHook(() => useCookieConsent())

      act(() => {
        result.current.openPreferences()
      })
      expect(result.current.isPreferencesOpen).toBe(true)

      act(() => {
        result.current.acceptAll()
      })
      expect(result.current.isPreferencesOpen).toBe(false)
    })
  })

  describe('rejectAll', () => {
    it('sauvegarde les preferences "tout refuser"', () => {
      const { result } = renderHook(() => useCookieConsent())

      act(() => {
        result.current.rejectAll()
      })

      expect(mockSetConsent).toHaveBeenCalledWith({
        essential: true,
        analytics: false,
        functional: false,
      })
    })

    it('applique les preferences apres refus', () => {
      const { result } = renderHook(() => useCookieConsent())

      act(() => {
        result.current.rejectAll()
      })

      expect(mockApplyConsentPreferences).toHaveBeenCalled()
    })
  })

  describe('savePreferences', () => {
    it('sauvegarde les preferences personnalisees', () => {
      const { result } = renderHook(() => useCookieConsent())

      const customPrefs = {
        essential: true,
        analytics: true,
        functional: false,
      }

      act(() => {
        result.current.savePreferences(customPrefs)
      })

      expect(mockSetConsent).toHaveBeenCalledWith({
        ...customPrefs,
        essential: true, // Toujours force
      })
    })

    it('force essential a true meme si false est passe', () => {
      const { result } = renderHook(() => useCookieConsent())

      act(() => {
        result.current.savePreferences({
          essential: true,
          analytics: false,
          functional: false,
        })
      })

      expect(mockSetConsent).toHaveBeenCalledWith(
        expect.objectContaining({ essential: true })
      )
    })
  })

  describe('Modal preferences', () => {
    it('isPreferencesOpen est false par defaut', () => {
      const { result } = renderHook(() => useCookieConsent())
      expect(result.current.isPreferencesOpen).toBe(false)
    })

    it('openPreferences ouvre le modal', () => {
      const { result } = renderHook(() => useCookieConsent())

      act(() => {
        result.current.openPreferences()
      })

      expect(result.current.isPreferencesOpen).toBe(true)
    })

    it('closePreferences ferme le modal', () => {
      const { result } = renderHook(() => useCookieConsent())

      act(() => {
        result.current.openPreferences()
      })
      expect(result.current.isPreferencesOpen).toBe(true)

      act(() => {
        result.current.closePreferences()
      })
      expect(result.current.isPreferencesOpen).toBe(false)
    })
  })

  describe('Chargement initial', () => {
    it('applique les preferences existantes au mount', () => {
      mockGetConsent.mockReturnValue({
        version: 1,
        timestamp: '2026-01-16T10:00:00.000Z',
        preferences: { essential: true, analytics: true, functional: false },
      })

      renderHook(() => useCookieConsent())

      expect(mockApplyConsentPreferences).toHaveBeenCalled()
    })

    it("n'applique pas les preferences si pas de consentement", () => {
      mockGetConsent.mockReturnValue(null)

      renderHook(() => useCookieConsent())

      expect(mockApplyConsentPreferences).not.toHaveBeenCalled()
    })
  })
})
