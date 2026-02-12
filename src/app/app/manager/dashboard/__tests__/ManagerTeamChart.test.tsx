/**
 * Tests unitaires pour ManagerTeamChart
 *
 * @ticket SP-316
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ManagerTeamChart } from '../_components/ManagerTeamChart'

// Mock recharts pour eviter les erreurs de rendu
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
}))

const mockTeamPerformance = [
  { name: 'Alice D.', hoursWorked: 35, scheduledHours: 35 },
  { name: 'Bob M.', hoursWorked: 32, scheduledHours: 35 },
  { name: 'Claire P.', hoursWorked: 28, scheduledHours: 35 },
]

describe('ManagerTeamChart', () => {
  it('affiche le titre "Performance equipe"', () => {
    render(<ManagerTeamChart teamPerformance={mockTeamPerformance} />)

    expect(screen.getByText('Performance équipe')).toBeInTheDocument()
  })

  it('affiche la description', () => {
    render(<ManagerTeamChart teamPerformance={mockTeamPerformance} />)

    expect(screen.getByText('Heures travaillées ce mois')).toBeInTheDocument()
  })

  it('affiche le total des heures', () => {
    render(<ManagerTeamChart teamPerformance={mockTeamPerformance} />)

    // 35 + 32 + 28 = 95h
    expect(screen.getByText('95h')).toBeInTheDocument()
  })

  it('affiche le pourcentage de completion moyenne', () => {
    render(<ManagerTeamChart teamPerformance={mockTeamPerformance} />)

    // (95 / 105) * 100 = 90%
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('a le data-testid manager-team-chart', () => {
    render(<ManagerTeamChart teamPerformance={mockTeamPerformance} />)

    expect(screen.getByTestId('manager-team-chart')).toBeInTheDocument()
  })

  it('affiche message si equipe vide', () => {
    render(<ManagerTeamChart teamPerformance={[]} />)

    expect(screen.getByText("Aucun membre dans l'équipe")).toBeInTheDocument()
  })

  it('applique couleur verte pour completion >= 90%', () => {
    const highPerformance = [
      { name: 'Alice D.', hoursWorked: 35, scheduledHours: 35 },
    ]
    render(<ManagerTeamChart teamPerformance={highPerformance} />)

    // 100% completion = vert (emerald)
    const completion = screen.getByText('100%')
    expect(completion).toHaveClass('text-emerald-600')
  })

  it('applique couleur ambre pour completion entre 70 et 90%', () => {
    const mediumPerformance = [
      { name: 'Alice D.', hoursWorked: 28, scheduledHours: 35 },
    ]
    render(<ManagerTeamChart teamPerformance={mediumPerformance} />)

    // 80% completion = ambre
    const completion = screen.getByText('80%')
    expect(completion).toHaveClass('text-amber-600')
  })

  it('applique couleur rouge pour completion < 70%', () => {
    const lowPerformance = [
      { name: 'Alice D.', hoursWorked: 20, scheduledHours: 35 },
    ]
    render(<ManagerTeamChart teamPerformance={lowPerformance} />)

    // 57% completion = rouge
    const completion = screen.getByText('57%')
    expect(completion).toHaveClass('text-red-600')
  })

  it('gere scheduledHours = 0 sans division par zero', () => {
    const noScheduled = [
      { name: 'Alice D.', hoursWorked: 10, scheduledHours: 0 },
    ]
    render(<ManagerTeamChart teamPerformance={noScheduled} />)

    // 0% completion (pas de division par zero)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('formate les heures avec minutes', () => {
    const withMinutes = [
      { name: 'Alice D.', hoursWorked: 35.5, scheduledHours: 35 },
    ]
    render(<ManagerTeamChart teamPerformance={withMinutes} />)

    // 35.5h = 35h30
    expect(screen.getByText('35h30')).toBeInTheDocument()
  })
})
