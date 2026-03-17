/**
 * Tests unitaires pour EmployeeLeaveBalance
 *
 * Teste le composant de solde de conges avec :
 * - Graphique donut
 * - Barre de progression
 * - Resume textuel
 * - Accessibilite
 *
 * @ticket SP-145
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmployeeLeaveBalance } from '@/app/app/dashboard/_components/EmployeeLeaveBalance'

// Mock des composants charts
vi.mock('@/components/charts', () => ({
  PieChartWidget: ({
    data,
    isLoading,
    emptyMessage,
    title,
  }: {
    data: unknown[]
    isLoading?: boolean
    emptyMessage?: string
    title?: string
  }) => (
    <div data-testid="pie-chart" aria-label={title}>
      {isLoading && <span>Loading...</span>}
      {!isLoading && data.length === 0 && <span>{emptyMessage}</span>}
      {!isLoading && data.length > 0 && (
        <span data-testid="chart-data">{JSON.stringify(data)}</span>
      )}
    </div>
  ),
}))

// Donnees de test
const mockLeaveBalance = {
  remaining: 15,
  used: 10,
  total: 25,
}

describe('EmployeeLeaveBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait afficher le titre', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      expect(screen.getByText('Solde de congés')).toBeInTheDocument()
    })

    it('devrait afficher le graphique', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Label central
  // ==========================================================================

  describe('label central', () => {
    it('devrait afficher le nombre de jours restants', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('jours restants')).toBeInTheDocument()
    })

    it('devrait gerer 0 jours restants', () => {
      const balance = { remaining: 0, used: 25, total: 25 }

      render(<EmployeeLeaveBalance leaveBalance={balance} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Resume textuel
  // ==========================================================================

  describe('resume textuel', () => {
    it('devrait afficher les jours utilises', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      expect(screen.getByText('10 j')).toBeInTheDocument()
    })

    it('devrait afficher les jours restants en vert', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      const remaining = screen.getByText('15 j')
      expect(remaining).toHaveClass('text-green-600')
    })

    it('devrait afficher le total', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      expect(screen.getByText('25 j')).toBeInTheDocument()
    })

    it('devrait afficher les labels', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      expect(screen.getByText('Utilisés')).toBeInTheDocument()
      expect(screen.getByText('Restants')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Barre de progression
  // ==========================================================================

  describe('barre de progression', () => {
    it('devrait afficher le pourcentage restant', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      // 15/25 = 60%
      expect(screen.getByText('60% restants')).toBeInTheDocument()
    })

    it('devrait afficher le pourcentage utilise', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      expect(screen.getByText('40% utilisés')).toBeInTheDocument()
    })

    it('devrait avoir la barre avec la bonne largeur', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle({ width: '60%' })
    })

    it('devrait avoir les attributs ARIA corrects', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '60')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  // ==========================================================================
  // Donnees du graphique
  // ==========================================================================

  describe('donnees du graphique', () => {
    it('devrait formater les donnees pour le graphique', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} />)

      const chartData = screen.getByTestId('chart-data')
      const data = JSON.parse(chartData.textContent || '[]')

      expect(data).toHaveLength(2)
      expect(data[0]).toEqual({ name: 'Utilisés', value: 10 })
      expect(data[1]).toEqual({ name: 'Restants', value: 15 })
    })
  })

  // ==========================================================================
  // Etats
  // ==========================================================================

  describe('etats', () => {
    it("devrait afficher l'etat de chargement", () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} isLoading />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('ne devrait pas afficher le label central en chargement', () => {
      render(<EmployeeLeaveBalance leaveBalance={mockLeaveBalance} isLoading />)

      expect(screen.queryByText('jours restants')).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <EmployeeLeaveBalance
          leaveBalance={mockLeaveBalance}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('edge cases', () => {
    it('devrait gerer total a 0', () => {
      const balance = { remaining: 0, used: 0, total: 0 }

      render(<EmployeeLeaveBalance leaveBalance={balance} />)

      expect(screen.getByText('0% restants')).toBeInTheDocument()
    })

    it('devrait gerer un solde negatif', () => {
      const balance = { remaining: -5, used: 30, total: 25 }

      render(<EmployeeLeaveBalance leaveBalance={balance} />)

      expect(screen.getByText('-5')).toBeInTheDocument()
    })

    it('devrait gerer des valeurs decimales', () => {
      const balance = { remaining: 15.5, used: 9.5, total: 25 }

      render(<EmployeeLeaveBalance leaveBalance={balance} />)

      expect(screen.getByText('15.5 j')).toBeInTheDocument()
    })

    it('devrait afficher 100% quand tout est utilise', () => {
      const balance = { remaining: 0, used: 25, total: 25 }

      render(<EmployeeLeaveBalance leaveBalance={balance} />)

      expect(screen.getByText('0% restants')).toBeInTheDocument()
      expect(screen.getByText('100% utilisés')).toBeInTheDocument()
    })

    it("devrait afficher 100% restants quand rien n'est utilise", () => {
      const balance = { remaining: 25, used: 0, total: 25 }

      render(<EmployeeLeaveBalance leaveBalance={balance} />)

      expect(screen.getByText('100% restants')).toBeInTheDocument()
      expect(screen.getByText('0% utilisés')).toBeInTheDocument()
    })
  })
})
