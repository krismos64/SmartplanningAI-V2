/**
 * Tests d'intégration pour le flux complet ContactForm
 *
 * @ticket SP-289
 * @description Tests des flux complets : formulaire → loading → success/error → reset/retry
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/public/ContactForm'

// Mock framer-motion avec AnimatePresence fonctionnel
vi.mock('framer-motion', () => ({
  motion: {
    form: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <form {...props}>{children}</form>
    ),
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <p {...props}>{children}</p>
    ),
    svg: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <svg {...props}>{children}</svg>
    ),
    circle: (props: object) => <circle {...props} />,
    path: (props: object) => <path {...props} />,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useAnimation: () => ({
    start: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock sonner (toast)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const validFormData = {
  name: 'Jean Dupont',
  email: 'jean@test.com',
  subject: 'Test sujet valide',
  message:
    'Ceci est un message de test avec plus de 20 caractères pour passer la validation.',
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nom complet/i), validFormData.name)
  await user.type(screen.getByLabelText(/adresse email/i), validFormData.email)
  await user.type(screen.getByLabelText(/sujet/i), validFormData.subject)
  await user.type(screen.getByLabelText(/message/i), validFormData.message)
}

describe('ContactForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // FLUX SUCCÈS COMPLET
  // ==========================================================================
  describe('Flux : Formulaire → Loading → Succès', () => {
    it('devrait afficher le formulaire, puis loading, puis succès', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ success: true }), 50)
            )
        )

      render(<ContactForm onSubmit={mockOnSubmit} />)

      // 1. Formulaire visible
      expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /envoyer le message/i })
      ).toBeInTheDocument()

      // 2. Remplir et soumettre
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      // 3. État loading
      expect(screen.getByText(/envoi en cours/i)).toBeInTheDocument()

      // 4. État succès
      await waitFor(() => {
        expect(screen.getByText(/merci jean dupont/i)).toBeInTheDocument()
      })
      expect(
        screen.getByText(/votre message a bien été envoyé/i)
      ).toBeInTheDocument()
    })

    it('devrait masquer le formulaire après succès', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/merci jean dupont/i)).toBeInTheDocument()
      })

      // Formulaire ne devrait plus être visible
      expect(screen.queryByLabelText(/nom complet/i)).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // FLUX SUCCÈS → RESET
  // ==========================================================================
  describe('Flux : Succès → Reset → Formulaire', () => {
    it('devrait revenir au formulaire après clic sur "Envoyer un autre message"', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      // Soumettre le formulaire
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      // Attendre l'état de succès
      await waitFor(() => {
        expect(screen.getByText(/merci jean dupont/i)).toBeInTheDocument()
      })

      // Cliquer sur le bouton de reset
      await user.click(
        screen.getByRole('button', { name: /envoyer un autre message/i })
      )

      // Le formulaire doit réapparaître
      await waitFor(() => {
        expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: /envoyer le message/i })
      ).toBeInTheDocument()
    })

    it('devrait réinitialiser les champs du formulaire après reset', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/merci jean dupont/i)).toBeInTheDocument()
      })

      await user.click(
        screen.getByRole('button', { name: /envoyer un autre message/i })
      )

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nom complet/i)
        expect(nameInput).toHaveValue('')
      })
    })
  })

  // ==========================================================================
  // FLUX ERREUR
  // ==========================================================================
  describe('Flux : Formulaire → Loading → Erreur', () => {
    it("devrait afficher l'état d'erreur après échec", async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: false,
        error: 'Erreur serveur interne',
      })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/erreur lors de l'envoi/i)).toBeInTheDocument()
        expect(screen.getByText('Erreur serveur interne')).toBeInTheDocument()
      })
    })

    it("devrait garder le formulaire visible en état d'erreur", async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: false,
        error: 'Erreur',
      })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/erreur lors de l'envoi/i)).toBeInTheDocument()
      })

      // Formulaire toujours visible
      expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument()
    })

    it('devrait conserver les données du formulaire après erreur', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: false,
        error: 'Erreur',
      })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/erreur lors de l'envoi/i)).toBeInTheDocument()
      })

      // Vérifier que les données sont conservées
      expect(screen.getByLabelText(/nom complet/i)).toHaveValue(
        validFormData.name
      )
      expect(screen.getByLabelText(/adresse email/i)).toHaveValue(
        validFormData.email
      )
    })
  })

  // ==========================================================================
  // FLUX ERREUR → RETRY
  // ==========================================================================
  describe('Flux : Erreur → Retry → Succès', () => {
    it('devrait permettre de réessayer après une erreur', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi
        .fn()
        .mockResolvedValueOnce({ success: false, error: 'Erreur temporaire' })
        .mockResolvedValueOnce({ success: true })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      // Erreur affichée
      await waitFor(() => {
        expect(screen.getByText('Erreur temporaire')).toBeInTheDocument()
      })

      // Cliquer sur Réessayer
      await user.click(screen.getByRole('button', { name: /réessayer/i }))

      // Succès
      await waitFor(() => {
        expect(screen.getByText(/merci jean dupont/i)).toBeInTheDocument()
      })
    })

    it('devrait appeler onSubmit avec les mêmes données lors du retry', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi
        .fn()
        .mockResolvedValueOnce({ success: false, error: 'Erreur' })
        .mockResolvedValueOnce({ success: true })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /réessayer/i })
        ).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /réessayer/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(2)
      })

      // Les deux appels ont les mêmes données
      const firstCall = mockOnSubmit.mock.calls[0][0]
      const secondCall = mockOnSubmit.mock.calls[1][0]
      expect(firstCall).toEqual(secondCall)
    })
  })

  // ==========================================================================
  // DÉSACTIVATION PENDANT LOADING
  // ==========================================================================
  describe('Désactivation pendant loading', () => {
    it('devrait désactiver tous les champs pendant la soumission', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ success: true }), 100)
            )
        )

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      // Vérifier que les champs sont désactivés
      expect(screen.getByLabelText(/nom complet/i)).toBeDisabled()
      expect(screen.getByLabelText(/adresse email/i)).toBeDisabled()
      expect(screen.getByLabelText(/sujet/i)).toBeDisabled()
      expect(screen.getByLabelText(/message/i)).toBeDisabled()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('devrait réactiver les champs après erreur', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: false,
        error: 'Erreur',
      })

      render(<ContactForm onSubmit={mockOnSubmit} />)

      await fillForm(user)
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/erreur lors de l'envoi/i)).toBeInTheDocument()
      })

      // Les champs doivent être réactivés
      expect(screen.getByLabelText(/nom complet/i)).not.toBeDisabled()
      expect(
        screen.getByRole('button', { name: /envoyer le message/i })
      ).not.toBeDisabled()
    })
  })
})
