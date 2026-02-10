/**
 * Tests unitaires pour CookieConsentProvider
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  CookieConsentProvider,
  useCookieConsentContext,
  useCookieConsentContextOptional,
} from '@/components/cookies/CookieConsentProvider'

// ============================================================================
// Mocks
// ============================================================================

const mockGetConsent = vi.fn()
const mockSetConsent = vi.fn()
const mockApplyConsentPreferences = vi.fn()

vi.mock('@/lib/cookies', () => ({
  getConsent: () => mockGetConsent(),
  setConsent: (...args: unknown[]) => mockSetConsent(...args),
  applyConsentPreferences: () => mockApplyConsentPreferences(),
  ACCEPT_ALL_PREFERENCES: {
    essential: true,
    analytics: true,
    functional: true,
  },
  DEFAULT_PREFERENCES: {
    essential: true,
    analytics: false,
    functional: false,
  },
}))

// Mock des sous-composants pour simplifier
vi.mock('@/components/cookies/CookieBanner', () => ({
  CookieBanner: () => <div data-testid="cookie-banner">Banner</div>,
}))

vi.mock('@/components/cookies/CookiePreferencesModal', () => ({
  CookiePreferencesModal: () => (
    <div data-testid="cookie-preferences-modal">Modal</div>
  ),
}))

// ============================================================================
// Composants de test
// ============================================================================

function ConsumerComponent() {
  const ctx = useCookieConsentContext()
  return (
    <div>
      <span data-testid="has-consented">{String(ctx.hasConsented)}</span>
      <span data-testid="is-loaded">{String(ctx.isLoaded)}</span>
      <span data-testid="preferences-open">
        {String(ctx.isPreferencesOpen)}
      </span>
      <span data-testid="preferences-analytics">
        {String(ctx.preferences.analytics)}
      </span>
      <button data-testid="accept-all" onClick={ctx.acceptAll}>
        Accept All
      </button>
      <button data-testid="reject-all" onClick={ctx.rejectAll}>
        Reject All
      </button>
      <button data-testid="open-preferences" onClick={ctx.openPreferences}>
        Open Preferences
      </button>
      <button data-testid="close-preferences" onClick={ctx.closePreferences}>
        Close Preferences
      </button>
      <button
        data-testid="save-preferences"
        onClick={() =>
          ctx.savePreferences({
            essential: true,
            analytics: true,
            functional: false,
          })
        }
      >
        Save
      </button>
    </div>
  )
}

function OptionalConsumerComponent() {
  const ctx = useCookieConsentContextOptional()
  return (
    <span data-testid="optional-context">
      {ctx ? 'has-context' : 'no-context'}
    </span>
  )
}

// ============================================================================
// Tests
// ============================================================================

describe('CookieConsentProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConsent.mockReturnValue(null)
  })

  describe('Rendering', () => {
    it('rend les enfants', () => {
      render(
        <CookieConsentProvider>
          <div data-testid="child">Hello</div>
        </CookieConsentProvider>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('rend la banniere', () => {
      render(<CookieConsentProvider />)
      expect(screen.getByTestId('cookie-banner')).toBeInTheDocument()
    })

    it('rend le modal de preferences', () => {
      render(<CookieConsentProvider />)
      expect(
        screen.getByTestId('cookie-preferences-modal')
      ).toBeInTheDocument()
    })
  })

  describe('Contexte initial (pas de consentement)', () => {
    it('hasConsented est false sans consentement', () => {
      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )
      expect(screen.getByTestId('has-consented')).toHaveTextContent('false')
    })

    it('isLoaded est true apres le montage', () => {
      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )
      expect(screen.getByTestId('is-loaded')).toHaveTextContent('true')
    })

    it('preferences par defaut (analytics false)', () => {
      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )
      expect(
        screen.getByTestId('preferences-analytics')
      ).toHaveTextContent('false')
    })
  })

  describe('Contexte avec consentement existant', () => {
    it('hasConsented est true avec consentement stocke', () => {
      mockGetConsent.mockReturnValue({
        version: 1,
        timestamp: '2026-01-01',
        preferences: {
          essential: true,
          analytics: true,
          functional: false,
        },
      })

      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )
      expect(screen.getByTestId('has-consented')).toHaveTextContent('true')
    })

    it('applique les preferences existantes au montage', () => {
      mockGetConsent.mockReturnValue({
        version: 1,
        timestamp: '2026-01-01',
        preferences: {
          essential: true,
          analytics: true,
          functional: true,
        },
      })

      render(<CookieConsentProvider />)
      expect(mockApplyConsentPreferences).toHaveBeenCalled()
    })
  })

  describe('Actions', () => {
    it('acceptAll appelle setConsent et applyConsentPreferences', async () => {
      const user = userEvent.setup()
      // Apres acceptAll, getConsent retourne le consentement
      mockGetConsent
        .mockReturnValueOnce(null) // initial
        .mockReturnValue({
          version: 1,
          timestamp: '2026-01-01',
          preferences: {
            essential: true,
            analytics: true,
            functional: true,
          },
        })

      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )

      await user.click(screen.getByTestId('accept-all'))

      expect(mockSetConsent).toHaveBeenCalledWith({
        essential: true,
        analytics: true,
        functional: true,
      })
      expect(mockApplyConsentPreferences).toHaveBeenCalled()
    })

    it('rejectAll appelle setConsent avec DEFAULT_PREFERENCES', async () => {
      const user = userEvent.setup()
      mockGetConsent.mockReturnValue(null)

      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )

      await user.click(screen.getByTestId('reject-all'))

      expect(mockSetConsent).toHaveBeenCalledWith({
        essential: true,
        analytics: false,
        functional: false,
      })
    })

    it('savePreferences appelle setConsent avec les preferences custom', async () => {
      const user = userEvent.setup()
      mockGetConsent.mockReturnValue(null)

      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )

      await user.click(screen.getByTestId('save-preferences'))

      expect(mockSetConsent).toHaveBeenCalledWith({
        essential: true,
        analytics: true,
        functional: false,
      })
    })

    it('openPreferences met isPreferencesOpen a true', async () => {
      const user = userEvent.setup()
      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )

      expect(
        screen.getByTestId('preferences-open')
      ).toHaveTextContent('false')

      await user.click(screen.getByTestId('open-preferences'))

      expect(
        screen.getByTestId('preferences-open')
      ).toHaveTextContent('true')
    })

    it('closePreferences met isPreferencesOpen a false', async () => {
      const user = userEvent.setup()
      render(
        <CookieConsentProvider>
          <ConsumerComponent />
        </CookieConsentProvider>
      )

      await user.click(screen.getByTestId('open-preferences'))
      await user.click(screen.getByTestId('close-preferences'))

      expect(
        screen.getByTestId('preferences-open')
      ).toHaveTextContent('false')
    })
  })

  describe('Hooks', () => {
    it('useCookieConsentContext throw en dehors du provider', () => {
      expect(() => {
        render(<ConsumerComponent />)
      }).toThrow(
        'useCookieConsentContext doit être utilisé dans un CookieConsentProvider'
      )
    })

    it('useCookieConsentContextOptional retourne null en dehors du provider', () => {
      render(<OptionalConsumerComponent />)
      expect(screen.getByTestId('optional-context')).toHaveTextContent(
        'no-context'
      )
    })

    it('useCookieConsentContextOptional retourne le contexte dans le provider', () => {
      render(
        <CookieConsentProvider>
          <OptionalConsumerComponent />
        </CookieConsentProvider>
      )
      expect(screen.getByTestId('optional-context')).toHaveTextContent(
        'has-context'
      )
    })
  })
})
