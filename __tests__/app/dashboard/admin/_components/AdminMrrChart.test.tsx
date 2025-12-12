/**
 * Tests unitaires pour AdminMrrChart
 *
 * Teste le composant graphique MRR avec :
 * - Rendu du chart
 * - Calcul de croissance
 * - Affichage des donnees vides
 *
 * @ticket SP-148
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminMrrChart } from '@/app/(dashboard)/dashboard/admin/_components/AdminMrrChart'

// Mock du composant AreaChartWidget
vi.mock('@/components/charts', () => ({
  AreaChartWidget: ({ data }: { data: unknown[] }) => (
    <div data-testid="area-chart" data-count={data.length}>
      Area Chart Mock
    </div>
  ),
}))

const mockCompaniesGrowth = [
  { month: 'Jan', count: 100 },
  { month: 'Feb', count: 110 },
  { month: 'Mar', count: 125 },
  { month: 'Apr', count: 140 },
  { month: 'May', count: 150 },
  { month: 'Jun', count: 160 },
]

describe('AdminMrrChart', () => {
  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait rendre le titre', () => {
      render(<AdminMrrChart companiesGrowth={mockCompaniesGrowth} />)

      expect(screen.getByText('Evolution des entreprises')).toBeInTheDocument()
    })

    it('devrait rendre le sous-titre', () => {
      render(<AdminMrrChart companiesGrowth={mockCompaniesGrowth} />)

      expect(screen.getByText('6 derniers mois')).toBeInTheDocument()
    })

    it('devrait rendre le chart avec les donnees', () => {
      render(<AdminMrrChart companiesGrowth={mockCompaniesGrowth} />)

      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toHaveAttribute(
        'data-count',
        '6'
      )
    })
  })

  // ==========================================================================
  // Calcul de croissance
  // ==========================================================================

  describe('calcul de croissance', () => {
    it('devrait afficher la croissance positive avec +', () => {
      render(<AdminMrrChart companiesGrowth={mockCompaniesGrowth} />)

      // 160 vs 100 = +60%
      expect(screen.getByText('+60%')).toBeInTheDocument()
    })

    it('devrait afficher la croissance negative sans +', () => {
      const decreasingData = [
        { month: 'Jan', count: 100 },
        { month: 'Feb', count: 90 },
      ]

      render(<AdminMrrChart companiesGrowth={decreasingData} />)

      // 90 vs 100 = -10%
      expect(screen.getByText('-10%')).toBeInTheDocument()
    })

    it('devrait afficher 0% pour aucune croissance', () => {
      const flatData = [
        { month: 'Jan', count: 100 },
        { month: 'Feb', count: 100 },
      ]

      render(<AdminMrrChart companiesGrowth={flatData} />)

      expect(screen.getByText('+0%')).toBeInTheDocument()
    })

    it('devrait retourner 0% si premier mois est 0', () => {
      const startZero = [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: 100 },
      ]

      render(<AdminMrrChart companiesGrowth={startZero} />)

      expect(screen.getByText('+0%')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Donnees vides
  // ==========================================================================

  describe('donnees vides', () => {
    it('devrait afficher un message quand donnees vides', () => {
      render(<AdminMrrChart companiesGrowth={[]} />)

      expect(screen.getByText('Aucune donnee disponible')).toBeInTheDocument()
    })

    it('ne devrait pas rendre le chart quand donnees vides', () => {
      render(<AdminMrrChart companiesGrowth={[]} />)

      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })

    it('devrait afficher 0% de croissance quand une seule donnee', () => {
      render(<AdminMrrChart companiesGrowth={[{ month: 'Jan', count: 100 }]} />)

      expect(screen.getByText('+0%')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Styles indicateur croissance
  // ==========================================================================

  describe('styles indicateur croissance', () => {
    it('devrait avoir le style vert pour croissance positive', () => {
      const { container } = render(
        <AdminMrrChart companiesGrowth={mockCompaniesGrowth} />
      )

      const badge = container.querySelector('.bg-emerald-500\\/10')
      expect(badge).toBeInTheDocument()
    })

    it('devrait avoir le style rouge pour croissance negative', () => {
      const decreasingData = [
        { month: 'Jan', count: 100 },
        { month: 'Feb', count: 80 },
      ]

      const { container } = render(
        <AdminMrrChart companiesGrowth={decreasingData} />
      )

      const badge = container.querySelector('.bg-red-500\\/10')
      expect(badge).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Classes CSS
  // ==========================================================================

  describe('classes CSS', () => {
    it('devrait appliquer les classes personnalisees', () => {
      const { container } = render(
        <AdminMrrChart
          companiesGrowth={mockCompaniesGrowth}
          className="custom-class"
        />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })
})
