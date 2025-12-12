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
import { AdminStats } from '@/app/(dashboard)/dashboard/admin/_components/AdminStats'
import type { AdminStatsResult } from '@/lib/services/dashboard/types'

// Mock des composants
vi.mock('@/components/dashboard', () => ({
  StatsGrid: ({
    stats,
    isLoading,
  }: {
    stats: unknown[]
    isLoading?: boolean
  }) => (
    <div data-testid="stats-grid" data-loading={isLoading}>
      {JSON.stringify(stats)}
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
    it('devrait rendre le composant StatsGrid', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByTestId('stats-grid')).toBeInTheDocument()
    })

    it('devrait passer isLoading false par defaut', () => {
      render(<AdminStats stats={mockStats} />)

      expect(screen.getByTestId('stats-grid')).toHaveAttribute(
        'data-loading',
        'false'
      )
    })

    it('devrait passer isLoading true quand specifie', () => {
      render(<AdminStats stats={mockStats} isLoading />)

      expect(screen.getByTestId('stats-grid')).toHaveAttribute(
        'data-loading',
        'true'
      )
    })
  })

  // ==========================================================================
  // KPIs passes a StatsGrid
  // ==========================================================================

  describe('KPIs passes a StatsGrid', () => {
    it('devrait inclure le KPI Entreprises', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('Entreprises')
      expect(gridContent).toContain('150')
    })

    it('devrait inclure le KPI Utilisateurs', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('Utilisateurs')
      expect(gridContent).toContain('2500')
    })

    it('devrait inclure le KPI Abonnements actifs', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('Abonnements actifs')
      expect(gridContent).toContain('130')
    })

    it('devrait inclure le KPI MRR formate', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('MRR')
      // formatCurrency retourne "45.0k EUR"
      expect(gridContent).toContain('45.0k EUR')
    })

    it('devrait inclure le KPI Taux conversion', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('Taux conversion')
    })

    it('devrait inclure le KPI Taux churn', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('Taux churn')
      expect(gridContent).toContain('2.5')
    })
  })

  // ==========================================================================
  // Trends
  // ==========================================================================

  describe('trends', () => {
    it('devrait calculer les trends pour Entreprises', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      // Le trend de 25% devrait etre inclus
      expect(gridContent).toContain('up')
    })

    it('devrait calculer les trends pour MRR', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      // Le trend de 18.4% devrait etre inclus
      expect(gridContent).toContain('18.4')
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

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('down')
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

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('neutral')
    })
  })

  // ==========================================================================
  // Taux de conversion
  // ==========================================================================

  describe('taux de conversion', () => {
    it('devrait calculer le taux de conversion', () => {
      render(<AdminStats stats={mockStats} />)

      // 100 actifs / (100 + 30 essai) = 77%
      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('77')
    })

    it('devrait retourner 0 si aucun abonnement', () => {
      const statsWithNoSubs: AdminStatsResult = {
        ...mockStats,
        subscriptionStatusDistribution: [],
      }

      render(<AdminStats stats={statsWithNoSubs} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('"value":0')
    })

    it('devrait retourner 100% si tous actifs', () => {
      const statsAllActive: AdminStatsResult = {
        ...mockStats,
        subscriptionStatusDistribution: [{ status: 'Actif', count: 100 }],
      }

      render(<AdminStats stats={statsAllActive} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('"value":100')
    })
  })

  // ==========================================================================
  // Formatage MRR
  // ==========================================================================

  describe('formatage MRR', () => {
    it('devrait formater les montants >= 1000 en k EUR', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      // formatCurrency retourne "45.0k EUR"
      expect(gridContent).toContain('45.0k EUR')
    })

    it('devrait formater les montants < 1000 sans k', () => {
      const statsLowMrr: AdminStatsResult = {
        ...mockStats,
        mrr: { current: 500, previous: 400, trend: 25 },
      }

      render(<AdminStats stats={statsLowMrr} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('500 EUR')
    })

    it('devrait afficher 0 EUR pour MRR = 0', () => {
      const statsZeroMrr: AdminStatsResult = {
        ...mockStats,
        mrr: { current: 0, previous: 0, trend: 0 },
      }

      render(<AdminStats stats={statsZeroMrr} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('0 EUR')
    })
  })

  // ==========================================================================
  // Description churn
  // ==========================================================================

  describe('description churn', () => {
    it('devrait afficher Retention saine pour churn <= 5%', () => {
      render(<AdminStats stats={mockStats} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('Retention saine')
    })

    it('devrait afficher Attention requise pour churn > 5%', () => {
      const statsHighChurn: AdminStatsResult = {
        ...mockStats,
        churnRate: 7.5,
      }

      render(<AdminStats stats={statsHighChurn} />)

      const gridContent = screen.getByTestId('stats-grid').textContent
      expect(gridContent).toContain('Attention requise')
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
