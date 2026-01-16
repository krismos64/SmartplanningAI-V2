/**
 * Tests unitaires pour le composant CookieBanner
 *
 * @ticket SP-283
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { CookieBanner } from '@/components/cookies/CookieBanner'

// Mock du hook useCookieConsentContext du Provider
const mockUseCookieConsentContext = vi.fn()

vi.mock('@/components/cookies/CookieConsentProvider', () => ({
  useCookieConsentContext: () => mockUseCookieConsentContext(),
}))

describe('CookieBanner', () => {
  const defaultMockReturn = {
    hasConsented: false,
    isLoaded: true,
    acceptAll: vi.fn(),
    rejectAll: vi.fn(),
    openPreferences: vi.fn(),
    consent: null,
    preferences: { essential: true, analytics: false, functional: false },
    savePreferences: vi.fn(),
    closePreferences: vi.fn(),
    isPreferencesOpen: false,
  }

  beforeEach(() => {
    mockUseCookieConsentContext.mockReturnValue({ ...defaultMockReturn })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Affichage', () => {
    it("ne s'affiche pas si isLoaded est false", () => {
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        isLoaded: false,
      })

      const { container } = render(<CookieBanner />)
      expect(container.firstChild).toBeNull()
    })

    it("ne s'affiche pas si l'utilisateur a deja consenti", () => {
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        hasConsented: true,
      })

      const { container } = render(<CookieBanner />)
      expect(container.firstChild).toBeNull()
    })

    it("s'affiche si pas de consentement et loaded", () => {
      render(<CookieBanner />)

      expect(
        screen.getByRole('dialog', { name: /paramètres des cookies/i })
      ).toBeInTheDocument()
    })

    it('affiche le titre et la description', () => {
      render(<CookieBanner />)

      expect(
        screen.getByText('Nous respectons votre vie privée')
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Ce site utilise des cookies/i)
      ).toBeInTheDocument()
    })

    it("affiche les trois boutons d'action", () => {
      render(<CookieBanner />)

      expect(screen.getByText('Tout refuser')).toBeInTheDocument()
      expect(screen.getByText('Personnaliser')).toBeInTheDocument()
      expect(screen.getByText('Tout accepter')).toBeInTheDocument()
    })

    it('affiche le lien vers la politique cookies', () => {
      render(<CookieBanner />)

      const link = screen.getByRole('link', { name: /en savoir plus/i })
      expect(link).toHaveAttribute('href', '/cookies')
    })
  })

  describe('Interactions', () => {
    it('appelle acceptAll au clic sur "Tout accepter"', async () => {
      const user = setupUser()
      const acceptAll = vi.fn()
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        acceptAll,
      })

      render(<CookieBanner />)

      await user.click(screen.getByText('Tout accepter'))
      expect(acceptAll).toHaveBeenCalledTimes(1)
    })

    it('appelle rejectAll au clic sur "Tout refuser"', async () => {
      const user = setupUser()
      const rejectAll = vi.fn()
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        rejectAll,
      })

      render(<CookieBanner />)

      await user.click(screen.getByText('Tout refuser'))
      expect(rejectAll).toHaveBeenCalledTimes(1)
    })

    it('appelle openPreferences au clic sur "Personnaliser"', async () => {
      const user = setupUser()
      const openPreferences = vi.fn()
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        openPreferences,
      })

      render(<CookieBanner />)

      await user.click(screen.getByText('Personnaliser'))
      expect(openPreferences).toHaveBeenCalledTimes(1)
    })

    it('appelle onConsentChange apres acceptAll', async () => {
      const user = setupUser()
      const onConsentChange = vi.fn()
      render(<CookieBanner onConsentChange={onConsentChange} />)

      await user.click(screen.getByText('Tout accepter'))
      expect(onConsentChange).toHaveBeenCalledTimes(1)
    })

    it('appelle onConsentChange apres rejectAll', async () => {
      const user = setupUser()
      const onConsentChange = vi.fn()
      render(<CookieBanner onConsentChange={onConsentChange} />)

      await user.click(screen.getByText('Tout refuser'))
      expect(onConsentChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibilite', () => {
    it('a le role dialog', () => {
      render(<CookieBanner />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('a un aria-label descriptif', () => {
      render(<CookieBanner />)

      expect(
        screen.getByRole('dialog', { name: /paramètres des cookies/i })
      ).toBeInTheDocument()
    })

    it('a une description liee par aria-describedby', () => {
      render(<CookieBanner />)

      const dialog = screen.getByRole('dialog')
      const describedById = dialog.getAttribute('aria-describedby')
      expect(describedById).toBe('cookie-banner-description')

      const description = document.getElementById('cookie-banner-description')
      expect(description).toBeInTheDocument()
    })
  })
})
