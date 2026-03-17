/**
 * Tests unitaires pour RegisterForm
 *
 * RegisterForm est le composant d'inscription SaaS avec :
 * - React Hook Form + zodResolver (signupSchema)
 * - Server Action registerAction
 * - Auto-login après inscription réussie
 * - Toast notifications (Sonner)
 *
 * @ticket SP-140
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, setupUser, waitFor } from '../../utils/test-utils'
import { RegisterForm } from '@/components/auth/RegisterForm'

// ============================================================================
// MOCKS
// ============================================================================

// Mock registerAction
const mockRegisterAction = vi.fn()
vi.mock('@/lib/actions', () => ({
  registerAction: (...args: unknown[]) => mockRegisterAction(...args),
}))

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
const mockToastInfo = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
    info: (...args: unknown[]) => mockToastInfo(...args),
  },
}))

/**
 * Helper pour récupérer les inputs du formulaire
 */
function getFormInputs() {
  const nameInput = screen.getByPlaceholderText(
    /jean dupont/i
  ) as HTMLInputElement
  const emailInput = screen.getByPlaceholderText(
    /jean@entreprise.com/i
  ) as HTMLInputElement
  const companyInput = screen.getByPlaceholderText(
    /mon entreprise sas/i
  ) as HTMLInputElement
  // Le formulaire a 2 inputs avec le même placeholder ••••••••
  const passwordInputs = screen.getAllByPlaceholderText(
    /••••••••/i
  ) as HTMLInputElement[]
  const passwordInput = passwordInputs[0] as HTMLInputElement
  const confirmPasswordInput = passwordInputs[1] as HTMLInputElement
  const termsCheckbox = screen.getByRole('checkbox')
  const submitButton = screen.getByRole('button', { name: /créer mon compte/i })

  return {
    nameInput,
    emailInput,
    companyInput,
    passwordInput,
    confirmPasswordInput,
    termsCheckbox,
    submitButton,
  }
}

/**
 * Helper pour remplir le formulaire avec des données valides
 */
async function fillValidForm(user: ReturnType<typeof setupUser>) {
  const {
    nameInput,
    emailInput,
    companyInput,
    passwordInput,
    confirmPasswordInput,
    termsCheckbox,
  } = getFormInputs()

  await user.type(nameInput, 'Jean Dupont')
  await user.type(emailInput, 'jean@example.com')
  await user.type(companyInput, 'Mon Entreprise SAS')
  await user.type(passwordInput, 'Password123!')
  await user.type(confirmPasswordInput, 'Password123!')
  await user.click(termsCheckbox)
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // RENDU DE BASE
  // =========================================================================

  describe('Rendu de base', () => {
    it('renders all form fields', () => {
      render(<RegisterForm />)

      expect(screen.getByPlaceholderText(/jean dupont/i)).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/jean@entreprise.com/i)
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/mon entreprise sas/i)
      ).toBeInTheDocument()
      expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /créer mon compte/i })
      ).toBeInTheDocument()
    })

    it('renders terms and privacy links', () => {
      render(<RegisterForm />)

      expect(
        screen.getByRole('link', { name: /conditions d'utilisation/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /politique de confidentialité/i })
      ).toBeInTheDocument()
    })

    it('renders password requirements description', () => {
      render(<RegisterForm />)

      expect(screen.getByText(/minimum 8 caractères/i)).toBeInTheDocument()
    })

    it('renders all labels', () => {
      render(<RegisterForm />)

      expect(screen.getByText('Nom complet')).toBeInTheDocument()
      expect(screen.getByText('Email professionnel')).toBeInTheDocument()
      expect(screen.getByText('Nom de votre organisation')).toBeInTheDocument()
      expect(screen.getByText('Mot de passe')).toBeInTheDocument()
      expect(screen.getByText('Confirmer le mot de passe')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // VALIDATION DES CHAMPS
  // =========================================================================

  describe('Validation des champs', () => {
    it('shows error when email is invalid', async () => {
      const user = setupUser()
      render(<RegisterForm />)

      const {
        nameInput,
        emailInput,
        companyInput,
        passwordInput,
        confirmPasswordInput,
        termsCheckbox,
        submitButton,
      } = getFormInputs()

      // Remplir tous les champs sauf email qui est invalide
      await user.type(nameInput, 'Jean Dupont')
      await user.type(emailInput, 'invalid-email')
      await user.type(companyInput, 'Mon Entreprise')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(termsCheckbox)
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
      })
    })

    it('shows error when passwords do not match', async () => {
      const user = setupUser()
      render(<RegisterForm />)

      const {
        nameInput,
        emailInput,
        companyInput,
        passwordInput,
        confirmPasswordInput,
        termsCheckbox,
        submitButton,
      } = getFormInputs()

      await user.type(nameInput, 'Jean Dupont')
      await user.type(emailInput, 'jean@example.com')
      await user.type(companyInput, 'Mon Entreprise')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'DifferentPassword123!')
      await user.click(termsCheckbox)
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/mots de passe ne correspondent pas/i)
        ).toBeInTheDocument()
      })
    })

    it('shows error when terms are not accepted', async () => {
      const user = setupUser()
      render(<RegisterForm />)

      const {
        nameInput,
        emailInput,
        companyInput,
        passwordInput,
        confirmPasswordInput,
        submitButton,
      } = getFormInputs()

      await user.type(nameInput, 'Jean Dupont')
      await user.type(emailInput, 'jean@example.com')
      await user.type(companyInput, 'Mon Entreprise')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      // Don't check the terms checkbox
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/accepter les conditions/i)).toBeInTheDocument()
      })
    })

    it('shows error when name is too short', async () => {
      const user = setupUser()
      render(<RegisterForm />)

      const { nameInput, submitButton } = getFormInputs()

      await user.type(nameInput, 'J')
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/le nom doit contenir au moins 2 caractères/i)
        ).toBeInTheDocument()
      })
    })

    it('does not call registerAction when form is invalid', async () => {
      const user = setupUser()
      render(<RegisterForm />)

      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegisterAction).not.toHaveBeenCalled()
      })
    })
  })

  // =========================================================================
  // SOUMISSION DU FORMULAIRE
  // =========================================================================

  describe('Soumission du formulaire', () => {
    it('calls registerAction with correct data', async () => {
      const user = setupUser()
      mockRegisterAction.mockResolvedValue({
        success: true,
        userId: 'user-123',
        companyId: 'company-456',
      })
      mockSignIn.mockResolvedValue({ ok: true })

      render(<RegisterForm />)

      await fillValidForm(user)
      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegisterAction).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Jean Dupont',
            email: 'jean@example.com',
            companyName: 'Mon Entreprise SAS',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            acceptTerms: true,
          })
        )
      })
    })

    it('shows loading state while submitting', async () => {
      const user = setupUser()
      mockRegisterAction.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  userId: 'user-123',
                  companyId: 'company-456',
                }),
              100
            )
          )
      )

      render(<RegisterForm />)

      await fillValidForm(user)
      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      expect(screen.getByText(/création du compte/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  // =========================================================================
  // GESTION DES ERREURS
  // =========================================================================

  describe('Gestion des erreurs', () => {
    it('shows toast error when email already exists', async () => {
      const user = setupUser()
      mockRegisterAction.mockResolvedValue({
        success: false,
        error: 'Un compte existe déjà avec cet email',
        field: 'email',
      })

      render(<RegisterForm />)

      await fillValidForm(user)
      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Erreur lors de l'inscription",
          expect.objectContaining({
            description: 'Un compte existe déjà avec cet email',
          })
        )
      })
    })

    it('shows toast error on server error', async () => {
      const user = setupUser()
      mockRegisterAction.mockResolvedValue({
        success: false,
        error:
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
      })

      render(<RegisterForm />)

      await fillValidForm(user)
      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Erreur lors de l'inscription",
          expect.objectContaining({
            description: expect.stringContaining('erreur'),
          })
        )
      })
    })

    it('shows toast error on network error', async () => {
      const user = setupUser()
      mockRegisterAction.mockRejectedValue(new Error('Network error'))

      render(<RegisterForm />)

      await fillValidForm(user)
      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Erreur lors de l'inscription",
          expect.objectContaining({
            description: expect.stringContaining('inattendue'),
          })
        )
      })
    })
  })

  // =========================================================================
  // SUCCÈS D'INSCRIPTION + AUTO-LOGIN
  // =========================================================================

  describe("Succès d'inscription", () => {
    it('calls signIn for auto-login after successful registration', async () => {
      const user = setupUser()
      mockRegisterAction.mockResolvedValue({
        success: true,
        userId: 'user-123',
        companyId: 'company-456',
      })
      mockSignIn.mockResolvedValue({ ok: true })

      render(<RegisterForm />)

      await fillValidForm(user)
      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'jean@example.com',
          password: 'Password123!',
          redirect: false,
        })
      })
    })

    it('shows toast success and redirects after successful auto-login', async () => {
      const user = setupUser()
      mockRegisterAction.mockResolvedValue({
        success: true,
        userId: 'user-123',
        companyId: 'company-456',
      })
      mockSignIn.mockResolvedValue({ ok: true })

      render(<RegisterForm />)

      await fillValidForm(user)
      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Bienvenue sur SmartPlanning !',
          expect.objectContaining({
            description: expect.stringContaining('tableau de bord'),
          })
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/app/dashboard')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('redirects to login if auto-login fails', async () => {
      const user = setupUser()
      mockRegisterAction.mockResolvedValue({
        success: true,
        userId: 'user-123',
        companyId: 'company-456',
      })
      mockSignIn.mockResolvedValue({ ok: false, error: 'SomeError' })

      render(<RegisterForm />)

      await fillValidForm(user)
      const { submitButton } = getFormInputs()
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastInfo).toHaveBeenCalledWith(
          'Veuillez vous connecter',
          expect.objectContaining({
            description: expect.stringContaining('Connectez-vous'),
          })
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/connexion')
      })
    })
  })

  // =========================================================================
  // TOGGLE MOT DE PASSE
  // =========================================================================

  describe('Toggle visibilité mot de passe', () => {
    it('toggles password visibility', async () => {
      const user = setupUser()
      render(<RegisterForm />)

      const { passwordInput } = getFormInputs()
      const toggleButtons = screen.getAllByRole('button', {
        name: /afficher le mot de passe/i,
      })
      const toggleButton = toggleButtons[0] as HTMLButtonElement

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('toggles confirm password visibility independently', async () => {
      const user = setupUser()
      render(<RegisterForm />)

      const { confirmPasswordInput } = getFormInputs()
      const toggleButtons = screen.getAllByRole('button', {
        name: /afficher le mot de passe/i,
      })
      const toggleButton = toggleButtons[1] as HTMLButtonElement

      expect(confirmPasswordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(confirmPasswordInput).toHaveAttribute('type', 'text')
    })
  })
})
