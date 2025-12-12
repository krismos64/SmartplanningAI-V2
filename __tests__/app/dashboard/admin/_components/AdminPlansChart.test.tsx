/**
 * Tests unitaires pour AdminPlansChart
 *
 * Teste le composant graphique des plans avec :
 * - Rendu du PieChart
 * - Legende des plans
 * - Calculs de pourcentages
 *
 * @ticket SP-148
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminPlansChart } from '@/app/(dashboard)/dashboard/admin/_components/AdminPlansChart'

// Mock du composant PieChartWidget
vi.mock('@/components/charts', () => ({
  PieChartWidget: ({ data }: { data: unknown[] }) => (
    <div data-testid="pie-chart" data-count={data.length}>
      Pie Chart Mock
    </div>
  ),
}))

const mockRevenueByPlan = [
  { plan: 'Gratuit', revenue: 0, count: 50 },
  { plan: 'Starter', revenue: 1450, count: 50 },
  { plan: 'Business', revenue: 4950, count: 50 },
  { plan: 'Enterprise', revenue: 14950, count: 50 },
]

const mockSubscriptionStatusDistribution = [
  { status: 'Actif', count: 150 },
  { status: 'Essai', count: 50 },
]

describe('AdminPlansChart', () => {
  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait rendre le titre', () => {
      render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      expect(screen.getByText('Repartition des plans')).toBeInTheDocument()
    })

    it('devrait rendre le total des abonnements', () => {
      render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      // 50 * 4 = 200 abonnements
      expect(screen.getByText(/200 abonnements/)).toBeInTheDocument()
    })

    it('devrait rendre le total du revenue', () => {
      render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      // 0 + 1450 + 4950 + 14950 = 21350 EUR
      expect(screen.getByText(/21.*350.*€|21.*350.*EUR/)).toBeInTheDocument()
    })

    it('devrait rendre le PieChart', () => {
      render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Filtrage des donnees
  // ==========================================================================

  describe('filtrage des donnees', () => {
    it('devrait filtrer les plans avec count = 0', () => {
      const dataWithZero = [
        { plan: 'Gratuit', revenue: 0, count: 0 },
        { plan: 'Starter', revenue: 1450, count: 50 },
        { plan: 'Business', revenue: 4950, count: 50 },
      ]

      render(
        <AdminPlansChart
          revenueByPlan={dataWithZero}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      // Seuls 2 plans ont des abonnements
      expect(screen.getByTestId('pie-chart')).toHaveAttribute('data-count', '2')
    })

    it('devrait inclure tous les plans dans la legende', () => {
      render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      expect(screen.getByText('Gratuit')).toBeInTheDocument()
      expect(screen.getByText('Starter')).toBeInTheDocument()
      expect(screen.getByText('Business')).toBeInTheDocument()
      expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Legende et pourcentages
  // ==========================================================================

  describe('legende et pourcentages', () => {
    it('devrait afficher le nombre d abonnements par plan', () => {
      render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      // Chaque plan a 50 abos
      const abosTexts = screen.getAllByText(/50 abos/)
      expect(abosTexts.length).toBe(4)
    })

    it('devrait afficher les pourcentages corrects', () => {
      render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      // Chaque plan = 25%
      const percentTexts = screen.getAllByText(/25%/)
      expect(percentTexts.length).toBe(4)
    })

    it('devrait afficher les indicateurs de couleur', () => {
      const { container } = render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      const colorDots = container.querySelectorAll('.rounded-full.h-3.w-3')
      expect(colorDots.length).toBe(4)
    })
  })

  // ==========================================================================
  // Donnees vides
  // ==========================================================================

  describe('donnees vides', () => {
    it('devrait afficher un message quand aucun abonnement', () => {
      render(
        <AdminPlansChart
          revenueByPlan={[]}
          subscriptionStatusDistribution={[]}
        />
      )

      expect(screen.getByText('Aucun abonnement actif')).toBeInTheDocument()
    })

    it('ne devrait pas rendre le PieChart quand vide', () => {
      render(
        <AdminPlansChart
          revenueByPlan={[]}
          subscriptionStatusDistribution={[]}
        />
      )

      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    })

    it('devrait afficher 0 abonnements et 0 EUR', () => {
      render(
        <AdminPlansChart
          revenueByPlan={[]}
          subscriptionStatusDistribution={[]}
        />
      )

      expect(
        screen.getByText(/0 abonnements.*0.*€|0 abonnements.*0.*EUR/)
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Calculs
  // ==========================================================================

  describe('calculs', () => {
    it('devrait calculer le pourcentage arrondi', () => {
      const unevenData = [
        { plan: 'Starter', revenue: 1000, count: 33 },
        { plan: 'Business', revenue: 2000, count: 67 },
      ]

      render(
        <AdminPlansChart
          revenueByPlan={unevenData}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
        />
      )

      // 33/100 = 33%, 67/100 = 67%
      expect(screen.getByText(/33%/)).toBeInTheDocument()
      expect(screen.getByText(/67%/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Classes CSS
  // ==========================================================================

  describe('classes CSS', () => {
    it('devrait appliquer les classes personnalisees', () => {
      const { container } = render(
        <AdminPlansChart
          revenueByPlan={mockRevenueByPlan}
          subscriptionStatusDistribution={mockSubscriptionStatusDistribution}
          className="custom-class"
        />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })
})
