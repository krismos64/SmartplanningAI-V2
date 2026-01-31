/**
 * Tests unitaires pour AdminStats
 *
 * Teste le composant de statistiques Super Admin avec :
 * - Affichage des 6 KPIs SaaS
 * - Formatage des valeurs
 * - Trends et tendances
 *
 * @ticket SP-148
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminStats } from '@/app/app/admin/dashboard/_components/AdminStats'
import type { AdminStatsResult } from '@/lib/services/dashboard/types'

// Mock des composants
vi.mock('@/components/dashboard', () => ({
  StatCard: ({
    title,
    value,
    trend,
    description,
    unit,
    variant,
    isLoading,
  }: {
    title: string
    value: string | number
    trend?: { value: number; direction: string; label: string }
    description?: string
    unit?: string
    variant?: string
    isLoading?: boolean
  }) => (
    <div
      data-testid="stat-card"
      data-title={title}
      data-value={unit ? `${value}${unit}` : value}
      data-trend-direction={trend?.direction}
      data-trend-value={trend?.value}
      data-description={description}
      data-variant={variant}
      data-loading={isLoading}
    >
      <span>{title}</span>
      <span>{unit ? `${value}${unit}` : value}</span>
      {trend && <span>{trend.direction}</span>}
      {trend && <span>{trend.value}</span>}
      {description && <span>{description}</span>}
    </div>
  ),
}))

const mockStats: AdminStatsResult = {
  totalCompanies: {
    current: 150,
    previous: 120,
    trend: 25,
  },
  totalUsers: {
    current: 2500,
    previous: 2000,
    trend: 25,
  },
  activeSubscriptions: 130,
  mrr: {
    current: 45000,
    previous: 38000,
    trend: 18.4,
  },
  churnRate: 2.5,
  companiesGrowth: [
    { month: 'Jan', count: 100 },
    { month: 'Feb', count: 110 },
  ],
  revenueByPlan: [
    { plan: 'Starter', revenue: 15000, count: 50 },
    { plan: 'Business', revenue: 25000, count: 30 },
  ],
  subscriptionStatusDistribution: [
    { status: 'Actif', count: 100 },
    { status: 'Essai', count: 30 },
  ],
}

describe('AdminStats', () => {
  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait rendre les StatCards', () => {
      render(<AdminStats stats={mockStats} />)

      const statCards = screen.getAllByTestId('stat-card')
      expect(statCards.length).toBe(6)
    })

    it('devrait passer isLoading false par defaut', () => {
      render(<AdminStats stats={mockStats} />)

      const statCards = screen.getAllByTestId('stat-card')
      statCards.forEach((card) => {
        expect(card).not.toHaveAttribute('data-loading', 'true')
      })
    })

    it('devrait passer isLoading true quand specifie', () => {
      render(<AdminStats stats={mockStats} isLoading />)

      const statCards = screen.getAllByTestId('stat-card')
      statCards.forEach((card) => {
        expect(card).toHaveAttribute('data-loading', 'true')
      })
    })
  })

  // ==========================================================================
  // KPIs passes a StatsGrid
  // ==========================================================================

  describe('KPIs affiches', () => {
    it('devrait inclure le KPI Entreprises', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByText('Entreprises')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('devrait inclure le KPI Utilisateurs', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByText('Utilisateurs')).toBeInTheDocument()
      expect(screen.getByText('2500')).toBeInTheDocument()
    })

    it('devrait inclure le KPI Abonnements actifs', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByText('Abonnements actifs')).toBeInTheDocument()
      expect(screen.getByText('130')).toBeInTheDocument()
    })

    it('devrait inclure le KPI MRR formate', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByText('MRR')).toBeInTheDocument()
      // formatCurrency retourne "45.0k EUR"
      expect(screen.getByText('45.0k EUR')).toBeInTheDocument()
    })

    it('devrait inclure le KPI Taux conversion', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByText('Taux conversion')).toBeInTheDocument()
    })

    it('devrait inclure le KPI Taux churn', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByText('Taux churn')).toBeInTheDocument()
      expect(screen.getByText('2.5%')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Trends
  // ==========================================================================

  describe('trends', () => {
    it('devrait calculer les trends pour Entreprises', () => {
      render(<AdminStats stats={mockStats} />)

      // Le trend de 25% devrait etre inclus avec direction up
      const statCards = screen.getAllByTestId('stat-card')
      const entreprisesCard = statCards.find(
        (card) => card.getAttribute('data-title') === 'Entreprises'
      )
      expect(entreprisesCard).toHaveAttribute('data-trend-direction', 'up')
    })

    it('devrait calculer les trends pour MRR', () => {
      render(<AdminStats stats={mockStats} />)

      // Le trend de 18.4% devrait etre inclus
      const statCards = screen.getAllByTestId('stat-card')
      const mrrCard = statCards.find(
        (card) => card.getAttribute('data-title') === 'MRR'
      )
      expect(mrrCard).toHaveAttribute('data-trend-value', '18.4')
    })

    it('devrait gerer les trends negatifs', () => {
      const statsWithNegativeTrend: AdminStatsResult = {
        ...mockStats,
        totalCompanies: {
          current: 100,
          previous: 120,
          trend: -16.7,
        },
      }

      render(<AdminStats stats={statsWithNegativeTrend} />)

      const statCards = screen.getAllByTestId('stat-card')
      const entreprisesCard = statCards.find(
        (card) => card.getAttribute('data-title') === 'Entreprises'
      )
      expect(entreprisesCard).toHaveAttribute('data-trend-direction', 'down')
    })

    it('devrait gerer les trends neutres (0)', () => {
      const statsWithNeutralTrend: AdminStatsResult = {
        ...mockStats,
        totalCompanies: {
          current: 100,
          previous: 100,
          trend: 0,
        },
      }

      render(<AdminStats stats={statsWithNeutralTrend} />)

      const statCards = screen.getAllByTestId('stat-card')
      const entreprisesCard = statCards.find(
        (card) => card.getAttribute('data-title') === 'Entreprises'
      )
      expect(entreprisesCard).toHaveAttribute('data-trend-direction', 'neutral')
    })
  })

  // ==========================================================================
  // Taux de conversion
  // ==========================================================================

  describe('taux de conversion', () => {
    it('devrait calculer le taux de conversion', () => {
      render(<AdminStats stats={mockStats} />)

      // 100 actifs / (100 + 30 essai) = 77%
      expect(screen.getByText('77%')).toBeInTheDocument()
    })

    it('devrait retourner 0 si aucun abonnement', () => {
      const statsWithNoSubs: AdminStatsResult = {
        ...mockStats,
        subscriptionStatusDistribution: [],
      }

      render(<AdminStats stats={statsWithNoSubs} />)

      const statCards = screen.getAllByTestId('stat-card')
      const conversionCard = statCards.find(
        (card) => card.getAttribute('data-title') === 'Taux conversion'
      )
      expect(conversionCard).toHaveAttribute('data-value', '0%')
    })

    it('devrait retourner 100% si tous actifs', () => {
      const statsAllActive: AdminStatsResult = {
        ...mockStats,
        subscriptionStatusDistribution: [{ status: 'Actif', count: 100 }],
      }

      render(<AdminStats stats={statsAllActive} />)

      const statCards = screen.getAllByTestId('stat-card')
      const conversionCard = statCards.find(
        (card) => card.getAttribute('data-title') === 'Taux conversion'
      )
      expect(conversionCard).toHaveAttribute('data-value', '100%')
    })
  })

  // ==========================================================================
  // Formatage MRR
  // ==========================================================================

  describe('formatage MRR', () => {
    it('devrait formater les montants >= 1000 en k EUR', () => {
      render(<AdminStats stats={mockStats} />)

      // formatCurrency retourne "45.0k EUR"
      expect(screen.getByText('45.0k EUR')).toBeInTheDocument()
    })

    it('devrait formater les montants < 1000 sans k', () => {
      const statsLowMrr: AdminStatsResult = {
        ...mockStats,
        mrr: { current: 500, previous: 400, trend: 25 },
      }

      render(<AdminStats stats={statsLowMrr} />)

      expect(screen.getByText('500 EUR')).toBeInTheDocument()
    })

    it('devrait afficher 0 EUR pour MRR = 0', () => {
      const statsZeroMrr: AdminStatsResult = {
        ...mockStats,
        mrr: { current: 0, previous: 0, trend: 0 },
      }

      render(<AdminStats stats={statsZeroMrr} />)

      expect(screen.getByText('0 EUR')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Description churn
  // ==========================================================================

  describe('description churn', () => {
    it('devrait afficher Retention saine pour churn <= 5%', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByText('Retention saine')).toBeInTheDocument()
    })

    it('devrait afficher Attention requise pour churn > 5%', () => {
      const statsHighChurn: AdminStatsResult = {
        ...mockStats,
        churnRate: 7.5,
      }

      render(<AdminStats stats={statsHighChurn} />)

      expect(screen.getByText('Attention requise')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Accessibilite
  // ==========================================================================

  describe('accessibilite', () => {
    it('devrait avoir un role region', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('devrait avoir un aria-label', () => {
      render(<AdminStats stats={mockStats} />)

      expect(
        screen.getByRole('region', { name: /statistiques plateforme/i })
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Classes CSS
  // ==========================================================================

  describe('classes CSS', () => {
    it('devrait appliquer les classes personnalisees', () => {
      const { container } = render(
        <AdminStats stats={mockStats} className="custom-class" />
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })
})
