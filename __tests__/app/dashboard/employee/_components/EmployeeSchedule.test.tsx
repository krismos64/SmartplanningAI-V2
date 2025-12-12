/**
 * Tests unitaires pour EmployeeSchedule
 *
 * Teste le composant de planning hebdomadaire avec :
 * - Affichage du graphique
 * - Calcul des heures totales
 * - Etat vide
 * - Formatage des donnees
 *
 * @ticket SP-145
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmployeeSchedule } from '@/app/(dashboard)/dashboard/employee/_components/EmployeeSchedule'

// Mock des composants charts pour eviter les erreurs Recharts
vi.mock('@/components/charts', () => ({
  BarChartWidget: ({
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
    <div data-testid="bar-chart" aria-label={title}>
      {isLoading && <span>Loading...</span>}
      {!isLoading && data.length === 0 && <span>{emptyMessage}</span>}
      {!isLoading && data.length > 0 && (
        <span data-testid="chart-data">{JSON.stringify(data)}</span>
      )}
    </div>
  ),
}))

// Donnees de test
const mockWeeklySchedule = [
  { day: 'Lun', hours: 8 },
  { day: 'Mar', hours: 8 },
  { day: 'Mer', hours: 7.5 },
  { day: 'Jeu', hours: 8 },
  { day: 'Ven', hours: 7 },
  { day: 'Sam', hours: 0 },
  { day: 'Dim', hours: 0 },
]

describe('EmployeeSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait afficher le titre du composant', () => {
      render(<EmployeeSchedule weeklySchedule={mockWeeklySchedule} />)

      expect(screen.getByText('Mon planning cette semaine')).toBeInTheDocument()
    })

    it('devrait afficher le graphique', () => {
      render(<EmployeeSchedule weeklySchedule={mockWeeklySchedule} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Calcul du total
  // ==========================================================================

  describe('calcul du total', () => {
    it('devrait afficher le total des heures', () => {
      render(<EmployeeSchedule weeklySchedule={mockWeeklySchedule} />)

      // Total = 8+8+7.5+8+7+0+0 = 38.5h = 38h30
      expect(screen.getByText(/38h30/)).toBeInTheDocument()
    })

    it('devrait afficher 0h pour un planning vide', () => {
      const emptySchedule = [
        { day: 'Lun', hours: 0 },
        { day: 'Mar', hours: 0 },
        { day: 'Mer', hours: 0 },
        { day: 'Jeu', hours: 0 },
        { day: 'Ven', hours: 0 },
        { day: 'Sam', hours: 0 },
        { day: 'Dim', hours: 0 },
      ]

      render(<EmployeeSchedule weeklySchedule={emptySchedule} />)

      expect(screen.getByText(/0h/)).toBeInTheDocument()
    })

    it('devrait formater correctement les heures entieres', () => {
      const schedule = [
        { day: 'Lun', hours: 8 },
        { day: 'Mar', hours: 8 },
        { day: 'Mer', hours: 8 },
        { day: 'Jeu', hours: 8 },
        { day: 'Ven', hours: 8 },
        { day: 'Sam', hours: 0 },
        { day: 'Dim', hours: 0 },
      ]

      render(<EmployeeSchedule weeklySchedule={schedule} />)

      // Total = 40h
      expect(screen.getByText(/40h/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Formatage des donnees
  // ==========================================================================

  describe('formatage des donnees', () => {
    it('devrait formater les donnees pour le graphique', () => {
      render(<EmployeeSchedule weeklySchedule={mockWeeklySchedule} />)

      const chartData = screen.getByTestId('chart-data')
      const data = JSON.parse(chartData.textContent || '[]')

      expect(data).toHaveLength(7)
      expect(data[0]).toHaveProperty('name', 'Lun')
      expect(data[0]).toHaveProperty('heures', 8)
    })

    it('devrait convertir les jours en noms', () => {
      render(<EmployeeSchedule weeklySchedule={mockWeeklySchedule} />)

      const chartData = screen.getByTestId('chart-data')
      const data = JSON.parse(chartData.textContent || '[]')

      expect(data.map((d: { name: string }) => d.name)).toEqual([
        'Lun',
        'Mar',
        'Mer',
        'Jeu',
        'Ven',
        'Sam',
        'Dim',
      ])
    })
  })

  // ==========================================================================
  // Etats
  // ==========================================================================

  describe('etats', () => {
    it("devrait afficher l'etat de chargement", () => {
      render(<EmployeeSchedule weeklySchedule={mockWeeklySchedule} isLoading />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('devrait afficher le message vide quand pas de donnees', () => {
      render(<EmployeeSchedule weeklySchedule={[]} />)

      expect(
        screen.getByText('Aucun shift planifie cette semaine')
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <EmployeeSchedule
          weeklySchedule={mockWeeklySchedule}
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
    it('devrait gerer des heures decimales', () => {
      const schedule = [
        { day: 'Lun', hours: 8.25 },
        { day: 'Mar', hours: 7.75 },
        { day: 'Mer', hours: 0 },
        { day: 'Jeu', hours: 0 },
        { day: 'Ven', hours: 0 },
        { day: 'Sam', hours: 0 },
        { day: 'Dim', hours: 0 },
      ]

      render(<EmployeeSchedule weeklySchedule={schedule} />)

      // Total = 16h
      expect(screen.getByText(/16h/)).toBeInTheDocument()
    })

    it('devrait gerer une semaine incomplete', () => {
      const schedule = [{ day: 'Lun', hours: 8 }]

      render(<EmployeeSchedule weeklySchedule={schedule} />)

      expect(screen.getByText(/8h/)).toBeInTheDocument()
    })
  })
})
