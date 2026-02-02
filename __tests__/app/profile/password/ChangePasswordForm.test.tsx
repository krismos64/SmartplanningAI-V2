/**
 * Tests unitaires pour ChangePasswordForm
 *
 * @ticket SP-273
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ChangePasswordForm } from '@/app/app/profile/password/_components/ChangePasswordForm'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock changePassword action
const mockChangePassword = vi.fn()
vi.mock('@/lib/actions/profile', () => ({
  changePassword: (data: unknown) => mockChangePassword(data),
}))

// Mock useCrudMutation
vi.mock('@/hooks/use-crud-mutation', () => ({
  useCrudMutation: (
    action: (data: unknown) => Promise<unknown>,
    options: { onSuccess?: () => void; onError?: (error: string, field?: string) => void }
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

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChangePassword.mockResolvedValue({ success: true, data: { message: 'OK' } })
  })

  // ============================================
  // RENDU INITIAL
  // ============================================
  describe('Rendu initial', () => {
    it('should render all password fields', () => {
      render(<ChangePasswordForm />)

      expect(screen.getByTestId('input-currentPassword')).toBeInTheDocument()
      expect(screen.getByTestId('input-newPassword')).toBeInTheDocument()
      expect(screen.getByTestId('input-confirmNewPassword')).toBeInTheDocument()
    })

    it('should render password visibility toggles', () => {
      render(<ChangePasswordForm />)

      expect(screen.getByTestId('toggle-currentPassword')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-newPassword')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-confirmNewPassword')).toBeInTheDocument()
    })

    it('should render submit button disabled initially', () => {
      render(<ChangePasswordForm />)

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('should render back button', () => {
      render(<ChangePasswordForm />)

      expect(screen.getByTestId('back-button')).toBeInTheDocument()
    })

    it('should render cancel button', () => {
      render(<ChangePasswordForm />)

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    it('should have correct form title', () => {
      render(<ChangePasswordForm />)

      expect(
        screen.getByText('Changer mon mot de passe')
      ).toBeInTheDocument()
    })
  })

  // ============================================
  // TOGGLE VISIBILITÉ
  // ============================================
  describe('Toggle visibilité', () => {
    it('should toggle currentPassword visibility', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const input = screen.getByTestId('input-currentPassword')
      const toggle = screen.getByTestId('toggle-currentPassword')

      expect(input).toHaveAttribute('type', 'password')

      await user.click(toggle)
      expect(input).toHaveAttribute('type', 'text')

      await user.click(toggle)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should toggle newPassword visibility', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const input = screen.getByTestId('input-newPassword')
      const toggle = screen.getByTestId('toggle-newPassword')

      expect(input).toHaveAttribute('type', 'password')

      await user.click(toggle)
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should toggle confirmPassword visibility', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const input = screen.getByTestId('input-confirmNewPassword')
      const toggle = screen.getByTestId('toggle-confirmNewPassword')

      expect(input).toHaveAttribute('type', 'password')

      await user.click(toggle)
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  // ============================================
  // INDICATEUR DE FORCE
  // ============================================
  describe('Indicateur de force', () => {
    it('should not show password strength indicator initially', () => {
      render(<ChangePasswordForm />)

      expect(
        screen.queryByTestId('password-strength-indicator')
      ).not.toBeInTheDocument()
    })

    it('should show password strength indicator when typing new password', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const input = screen.getByTestId('input-newPassword')
      await user.type(input, 'test')

      expect(
        screen.getByTestId('password-strength-indicator')
      ).toBeInTheDocument()
    })
  })

  // ============================================
  // VALIDATION CÔTÉ CLIENT
  // ============================================
  describe('Validation côté client', () => {
    it('should show error when currentPassword is empty on submit', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      // Fill only new passwords to make form dirty
      await user.type(
        screen.getByTestId('input-newPassword'),
        'NewPass123!'
      )
      await user.type(
        screen.getByTestId('input-confirmNewPassword'),
        'NewPass123!'
      )

      // Try to submit
      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(
          screen.getByText('Le mot de passe actuel est requis')
        ).toBeInTheDocument()
      })
    })

    it('should show error when newPassword is too weak', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      await user.type(
        screen.getByTestId('input-currentPassword'),
        'OldPass123!'
      )
      await user.type(screen.getByTestId('input-newPassword'), 'weak')
      await user.type(
        screen.getByTestId('input-confirmNewPassword'),
        'weak'
      )

      await user.click(screen.getByTestId('submit-button'))

      // The error message could be about length OR missing characters
      await waitFor(() => {
        const errorElement = screen.getByTestId('error-newPassword')
        expect(errorElement).toBeInTheDocument()
      })
    })

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      await user.type(
        screen.getByTestId('input-currentPassword'),
        'OldPass123!'
      )
      await user.type(
        screen.getByTestId('input-newPassword'),
        'NewPass123!'
      )
      await user.type(
        screen.getByTestId('input-confirmNewPassword'),
        'DifferentPass123!'
      )

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(
          screen.getByText('Les nouveaux mots de passe ne correspondent pas')
        ).toBeInTheDocument()
      })
    })

    it('should show error when using same password', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      await user.type(
        screen.getByTestId('input-currentPassword'),
        'SamePass123!'
      )
      await user.type(
        screen.getByTestId('input-newPassword'),
        'SamePass123!'
      )
      await user.type(
        screen.getByTestId('input-confirmNewPassword'),
        'SamePass123!'
      )

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(
          screen.getByText(
            "Le nouveau mot de passe doit être différent de l'ancien"
          )
        ).toBeInTheDocument()
      })
    })
  })

  // ============================================
  // SOUMISSION
  // ============================================
  describe('Soumission', () => {
    it('should enable submit button when form is dirty', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()

      await user.type(
        screen.getByTestId('input-currentPassword'),
        'OldPass123!'
      )

      expect(submitButton).not.toBeDisabled()
    })

    it('should call changePassword action on valid submit', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      await user.type(
        screen.getByTestId('input-currentPassword'),
        'OldPass123!'
      )
      await user.type(
        screen.getByTestId('input-newPassword'),
        'NewPass123!'
      )
      await user.type(
        screen.getByTestId('input-confirmNewPassword'),
        'NewPass123!'
      )

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockChangePassword).toHaveBeenCalledWith({
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!',
          confirmNewPassword: 'NewPass123!',
        })
      })
    })

    it('should navigate to profile on success', async () => {
      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      await user.type(
        screen.getByTestId('input-currentPassword'),
        'OldPass123!'
      )
      await user.type(
        screen.getByTestId('input-newPassword'),
        'NewPass123!'
      )
      await user.type(
        screen.getByTestId('input-confirmNewPassword'),
        'NewPass123!'
      )

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/app/profile')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })
  })

  // ============================================
  // GESTION DES ERREURS SERVEUR
  // ============================================
  describe('Gestion des erreurs serveur', () => {
    it('should show field error when server returns field-specific error', async () => {
      mockChangePassword.mockResolvedValue({
        success: false,
        error: 'Mot de passe actuel incorrect',
        field: 'currentPassword',
      })

      const user = userEvent.setup()
      render(<ChangePasswordForm />)

      await user.type(
        screen.getByTestId('input-currentPassword'),
        'WrongPass123!'
      )
      await user.type(
        screen.getByTestId('input-newPassword'),
        'NewPass123!'
      )
      await user.type(
        screen.getByTestId('input-confirmNewPassword'),
        'NewPass123!'
      )

      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(
          screen.getByText('Mot de passe actuel incorrect')
        ).toBeInTheDocument()
      })
    })
  })

  // ============================================
  // ACCESSIBILITÉ
  // ============================================
  describe('Accessibilité', () => {
    it('should have correct aria-label on toggle buttons', () => {
      render(<ChangePasswordForm />)

      expect(screen.getByTestId('toggle-currentPassword')).toHaveAttribute(
        'aria-label',
        'Afficher le mot de passe actuel'
      )
      expect(screen.getByTestId('toggle-newPassword')).toHaveAttribute(
        'aria-label',
        'Afficher le nouveau mot de passe'
      )
    })

    it('should have correct autocomplete attributes', () => {
      render(<ChangePasswordForm />)

      expect(screen.getByTestId('input-currentPassword')).toHaveAttribute(
        'autocomplete',
        'current-password'
      )
      expect(screen.getByTestId('input-newPassword')).toHaveAttribute(
        'autocomplete',
        'new-password'
      )
      expect(screen.getByTestId('input-confirmNewPassword')).toHaveAttribute(
        'autocomplete',
        'new-password'
      )
    })
  })
})
