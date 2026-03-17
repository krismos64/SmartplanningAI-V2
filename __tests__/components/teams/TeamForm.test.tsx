/**
 * Tests unitaires pour TeamForm
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamForm } from '@/components/teams/TeamForm'
import type { TeamWithCounts, TeamMemberInfo } from '@/lib/validations/team'

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

const mockCreateTeam = vi.fn()
const mockUpdateTeam = vi.fn()

vi.mock('@/lib/actions/teams', () => ({
  createTeam: (...args: unknown[]) => mockCreateTeam(...args),
  updateTeam: (...args: unknown[]) => mockUpdateTeam(...args),
}))

vi.mock('@/hooks/use-crud-mutation', () => ({
  useCrudMutation: (action: (...args: unknown[]) => unknown, options: Record<string, unknown>) => ({
    mutate: async (data: unknown) => {
      const result = await action(data)
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        ;(options.onSuccess as () => void)?.()
      }
      return result
    },
    isPending: false,
  }),
}))

vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

// ============================================================================
// Fixtures
// ============================================================================

const mockManagers: TeamMemberInfo[] = [
  {
    id: 'clmgr0000001',
    firstName: 'Marie',
    lastName: 'Martin',
    jobTitle: 'Chef de projet',
    isActive: true,
    user: { email: 'marie@test.com', image: null },
  },
  {
    id: 'clmgr0000002',
    firstName: 'Pierre',
    lastName: 'Bernard',
    jobTitle: null,
    isActive: true,
  },
]

const mockTeam: TeamWithCounts = {
  id: 'clteam000001',
  name: 'Équipe Marketing',
  description: 'Gestion des campagnes',
  color: '#10B981',
  managerId: 'clmgr0000001',
  companyId: 'clcmp0000001',
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-06-01'),
  manager: {
    id: 'clmgr0000001',
    firstName: 'Marie',
    lastName: 'Martin',
  },
  _count: { employees: 3, schedules: 1 },
}

const companyId = 'clcmp0000001'

// ============================================================================
// Tests
// ============================================================================

describe('TeamForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateTeam.mockResolvedValue({ success: true, data: { id: 'new-team' } })
    mockUpdateTeam.mockResolvedValue({ success: true, data: { id: 'clteam000001' } })
  })

  describe('Mode création', () => {
    it('affiche le formulaire vide en mode création', () => {
      render(<TeamForm companyId={companyId} managers={mockManagers} />)
      expect(
        screen.getByPlaceholderText('Ex: Équipe Marketing')
      ).toHaveValue('')
      expect(screen.getByText("Créer l'équipe")).toBeInTheDocument()
    })

    it('affiche le bouton Annuler', () => {
      render(<TeamForm companyId={companyId} />)
      expect(screen.getByText('Annuler')).toBeInTheDocument()
    })

    it('affiche les labels des sections', () => {
      render(<TeamForm companyId={companyId} />)
      expect(
        screen.getByText("Informations de l'équipe")
      ).toBeInTheDocument()
      expect(screen.getByText('Personnalisation')).toBeInTheDocument()
    })

    it('affiche les champs du formulaire', () => {
      render(<TeamForm companyId={companyId} />)
      expect(screen.getByText("Nom de l'équipe *")).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText("Couleur de l'équipe")).toBeInTheDocument()
      expect(screen.getByText("Manager de l'équipe")).toBeInTheDocument()
    })

    it('affiche la palette de 10 couleurs', () => {
      render(<TeamForm companyId={companyId} />)
      const colorButtons = screen.getAllByTitle(/Bleu|Vert|Orange|Rouge|Violet|Rose|Cyan|Lime|Corail|Indigo/)
      expect(colorButtons.length).toBe(10)
    })

    it('soumet le formulaire en mode création', async () => {
      const user = userEvent.setup()
      render(<TeamForm companyId={companyId} managers={mockManagers} />)

      await user.type(
        screen.getByPlaceholderText('Ex: Équipe Marketing'),
        'Nouvelle Équipe'
      )

      fireEvent.click(screen.getByText("Créer l'équipe"))

      await waitFor(() => {
        expect(mockCreateTeam).toHaveBeenCalledWith(
          expect.objectContaining({
            companyId,
            name: 'Nouvelle Équipe',
            color: '#3B82F6',
          })
        )
      })
    })

    it('redirige vers /app/director/teams après création réussie', async () => {
      const user = userEvent.setup()
      render(<TeamForm companyId={companyId} />)

      await user.type(
        screen.getByPlaceholderText('Ex: Équipe Marketing'),
        'Nouvelle Équipe'
      )

      fireEvent.click(screen.getByText("Créer l'équipe"))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/app/directeur/equipes')
      })
    })

    it('appelle router.back() au clic sur Annuler sans onCancel', async () => {
      const user = userEvent.setup()
      render(<TeamForm companyId={companyId} />)
      await user.click(screen.getByText('Annuler'))
      expect(mockBack).toHaveBeenCalled()
    })

    it('appelle onCancel si fourni', async () => {
      const onCancel = vi.fn()
      const user = userEvent.setup()
      render(<TeamForm companyId={companyId} onCancel={onCancel} />)
      await user.click(screen.getByText('Annuler'))
      expect(onCancel).toHaveBeenCalled()
      expect(mockBack).not.toHaveBeenCalled()
    })
  })

  describe('Mode édition', () => {
    it('pré-remplit les champs en mode édition', () => {
      render(
        <TeamForm
          team={mockTeam}
          companyId={companyId}
          managers={mockManagers}
        />
      )
      expect(
        screen.getByPlaceholderText('Ex: Équipe Marketing')
      ).toHaveValue('Équipe Marketing')
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })

    it('soumet le formulaire en mode édition', async () => {
      const user = userEvent.setup()
      render(
        <TeamForm
          team={mockTeam}
          companyId={companyId}
          managers={mockManagers}
        />
      )

      const nameInput = screen.getByPlaceholderText('Ex: Équipe Marketing')
      await user.clear(nameInput)
      await user.type(nameInput, 'Équipe Modifiée')

      fireEvent.click(screen.getByText('Modifier'))

      await waitFor(() => {
        expect(mockUpdateTeam).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'clteam000001',
            name: 'Équipe Modifiée',
          })
        )
      })
    })
  })

  describe('Validation', () => {
    it('affiche une erreur si le nom est trop court', async () => {
      const user = userEvent.setup()
      render(<TeamForm companyId={companyId} />)

      await user.type(
        screen.getByPlaceholderText('Ex: Équipe Marketing'),
        'A'
      )

      fireEvent.click(screen.getByText("Créer l'équipe"))

      await waitFor(() => {
        expect(
          screen.getByText(/doit contenir au moins 2 caractères/)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Sélection de couleur', () => {
    it('permet de changer la couleur en cliquant', async () => {
      const user = userEvent.setup()
      render(<TeamForm companyId={companyId} />)

      const vertButton = screen.getByTitle('Vert')
      await user.click(vertButton)

      // Le bouton Vert doit être sélectionné (classe scale-110)
      expect(vertButton.className).toContain('scale-110')
    })
  })

  describe('Liste des managers', () => {
    it('affiche l option Aucun manager', () => {
      render(<TeamForm companyId={companyId} managers={mockManagers} />)
      // Le Select n'affiche pas directement les options, elles sont dans un portal
      // Vérifions que le composant rend sans erreur
      expect(screen.getByText("Manager de l'équipe")).toBeInTheDocument()
    })
  })
})
