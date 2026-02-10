/**
 * Tests unitaires pour les widgets charts (AreaChart, BarChart, PieChart)
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// ============================================================================
// Mocks - Recharts nécessite un mock complet en jsdom
// ============================================================================

vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  )
  const MockAreaChart = ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="area-chart" aria-label={props['aria-label'] as string}>
      {children as React.ReactNode}
    </div>
  )
  const MockBarChart = ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="bar-chart" aria-label={props['aria-label'] as string}>
      {children as React.ReactNode}
    </div>
  )
  const MockPieChart = ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="pie-chart" aria-label={props['aria-label'] as string}>
      {children as React.ReactNode}
    </div>
  )
  const MockArea = (props: Record<string, unknown>) => (
    <div data-testid={`area-${props.dataKey}`} />
  )
  const MockBar = (props: Record<string, unknown>) => (
    <div data-testid={`bar-${props.dataKey}`}>{props.children as React.ReactNode}</div>
  )
  const MockPie = ({ children }: Record<string, unknown>) => (
    <div data-testid="pie">{children as React.ReactNode}</div>
  )
  const MockCell = (props: Record<string, unknown>) => (
    <div data-testid="cell" data-fill={props.fill as string} />
  )

  return {
    ResponsiveContainer: MockResponsiveContainer,
    AreaChart: MockAreaChart,
    BarChart: MockBarChart,
    PieChart: MockPieChart,
    Area: MockArea,
    Bar: MockBar,
    Pie: MockPie,
    Cell: MockCell,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
  }
})

import { AreaChartWidget } from '@/components/charts/AreaChartWidget'
import { BarChartWidget } from '@/components/charts/BarChartWidget'
import { PieChartWidget } from '@/components/charts/PieChartWidget'
import { ChartContainer } from '@/components/charts/ChartContainer'

// ============================================================================
// Fixtures
// ============================================================================

const sampleData = [
  { name: 'Jan', value: 100, revenue: 200, expenses: 150 },
  { name: 'Fev', value: 200, revenue: 300, expenses: 180 },
  { name: 'Mar', value: 150, revenue: 250, expenses: 200 },
]

const pieData = [
  { name: 'Congés', value: 30 },
  { name: 'Maladie', value: 10 },
  { name: 'Autre', value: 5 },
]

// ============================================================================
// ChartContainer
// ============================================================================

describe('ChartContainer', () => {
  it('affiche le loading skeleton', () => {
    render(
      <ChartContainer isLoading>
        <div>Chart</div>
      </ChartContainer>
    )
    expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })

  it('affiche l etat vide', () => {
    render(
      <ChartContainer isEmpty>
        <div>Chart</div>
      </ChartContainer>
    )
    expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
    expect(
      screen.getByText('Aucune donnee disponible')
    ).toBeInTheDocument()
  })

  it('affiche un message vide personnalise', () => {
    render(
      <ChartContainer isEmpty emptyMessage="Pas de stats">
        <div>Chart</div>
      </ChartContainer>
    )
    expect(screen.getByText('Pas de stats')).toBeInTheDocument()
  })

  it('rend les enfants en mode normal', () => {
    render(
      <ChartContainer>
        <div>Chart Content</div>
      </ChartContainer>
    )
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
  })
})

// ============================================================================
// AreaChartWidget
// ============================================================================

describe('AreaChartWidget', () => {
  it('rend le graphique avec les donnees', () => {
    render(<AreaChartWidget data={sampleData} dataKey="value" />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('area-value')).toBeInTheDocument()
  })

  it('gere les donnees vides', () => {
    render(<AreaChartWidget data={[]} dataKey="value" />)
    expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
  })

  it('affiche le loading', () => {
    render(
      <AreaChartWidget data={sampleData} dataKey="value" isLoading />
    )
    expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
  })

  it('accepte un titre pour aria-label', () => {
    render(
      <AreaChartWidget
        data={sampleData}
        dataKey="value"
        title="Evolution mensuelle"
      />
    )
    expect(screen.getByTestId('area-chart')).toHaveAttribute(
      'aria-label',
      'Evolution mensuelle'
    )
  })

  it('supporte des dataKey multiples', () => {
    render(
      <AreaChartWidget
        data={sampleData}
        dataKey={['revenue', 'expenses']}
      />
    )
    expect(screen.getByTestId('area-revenue')).toBeInTheDocument()
    expect(screen.getByTestId('area-expenses')).toBeInTheDocument()
  })

  it('aria-label par defaut', () => {
    render(<AreaChartWidget data={sampleData} dataKey="value" />)
    expect(screen.getByTestId('area-chart')).toHaveAttribute(
      'aria-label',
      'Graphique en aire'
    )
  })
})

// ============================================================================
// BarChartWidget
// ============================================================================

describe('BarChartWidget', () => {
  it('rend le graphique avec les donnees', () => {
    render(<BarChartWidget data={sampleData} dataKey="value" />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-value')).toBeInTheDocument()
  })

  it('gere les donnees vides', () => {
    render(<BarChartWidget data={[]} dataKey="value" />)
    expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
  })

  it('affiche le loading', () => {
    render(
      <BarChartWidget data={sampleData} dataKey="value" isLoading />
    )
    expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
  })

  it('accepte un titre', () => {
    render(
      <BarChartWidget
        data={sampleData}
        dataKey="value"
        title="Comparaison"
      />
    )
    expect(screen.getByTestId('bar-chart')).toHaveAttribute(
      'aria-label',
      'Comparaison'
    )
  })

  it('supporte des dataKey multiples', () => {
    render(
      <BarChartWidget
        data={sampleData}
        dataKey={['revenue', 'expenses']}
      />
    )
    expect(screen.getByTestId('bar-revenue')).toBeInTheDocument()
    expect(screen.getByTestId('bar-expenses')).toBeInTheDocument()
  })

  it('aria-label par defaut', () => {
    render(<BarChartWidget data={sampleData} dataKey="value" />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute(
      'aria-label',
      'Graphique en barres'
    )
  })
})

// ============================================================================
// PieChartWidget
// ============================================================================

describe('PieChartWidget', () => {
  it('rend le graphique circulaire', () => {
    render(<PieChartWidget data={pieData} dataKey="value" />)
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pie')).toBeInTheDocument()
  })

  it('gere les donnees vides', () => {
    render(<PieChartWidget data={[]} dataKey="value" />)
    expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
  })

  it('affiche le loading', () => {
    render(<PieChartWidget data={pieData} dataKey="value" isLoading />)
    expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
  })

  it('accepte un titre', () => {
    render(
      <PieChartWidget
        data={pieData}
        dataKey="value"
        title="Repartition conges"
      />
    )
    expect(screen.getByTestId('pie-chart')).toHaveAttribute(
      'aria-label',
      'Repartition conges'
    )
  })

  it('rend un Cell par segment de donnees', () => {
    render(<PieChartWidget data={pieData} dataKey="value" />)
    const cells = screen.getAllByTestId('cell')
    expect(cells).toHaveLength(3)
  })

  it('aria-label par defaut', () => {
    render(<PieChartWidget data={pieData} dataKey="value" />)
    expect(screen.getByTestId('pie-chart')).toHaveAttribute(
      'aria-label',
      'Graphique circulaire'
    )
  })
})
