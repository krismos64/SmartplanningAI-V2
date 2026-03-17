/**
 * Tests unitaires pour TeamCard
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TeamCard } from '@/components/teams/TeamCard'
import type { TeamWithCounts } from '@/lib/validations/team'

// ============================================================================
// Fixtures
// ============================================================================

const mockTeam: TeamWithCounts = {
  id: 'clteam000001',
  name: 'Équipe Marketing',
  description: 'Gestion des campagnes et stratégie digitale',
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
}

const mockTeamNoManager: TeamWithCounts = {
  ...mockTeam,
  id: 'clteam000002',
  name: 'Équipe Support',
  description: null,
  manager: null,
  managerId: null,
  _count: { employees: 0, schedules: 0 },
}

// ============================================================================
// Tests
// ============================================================================

describe('TeamCard', () => {
  describe('Affichage de base', () => {
    it('affiche le nom de l équipe', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('Équipe Marketing')).toBeInTheDocument()
    })

    it('affiche la description', () => {
      render(<TeamCard team={mockTeam} />)
      expect(
        screen.getByText('Gestion des campagnes et stratégie digitale')
      ).toBeInTheDocument()
    })

    it('affiche le nom de la company', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })

    it('affiche les initiales de l équipe', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('ÉM')).toBeInTheDocument()
    })

    it('affiche le nombre de membres', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('affiche le nombre de plannings quand > 0', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('n affiche pas le nombre de plannings quand 0', () => {
      render(<TeamCard team={mockTeamNoManager} />)
      expect(screen.queryByText('0 planning')).not.toBeInTheDocument()
    })

    it('n affiche pas la description quand null', () => {
      render(<TeamCard team={mockTeamNoManager} />)
      expect(
        screen.queryByText('Gestion des campagnes')
      ).not.toBeInTheDocument()
    })
  })

  describe('Manager', () => {
    it('affiche le nom du manager', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    })

    it('affiche le badge Manager', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })

    it('affiche "Aucun manager assigné" sans manager', () => {
      render(<TeamCard team={mockTeamNoManager} />)
      expect(screen.getByText('Aucun manager assigné')).toBeInTheDocument()
    })

    it('affiche les initiales du manager dans le fallback avatar', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('MM')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('affiche les boutons Voir et Modifier par défaut', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.getByText('Voir')).toBeInTheDocument()
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })

    it('masque les actions quand showActions=false', () => {
      render(<TeamCard team={mockTeam} showActions={false} />)
      expect(screen.queryByText('Voir')).not.toBeInTheDocument()
      expect(screen.queryByText('Modifier')).not.toBeInTheDocument()
    })

    it('affiche le bouton Supprimer quand onDelete est fourni', () => {
      render(<TeamCard team={mockTeam} onDelete={vi.fn()} />)
      expect(screen.getByText('Supprimer')).toBeInTheDocument()
    })

    it('n affiche pas le bouton Supprimer sans onDelete', () => {
      render(<TeamCard team={mockTeam} />)
      expect(screen.queryByText('Supprimer')).not.toBeInTheDocument()
    })

    it('appelle onDelete avec le teamId', () => {
      const onDelete = vi.fn()
      render(<TeamCard team={mockTeam} onDelete={onDelete} />)
      fireEvent.click(screen.getByText('Supprimer'))
      expect(onDelete).toHaveBeenCalledWith('clteam000001')
    })

    it('désactive le bouton Supprimer pendant isDeleting', () => {
      render(
        <TeamCard team={mockTeam} onDelete={vi.fn()} isDeleting={true} />
      )
      expect(screen.getByText('Suppression...')).toBeInTheDocument()
      expect(screen.getByText('Suppression...').closest('button')).toBeDisabled()
    })

    it('les liens Voir et Modifier pointent vers les bonnes routes', () => {
      render(<TeamCard team={mockTeam} />)
      const voirLink = screen.getByText('Voir').closest('a')
      const modifierLink = screen.getByText('Modifier').closest('a')
      expect(voirLink).toHaveAttribute(
        'href',
        '/app/director/teams/clteam000001'
      )
      expect(modifierLink).toHaveAttribute(
        'href',
        '/app/director/teams/clteam000001/edit'
      )
    })
  })

  describe('Couleur', () => {
    it('applique la couleur de l équipe sur la barre et l avatar', () => {
      const { container } = render(<TeamCard team={mockTeam} />)
      const colorBar = container.querySelector(
        '[style*="background-color: rgb(59, 130, 246)"]'
      ) || container.querySelector('[style*="background-color: #3B82F6"]')
      expect(colorBar).toBeTruthy()
    })
  })

  describe('Compteurs via employees array', () => {
    it('utilise employees.length si _count absent', () => {
      const teamWithEmployees: TeamWithCounts = {
        ...mockTeam,
        _count: undefined,
        employees: [
          {
            id: 'e1',
            firstName: 'Jean',
            lastName: 'Dupont',
            jobTitle: null,
            isActive: true,
          },
          {
            id: 'e2',
            firstName: 'Sophie',
            lastName: 'Leroy',
            jobTitle: null,
            isActive: true,
          },
        ],
      }
      render(<TeamCard team={teamWithEmployees} />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })
})
