/**
 * Tests unitaires pour ResetPasswordForm
 *
 * @ticket SP-263
 * @description Tests de rendu, validation et soumission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ResetPasswordForm } from '../ResetPasswordForm'

// Mock des Server Actions
vi.mock('@/lib/actions/password-actions', () => ({
  resetPasswordAction: vi.fn(),
}))

// Mock de next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}))

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Import après les mocks
import { resetPasswordAction } from '@/lib/actions/password-actions'

const mockResetPasswordAction = resetPasswordAction as ReturnType<typeof vi.fn>

const VALID_TOKEN = 'valid-test-token-123'

/**
 * Helper pour récupérer les inputs password du formulaire
 */
function getPasswordInputs() {
  const inputs = screen.getAllByPlaceholderText('••••••••')
  const passwordInput = inputs[0]!
  const confirmInput = inputs[1]!
  return { passwordInput, confirmInput }
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // TESTS DE RENDU
  // ==========================================================================

  describe('Rendu', () => {
    it('renders password and confirm password inputs', () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      // Utiliser getByPlaceholderText car FormControl wrap les inputs
      const { passwordInput, confirmInput } = getPasswordInputs()
      expect(passwordInput).toHaveAttribute('name', 'password')
      expect(confirmInput).toHaveAttribute('name', 'confirmPassword')
    })

    it('renders submit button', () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      expect(
        screen.getByRole('button', { name: /réinitialiser/i })
      ).toBeInTheDocument()
    })

    it('renders link back to login', () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const loginLink = screen.getByRole('link', { name: /retour/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('renders password requirements hint', () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      expect(screen.getByText(/minimum 8 caractères/i)).toBeInTheDocument()
    })

    it('applies dark variant styling', () => {
      render(<ResetPasswordForm token={VALID_TOKEN} variant="dark" />)

      const { passwordInput } = getPasswordInputs()
      expect(passwordInput).toHaveClass('border-white/20')
    })
  })

  // ==========================================================================
  // TESTS DE VALIDATION
  // ==========================================================================

  describe('Validation', () => {
    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'Password123!')
      await user.type(confirmInput, 'DifferentPassword123!')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/mots de passe ne correspondent pas/i)
        ).toBeInTheDocument()
      })
    })

    it('shows error for weak password', async () => {
      const user = userEvent.setup()
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'weak')
      await user.type(confirmInput, 'weak')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument()
      })
    })

    it('shows error for empty fields', async () => {
      const user = userEvent.setup()
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getAllByText(/mot de passe/i).length).toBeGreaterThan(0)
      })
    })
  })

  // ==========================================================================
  // TESTS DE SOUMISSION
  // ==========================================================================

  describe('Soumission', () => {
    it('calls resetPasswordAction with token on valid submit', async () => {
      const user = userEvent.setup()
      mockResetPasswordAction.mockResolvedValue({ success: true })

      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'NewPassword123!')
      await user.type(confirmInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockResetPasswordAction).toHaveBeenCalledWith({
          token: VALID_TOKEN,
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      mockResetPasswordAction.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      )

      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'NewPassword123!')
      await user.type(confirmInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      expect(screen.getByText(/réinitialisation.../i)).toBeInTheDocument()
    })

    it('shows success message on successful reset', async () => {
      const user = userEvent.setup()
      mockResetPasswordAction.mockResolvedValue({ success: true })

      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'NewPassword123!')
      await user.type(confirmInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/mot de passe réinitialisé/i)
        ).toBeInTheDocument()
      })
    })
  })

  // ==========================================================================
  // TESTS ERREURS SERVEUR
  // ==========================================================================

  describe('Erreurs serveur', () => {
    it('shows error message for invalid token', async () => {
      const user = userEvent.setup()
      const { toast } = await import('sonner')
      mockResetPasswordAction.mockResolvedValue({
        success: false,
        error:
          'Ce lien de réinitialisation est invalide ou a déjà été utilisé.',
      })

      render(<ResetPasswordForm token="invalid-token" />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'NewPassword123!')
      await user.type(confirmInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      // Toast.error devrait être appelé avec le message d'erreur
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur', {
          description:
            'Ce lien de réinitialisation est invalide ou a déjà été utilisé.',
        })
      })
    })

    it('shows error message for expired token', async () => {
      const user = userEvent.setup()
      const { toast } = await import('sonner')
      mockResetPasswordAction.mockResolvedValue({
        success: false,
        error:
          'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
      })

      render(<ResetPasswordForm token="expired-token" />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'NewPassword123!')
      await user.type(confirmInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur', {
          description:
            'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
        })
      })
    })
  })

  // ==========================================================================
  // TESTS INTERACTION (Visibilité mot de passe)
  // ==========================================================================

  describe('Interactions', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { passwordInput } = getPasswordInputs()
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Find toggle button for first password field
      const toggleButtons = screen.getAllByRole('button', {
        name: /afficher|masquer/i,
      })
      await user.click(toggleButtons[0]!)

      expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('toggles confirm password visibility', async () => {
      const user = userEvent.setup()
      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { confirmInput } = getPasswordInputs()
      expect(confirmInput).toHaveAttribute('type', 'password')

      // Find toggle button for second password field
      const toggleButtons = screen.getAllByRole('button', {
        name: /afficher|masquer/i,
      })
      await user.click(toggleButtons[1]!)

      expect(confirmInput).toHaveAttribute('type', 'text')
    })
  })

  // ==========================================================================
  // TESTS REDIRECTION
  // ==========================================================================

  describe('Redirection', () => {
    it('shows countdown after successful reset', async () => {
      const user = userEvent.setup()
      mockResetPasswordAction.mockResolvedValue({ success: true })

      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'NewPassword123!')
      await user.type(confirmInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/redirection dans/i)).toBeInTheDocument()
      })
    })

    it('shows immediate login button after success', async () => {
      const user = userEvent.setup()
      mockResetPasswordAction.mockResolvedValue({ success: true })

      render(<ResetPasswordForm token={VALID_TOKEN} />)

      const { passwordInput, confirmInput } = getPasswordInputs()

      await user.type(passwordInput, 'NewPassword123!')
      await user.type(confirmInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', {
        name: /réinitialiser/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /se connecter maintenant/i })
        ).toBeInTheDocument()
      })
    })
  })
})
