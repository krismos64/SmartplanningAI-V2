/**
 * Tests unitaires pour TopActionsChart
 *
 * @ticket SP-465
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopActionsChart } from '../TopActionsChart'

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode
    data: unknown[]
  }) => (
    <div data-testid="bar-chart" data-bars={data.length}>
      {children}
    </div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

const MOCK_DATA = [
  { action: 'LOGIN', count: 25 },
  { action: 'CREATE', count: 15 },
  { action: 'UPDATE', count: 10 },
]

describe('TopActionsChart', () => {
  it('affiche le titre', () => {
    render(<TopActionsChart data={MOCK_DATA} />)
    expect(screen.getByText('Top actions (7 jours)')).toBeInTheDocument()
  })

  it('a le testid top-actions-chart', () => {
    render(<TopActionsChart data={MOCK_DATA} />)
    expect(screen.getByTestId('top-actions-chart')).toBeInTheDocument()
  })

  it('passe le bon nombre de barres', () => {
    render(<TopActionsChart data={MOCK_DATA} />)
    const chart = screen.getByTestId('bar-chart')
    expect(chart).toHaveAttribute('data-bars', '3')
  })

  it('gère un tableau vide', () => {
    render(<TopActionsChart data={[]} />)
    expect(screen.getByTestId('top-actions-chart')).toBeInTheDocument()
  })
})
