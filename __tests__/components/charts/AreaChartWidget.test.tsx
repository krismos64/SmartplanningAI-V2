/**
 * Tests pour AreaChartWidget
 *
 * Graphique d'aire pour visualiser des tendances temporelles
 * avec support multi-series et gradients.
 *
 * @ticket SP-143
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AreaChartWidget } from '@/components/charts/AreaChartWidget'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import type { ChartDataPoint } from '@/types/charts'

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({
    children,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    'aria-label'?: string
  }) => (
    <div data-testid="area-chart" aria-label={ariaLabel}>
      {children}
    </div>
  ),
  Area: ({
    dataKey,
    stroke,
    fill,
    type,
    name,
  }: {
    dataKey: string
    stroke: string
    fill: string
    type: string
    name: string
  }) => (
    <div
      data-testid={`area-${dataKey}`}
      data-stroke={stroke}
      data-fill={fill}
      data-type={type}
      data-name={name}
    />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-datakey={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
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

describe('AreaChartWidget', () => {
  // =========================================================================
  // Rendu de base
  // =========================================================================

  describe('Rendu de base', () => {
    it('rend le graphique avec une serie simple', () => {
      render(<AreaChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByTestId('area-value')).toBeInTheDocument()
    })

    it('rend les axes X et Y', () => {
      render(<AreaChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })

    it('utilise "name" comme dataKey pour l\'axe X', () => {
      render(<AreaChartWidget data={mockSingleSeriesData} dataKey="value" />)

      const xAxis = screen.getByTestId('x-axis')
      expect(xAxis).toHaveAttribute('data-datakey', 'name')
    })
  })

  // =========================================================================
  // Multi-series
  // =========================================================================

  describe('Multi-series', () => {
    it('rend plusieurs aires avec dataKey tableau', () => {
      render(
        <AreaChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
        />
      )

      expect(screen.getByTestId('area-revenue')).toBeInTheDocument()
      expect(screen.getByTestId('area-expenses')).toBeInTheDocument()
    })

    it('applique les couleurs par defaut pour chaque serie', () => {
      render(
        <AreaChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
        />
      )

      const areaRevenue = screen.getByTestId('area-revenue')
      const areaExpenses = screen.getByTestId('area-expenses')

      expect(areaRevenue).toHaveAttribute(
        'data-stroke',
        CHART_COLORS.primary[0]
      )
      expect(areaExpenses).toHaveAttribute(
        'data-stroke',
        CHART_COLORS.primary[1]
      )
    })

    it('applique des couleurs personnalisees', () => {
      const customColors = ['#ff0000', '#00ff00']
      render(
        <AreaChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
          colors={customColors}
        />
      )

      const areaRevenue = screen.getByTestId('area-revenue')
      const areaExpenses = screen.getByTestId('area-expenses')

      expect(areaRevenue).toHaveAttribute('data-stroke', '#ff0000')
      expect(areaExpenses).toHaveAttribute('data-stroke', '#00ff00')
    })
  })

  // =========================================================================
  // Grille et elements optionnels
  // =========================================================================

  describe('Elements optionnels', () => {
    it('affiche la grille par defaut', () => {
      render(<AreaChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    })

    it('masque la grille avec showGrid=false', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          showGrid={false}
        />
      )

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument()
    })

    it('affiche le tooltip par defaut', () => {
      render(<AreaChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('masque le tooltip avec showTooltip=false', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          showTooltip={false}
        />
      )

      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it("n'affiche pas la legende par defaut", () => {
      render(<AreaChartWidget data={mockSingleSeriesData} dataKey="value" />)

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
    })

    it('affiche la legende avec showLegend=true', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          showLegend
        />
      )

      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Type de courbe
  // =========================================================================

  describe('Type de courbe', () => {
    it('utilise monotone par defaut', () => {
      render(<AreaChartWidget data={mockSingleSeriesData} dataKey="value" />)

      const area = screen.getByTestId('area-value')
      expect(area).toHaveAttribute('data-type', 'monotone')
    })

    it('accepte linear comme type de courbe', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          curveType="linear"
        />
      )

      const area = screen.getByTestId('area-value')
      expect(area).toHaveAttribute('data-type', 'linear')
    })

    it('accepte step comme type de courbe', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          curveType="step"
        />
      )

      const area = screen.getByTestId('area-value')
      expect(area).toHaveAttribute('data-type', 'step')
    })
  })

  // =========================================================================
  // Etats loading et empty
  // =========================================================================

  describe('Etats loading et empty', () => {
    it('affiche le skeleton en loading', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          isLoading
        />
      )

      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })

    it("affiche l'etat vide sans donnees", () => {
      render(<AreaChartWidget data={[]} dataKey="value" />)

      expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })

    it("affiche un message personnalise pour l'etat vide", () => {
      render(
        <AreaChartWidget
          data={[]}
          dataKey="value"
          emptyMessage="Aucune donnee de vente"
        />
      )

      expect(screen.getByText('Aucune donnee de vente')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Accessibilite
  // =========================================================================

  describe('Accessibilite', () => {
    it('applique aria-label par defaut', () => {
      render(<AreaChartWidget data={mockSingleSeriesData} dataKey="value" />)

      const chart = screen.getByTestId('area-chart')
      expect(chart).toHaveAttribute('aria-label', 'Graphique en aire')
    })

    it('applique un titre personnalise comme aria-label', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          title="Evolution du chiffre d'affaires"
        />
      )

      const chart = screen.getByTestId('area-chart')
      expect(chart).toHaveAttribute(
        'aria-label',
        "Evolution du chiffre d'affaires"
      )
    })
  })

  // =========================================================================
  // Props du container
  // =========================================================================

  describe('Props du container', () => {
    it('applique une hauteur personnalisee', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          height={450}
        />
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveStyle({ height: '450px' })
    })

    it('applique des classes CSS personnalisees', () => {
      render(
        <AreaChartWidget
          data={mockSingleSeriesData}
          dataKey="value"
          className="custom-chart"
        />
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveClass('custom-chart')
    })
  })

  // =========================================================================
  // Nommage des series
  // =========================================================================

  describe('Nommage des series', () => {
    it('utilise la dataKey comme nom de serie', () => {
      render(
        <AreaChartWidget
          data={mockMultiSeriesData}
          dataKey={['revenue', 'expenses']}
        />
      )

      const areaRevenue = screen.getByTestId('area-revenue')
      const areaExpenses = screen.getByTestId('area-expenses')

      expect(areaRevenue).toHaveAttribute('data-name', 'revenue')
      expect(areaExpenses).toHaveAttribute('data-name', 'expenses')
    })
  })
})
