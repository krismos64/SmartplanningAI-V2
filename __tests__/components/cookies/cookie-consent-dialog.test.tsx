/**
 * Tests unitaires pour la modale de consentement cookies dans l'application privée
 *
 * Couvre l'aiguillage de CookieConsentProvider entre CookieBanner (public) et
 * CookieConsentDialog (`/app/*`), ainsi que le comportement propre à la modale :
 * masquage tant que le consentement n'est pas chargé ou déjà donné, actions
 * accepter/refuser/personnaliser, et absence de croix de fermeture.
 *
 * @ticket SP-600
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CookieConsentProvider } from '@/components/cookies/CookieConsentProvider'
import { CONSENT_COOKIE_NAME, CONSENT_VERSION } from '@/lib/cookies'

// ============================================================================
// Mocks
// ============================================================================

const mockPathname = vi.hoisted(() => vi.fn(() => '/'))

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

// Mock de document.cookie, sur le même modèle que __tests__/lib/cookies/cookie-consent.test.ts
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

// ============================================================================
// Helpers
// ============================================================================

function setExistingConsent() {
  mockCookies[CONSENT_COOKIE_NAME] = encodeURIComponent(
    JSON.stringify({
      version: CONSENT_VERSION,
      timestamp: '2026-09-01T10:00:00.000Z',
      preferences: {
        essential: true,
        analytics: true,
        functional: true,
        marketing: false,
      },
    })
  )
}

// ============================================================================
// Tests
// ============================================================================

describe('CookieConsentProvider — aiguillage bannière / modale', () => {
  beforeEach(() => {
    mockCookies = {}
    vi.clearAllMocks()
    mockPathname.mockReturnValue('/')

    Object.defineProperty(document, 'cookie', {
      get: mockDocumentCookie.get,
      set: mockDocumentCookie.set,
      configurable: true,
    })
  })

  afterEach(() => {
    mockCookies = {}
  })

  // --------------------------------------------------------------------------
  // Cœur du correctif : l'aiguillage par route
  // --------------------------------------------------------------------------

  describe('Application privée : la modale remplace la bannière', () => {
    it.each([
      '/app/dashboard/schedules',
      '/app/settings',
      '/app/director/teams',
    ])('rend la modale et pas la bannière sur %s', async (pathname) => {
      mockPathname.mockReturnValue(pathname)

      render(
        <CookieConsentProvider>
          <div>contenu applicatif</div>
        </CookieConsentProvider>
      )

      expect(
        await screen.findByTestId('cookie-consent-dialog')
      ).toBeInTheDocument()
      expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument()
    })
  })

  describe('Site public : la bannière reste affichée, pas la modale', () => {
    it.each(['/', '/tarifs', '/solutions/planning-commerce'])(
      'rend la bannière et pas la modale sur %s',
      async (pathname) => {
        mockPathname.mockReturnValue(pathname)

        render(
          <CookieConsentProvider>
            <div>contenu public</div>
          </CookieConsentProvider>
        )

        expect(await screen.findByTestId('cookie-banner')).toBeInTheDocument()
        expect(
          screen.queryByTestId('cookie-consent-dialog')
        ).not.toBeInTheDocument()
      }
    )
  })

  // --------------------------------------------------------------------------
  // Comportement de la modale
  // --------------------------------------------------------------------------

  describe('Affichage conditionnel de la modale', () => {
    it('ne rend pas la modale quand le consentement a déjà été donné', async () => {
      setExistingConsent()
      mockPathname.mockReturnValue('/app/dashboard/schedules')

      render(
        <CookieConsentProvider>
          <div>contenu applicatif</div>
        </CookieConsentProvider>
      )

      // Laisse le useEffect de chargement du consentement s'exécuter
      await screen.findByText('contenu applicatif')

      expect(
        screen.queryByTestId('cookie-consent-dialog')
      ).not.toBeInTheDocument()
    })

    it("ne rend rien tant qu'isLoaded est faux (premier rendu synchrone)", () => {
      mockPathname.mockReturnValue('/app/dashboard/schedules')

      // isLoaded passe à true dans un useEffect : au tout premier rendu
      // synchrone (avant que React n'ait eu la main pour l'exécuter), la
      // modale ne doit pas encore être dans le DOM.
      const { container } = render(
        <CookieConsentProvider>
          <div>contenu applicatif</div>
        </CookieConsentProvider>
      )

      expect(
        container.querySelector('[data-testid="cookie-consent-dialog"]')
      ).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Actions de la modale
  // --------------------------------------------------------------------------

  describe('Actions de la modale', () => {
    beforeEach(() => {
      mockPathname.mockReturnValue('/app/dashboard/schedules')
    })

    it('cookie-accept-all appelle acceptAll et fait disparaître la modale', async () => {
      render(
        <CookieConsentProvider>
          <div>contenu applicatif</div>
        </CookieConsentProvider>
      )

      const acceptButton = await screen.findByTestId('cookie-accept-all')
      fireEvent.click(acceptButton)

      expect(
        screen.queryByTestId('cookie-consent-dialog')
      ).not.toBeInTheDocument()
      expect(mockCookies[CONSENT_COOKIE_NAME]).toBeDefined()

      const stored = JSON.parse(
        decodeURIComponent(mockCookies[CONSENT_COOKIE_NAME])
      )
      expect(stored.preferences.analytics).toBe(true)
    })

    it('cookie-reject-all appelle rejectAll et fait disparaître la modale', async () => {
      render(
        <CookieConsentProvider>
          <div>contenu applicatif</div>
        </CookieConsentProvider>
      )

      const rejectButton = await screen.findByTestId('cookie-reject-all')
      fireEvent.click(rejectButton)

      expect(
        screen.queryByTestId('cookie-consent-dialog')
      ).not.toBeInTheDocument()

      const stored = JSON.parse(
        decodeURIComponent(mockCookies[CONSENT_COOKIE_NAME])
      )
      expect(stored.preferences.analytics).toBe(false)
    })

    it('cookie-settings appelle openPreferences et ouvre le modal de préférences', async () => {
      render(
        <CookieConsentProvider>
          <div>contenu applicatif</div>
        </CookieConsentProvider>
      )

      const settingsButton = await screen.findByTestId('cookie-settings')
      fireEvent.click(settingsButton)

      // Le modal de préférences (CookiePreferencesModal) prend le relais.
      expect(
        await screen.findByText('Préférences des cookies')
      ).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // Pas de choix implicite
  // --------------------------------------------------------------------------

  describe('Absence de croix de fermeture (pas de choix implicite)', () => {
    it("n'affiche aucun bouton de fermeture dans la modale", async () => {
      mockPathname.mockReturnValue('/app/dashboard/schedules')

      render(
        <CookieConsentProvider>
          <div>contenu applicatif</div>
        </CookieConsentProvider>
      )

      await screen.findByTestId('cookie-consent-dialog')

      expect(
        screen.queryByRole('button', { name: /close/i })
      ).not.toBeInTheDocument()
    })
  })
})
