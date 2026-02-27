/**
 * Tests unitaires pour DirectorStats
 *
 * Teste le composant de statistiques avec :
 * - Affichage des 3 StatCards (KPIs simplifiés)
 * - Descriptions correctes
 * - Etat de chargement
 *
 * @ticket SP-147
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth pour éviter l'erreur d'import next/server
// (nécessaire car @/components/dashboard exporte PersonalTasksWidget qui importe des actions)
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}))

// Mock des actions personal-tasks pour éviter les imports de auth
vi.mock('@/lib/actions/personal-tasks', () => ({
  togglePersonalTask: vi.fn(),
  getPersonalTasksForWidget: vi.fn(),
}))
import { render, screen } from '@testing-library/react'
import { DirectorStats } from '@/app/app/director/dashboard/_components/DirectorStats'
import type { DirectorStatsResult } from '@/lib/services/dashboard/types'

// Mock des donnees de test
const mockStats: DirectorStatsResult = {
  totalEmployees: 45,
  totalTeams: 5,
  pendingLeaveRequests: 8,
  averageAttendanceRate: 87,
  teamStats: [
    { name: 'Equipe A', employees: 15, hoursWorked: 600, leaveRate: 10 },
    { name: 'Equipe B', employees: 12, hoursWorked: 480, leaveRate: 15 },
    { name: 'Equipe C', employees: 18, hoursWorked: 720, leaveRate: 5 },
  ],
  leaveTypeDistribution: [
    { type: 'Conges payes', count: 30 },
    { type: 'RTT', count: 15 },
    { type: 'Maladie', count: 8 },
  ],
  employeeGrowth: [
    { month: 'Jan', count: 38 },
    { month: 'Feb', count: 40 },
    { month: 'Mar', count: 42 },
    { month: 'Apr', count: 43 },
    { month: 'May', count: 44 },
    { month: 'Jun', count: 45 },
  ],
}

describe('DirectorStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Rendu des StatCards
  // ==========================================================================

  describe('rendu des StatCards', () => {
    it('devrait afficher les 3 titres de statistiques', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('Employes actifs')).toBeInTheDocument()
      expect(screen.getByText('Equipes')).toBeInTheDocument()
      expect(screen.getByText('Conges en attente')).toBeInTheDocument()
    })

    it('devrait afficher le nombre total d employes', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('45')).toBeInTheDocument()
    })

    it('devrait afficher le nombre d equipes', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('devrait afficher le nombre de conges en attente', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('devrait afficher le nombre de conges en attente', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('8')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Descriptions
  // ==========================================================================

  describe('descriptions', () => {
    it('devrait afficher Total entreprise pour employes', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('Total entreprise')).toBeInTheDocument()
    })

    it('devrait afficher Departements actifs pour equipes', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('Departements actifs')).toBeInTheDocument()
    })

    it('devrait afficher A valider par les managers si conges en attente', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('A valider par les managers')).toBeInTheDocument()
    })

    it('devrait afficher Aucune demande si 0 conges en attente', () => {
      const stats = { ...mockStats, pendingLeaveRequests: 0 }

      render(<DirectorStats stats={stats} />)

      expect(screen.getByText('Aucune demande')).toBeInTheDocument()
    })

    it('devrait afficher Departements actifs pour equipes', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByText('Departements actifs')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Accessibilite
  // ==========================================================================

  describe('accessibilite', () => {
    it('devrait avoir un role region', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('devrait avoir un aria-label', () => {
      render(<DirectorStats stats={mockStats} />)

      expect(
        screen.getByLabelText('Statistiques entreprise')
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <DirectorStats stats={mockStats} className="custom-class" />
      )

      // La className est sur le conteneur (motion.div ou div)
      const element = container.querySelector('.custom-class')
      expect(element).toBeInTheDocument()
    })

    it('devrait accepter isLoading', () => {
      render(<DirectorStats stats={mockStats} isLoading={true} />)

      // En mode loading, les StatCards affichent des skeletons
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('edge cases', () => {
    it('devrait gerer 0 employes', () => {
      const stats = { ...mockStats, totalEmployees: 0 }

      render(<DirectorStats stats={stats} />)

      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
    })

    it('devrait gerer 0 equipes', () => {
      const stats = { ...mockStats, totalTeams: 0 }

      render(<DirectorStats stats={stats} />)

      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
    })

    it('devrait gerer un grand nombre de conges en attente', () => {
      const stats = { ...mockStats, pendingLeaveRequests: 99 }

      render(<DirectorStats stats={stats} />)

      expect(screen.getByText('99')).toBeInTheDocument()
    })

    it('devrait gerer un grand nombre d employes', () => {
      const stats = { ...mockStats, totalEmployees: 1234 }

      render(<DirectorStats stats={stats} />)

      expect(screen.getByText('1234')).toBeInTheDocument()
    })
  })
})
