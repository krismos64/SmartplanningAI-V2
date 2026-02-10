/**
 * Tests unitaires pour TeamMembersManager
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamMembersManager } from '@/components/teams/TeamMembersManager'
import type { TeamWithDetails, TeamMemberInfo } from '@/lib/validations/team'

// ============================================================================
// Mocks
// ============================================================================

const mockAddTeamMember = vi.fn()
const mockRemoveTeamMember = vi.fn()
const mockGetAvailableEmployees = vi.fn()

vi.mock('@/lib/actions/teams', () => ({
  addTeamMember: (...args: unknown[]) => mockAddTeamMember(...args),
  removeTeamMember: (...args: unknown[]) => mockRemoveTeamMember(...args),
  getAvailableEmployees: (...args: unknown[]) =>
    mockGetAvailableEmployees(...args),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// ============================================================================
// Fixtures
// ============================================================================

const mockMembers: TeamMemberInfo[] = [
  {
    id: 'clemp0000001',
    firstName: 'Jean',
    lastName: 'Dupont',
    jobTitle: 'Développeur',
    isActive: true,
    user: { email: 'jean@test.com', image: null },
  },
  {
    id: 'clemp0000002',
    firstName: 'Sophie',
    lastName: 'Leroy',
    jobTitle: 'Designer',
    isActive: true,
    user: { email: 'sophie@test.com', image: null },
  },
  {
    id: 'clemp0000003',
    firstName: 'Thomas',
    lastName: 'Garcia',
    jobTitle: null,
    isActive: false,
    user: { email: 'thomas@test.com', image: null },
  },
]

const mockAvailableEmployees: TeamMemberInfo[] = [
  {
    id: 'clemp0000004',
    firstName: 'Alice',
    lastName: 'Martin',
    jobTitle: 'Chef de projet',
    isActive: true,
    user: { email: 'alice@test.com', image: null },
  },
  {
    id: 'clemp0000005',
    firstName: 'Bob',
    lastName: 'Petit',
    jobTitle: 'Testeur QA',
    isActive: true,
    user: { email: 'bob@test.com', image: null },
  },
]

const mockTeam: TeamWithDetails = {
  id: 'clteam000001',
  name: 'Équipe Marketing',
  description: 'Test équipe',
  color: '#3B82F6',
  managerId: null,
  companyId: 'clcmp0000001',
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-06-01'),
  employees: mockMembers,
  _count: { employees: 3, schedules: 0 },
}

const mockTeamEmpty: TeamWithDetails = {
  ...mockTeam,
  id: 'clteam000002',
  employees: [],
  _count: { employees: 0, schedules: 0 },
}

// ============================================================================
// Tests
// ============================================================================

describe('TeamMembersManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAvailableEmployees.mockResolvedValue({
      success: true,
      data: mockAvailableEmployees,
    })
    mockAddTeamMember.mockResolvedValue({
      success: true,
      data: {
        ...mockTeam,
        employees: [
          ...mockMembers,
          mockAvailableEmployees[0],
        ],
      },
    })
    mockRemoveTeamMember.mockResolvedValue({
      success: true,
      data: {
        ...mockTeam,
        employees: mockMembers.filter((m) => m.id !== 'clemp0000001'),
      },
    })
  })

  describe('Affichage de base', () => {
    it('affiche le titre "Membres de l\'équipe"', () => {
      render(<TeamMembersManager team={mockTeam} />)
      expect(screen.getByText("Membres de l'équipe")).toBeInTheDocument()
    })

    it('affiche le compteur de membres', () => {
      render(<TeamMembersManager team={mockTeam} />)
      expect(
        screen.getByText('3 membres dans cette équipe')
      ).toBeInTheDocument()
    })

    it('affiche chaque membre', () => {
      render(<TeamMembersManager team={mockTeam} />)
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Sophie Leroy')).toBeInTheDocument()
      expect(screen.getByText('Thomas Garcia')).toBeInTheDocument()
    })

    it('affiche le poste des membres', () => {
      render(<TeamMembersManager team={mockTeam} />)
      expect(screen.getByText('Développeur')).toBeInTheDocument()
      expect(screen.getByText('Designer')).toBeInTheDocument()
    })

    it('affiche le badge Inactif pour les membres inactifs', () => {
      render(<TeamMembersManager team={mockTeam} />)
      expect(screen.getByText('Inactif')).toBeInTheDocument()
    })

    it('affiche les initiales des membres dans les avatars', () => {
      render(<TeamMembersManager team={mockTeam} />)
      expect(screen.getByText('JD')).toBeInTheDocument()
      expect(screen.getByText('SL')).toBeInTheDocument()
      expect(screen.getByText('TG')).toBeInTheDocument()
    })
  })

  describe('État vide', () => {
    it('affiche le message quand aucun membre', () => {
      render(<TeamMembersManager team={mockTeamEmpty} />)
      expect(
        screen.getByText('Aucun membre dans cette équipe')
      ).toBeInTheDocument()
    })

    it('affiche "Ajouter le premier membre" en état vide', () => {
      render(<TeamMembersManager team={mockTeamEmpty} />)
      expect(
        screen.getByText('Ajouter le premier membre')
      ).toBeInTheDocument()
    })

    it('masque "Ajouter le premier membre" en lecture seule', () => {
      render(<TeamMembersManager team={mockTeamEmpty} readOnly />)
      expect(
        screen.queryByText('Ajouter le premier membre')
      ).not.toBeInTheDocument()
    })
  })

  describe('Mode lecture seule', () => {
    it('masque le bouton "Ajouter un membre" en readOnly', () => {
      render(<TeamMembersManager team={mockTeam} readOnly />)
      expect(
        screen.queryByText('Ajouter un membre')
      ).not.toBeInTheDocument()
    })

    it('masque les boutons de suppression des membres en readOnly', () => {
      const { container } = render(
        <TeamMembersManager team={mockTeam} readOnly />
      )
      // Pas de bouton UserMinus
      const removeButtons = container.querySelectorAll(
        'button.text-destructive'
      )
      expect(removeButtons.length).toBe(0)
    })
  })

  describe('Bouton Ajouter un membre', () => {
    it('affiche le bouton "Ajouter un membre"', () => {
      render(<TeamMembersManager team={mockTeam} />)
      expect(screen.getByText('Ajouter un membre')).toBeInTheDocument()
    })

    it('ouvre le dialog au clic', async () => {
      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(
          screen.getByText("Sélectionnez un employé à ajouter à l'équipe")
        ).toBeInTheDocument()
      })
    })

    it('charge les employés disponibles à l ouverture du dialog', async () => {
      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(mockGetAvailableEmployees).toHaveBeenCalledWith(
          'clteam000001'
        )
      })
    })

    it('affiche les employés disponibles dans le dialog', async () => {
      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(screen.getByText('Alice Martin')).toBeInTheDocument()
        expect(screen.getByText('Bob Petit')).toBeInTheDocument()
      })
    })

    it('affiche le champ de recherche dans le dialog', async () => {
      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Rechercher un employé...')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Recherche employés disponibles', () => {
    it('filtre les employés disponibles par nom', async () => {
      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(screen.getByText('Alice Martin')).toBeInTheDocument()
      })

      await user.type(
        screen.getByPlaceholderText('Rechercher un employé...'),
        'Alice'
      )

      expect(screen.getByText('Alice Martin')).toBeInTheDocument()
      expect(screen.queryByText('Bob Petit')).not.toBeInTheDocument()
    })

    it('filtre les employés disponibles par poste', async () => {
      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(screen.getByText('Alice Martin')).toBeInTheDocument()
      })

      await user.type(
        screen.getByPlaceholderText('Rechercher un employé...'),
        'Testeur'
      )

      expect(screen.queryByText('Alice Martin')).not.toBeInTheDocument()
      expect(screen.getByText('Bob Petit')).toBeInTheDocument()
    })
  })

  describe('Ajout de membre', () => {
    it('appelle addTeamMember au clic sur un employé', async () => {
      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(screen.getByText('Alice Martin')).toBeInTheDocument()
      })

      // Cliquer sur le bouton d'ajout à côté d'Alice Martin
      const addButtons = screen.getAllByRole('button').filter(
        (btn) => btn.closest('[class*="hover:bg-muted"]')
      )

      // Le bouton UserPlus est à côté de chaque employé
      const aliceRow = screen.getByText('Alice Martin').closest('div[class*="items-center justify-between"]')
      const addButton = aliceRow?.querySelector('button')
      if (addButton) {
        await user.click(addButton)
      }

      await waitFor(() => {
        expect(mockAddTeamMember).toHaveBeenCalledWith(
          'clteam000001',
          'clemp0000004'
        )
      })
    })
  })

  describe('Suppression de membre', () => {
    it('affiche le dialog de confirmation au clic sur retirer', async () => {
      const user = userEvent.setup()
      const { container } = render(<TeamMembersManager team={mockTeam} />)

      // Cliquer sur le premier bouton de suppression (UserMinus)
      const removeButtons = container.querySelectorAll(
        'button.text-destructive'
      )
      expect(removeButtons.length).toBeGreaterThan(0)

      await user.click(removeButtons[0] as HTMLElement)

      await waitFor(() => {
        expect(screen.getByText('Retirer ce membre ?')).toBeInTheDocument()
      })
    })

    it('affiche le nom du membre dans le dialog de confirmation', async () => {
      const user = userEvent.setup()
      const { container } = render(<TeamMembersManager team={mockTeam} />)

      const removeButtons = container.querySelectorAll(
        'button.text-destructive'
      )
      await user.click(removeButtons[0] as HTMLElement)

      await waitFor(() => {
        expect(screen.getByText('Retirer ce membre ?')).toBeInTheDocument()
        // Le nom est dans un <strong> dans le dialog
        const strongElement = screen.getByRole('alertdialog').querySelector('strong')
        expect(strongElement?.textContent).toBe('Jean Dupont')
      })
    })

    it('appelle removeTeamMember au clic sur Retirer', async () => {
      const user = userEvent.setup()
      const { container } = render(<TeamMembersManager team={mockTeam} />)

      const removeButtons = container.querySelectorAll(
        'button.text-destructive'
      )
      await user.click(removeButtons[0] as HTMLElement)

      await waitFor(() => {
        expect(screen.getByText('Retirer ce membre ?')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Retirer'))

      await waitFor(() => {
        expect(mockRemoveTeamMember).toHaveBeenCalledWith(
          'clteam000001',
          'clemp0000001'
        )
      })
    })

    it('permet d annuler la suppression', async () => {
      const user = userEvent.setup()
      const { container } = render(<TeamMembersManager team={mockTeam} />)

      const removeButtons = container.querySelectorAll(
        'button.text-destructive'
      )
      await user.click(removeButtons[0] as HTMLElement)

      await waitFor(() => {
        expect(screen.getByText('Retirer ce membre ?')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Annuler'))

      await waitFor(() => {
        expect(
          screen.queryByText('Retirer ce membre ?')
        ).not.toBeInTheDocument()
      })
      expect(mockRemoveTeamMember).not.toHaveBeenCalled()
    })
  })

  describe('Callbacks', () => {
    it('appelle onMembersChange après ajout réussi', async () => {
      const onMembersChange = vi.fn()
      const user = userEvent.setup()
      render(
        <TeamMembersManager team={mockTeam} onMembersChange={onMembersChange} />
      )

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(screen.getByText('Alice Martin')).toBeInTheDocument()
      })

      const aliceRow = screen.getByText('Alice Martin').closest('div[class*="items-center justify-between"]')
      const addButton = aliceRow?.querySelector('button')
      if (addButton) {
        await user.click(addButton)
      }

      await waitFor(() => {
        expect(onMembersChange).toHaveBeenCalled()
      })
    })
  })

  describe('Gestion d erreurs', () => {
    it('gère les erreurs de chargement des employés disponibles', async () => {
      mockGetAvailableEmployees.mockResolvedValue({
        success: false,
        error: 'Erreur de chargement',
      })

      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(mockGetAvailableEmployees).toHaveBeenCalled()
      })
    })

    it('affiche message quand aucun employé disponible', async () => {
      mockGetAvailableEmployees.mockResolvedValue({
        success: true,
        data: [],
      })

      const user = userEvent.setup()
      render(<TeamMembersManager team={mockTeam} />)

      await user.click(screen.getByText('Ajouter un membre'))

      await waitFor(() => {
        expect(
          screen.getByText(
            'Tous les employés sont déjà dans une équipe'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('Compteur singulier/pluriel', () => {
    it('affiche "1 membre" au singulier', () => {
      const teamOneMember: TeamWithDetails = {
        ...mockTeam,
        employees: [mockMembers[0]],
      }
      render(<TeamMembersManager team={teamOneMember} />)
      expect(
        screen.getByText('1 membre dans cette équipe')
      ).toBeInTheDocument()
    })
  })
})
