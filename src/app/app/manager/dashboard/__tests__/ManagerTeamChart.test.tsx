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
  it('affiche le titre "Heures travaillées ce mois"', () => {
    render(<ManagerTeamChart teamPerformance={mockTeamPerformance} />)

    expect(screen.getByText('Heures travaillées ce mois')).toBeInTheDocument()
  })

  it('a le data-testid manager-team-chart', () => {
    render(<ManagerTeamChart teamPerformance={mockTeamPerformance} />)

    expect(screen.getByTestId('manager-team-chart')).toBeInTheDocument()
  })

  it('affiche message si equipe vide', () => {
    render(<ManagerTeamChart teamPerformance={[]} />)

    expect(screen.getByText("Aucun membre dans l'équipe")).toBeInTheDocument()
  })

  // Tests de completion/couleurs supprimés — le header total/completion a été retiré
})
