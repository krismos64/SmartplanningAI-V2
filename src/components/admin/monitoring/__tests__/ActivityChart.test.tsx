/**
 * Tests unitaires pour ActivityChart
 *
 * @ticket SP-465
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityChart } from '../ActivityChart'

// Mock recharts pour éviter les erreurs de rendu SVG
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({
    children,
    data,
  }: {
    children: React.ReactNode
    data: unknown[]
  }) => (
    <div data-testid="area-chart" data-points={data.length}>
      {children}
    </div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

const MOCK_DATA = [
  { date: '2026-02-14', count: 5 },
  { date: '2026-02-15', count: 12 },
  { date: '2026-02-16', count: 0 },
  { date: '2026-02-17', count: 8 },
  { date: '2026-02-18', count: 3 },
  { date: '2026-02-19', count: 15 },
  { date: '2026-02-20', count: 7 },
]

describe('ActivityChart', () => {
  it('affiche le titre', () => {
    render(<ActivityChart data={MOCK_DATA} />)
    expect(
      screen.getByText('Activité plateforme (7 derniers jours)')
    ).toBeInTheDocument()
  })

  it('a le testid activity-chart', () => {
    render(<ActivityChart data={MOCK_DATA} />)
    expect(screen.getByTestId('activity-chart')).toBeInTheDocument()
  })

  it('passe le bon nombre de points au chart', () => {
    render(<ActivityChart data={MOCK_DATA} />)
    const chart = screen.getByTestId('area-chart')
    expect(chart).toHaveAttribute('data-points', '7')
  })

  it('gère un tableau vide', () => {
    render(<ActivityChart data={[]} />)
    expect(screen.getByTestId('activity-chart')).toBeInTheDocument()
  })
})
