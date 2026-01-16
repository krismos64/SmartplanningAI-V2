/**
 * Tests unitaires pour le composant CookieSettingsButton
 *
 * @ticket SP-283
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { CookieSettingsButton } from '@/components/cookies/CookieSettingsButton'

// Mock du hook useCookieConsentContextOptional du Provider
const mockUseCookieConsentContextOptional = vi.fn()

vi.mock('@/components/cookies/CookieConsentProvider', () => ({
  useCookieConsentContextOptional: () => mockUseCookieConsentContextOptional(),
}))

describe('CookieSettingsButton', () => {
  const defaultMockReturn = {
    hasConsented: true,
    isLoaded: true,
    acceptAll: vi.fn(),
    rejectAll: vi.fn(),
    openPreferences: vi.fn(),
    closePreferences: vi.fn(),
    savePreferences: vi.fn(),
    consent: null,
    preferences: { essential: true, analytics: false, functional: false },
    isPreferencesOpen: false,
  }

  beforeEach(() => {
    mockUseCookieConsentContextOptional.mockReturnValue({ ...defaultMockReturn })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Affichage', () => {
    it("s'affiche avec le texte par defaut", () => {
      render(<CookieSettingsButton />)

      expect(
        screen.getByRole('button', { name: /paramètres des cookies/i })
      ).toBeInTheDocument()
      expect(screen.getByText('Paramètres des cookies')).toBeInTheDocument()
    })

    it("affiche uniquement l'icone en mode iconOnly", () => {
      render(<CookieSettingsButton iconOnly />)

      expect(
        screen.getByRole('button', { name: /paramètres des cookies/i })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Paramètres des cookies')
      ).not.toBeInTheDocument()
    })
  })

  describe('Variantes', () => {
    it('applique la variante ghost par defaut', () => {
      render(<CookieSettingsButton />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('hover:bg-accent')
    })

    it('applique la variante link', () => {
      render(<CookieSettingsButton variant="link" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('underline-offset')
    })

    it('applique la variante outline', () => {
      render(<CookieSettingsButton variant="outline" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('border')
    })
  })

  describe('Tailles', () => {
    it('applique la taille sm par defaut', () => {
      render(<CookieSettingsButton />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('h-8')
    })

    it('applique la taille lg', () => {
      render(<CookieSettingsButton size="lg" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('h-10')
    })

    it('applique la taille icon en mode iconOnly', () => {
      render(<CookieSettingsButton iconOnly />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('h-8')
      expect(button.className).toContain('w-8')
    })
  })

  describe('Interactions', () => {
    it('appelle openPreferences au clic', async () => {
      const user = setupUser()
      const openPreferences = vi.fn()
      mockUseCookieConsentContextOptional.mockReturnValue({
        ...defaultMockReturn,
        openPreferences,
      })

      render(<CookieSettingsButton />)

      await user.click(screen.getByRole('button'))
      expect(openPreferences).toHaveBeenCalledTimes(1)
    })

    it('appelle openPreferences au clic en mode iconOnly', async () => {
      const user = setupUser()
      const openPreferences = vi.fn()
      mockUseCookieConsentContextOptional.mockReturnValue({
        ...defaultMockReturn,
        openPreferences,
      })

      render(<CookieSettingsButton iconOnly />)

      await user.click(screen.getByRole('button'))
      expect(openPreferences).toHaveBeenCalledTimes(1)
    })

    it('ne fait rien si pas dans le Provider', async () => {
      const user = setupUser()
      mockUseCookieConsentContextOptional.mockReturnValue(null)

      render(<CookieSettingsButton />)

      // Le bouton doit être présent et cliquable sans erreur
      const button = screen.getByRole('button')
      await user.click(button)
      // Pas d'erreur = succès
    })
  })

  describe('Classes personnalisees', () => {
    it('accepte des classes supplementaires', () => {
      render(<CookieSettingsButton className="custom-class" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })

  describe('Accessibilite', () => {
    it('a un aria-label en mode normal', () => {
      render(<CookieSettingsButton />)

      expect(
        screen.getByRole('button', {
          name: /ouvrir les paramètres des cookies/i,
        })
      ).toBeInTheDocument()
    })

    it('a un aria-label en mode iconOnly', () => {
      render(<CookieSettingsButton iconOnly />)

      expect(
        screen.getByRole('button', { name: /paramètres des cookies/i })
      ).toBeInTheDocument()
    })

    it("l'icone a aria-hidden", () => {
      render(<CookieSettingsButton />)

      const svg = document.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
