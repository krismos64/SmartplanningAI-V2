/**
 * Tests unitaires pour le composant ContactForm
 *
 * @ticket SP-287
 * @description Tests du formulaire de contact (rendu, validation, états)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/public/ContactForm'

// Mock framer-motion pour éviter les erreurs d'animation
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
  },
}))

// Mock sonner (toast)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // RENDU
  // ==========================================================================
  describe('Rendu', () => {
    it('devrait afficher tous les champs du formulaire', () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sujet/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it('devrait afficher le bouton de soumission', () => {
      render(<ContactForm />)

      expect(
        screen.getByRole('button', { name: /envoyer le message/i })
      ).toBeInTheDocument()
    })

    it('devrait afficher les indicateurs de champs requis', () => {
      render(<ContactForm />)

      // Vérifie que les étoiles sont présentes
      const requiredIndicators = screen.getAllByText('*')
      expect(requiredIndicators.length).toBe(4)
    })

    it('devrait afficher le lien vers la politique de confidentialité', () => {
      render(<ContactForm />)

      expect(
        screen.getByRole('link', { name: /politique de confidentialité/i })
      ).toHaveAttribute('href', '/confidentialite')
    })

    it('devrait afficher le hint pour le message', () => {
      render(<ContactForm />)

      expect(
        screen.getByText(/minimum 20 caractères, maximum 2000 caractères/i)
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ACCESSIBILITÉ
  // ==========================================================================
  describe('Accessibilité', () => {
    it('devrait avoir un aria-label sur le formulaire', () => {
      render(<ContactForm />)

      expect(
        screen.getByRole('form', { name: /formulaire de contact/i })
      ).toBeInTheDocument()
    })

    it('devrait avoir des aria-required sur les champs obligatoires', () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/nom complet/i)).toHaveAttribute(
        'aria-required',
        'true'
      )
      expect(screen.getByLabelText(/adresse email/i)).toHaveAttribute(
        'aria-required',
        'true'
      )
      expect(screen.getByLabelText(/sujet/i)).toHaveAttribute(
        'aria-required',
        'true'
      )
      expect(screen.getByLabelText(/message/i)).toHaveAttribute(
        'aria-required',
        'true'
      )
    })

    it('devrait avoir des placeholders descriptifs', () => {
      render(<ContactForm />)

      expect(screen.getByPlaceholderText(/jean dupont/i)).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/jean.dupont@email.com/i)
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/demande d'information/i)
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/décrivez votre demande/i)
      ).toBeInTheDocument()
    })

    it('devrait avoir autocomplete sur les champs appropriés', () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/nom complet/i)).toHaveAttribute(
        'autocomplete',
        'name'
      )
      expect(screen.getByLabelText(/adresse email/i)).toHaveAttribute(
        'autocomplete',
        'email'
      )
    })
  })

  // ==========================================================================
  // VALIDATION
  // ==========================================================================
  describe('Validation', () => {
    it("devrait afficher une erreur si le nom est trop court", async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const nameInput = screen.getByLabelText(/nom complet/i)
      await user.type(nameInput, 'J')
      await user.tab() // blur pour déclencher la validation

      await waitFor(() => {
        expect(screen.getByText(/2 caractères/i)).toBeInTheDocument()
      })
    })

    it("devrait afficher une erreur si l'email est invalide", async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const emailInput = screen.getByLabelText(/adresse email/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
      })
    })

    it('devrait afficher une erreur si le sujet est trop court', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const subjectInput = screen.getByLabelText(/sujet/i)
      await user.type(subjectInput, 'Test')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/5 caractères/i)).toBeInTheDocument()
      })
    })

    it('devrait afficher une erreur si le message est trop court', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const messageInput = screen.getByLabelText(/message/i)
      await user.type(messageInput, 'Court')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/20 caractères/i)).toBeInTheDocument()
      })
    })

    it('devrait avoir aria-invalid sur les champs en erreur', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const nameInput = screen.getByLabelText(/nom complet/i)
      await user.type(nameInput, 'J')
      await user.tab()

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })

  // ==========================================================================
  // SOUMISSION
  // ==========================================================================
  describe('Soumission', () => {
    it('devrait appeler onSubmit avec les données valides', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })
      render(<ContactForm onSubmit={mockOnSubmit} />)

      await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
      await user.type(
        screen.getByLabelText(/adresse email/i),
        'jean@test.com'
      )
      await user.type(screen.getByLabelText(/sujet/i), 'Test sujet valide')
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test avec plus de 20 caractères.'
      )

      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Jean Dupont',
          email: 'jean@test.com',
          subject: 'Test sujet valide',
          message: 'Ceci est un message de test avec plus de 20 caractères.',
        })
      })
    })

    it("devrait ne pas soumettre si le formulaire est invalide", async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()
      render(<ContactForm onSubmit={mockOnSubmit} />)

      // Soumettre sans remplir les champs
      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
    })
  })

  // ==========================================================================
  // ÉTATS
  // ==========================================================================
  describe('États', () => {
    it("devrait afficher l'état de chargement pendant la soumission", async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      )
      render(<ContactForm onSubmit={mockOnSubmit} />)

      // Remplir le formulaire
      await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
      await user.type(
        screen.getByLabelText(/adresse email/i),
        'jean@test.com'
      )
      await user.type(screen.getByLabelText(/sujet/i), 'Test sujet valide')
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test avec plus de 20 caractères.'
      )

      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      // Vérifier l'état de chargement
      expect(screen.getByText(/envoi en cours/i)).toBeInTheDocument()

      // Attendre la fin
      await waitFor(() => {
        expect(screen.queryByText(/envoi en cours/i)).not.toBeInTheDocument()
      })
    })

    it("devrait afficher l'état de succès après un envoi réussi", async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })
      render(<ContactForm onSubmit={mockOnSubmit} />)

      // Remplir et soumettre
      await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
      await user.type(
        screen.getByLabelText(/adresse email/i),
        'jean@test.com'
      )
      await user.type(screen.getByLabelText(/sujet/i), 'Test sujet valide')
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test avec plus de 20 caractères.'
      )

      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(screen.getByText(/message envoyé/i)).toBeInTheDocument()
      })
    })

    it('devrait désactiver le bouton pendant le chargement', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      )
      render(<ContactForm onSubmit={mockOnSubmit} />)

      // Remplir le formulaire
      await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
      await user.type(
        screen.getByLabelText(/adresse email/i),
        'jean@test.com'
      )
      await user.type(screen.getByLabelText(/sujet/i), 'Test sujet valide')
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test avec plus de 20 caractères.'
      )

      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      // Le bouton est désactivé pendant le chargement
      expect(screen.getByRole('button')).toBeDisabled()

      // Attendre que le chargement se termine (bouton reste désactivé en mode succès aussi)
      await waitFor(() => {
        expect(screen.getByText(/message envoyé/i)).toBeInTheDocument()
      })

      // En mode succès, le bouton est aussi désactivé (pour éviter double soumission)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('devrait réinitialiser le formulaire après succès', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })
      render(<ContactForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/nom complet/i)
      const emailInput = screen.getByLabelText(/adresse email/i)

      // Remplir et soumettre
      await user.type(nameInput, 'Jean Dupont')
      await user.type(emailInput, 'jean@test.com')
      await user.type(screen.getByLabelText(/sujet/i), 'Test sujet valide')
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test avec plus de 20 caractères.'
      )

      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      await waitFor(() => {
        expect(nameInput).toHaveValue('')
        expect(emailInput).toHaveValue('')
      })
    })
  })

  // ==========================================================================
  // MOCK (SANS onSubmit)
  // ==========================================================================
  describe('Mode mock (sans onSubmit)', () => {
    it('devrait fonctionner avec le mock intégré', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      // Remplir le formulaire
      await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
      await user.type(
        screen.getByLabelText(/adresse email/i),
        'jean@test.com'
      )
      await user.type(screen.getByLabelText(/sujet/i), 'Test sujet valide')
      await user.type(
        screen.getByLabelText(/message/i),
        'Ceci est un message de test avec plus de 20 caractères.'
      )

      await user.click(screen.getByRole('button', { name: /envoyer/i }))

      // Devrait afficher l'état de chargement puis de succès
      expect(screen.getByText(/envoi en cours/i)).toBeInTheDocument()

      await waitFor(
        () => {
          expect(screen.getByText(/message envoyé/i)).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })
})
