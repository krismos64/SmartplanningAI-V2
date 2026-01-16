/**
 * Tests unitaires pour le composant CookiePreferencesModal
 *
 * @ticket SP-283
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { CookiePreferencesModal } from '@/components/cookies/CookiePreferencesModal'

// Mock du hook useCookieConsentContext du Provider
const mockUseCookieConsentContext = vi.fn()

vi.mock('@/components/cookies/CookieConsentProvider', () => ({
  useCookieConsentContext: () => mockUseCookieConsentContext(),
}))

describe('CookiePreferencesModal', () => {
  const defaultMockReturn = {
    hasConsented: false,
    isLoaded: true,
    acceptAll: vi.fn(),
    rejectAll: vi.fn(),
    openPreferences: vi.fn(),
    closePreferences: vi.fn(),
    savePreferences: vi.fn(),
    consent: null,
    preferences: { essential: true, analytics: false, functional: false },
    isPreferencesOpen: true,
  }

  beforeEach(() => {
    mockUseCookieConsentContext.mockReturnValue({ ...defaultMockReturn })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Affichage', () => {
    it("ne s'affiche pas si isPreferencesOpen est false", () => {
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        isPreferencesOpen: false,
      })

      render(<CookiePreferencesModal />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it("s'affiche si isPreferencesOpen est true", () => {
      render(<CookiePreferencesModal />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('affiche le titre et la description', () => {
      render(<CookiePreferencesModal />)

      expect(screen.getByText('Préférences des cookies')).toBeInTheDocument()
      expect(
        screen.getByText(/personnalisez vos choix de cookies/i)
      ).toBeInTheDocument()
    })

    it('affiche les trois categories de cookies', () => {
      render(<CookiePreferencesModal />)

      expect(screen.getByText('Cookies essentiels')).toBeInTheDocument()
      expect(screen.getByText('Cookies analytiques')).toBeInTheDocument()
      expect(screen.getByText('Cookies fonctionnels')).toBeInTheDocument()
    })

    it('affiche le badge "Requis" pour les cookies essentiels', () => {
      render(<CookiePreferencesModal />)

      expect(screen.getByText('Requis')).toBeInTheDocument()
    })

    it("affiche les trois boutons d'action", () => {
      render(<CookiePreferencesModal />)

      expect(screen.getByText('Tout refuser')).toBeInTheDocument()
      expect(screen.getByText('Tout accepter')).toBeInTheDocument()
      expect(screen.getByText('Sauvegarder mes choix')).toBeInTheDocument()
    })
  })

  describe('Date du dernier consentement', () => {
    it("n'affiche pas la date si pas de consentement precedent", () => {
      render(<CookiePreferencesModal />)

      expect(
        screen.queryByText(/dernier consentement/i)
      ).not.toBeInTheDocument()
    })

    it('affiche la date du dernier consentement si existe', () => {
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        consent: {
          version: 1,
          timestamp: '2026-01-16T10:00:00.000Z',
          preferences: { essential: true, analytics: true, functional: false },
        },
      })

      render(<CookiePreferencesModal />)

      expect(screen.getByText(/dernier consentement/i)).toBeInTheDocument()
      expect(screen.getByText(/16\/01\/2026/)).toBeInTheDocument()
    })
  })

  describe('Switches', () => {
    it('le switch essential est desactive', () => {
      render(<CookiePreferencesModal />)

      const essentialSwitch = screen.getByRole('switch', {
        name: /cookies essentiels/i,
      })
      expect(essentialSwitch).toBeDisabled()
      expect(essentialSwitch).toHaveAttribute('data-state', 'checked')
    })

    it('les switches analytics et functional sont actifs', () => {
      render(<CookiePreferencesModal />)

      const analyticsSwitch = screen.getByRole('switch', {
        name: /cookies analytiques/i,
      })
      const functionalSwitch = screen.getByRole('switch', {
        name: /cookies fonctionnels/i,
      })

      expect(analyticsSwitch).not.toBeDisabled()
      expect(functionalSwitch).not.toBeDisabled()
    })

    it("reflète l'etat des preferences", () => {
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        preferences: { essential: true, analytics: true, functional: false },
      })

      render(<CookiePreferencesModal />)

      const analyticsSwitch = screen.getByRole('switch', {
        name: /cookies analytiques/i,
      })
      expect(analyticsSwitch).toHaveAttribute('data-state', 'checked')

      const functionalSwitch = screen.getByRole('switch', {
        name: /cookies fonctionnels/i,
      })
      expect(functionalSwitch).toHaveAttribute('data-state', 'unchecked')
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

      render(<CookiePreferencesModal />)

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

      render(<CookiePreferencesModal />)

      await user.click(screen.getByText('Tout refuser'))
      expect(rejectAll).toHaveBeenCalledTimes(1)
    })

    it('appelle savePreferences au clic sur "Sauvegarder"', async () => {
      const user = setupUser()
      const savePreferences = vi.fn()
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        savePreferences,
      })

      render(<CookiePreferencesModal />)

      await user.click(screen.getByText('Sauvegarder mes choix'))
      expect(savePreferences).toHaveBeenCalledTimes(1)
    })

    it('appelle closePreferences lors de la fermeture', async () => {
      const user = setupUser()
      const closePreferences = vi.fn()
      mockUseCookieConsentContext.mockReturnValue({
        ...defaultMockReturn,
        closePreferences,
      })

      render(<CookiePreferencesModal />)

      // Ferme en cliquant sur le bouton close (sr-only "Close")
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      expect(closePreferences).toHaveBeenCalled()
    })
  })

  describe('Accessibilite', () => {
    it('a le role dialog', () => {
      render(<CookiePreferencesModal />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('les switches ont des aria-labels', () => {
      render(<CookiePreferencesModal />)

      expect(
        screen.getByRole('switch', { name: /cookies essentiels/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('switch', { name: /cookies analytiques/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('switch', { name: /cookies fonctionnels/i })
      ).toBeInTheDocument()
    })
  })
})
