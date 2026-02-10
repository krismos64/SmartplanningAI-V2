/**
 * Tests unitaires pour CompanyForm
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompanyForm } from '@/components/admin/companies/CompanyForm'
import type { CompanyDetail } from '@/lib/actions/companies'

// ============================================================================
// Mocks
// ============================================================================

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockBack = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: mockBack,
  }),
}))

const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

vi.mock('@/hooks/use-crud-mutation', () => ({
  useCrudMutation: (action: unknown, options: { onSuccess?: () => void }) => {
    // Distinguer create vs update par la référence de la fonction
    const isCreate = (action as { name?: string })?.name !== 'updateCompany'
    const mutate = isCreate ? mockCreateMutate : mockUpdateMutate
    return {
      mutate: async (data: unknown) => {
        mutate(data)
        options.onSuccess?.()
      },
      isPending: false,
    }
  },
}))

vi.mock('@/lib/actions/companies', () => ({
  createCompany: Object.assign(vi.fn(), { name: 'createCompany' }),
  updateCompany: Object.assign(vi.fn(), { name: 'updateCompany' }),
}))

// ============================================================================
// Fixtures
// ============================================================================

const mockCompany: CompanyDetail = {
  id: 'clcmp0000001',
  name: 'Acme Corp',
  slug: 'acme-corp',
  email: 'contact@acme.com',
  phone: '0612345678',
  address: '123 Rue de la Paix',
  timezone: 'Europe/Paris',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  subscription: {
    id: 'sub-1',
    plan: 'PER_SEAT',
    status: 'ACTIVE',
    companyId: 'clcmp0000001',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    trialEndsAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    quantity: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  _count: {
    employees: 5,
    users: 3,
    teams: 2,
  },
} as CompanyDetail

// ============================================================================
// Tests
// ============================================================================

describe('CompanyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Mode creation', () => {
    it('affiche le formulaire en mode creation', () => {
      render(<CompanyForm />)
      expect(screen.getByText("Créer l'entreprise")).toBeInTheDocument()
    })

    it('affiche les sections du formulaire', () => {
      render(<CompanyForm />)
      expect(
        screen.getByText('Informations générales')
      ).toBeInTheDocument()
      expect(screen.getByText('Abonnement')).toBeInTheDocument()
    })

    it('affiche les champs obligatoires', () => {
      render(<CompanyForm />)
      expect(
        screen.getByText("Nom de l'entreprise *")
      ).toBeInTheDocument()
    })

    it('les champs sont vides par defaut', () => {
      render(<CompanyForm />)
      const nameInput = screen.getByPlaceholderText('Acme Corporation')
      expect(nameInput).toHaveValue('')
    })

    it('affiche les boutons Annuler et Creer', () => {
      render(<CompanyForm />)
      expect(screen.getByText('Annuler')).toBeInTheDocument()
      expect(screen.getByText("Créer l'entreprise")).toBeInTheDocument()
    })

    it('appelle router.back au clic sur Annuler sans onCancel', async () => {
      const user = userEvent.setup()
      render(<CompanyForm />)

      await user.click(screen.getByText('Annuler'))
      expect(mockBack).toHaveBeenCalled()
    })

    it('appelle onCancel au clic sur Annuler quand fourni', async () => {
      const onCancel = vi.fn()
      const user = userEvent.setup()
      render(<CompanyForm onCancel={onCancel} />)

      await user.click(screen.getByText('Annuler'))
      expect(onCancel).toHaveBeenCalled()
      expect(mockBack).not.toHaveBeenCalled()
    })
  })

  describe('Mode edition', () => {
    it('affiche le formulaire en mode edition', () => {
      render(<CompanyForm company={mockCompany} />)
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })

    it('pre-remplit les champs', () => {
      render(<CompanyForm company={mockCompany} />)
      expect(
        screen.getByPlaceholderText('Acme Corporation')
      ).toHaveValue('Acme Corp')
    })

    it('pre-remplit l email', () => {
      render(<CompanyForm company={mockCompany} />)
      expect(
        screen.getByPlaceholderText('contact@acme.com')
      ).toHaveValue('contact@acme.com')
    })

    it('pre-remplit le telephone', () => {
      render(<CompanyForm company={mockCompany} />)
      expect(
        screen.getByPlaceholderText('+33 1 23 45 67 89')
      ).toHaveValue('0612345678')
    })
  })

  describe('Validation', () => {
    it('affiche une erreur si le nom est trop court', async () => {
      const user = userEvent.setup()
      render(<CompanyForm />)

      const nameInput = screen.getByPlaceholderText('Acme Corporation')
      await user.type(nameInput, 'A')

      // Soumettre
      await user.click(screen.getByText("Créer l'entreprise"))

      await waitFor(() => {
        expect(
          screen.getByText('Le nom doit contenir au moins 2 caractères')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Soumission creation', () => {
    it('appelle createMutation.mutate avec les donnees', async () => {
      const user = userEvent.setup()
      render(<CompanyForm />)

      await user.type(
        screen.getByPlaceholderText('Acme Corporation'),
        'Nouvelle Entreprise'
      )

      await user.click(screen.getByText("Créer l'entreprise"))

      await waitFor(() => {
        expect(mockCreateMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Nouvelle Entreprise',
          })
        )
      })
    })
  })

  describe('Soumission edition', () => {
    it('appelle updateMutation.mutate avec l id', async () => {
      const user = userEvent.setup()
      render(<CompanyForm company={mockCompany} />)

      // Modifier le nom
      const nameInput = screen.getByPlaceholderText('Acme Corporation')
      await user.clear(nameInput)
      await user.type(nameInput, 'Acme Updated')

      await user.click(screen.getByText('Modifier'))

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'clcmp0000001',
            name: 'Acme Updated',
          })
        )
      })
    })
  })

  describe('Labels', () => {
    it('affiche les labels des champs', () => {
      render(<CompanyForm />)
      expect(screen.getByText('Email de contact')).toBeInTheDocument()
      expect(screen.getByText('Téléphone')).toBeInTheDocument()
      expect(screen.getByText('Adresse')).toBeInTheDocument()
      expect(screen.getByText('Fuseau horaire')).toBeInTheDocument()
      expect(screen.getByText("Plan d'abonnement")).toBeInTheDocument()
      expect(
        screen.getByText("Statut de l'abonnement")
      ).toBeInTheDocument()
      expect(screen.getByText('Entreprise active')).toBeInTheDocument()
    })
  })

  describe('Descriptions', () => {
    it('affiche la description du nom', () => {
      render(<CompanyForm />)
      expect(
        screen.getByText(
          'Le nom sera utilisé pour générer un slug unique (URL)'
        )
      ).toBeInTheDocument()
    })

    it('affiche la description du plan', () => {
      render(<CompanyForm />)
      expect(
        screen.getByText('FREE : gratuit | PER_SEAT : 2,90€/employé/mois')
      ).toBeInTheDocument()
    })
  })
})
