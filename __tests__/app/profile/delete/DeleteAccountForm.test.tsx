/**
 * Tests unitaires pour DeleteAccountForm
 *
 * @ticket SP-277
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { DeleteAccountForm } from '@/app/app/profile/delete/_components/DeleteAccountForm'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock next-auth/react
const mockSignOut = vi.fn()
vi.mock('next-auth/react', () => ({
  signOut: (options: { callbackUrl: string }) => mockSignOut(options),
}))

// Mock deleteAccount action
const mockDeleteAccount = vi.fn()
vi.mock('@/lib/actions/profile', () => ({
  deleteAccount: (data: unknown) => mockDeleteAccount(data),
}))

// Mock useCrudMutation
vi.mock('@/hooks/use-crud-mutation', () => ({
  useCrudMutation: (
    action: (data: unknown) => Promise<unknown>,
    options: {
      onSuccess?: () => void
      onError?: (error: string, field?: string) => void
    }
  ) => ({
    mutate: async (data: unknown) => {
      const result = await action(data)
      if ((result as { success: boolean }).success) {
        options.onSuccess?.()
      } else {
        const errorResult = result as { error: string; field?: string }
        options.onError?.(errorResult.error, errorResult.field)
      }
      return result
    },
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}))

describe('DeleteAccountForm', () => {
  const userEmail = 'test@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteAccount.mockResolvedValue({
      success: true,
      data: { message: 'OK' },
    })
    mockSignOut.mockResolvedValue(undefined)
  })

  // ============================================
  // RENDU INITIAL
  // ============================================
  describe('Rendu initial', () => {
    it('should render form title', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(screen.getByText('Supprimer mon compte')).toBeInTheDocument()
    })

    it('should render RGPD warning alert', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(
        screen.getByText('Attention - Suppression définitive')
      ).toBeInTheDocument()
      expect(screen.getByText(/RGPD \(Article 17\)/)).toBeInTheDocument()
    })

    it('should display user email hint', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(screen.getByText(`(${userEmail})`)).toBeInTheDocument()
    })

    it('should render confirm email input', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(screen.getByTestId('confirm-email-input')).toBeInTheDocument()
    })

    it('should render password input', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })

    it('should render confirm deletion checkbox', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(
        screen.getByTestId('confirm-deletion-checkbox')
      ).toBeInTheDocument()
    })

    it('should render submit button disabled initially', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      const submitButton = screen.getByTestId('delete-account-button')
      expect(submitButton).toBeDisabled()
    })

    it('should render cancel button with profile link', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      const cancelButton = screen.getByTestId('cancel-button')
      expect(cancelButton).toHaveAttribute('href', '/app/profile')
    })
  })

  // ============================================
  // LISTE DES DONNÉES SUPPRIMÉES
  // ============================================
  describe('Liste des données supprimées', () => {
    it('should display list of data that will be deleted', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(
        screen.getByText(/Votre profil et informations personnelles/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Vos plannings et historique de présence/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Vos demandes de congés et soldes/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Vos notes et tâches personnelles/)
      ).toBeInTheDocument()
      expect(screen.getByText(/Toutes vos notifications/)).toBeInTheDocument()
    })
  })

  // ============================================
  // TOGGLE VISIBILITÉ MOT DE PASSE
  // ============================================
  describe('Toggle visibilité mot de passe', () => {
    it('should have password hidden by default', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(screen.getByTestId('password-input')).toHaveAttribute(
        'type',
        'password'
      )
    })

    it('should toggle password visibility on click', async () => {
      const user = userEvent.setup()
      render(<DeleteAccountForm userEmail={userEmail} />)

      const toggleButton = screen.getByTestId('toggle-password-visibility')
      const passwordInput = screen.getByTestId('password-input')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  // ============================================
  // ACTIVATION BOUTON SUBMIT
  // ============================================
  describe('Activation bouton submit', () => {
    it('should enable submit when all fields filled and checkbox checked', async () => {
      const user = userEvent.setup()
      render(<DeleteAccountForm userEmail={userEmail} />)

      await user.type(screen.getByTestId('confirm-email-input'), userEmail)
      await user.type(screen.getByTestId('password-input'), 'ValidP@ss123')
      await user.click(screen.getByTestId('confirm-deletion-checkbox'))

      expect(screen.getByTestId('delete-account-button')).not.toBeDisabled()
    })

    it('should keep submit disabled if checkbox not checked', async () => {
      const user = userEvent.setup()
      render(<DeleteAccountForm userEmail={userEmail} />)

      await user.type(screen.getByTestId('confirm-email-input'), userEmail)
      await user.type(screen.getByTestId('password-input'), 'ValidP@ss123')
      // No checkbox click

      expect(screen.getByTestId('delete-account-button')).toBeDisabled()
    })
  })

  // ============================================
  // VALIDATION CÔTÉ CLIENT
  // ============================================
  describe('Validation côté client', () => {
    it('should show error when email format is invalid', async () => {
      const user = userEvent.setup()
      render(<DeleteAccountForm userEmail={userEmail} />)

      await user.type(
        screen.getByTestId('confirm-email-input'),
        'invalid-email'
      )
      await user.type(screen.getByTestId('password-input'), 'ValidP@ss123')
      await user.click(screen.getByTestId('confirm-deletion-checkbox'))
      await user.click(screen.getByTestId('delete-account-button'))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-email-error')).toBeInTheDocument()
      })
    })
  })

  // ============================================
  // SOUMISSION
  // ============================================
  describe('Soumission', () => {
    it('should call deleteAccount with correct data', async () => {
      const user = userEvent.setup()
      render(<DeleteAccountForm userEmail={userEmail} />)

      await user.type(screen.getByTestId('confirm-email-input'), userEmail)
      await user.type(screen.getByTestId('password-input'), 'ValidP@ss123')
      await user.click(screen.getByTestId('confirm-deletion-checkbox'))
      await user.click(screen.getByTestId('delete-account-button'))

      await waitFor(() => {
        expect(mockDeleteAccount).toHaveBeenCalledWith({
          confirmEmail: userEmail,
          password: 'ValidP@ss123',
          confirmDeletion: true,
        })
      })
    })

    it('should call signOut after successful deletion', async () => {
      const user = userEvent.setup()
      render(<DeleteAccountForm userEmail={userEmail} />)

      await user.type(screen.getByTestId('confirm-email-input'), userEmail)
      await user.type(screen.getByTestId('password-input'), 'ValidP@ss123')
      await user.click(screen.getByTestId('confirm-deletion-checkbox'))
      await user.click(screen.getByTestId('delete-account-button'))

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({
          callbackUrl: '/login?deleted=true',
        })
      })
    })
  })

  // ============================================
  // GESTION DES ERREURS SERVEUR
  // ============================================
  describe('Gestion des erreurs serveur', () => {
    it('should show field error when email does not match', async () => {
      mockDeleteAccount.mockResolvedValue({
        success: false,
        error: "L'email saisi ne correspond pas à votre compte",
        field: 'confirmEmail',
      })

      const user = userEvent.setup()
      render(<DeleteAccountForm userEmail={userEmail} />)

      await user.type(
        screen.getByTestId('confirm-email-input'),
        'wrong@email.com'
      )
      await user.type(screen.getByTestId('password-input'), 'ValidP@ss123')
      await user.click(screen.getByTestId('confirm-deletion-checkbox'))
      await user.click(screen.getByTestId('delete-account-button'))

      await waitFor(() => {
        expect(screen.getByTestId('confirm-email-error')).toBeInTheDocument()
      })
    })

    it('should show field error when password is incorrect', async () => {
      mockDeleteAccount.mockResolvedValue({
        success: false,
        error: 'Mot de passe incorrect',
        field: 'password',
      })

      const user = userEvent.setup()
      render(<DeleteAccountForm userEmail={userEmail} />)

      await user.type(screen.getByTestId('confirm-email-input'), userEmail)
      await user.type(screen.getByTestId('password-input'), 'WrongPassword')
      await user.click(screen.getByTestId('confirm-deletion-checkbox'))
      await user.click(screen.getByTestId('delete-account-button'))

      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toBeInTheDocument()
      })
    })
  })

  // ============================================
  // ACCESSIBILITÉ
  // ============================================
  describe('Accessibilité', () => {
    it('should have correct aria-label on password toggle', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(screen.getByTestId('toggle-password-visibility')).toHaveAttribute(
        'aria-label',
        'Afficher le mot de passe'
      )
    })

    it('should have checkbox linked to label', () => {
      render(<DeleteAccountForm userEmail={userEmail} />)

      expect(
        screen.getByText(/Je comprends que cette action est irréversible/)
      ).toBeInTheDocument()
    })
  })
})
