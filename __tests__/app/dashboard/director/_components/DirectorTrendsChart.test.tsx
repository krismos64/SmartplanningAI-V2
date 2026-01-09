/**
 * Tests unitaires pour DirectorTrendsChart
 *
 * Teste le composant de graphique tendances avec :
 * - Titre et periode
 * - Indicateur de croissance
 * - Etat vide
 *
 * @ticket SP-147
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DirectorTrendsChart } from '@/app/app/director/dashboard/_components/DirectorTrendsChart'
import type { DirectorStatsResult } from '@/lib/services/dashboard/types'

// Mock de AreaChartWidget
vi.mock('@/components/charts', () => ({
  AreaChartWidget: vi.fn(({ isLoading, emptyMessage }) => {
    if (isLoading) return <div data-testid="loading-chart">Loading...</div>
    return <div data-testid="area-chart">{emptyMessage}</div>
  }),
}))

// Mock des donnees de test
const mockEmployeeGrowth: DirectorStatsResult['employeeGrowth'] = [
  { month: 'Jan', count: 38 },
  { month: 'Feb', count: 40 },
  { month: 'Mar', count: 42 },
  { month: 'Apr', count: 43 },
  { month: 'May', count: 44 },
  { month: 'Jun', count: 45 },
]

describe('DirectorTrendsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Titre et periode
  // ==========================================================================

  describe('titre et periode', () => {
    it('devrait afficher le titre', () => {
      render(<DirectorTrendsChart employeeGrowth={mockEmployeeGrowth} />)

      expect(screen.getByText('Evolution des effectifs')).toBeInTheDocument()
    })

    it('devrait afficher la periode', () => {
      render(<DirectorTrendsChart employeeGrowth={mockEmployeeGrowth} />)

      expect(screen.getByText('6 derniers mois')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Indicateur de croissance
  // ==========================================================================

  describe('indicateur de croissance', () => {
    it('devrait calculer la croissance positive', () => {
      // 38 -> 45 = (45-38)/38 * 100 = 18.42% arrondi a 18%
      render(<DirectorTrendsChart employeeGrowth={mockEmployeeGrowth} />)

      expect(screen.getByText('+18%')).toBeInTheDocument()
    })

    it('devrait afficher une croissance negative', () => {
      const decreasingGrowth = [
        { month: 'Jan', count: 50 },
        { month: 'Feb', count: 48 },
        { month: 'Mar', count: 45 },
        { month: 'Apr', count: 43 },
        { month: 'May', count: 41 },
        { month: 'Jun', count: 40 },
      ]

      render(<DirectorTrendsChart employeeGrowth={decreasingGrowth} />)

      // 50 -> 40 = (40-50)/50 * 100 = -20%
      expect(screen.getByText('-20%')).toBeInTheDocument()
    })

    it('devrait afficher 0% si pas de croissance', () => {
      const flatGrowth = [
        { month: 'Jan', count: 40 },
        { month: 'Feb', count: 40 },
        { month: 'Mar', count: 40 },
        { month: 'Apr', count: 40 },
        { month: 'May', count: 40 },
        { month: 'Jun', count: 40 },
      ]

      render(<DirectorTrendsChart employeeGrowth={flatGrowth} />)

      expect(screen.getByText('+0%')).toBeInTheDocument()
    })

    it('devrait gerer un premier mois a 0 employes', () => {
      const growthFromZero = [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: 5 },
        { month: 'Mar', count: 10 },
        { month: 'Apr', count: 15 },
        { month: 'May', count: 20 },
        { month: 'Jun', count: 25 },
      ]

      render(<DirectorTrendsChart employeeGrowth={growthFromZero} />)

      // Division par 0, donc growth = 0
      expect(screen.getByText('+0%')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Etat vide
  // ==========================================================================

  describe('etat vide', () => {
    it('devrait gerer une liste vide', () => {
      render(<DirectorTrendsChart employeeGrowth={[]} />)

      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Etat de chargement
  // ==========================================================================

  describe('etat de chargement', () => {
    it('devrait afficher l etat de chargement', () => {
      render(
        <DirectorTrendsChart
          employeeGrowth={mockEmployeeGrowth}
          isLoading={true}
        />
      )

      expect(screen.getByTestId('loading-chart')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <DirectorTrendsChart
          employeeGrowth={mockEmployeeGrowth}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
