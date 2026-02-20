/**
 * Tests unitaires pour SubscriptionPieChart
 *
 * @ticket SP-465
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubscriptionPieChart } from '../SubscriptionPieChart'
import type { SubscriptionStatus } from '@prisma/client'

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="pie" data-segments={data.length}>
      {children}
    </div>
  ),
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

const MOCK_DATA: { status: SubscriptionStatus; count: number }[] = [
  { status: 'ACTIVE', count: 10 },
  { status: 'TRIAL', count: 5 },
  { status: 'PAST_DUE', count: 2 },
]

describe('SubscriptionPieChart', () => {
  it('affiche le titre', () => {
    render(<SubscriptionPieChart data={MOCK_DATA} />)
    expect(screen.getByText('Répartition abonnements')).toBeInTheDocument()
  })

  it('a le testid subscription-pie-chart', () => {
    render(<SubscriptionPieChart data={MOCK_DATA} />)
    expect(screen.getByTestId('subscription-pie-chart')).toBeInTheDocument()
  })

  it('gère un tableau vide sans crash', () => {
    render(<SubscriptionPieChart data={[]} />)
    expect(screen.getByTestId('subscription-pie-chart')).toBeInTheDocument()
  })

  it('passe le bon nombre de segments', () => {
    render(<SubscriptionPieChart data={MOCK_DATA} />)
    const pie = screen.getByTestId('pie')
    expect(pie).toHaveAttribute('data-segments', '3')
  })
})
