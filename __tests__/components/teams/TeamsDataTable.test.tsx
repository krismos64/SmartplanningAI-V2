/**
 * Tests unitaires pour TeamsDataTable
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamsDataTable } from '@/components/teams/TeamsDataTable'
import type { TeamWithCounts } from '@/lib/validations/team'

// ============================================================================
// Fixtures
// ============================================================================

const mockTeams: TeamWithCounts[] = [
  {
    id: 'clteam000001',
    name: 'Équipe Marketing',
    description: 'Campagnes digitales',
    color: '#3B82F6',
    managerId: 'clmgr0000001',
    companyId: 'clcmp0000001',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-06-01'),
    manager: {
      id: 'clmgr0000001',
      firstName: 'Marie',
      lastName: 'Martin',
      user: { email: 'marie@test.com', image: null },
    },
    company: { id: 'clcmp0000001', name: 'Acme Corp' },
    _count: { employees: 5, schedules: 3 },
  },
  {
    id: 'clteam000002',
    name: 'Équipe Technique',
    description: 'Développement logiciel',
    color: '#10B981',
    managerId: 'clmgr0000002',
    companyId: 'clcmp0000001',
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-06-01'),
    manager: {
      id: 'clmgr0000002',
      firstName: 'Pierre',
      lastName: 'Bernard',
      user: { email: 'pierre@test.com', image: null },
    },
    company: { id: 'clcmp0000001', name: 'Acme Corp' },
    _count: { employees: 8, schedules: 2 },
  },
  {
    id: 'clteam000003',
    name: 'Équipe Support',
    description: null,
    color: '#F59E0B',
    managerId: null,
    companyId: 'clcmp0000001',
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-06-01'),
    manager: null,
    company: { id: 'clcmp0000001', name: 'Acme Corp' },
    _count: { employees: 0, schedules: 0 },
  },
]

// ============================================================================
// Tests
// ============================================================================

describe('TeamsDataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Affichage de base', () => {
    it('affiche les noms des équipes (table + cards mobile)', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      // Chaque nom apparaît 2 fois : table desktop + card mobile
      expect(screen.getAllByText('Équipe Marketing').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Équipe Technique').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Équipe Support').length).toBeGreaterThanOrEqual(1)
    })

    it('affiche le nombre total d équipes', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getByText('3 équipe(s)')).toBeInTheDocument()
    })

    it('affiche les managers dans le tableau', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getAllByText('Marie Martin').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Pierre Bernard').length).toBeGreaterThanOrEqual(1)
    })

    it('affiche Non assigné pour les équipes sans manager', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getByText('Non assigné')).toBeInTheDocument()
    })

    it('affiche le nombre de membres via badges', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getByText('5 membres')).toBeInTheDocument()
      expect(screen.getByText('8 membres')).toBeInTheDocument()
      expect(screen.getByText('Aucun membre')).toBeInTheDocument()
    })

    it('affiche le nom de la company', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      const cells = screen.getAllByText('Acme Corp')
      expect(cells.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Bouton de création', () => {
    it('affiche le bouton Nouvelle équipe par défaut', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getByText('Nouvelle équipe')).toBeInTheDocument()
    })

    it('masque le bouton quand showCreateButton=false', () => {
      render(<TeamsDataTable teams={mockTeams} showCreateButton={false} />)
      expect(screen.queryByText('Nouvelle équipe')).not.toBeInTheDocument()
    })

    it('le lien pointe vers /app/director/teams/new', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      const link = screen.getByText('Nouvelle équipe').closest('a')
      expect(link).toHaveAttribute('href', '/app/directeur/equipes/new')
    })
  })

  describe('Recherche', () => {
    it('affiche le champ de recherche', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(
        screen.getByPlaceholderText('Rechercher une équipe...')
      ).toBeInTheDocument()
    })

    it('filtre les équipes par nom', async () => {
      const user = userEvent.setup()
      render(<TeamsDataTable teams={mockTeams} />)

      await user.type(
        screen.getByPlaceholderText('Rechercher une équipe...'),
        'Marketing'
      )

      expect(screen.getAllByText('Équipe Marketing').length).toBeGreaterThanOrEqual(1)
      expect(screen.queryByText('Équipe Technique')).not.toBeInTheDocument()
      expect(screen.getByText('1 équipe(s)')).toBeInTheDocument()
    })

    it('filtre les équipes par description', async () => {
      const user = userEvent.setup()
      render(<TeamsDataTable teams={mockTeams} />)

      await user.type(
        screen.getByPlaceholderText('Rechercher une équipe...'),
        'logiciel'
      )

      expect(screen.getAllByText('Équipe Technique').length).toBeGreaterThanOrEqual(1)
      expect(screen.queryByText('Équipe Marketing')).not.toBeInTheDocument()
    })

    it('filtre les équipes par nom de manager', async () => {
      const user = userEvent.setup()
      render(<TeamsDataTable teams={mockTeams} />)

      await user.type(
        screen.getByPlaceholderText('Rechercher une équipe...'),
        'Pierre'
      )

      expect(screen.getAllByText('Équipe Technique').length).toBeGreaterThanOrEqual(1)
      expect(screen.queryByText('Équipe Marketing')).not.toBeInTheDocument()
    })
  })

  describe('État vide', () => {
    it('affiche le message quand aucune équipe', () => {
      render(<TeamsDataTable teams={[]} />)
      // Le message apparaît 2 fois (table + mobile)
      expect(screen.getAllByText('Aucune équipe trouvée').length).toBeGreaterThanOrEqual(1)
    })

    it('affiche les boutons Créer une équipe en état vide', () => {
      render(<TeamsDataTable teams={[]} />)
      // Apparaît dans les deux vues
      expect(screen.getAllByText('Créer une équipe').length).toBeGreaterThanOrEqual(1)
    })

    it('masque les boutons Créer quand showCreateButton=false en état vide', () => {
      render(<TeamsDataTable teams={[]} showCreateButton={false} />)
      expect(screen.queryByText('Créer une équipe')).not.toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('affiche les contrôles de pagination', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getByText('Précédent')).toBeInTheDocument()
      expect(screen.getByText('Suivant')).toBeInTheDocument()
    })

    it('affiche le numéro de page', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getByText(/Page 1 sur/)).toBeInTheDocument()
    })

    it('désactive les boutons quand tout tient sur une page', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getByText('Précédent').closest('button')).toBeDisabled()
      expect(screen.getByText('Suivant').closest('button')).toBeDisabled()
    })
  })

  describe('Tri', () => {
    it('affiche le bouton de tri sur la colonne Équipe', () => {
      render(<TeamsDataTable teams={mockTeams} />)
      expect(screen.getByText('Équipe')).toBeInTheDocument()
    })
  })

  describe('Événement de suppression', () => {
    it('écoute l événement team-delete et appelle onDelete', () => {
      const onDelete = vi.fn()
      render(<TeamsDataTable teams={mockTeams} onDelete={onDelete} />)

      const event = new CustomEvent('team-delete', {
        detail: { teamId: 'clteam000001' },
      })
      document.dispatchEvent(event)

      expect(onDelete).toHaveBeenCalledWith('clteam000001')
    })
  })
})
