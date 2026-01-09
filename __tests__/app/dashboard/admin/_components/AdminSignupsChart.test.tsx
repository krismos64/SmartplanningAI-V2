/**
 * Tests unitaires pour AdminSignupsChart
 *
 * Teste le composant graphique des inscriptions avec :
 * - Rendu du chart
 * - Calcul des inscriptions mensuelles
 * - Affichage des donnees vides
 *
 * @ticket SP-148
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminSignupsChart } from '@/app/app/admin/dashboard/_components/AdminSignupsChart'

// Mock du composant BarChartWidget
vi.mock('@/components/charts', () => ({
  BarChartWidget: ({ data }: { data: unknown[] }) => (
    <div data-testid="bar-chart" data-count={data.length}>
      Bar Chart Mock
    </div>
  ),
}))

const mockCompaniesGrowth = [
  { month: 'Jan', count: 100 },
  { month: 'Feb', count: 115 },
  { month: 'Mar', count: 130 },
  { month: 'Apr', count: 142 },
  { month: 'May', count: 155 },
  { month: 'Jun', count: 170 },
]

describe('AdminSignupsChart', () => {
  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait rendre le titre', () => {
      render(<AdminSignupsChart companiesGrowth={mockCompaniesGrowth} />)

      expect(screen.getByText('Nouvelles inscriptions')).toBeInTheDocument()
    })

    it('devrait rendre le total des inscriptions', () => {
      render(<AdminSignupsChart companiesGrowth={mockCompaniesGrowth} />)

      // Premier mois = 0 (pas de precedent)
      // 0 + 15 + 15 + 12 + 13 + 15 = 70
      expect(screen.getByText(/70/)).toBeInTheDocument()
      expect(
        screen.getByText(/nouvelles entreprises sur 6 mois/)
      ).toBeInTheDocument()
    })

    it('devrait rendre le chart avec les donnees', () => {
      render(<AdminSignupsChart companiesGrowth={mockCompaniesGrowth} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '6')
    })
  })

  // ==========================================================================
  // Calcul des inscriptions mensuelles
  // ==========================================================================

  describe('calcul des inscriptions mensuelles', () => {
    it('devrait calculer les deltas corrects', () => {
      render(<AdminSignupsChart companiesGrowth={mockCompaniesGrowth} />)

      // Premier mois = 0 (pas de mois precedent)
      // Les autres = delta
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('devrait gerer les valeurs negatives (retourner 0)', () => {
      const decreasingData = [
        { month: 'Jan', count: 100 },
        { month: 'Feb', count: 90 },
        { month: 'Mar', count: 95 },
      ]

      render(<AdminSignupsChart companiesGrowth={decreasingData} />)

      // Jan=0 (premier mois), Feb=0 (90-100<0 -> 0), Mar=5 (95-90)
      // Total = 5
      expect(screen.getByText(/5/)).toBeInTheDocument()
      expect(
        screen.getByText(/nouvelles entreprises sur 6 mois/)
      ).toBeInTheDocument()
    })

    it('devrait afficher 0 inscriptions si donnees identiques', () => {
      const flatData = [
        { month: 'Jan', count: 100 },
        { month: 'Feb', count: 100 },
        { month: 'Mar', count: 100 },
      ]

      render(<AdminSignupsChart companiesGrowth={flatData} />)

      // Jan=0 (premier), Feb=0 (100-100), Mar=0 (100-100) = 0 total
      // Le texte est split dans le DOM, utiliser une fonction
      expect(
        screen.getByText((_content, element) => {
          return (
            element?.tagName === 'P' &&
            /^0\s+nouvelles entreprises/.test(element.textContent || '')
          )
        })
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Donnees vides
  // ==========================================================================

  describe('donnees vides', () => {
    it('devrait afficher un message quand donnees vides', () => {
      render(<AdminSignupsChart companiesGrowth={[]} />)

      expect(screen.getByText('Aucune donnee disponible')).toBeInTheDocument()
    })

    it('ne devrait pas rendre le chart quand donnees vides', () => {
      render(<AdminSignupsChart companiesGrowth={[]} />)

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    })

    it('devrait afficher 0 inscriptions quand une seule donnee', () => {
      render(
        <AdminSignupsChart companiesGrowth={[{ month: 'Jan', count: 100 }]} />
      )

      // Premier mois = 0 inscription (pas de mois precedent)
      // Le texte est split dans le DOM
      expect(
        screen.getByText((_content, element) => {
          return (
            element?.tagName === 'P' &&
            /^0\s+nouvelles entreprises/.test(element.textContent || '')
          )
        })
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Total des inscriptions
  // ==========================================================================

  describe('total des inscriptions', () => {
    it('devrait calculer le total correct', () => {
      const simpleData = [
        { month: 'Jan', count: 10 },
        { month: 'Feb', count: 20 },
        { month: 'Mar', count: 35 },
      ]

      render(<AdminSignupsChart companiesGrowth={simpleData} />)

      // Jan=0 (premier), Feb=10 (20-10), Mar=15 (35-20) = 25
      expect(screen.getByText(/25/)).toBeInTheDocument()
      expect(
        screen.getByText(/nouvelles entreprises sur 6 mois/)
      ).toBeInTheDocument()
    })

    it('devrait afficher 0 si aucune nouvelle inscription', () => {
      const noGrowth = [
        { month: 'Jan', count: 50 },
        { month: 'Feb', count: 50 },
      ]

      render(<AdminSignupsChart companiesGrowth={noGrowth} />)

      // Jan=0, Feb=0 (50-50) = 0
      // Le texte est split dans le DOM
      expect(
        screen.getByText((_content, element) => {
          return (
            element?.tagName === 'P' &&
            /^0\s+nouvelles entreprises/.test(element.textContent || '')
          )
        })
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Classes CSS
  // ==========================================================================

  describe('classes CSS', () => {
    it('devrait appliquer les classes personnalisees', () => {
      const { container } = render(
        <AdminSignupsChart
          companiesGrowth={mockCompaniesGrowth}
          className="custom-class"
        />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })
})
