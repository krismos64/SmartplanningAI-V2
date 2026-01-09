/**
 * Tests unitaires pour DirectorTeamsChart
 *
 * Teste le composant de graphique equipes avec :
 * - Titre et sous-titre
 * - Liste des equipes
 * - Etat vide
 * - Calcul des pourcentages
 *
 * @ticket SP-147
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DirectorTeamsChart } from '@/app/app/director/dashboard/_components/DirectorTeamsChart'
import type { DirectorStatsResult } from '@/lib/services/dashboard/types'

// Mock de PieChartWidget
vi.mock('@/components/charts', () => ({
  PieChartWidget: vi.fn(({ isLoading, emptyMessage }) => {
    if (isLoading) return <div data-testid="loading-chart">Loading...</div>
    return <div data-testid="pie-chart">{emptyMessage}</div>
  }),
}))

// Mock des donnees de test
const mockTeamStats: DirectorStatsResult['teamStats'] = [
  { name: 'Equipe A', employees: 15, hoursWorked: 600, leaveRate: 10 },
  { name: 'Equipe B', employees: 12, hoursWorked: 480, leaveRate: 15 },
  { name: 'Equipe C', employees: 18, hoursWorked: 720, leaveRate: 5 },
]

describe('DirectorTeamsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Titre et sous-titre
  // ==========================================================================

  describe('titre et sous-titre', () => {
    it('devrait afficher le titre', () => {
      render(<DirectorTeamsChart teamStats={mockTeamStats} />)

      expect(screen.getByText('Repartition par equipe')).toBeInTheDocument()
    })

    it('devrait afficher le total employes', () => {
      render(<DirectorTeamsChart teamStats={mockTeamStats} />)

      // 15 + 12 + 18 = 45
      expect(screen.getByText('45 employes au total')).toBeInTheDocument()
    })

    it('devrait afficher employe (singulier) si total = 1', () => {
      const stats = [
        { name: 'Equipe A', employees: 1, hoursWorked: 40, leaveRate: 0 },
      ]

      render(<DirectorTeamsChart teamStats={stats} />)

      expect(screen.getByText('1 employe au total')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Liste des equipes
  // ==========================================================================

  describe('liste des equipes', () => {
    it('devrait afficher les noms des equipes', () => {
      render(<DirectorTeamsChart teamStats={mockTeamStats} />)

      expect(screen.getByText('Equipe A')).toBeInTheDocument()
      expect(screen.getByText('Equipe B')).toBeInTheDocument()
      expect(screen.getByText('Equipe C')).toBeInTheDocument()
    })

    it('devrait afficher le nombre d employes par equipe', () => {
      render(<DirectorTeamsChart teamStats={mockTeamStats} />)

      expect(screen.getByText('15 (33%)')).toBeInTheDocument()
      expect(screen.getByText('12 (27%)')).toBeInTheDocument()
      expect(screen.getByText('18 (40%)')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Calcul des pourcentages
  // ==========================================================================

  describe('calcul des pourcentages', () => {
    it('devrait calculer les pourcentages correctement', () => {
      const stats = [
        { name: 'Equipe A', employees: 50, hoursWorked: 0, leaveRate: 0 },
        { name: 'Equipe B', employees: 50, hoursWorked: 0, leaveRate: 0 },
      ]

      render(<DirectorTeamsChart teamStats={stats} />)

      // Multiple elements avec le meme texte (2 equipes a 50%)
      expect(screen.getAllByText('50 (50%)').length).toBe(2)
    })

    it('devrait gerer un total de 0 employes', () => {
      const stats = [
        { name: 'Equipe A', employees: 0, hoursWorked: 0, leaveRate: 0 },
        { name: 'Equipe B', employees: 0, hoursWorked: 0, leaveRate: 0 },
      ]

      render(<DirectorTeamsChart teamStats={stats} />)

      // Multiple elements avec le meme texte (2 equipes a 0%)
      expect(screen.getAllByText('0 (0%)').length).toBe(2)
    })
  })

  // ==========================================================================
  // Etat vide
  // ==========================================================================

  describe('etat vide', () => {
    it('devrait gerer une liste vide', () => {
      render(<DirectorTeamsChart teamStats={[]} />)

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('devrait afficher 0 employes au total si liste vide', () => {
      render(<DirectorTeamsChart teamStats={[]} />)

      expect(screen.getByText('0 employe au total')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Etat de chargement
  // ==========================================================================

  describe('etat de chargement', () => {
    it('devrait afficher l etat de chargement', () => {
      render(<DirectorTeamsChart teamStats={mockTeamStats} isLoading={true} />)

      expect(screen.getByTestId('loading-chart')).toBeInTheDocument()
    })

    it('ne devrait pas afficher la liste en chargement', () => {
      render(<DirectorTeamsChart teamStats={mockTeamStats} isLoading={true} />)

      expect(screen.queryByText('Equipe A')).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <DirectorTeamsChart
          teamStats={mockTeamStats}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
