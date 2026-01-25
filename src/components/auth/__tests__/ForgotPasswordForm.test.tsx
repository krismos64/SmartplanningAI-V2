/**
 * Tests unitaires pour ForgotPasswordForm
 *
 * @ticket SP-263
 * @description Tests de rendu, validation et soumission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ForgotPasswordForm } from '../ForgotPasswordForm'

// Mock des Server Actions
vi.mock('@/lib/actions/password-actions', () => ({
  forgotPasswordAction: vi.fn(),
}))

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
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
import { forgotPasswordAction } from '@/lib/actions/password-actions'

const mockForgotPasswordAction = forgotPasswordAction as ReturnType<typeof vi.fn>

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // TESTS DE RENDU
  // ==========================================================================

  describe('Rendu', () => {
    it('renders email input and submit button', () => {
      render(<ForgotPasswordForm />)

      expect(screen.getByPlaceholderText(/vous@entreprise.com/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /envoyer le lien/i })
      ).toBeInTheDocument()
    })

    it('renders link back to login', () => {
      render(<ForgotPasswordForm />)

      const loginLink = screen.getByRole('link', { name: /retour/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('renders description text', () => {
      render(<ForgotPasswordForm />)

      expect(
        screen.getByText(/entrez votre adresse email/i)
      ).toBeInTheDocument()
    })

    it('applies dark variant styling', () => {
      render(<ForgotPasswordForm variant="dark" />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      expect(emailInput).toHaveClass('border-white/20')
    })
  })

  // ==========================================================================
  // TESTS DE VALIDATION
  // ==========================================================================

  describe('Validation', () => {
    it('shows error for empty email', async () => {
      const user = userEvent.setup()
      render(<ForgotPasswordForm />)

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email.*requis/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
      })
    })

    it('does not show error for valid email', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAction.mockResolvedValue({ success: true })

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/email invalide/i)).not.toBeInTheDocument()
      })
    })
  })

  // ==========================================================================
  // TESTS DE SOUMISSION
  // ==========================================================================

  describe('Soumission', () => {
    it('calls forgotPasswordAction on valid submit', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAction.mockResolvedValue({ success: true })

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPasswordAction).toHaveBeenCalledWith({
          email: 'test@example.com',
        })
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAction.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      )

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      expect(screen.getByText(/envoi en cours/i)).toBeInTheDocument()
    })

    it('shows success message after submission', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAction.mockResolvedValue({ success: true })

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/vérifiez votre boîte mail/i)).toBeInTheDocument()
      })
    })

    it('hides form after successful submission', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAction.mockResolvedValue({ success: true })

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/vous@entreprise.com/i)).not.toBeInTheDocument()
      })
    })
  })

  // ==========================================================================
  // TESTS DE SÉCURITÉ (ANTI-ÉNUMÉRATION)
  // ==========================================================================

  describe('Sécurité (anti-énumération)', () => {
    it('shows same success message regardless of email existence', async () => {
      const user = userEvent.setup()
      // La Server Action retourne toujours success=true pour ne pas révéler si l'email existe
      mockForgotPasswordAction.mockResolvedValue({ success: true })

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'nonexistent@example.com')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/vérifiez votre boîte mail/i)).toBeInTheDocument()
        expect(
          screen.getByText(/si un compte existe avec cet email/i)
        ).toBeInTheDocument()
      })
    })

    it('shows success message even on network error', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAction.mockRejectedValue(new Error('Network error'))

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/vérifiez votre boîte mail/i)).toBeInTheDocument()
      })
    })
  })

  // ==========================================================================
  // TESTS D'INTERACTION
  // ==========================================================================

  describe('Interactions', () => {
    it('allows retry after success', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAction.mockResolvedValue({ success: true })

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByPlaceholderText(/vous@entreprise.com/i)
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', {
        name: /envoyer le lien/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/vérifiez votre boîte mail/i)).toBeInTheDocument()
      })

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /réessayer/i })
      await user.click(retryButton)

      // Form should be visible again
      expect(screen.getByPlaceholderText(/vous@entreprise.com/i)).toBeInTheDocument()
    })
  })
})
