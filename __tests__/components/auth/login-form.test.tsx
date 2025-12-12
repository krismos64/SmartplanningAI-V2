/**
 * Tests unitaires pour LoginForm
 *
 * LoginForm est le composant de connexion avec :
 * - React Hook Form + zodResolver (loginSchema)
 * - NextAuth signIn('credentials', { redirect: false })
 * - Toast notifications (Sonner)
 * - Redirection vers /app/dashboard après succès
 *
 * @ticket SP-140
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, setupUser, waitFor } from '../../utils/test-utils'
import { LoginForm } from '@/components/auth/LoginForm'

// ============================================================================
// MOCKS
// ============================================================================

// Mock next-auth/react
const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock sonner (toast)
const mockToastError = vi.fn()
const mockToastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}))

/**
 * Helper pour récupérer les inputs du formulaire
 */
function getFormInputs() {
  const emailInput = screen.getByPlaceholderText(
    /vous@entreprise.com/i
  ) as HTMLInputElement
  const passwordInput = screen.getByPlaceholderText(
    /••••••••/i
  ) as HTMLInputElement
  const submitButton = screen.getByRole('button', { name: /se connecter/i })
  return { emailInput, passwordInput, submitButton }
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // RENDU DE BASE
  // =========================================================================

  describe('Rendu de base', () => {
    it('renders all form fields', () => {
      render(<LoginForm />)

      expect(
        screen.getByPlaceholderText(/vous@entreprise.com/i)
      ).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /se connecter/i })
      ).toBeInTheDocument()
    })

    it('renders forgot password link', () => {
      render(<LoginForm />)

      expect(
        screen.getByRole('link', { name: /mot de passe oublié/i })
      ).toBeInTheDocument()
    })

    it('renders remember me checkbox', () => {
      render(<LoginForm />)

      expect(screen.getByText(/se souvenir de moi/i)).toBeInTheDocument()
    })

    it('renders email and password labels', () => {
      render(<LoginForm />)

      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Mot de passe')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // VALIDATION DES CHAMPS
  // =========================================================================

  describe('Validation des champs', () => {
    it('shows error when email is invalid', async () => {
      const user = setupUser()
      render(<LoginForm />)

      const { emailInput, passwordInput, submitButton } = getFormInputs()

      // Remplir le password pour isoler l'erreur email
      await user.type(emailInput, 'notanemail')
      await user.type(passwordInput, 'somepassword')
      await user.click(submitButton)

      await waitFor(() => {
        // Zod email validation message: "Email invalide"
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
      })
    })

    it('shows error when password is empty', async () => {
      const user = setupUser()
      render(<LoginForm />)

      const { emailInput, submitButton } = getFormInputs()

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/mot de passe est requis/i)).toBeInTheDocument()
      })
    })

    it('does not call signIn when form is invalid', async () => {
      const user = setupUser()
      render(<LoginForm />)

      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).not.toHaveBeenCalled()
      })
    })
  })

  // =========================================================================
  // SOUMISSION DU FORMULAIRE
  // =========================================================================

  describe('Soumission du formulaire', () => {
    it('calls signIn with correct credentials', async () => {
      const user = setupUser()
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<LoginForm />)

      const { emailInput, passwordInput, submitButton } = getFormInputs()

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'Password123!',
          redirect: false,
        })
      })
    })

    it('shows loading state while submitting', async () => {
      const user = setupUser()
      // Delay the response to check loading state
      mockSignIn.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      )

      render(<LoginForm />)

      const { emailInput, passwordInput, submitButton } = getFormInputs()

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.click(submitButton)

      expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  // =========================================================================
  // GESTION DES ERREURS
  // =========================================================================

  describe('Gestion des erreurs', () => {
    it('shows toast error when signIn fails with CredentialsSignin', async () => {
      const user = setupUser()
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      render(<LoginForm />)

      const { emailInput, passwordInput, submitButton } = getFormInputs()

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Erreur de connexion',
          expect.objectContaining({
            description: 'Email ou mot de passe incorrect',
          })
        )
      })
    })

    it('shows toast error when signIn fails with AccountDisabled', async () => {
      const user = setupUser()
      mockSignIn.mockResolvedValue({ ok: false, error: 'AccountDisabled' })

      render(<LoginForm />)

      const { emailInput, passwordInput, submitButton } = getFormInputs()

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Erreur de connexion',
          expect.objectContaining({
            description: expect.stringContaining('désactivé'),
          })
        )
      })
    })

    it('shows toast error on network error', async () => {
      const user = setupUser()
      mockSignIn.mockRejectedValue(new Error('Network error'))

      render(<LoginForm />)

      const { emailInput, passwordInput, submitButton } = getFormInputs()

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Erreur de connexion',
          expect.objectContaining({
            description: expect.stringContaining('inattendue'),
          })
        )
      })
    })

    it('does not redirect on signIn error', async () => {
      const user = setupUser()
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      render(<LoginForm />)

      const { emailInput, passwordInput, submitButton } = getFormInputs()

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })

  // =========================================================================
  // SUCCÈS DE CONNEXION
  // =========================================================================

  describe('Succès de connexion', () => {
    it('shows toast success and redirects on successful login', async () => {
      const user = setupUser()
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<LoginForm />)

      const { emailInput, passwordInput, submitButton } = getFormInputs()

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Connexion réussie',
          expect.objectContaining({
            description: expect.stringContaining('Redirection'),
          })
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/app/dashboard')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })
  })

  // =========================================================================
  // TOGGLE MOT DE PASSE
  // =========================================================================

  describe('Toggle visibilité mot de passe', () => {
    it('toggles password visibility when eye button is clicked', async () => {
      const user = setupUser()
      render(<LoginForm />)

      const { passwordInput } = getFormInputs()
      const toggleButton = screen.getByRole('button', {
        name: /afficher le mot de passe/i,
      })

      // Initially password type
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Click to show
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Click to hide again
      const hideButton = screen.getByRole('button', {
        name: /masquer le mot de passe/i,
      })
      await user.click(hideButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })
})
