/**
 * Tests pour BarChartWidget
 *
 * Graphique en barres pour comparaisons avec support
 * vertical/horizontal et mode stacked.
 *
 * @ticket SP-143
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BarChartWidget } from '@/components/charts/BarChartWidget'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import type { ChartDataPoint } from '@/types/charts'

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({
    children,
    layout,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    layout?: string
    'aria-label'?: string
  }) => (
    <div data-testid="bar-chart" data-layout={layout} aria-label={ariaLabel}>
      {children}
    </div>
  ),
  Bar: ({
    dataKey,
    fill,
    stackId,
    name,
    radius,
    children,
  }: {
    dataKey: string
    fill: string
    stackId?: string
    name: string
    radius?: number
    children?: React.ReactNode
  }) => (
    <div
      data-testid={`bar-${dataKey}`}
      data-fill={fill}
      data-stackid={stackId}
      data-name={name}
      data-radius={radius}
    >
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" data-fill={fill} />
  ),
  XAxis: ({ dataKey, type }: { dataKey?: string; type?: string }) => (
    <div data-testid="x-axis" data-datakey={dataKey} data-type={type} />
  ),
  YAxis: ({ dataKey, type }: { dataKey?: string; type?: string }) => (
    <div data-testid="y-axis" data-datakey={dataKey} data-type={type} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

// Donnees de test
const mockSingleSeriesData: ChartDataPoint[] = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 150 },
]

const mockMultiSeriesData: ChartDataPoint[] = [
  { name: 'Jan', revenue: 5000, expenses: 3000 },
  { name: 'Feb', revenue: 6000, expenses: 3500 },
  { name: 'Mar', revenue: 5500, expenses: 3200 },
]

describe('BarChartWidget', () => {
  // =========================================================================
  // Rendu de base
  // =========================================================================

  describe('Rendu de base', () => {
    it('rend le graphique avec une serie simple', () => {
      render(<BarChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-value')).toBeInTheDocument()
    })

    it('rend les axes X et Y', () => {
      render(<BarChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })

    it('utilise layout horizontal par defaut', () => {
      render(<BarChartWidget data={mockSingleSeriesData} dataKey="value" />)

      const chart = screen.getByTestId('bar-chart')
      expect(chart).toHaveAttribute('data-layout', 'horizontal')
    })
  })

  // =========================================================================
  // Mode horizontal
  // =========================================================================

  describe('Mode horizontal', () => {
    it('utilise layout vertical quand horizontal=true', () => {
      render(
        <BarChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          horizontal
        />
      )

      const chart = screen.getByTestId('bar-chart')
      expect(chart).toHaveAttribute('data-layout', 'vertical')
    })

    it('inverse les axes en mode horizontal', () => {
      render(
        <BarChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          horizontal
        />
      )

      const xAxis = screen.getByTestId('x-axis')
      const yAxis = screen.getByTestId('y-axis')

      expect(xAxis).toHaveAttribute('data-type', 'number')
      expect(yAxis).toHaveAttribute('data-type', 'category')
    })
  })

  // =========================================================================
  // Multi-series et stacked
  // =========================================================================

  describe('Multi-series et stacked', () => {
    it('rend plusieurs barres avec dataKey tableau', () => {
      render(
        <BarChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
        />
      )

      expect(screen.getByTestId('bar-revenue')).toBeInTheDocument()
      expect(screen.getByTestId('bar-expenses')).toBeInTheDocument()
    })

    it('n\'empile pas les barres par defaut', () => {
      render(
        <BarChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
        />
      )

      const barRevenue = screen.getByTestId('bar-revenue')
      const barExpenses = screen.getByTestId('bar-expenses')

      expect(barRevenue).not.toHaveAttribute('data-stackid', 'stack')
      expect(barExpenses).not.toHaveAttribute('data-stackid', 'stack')
    })

    it('empile les barres avec stacked=true', () => {
      render(
        <BarChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
          stacked
        />
      )

      const barRevenue = screen.getByTestId('bar-revenue')
      const barExpenses = screen.getByTestId('bar-expenses')

      expect(barRevenue).toHaveAttribute('data-stackid', 'stack')
      expect(barExpenses).toHaveAttribute('data-stackid', 'stack')
    })

    it('applique les couleurs par defaut', () => {
      render(
        <BarChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
        />
      )

      const barRevenue = screen.getByTestId('bar-revenue')
      const barExpenses = screen.getByTestId('bar-expenses')

      expect(barRevenue).toHaveAttribute('data-fill', CHART_COLORS.primary[0])
      expect(barExpenses).toHaveAttribute('data-fill', CHART_COLORS.primary[1])
    })
  })

  // =========================================================================
  // Couleurs et style
  // =========================================================================

  describe('Couleurs et style', () => {
    it('applique des couleurs personnalisees', () => {
      const customColors = ['#ff0000', '#00ff00']
      render(
        <BarChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
          colors={customColors}
        />
      )

      const barRevenue = screen.getByTestId('bar-revenue')
      const barExpenses = screen.getByTestId('bar-expenses')

      expect(barRevenue).toHaveAttribute('data-fill', '#ff0000')
      expect(barExpenses).toHaveAttribute('data-fill', '#00ff00')
    })

    it('applique le rayon par defaut (4px)', () => {
      render(<BarChartWidget data={mockSingleSeriesData} dataKey="value" />)

      const bar = screen.getByTestId('bar-value')
      expect(bar).toHaveAttribute('data-radius', '4')
    })

    it('applique un rayon personnalise', () => {
      render(
        <BarChartWidget data={mockSingleSeriesData} dataKey="value" radius={8} />
      )

      const bar = screen.getByTestId('bar-value')
      expect(bar).toHaveAttribute('data-radius', '8')
    })

    it('utilise des Cell pour serie unique', () => {
      render(<BarChartWidget data={mockSingleSeriesData} dataKey="value" />)

      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(mockSingleSeriesData.length)
    })
  })

  // =========================================================================
  // Elements optionnels
  // =========================================================================

  describe('Elements optionnels', () => {
    it('affiche la grille par defaut', () => {
      render(<BarChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    })

    it('masque la grille avec showGrid=false', () => {
      render(
        <BarChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          showGrid={false}
        />
      )

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument()
    })

    it('affiche le tooltip par defaut', () => {
      render(<BarChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('affiche la legende avec showLegend=true', () => {
      render(
        <BarChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          showLegend
        />
      )

      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Etats loading et empty
  // =========================================================================

  describe('Etats loading et empty', () => {
    it('affiche le skeleton en loading', () => {
      render(
        <BarChartWidget data={mockSingleSeriesData} dataKey="value" isLoading />
      )

      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    })

    it('affiche l\'etat vide sans donnees', () => {
      render(<BarChartWidget data={[]} dataKey="value" />)

      expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Accessibilite
  // =========================================================================

  describe('Accessibilite', () => {
    it('applique aria-label par defaut', () => {
      render(<BarChartWidget data={mockSingleSeriesData} dataKey="value" />)

      const chart = screen.getByTestId('bar-chart')
      expect(chart).toHaveAttribute('aria-label', 'Graphique en barres')
    })

    it('applique un titre personnalise comme aria-label', () => {
      render(
        <BarChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          title="Ventes mensuelles"
        />
      )

      const chart = screen.getByTestId('bar-chart')
      expect(chart).toHaveAttribute('aria-label', 'Ventes mensuelles')
    })
  })
})
