/**
 * Tests pour PieChartWidget
 *
 * Graphique circulaire pour repartitions avec support
 * pie/donut, labels et couleurs automatiques.
 *
 * @ticket SP-143
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PieChartWidget } from '@/components/charts/PieChartWidget'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import type { ChartDataPoint } from '@/types/charts'

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({
    children,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    'aria-label'?: string
  }) => (
    <div data-testid="pie-chart" aria-label={ariaLabel}>
      {children}
    </div>
  ),
  Pie: ({
    dataKey,
    nameKey,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    label,
    children,
  }: {
    dataKey: string
    nameKey?: string
    innerRadius?: number
    outerRadius?: number
    startAngle?: number
    endAngle?: number
    label?: boolean | (() => void)
    children?: React.ReactNode
  }) => (
    <div
      data-testid="pie"
      data-datakey={dataKey}
      data-namekey={nameKey}
      data-innerradius={innerRadius}
      data-outerradius={outerRadius}
      data-startangle={startAngle}
      data-endangle={endAngle}
      data-haslabel={label ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" data-fill={fill} />
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

// Donnees de test
const mockData: ChartDataPoint[] = [
  { name: 'A', value: 100 },
  { name: 'B', value: 200 },
  { name: 'C', value: 150 },
  { name: 'D', value: 50 },
]

describe('PieChartWidget', () => {
  // =========================================================================
  // Rendu de base
  // =========================================================================

  describe('Rendu de base', () => {
    it('rend le graphique pie', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie')).toBeInTheDocument()
    })

    it('utilise la dataKey specifiee', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-datakey', 'value')
    })

    it('utilise "name" comme nameKey par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-namekey', 'name')
    })

    it('accepte un nameKey personnalise', () => {
      render(
        <PieChartWidget data={mockData} dataKey="value" nameKey="label" />
      )

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-namekey', 'label')
    })
  })

  // =========================================================================
  // Mode Pie vs Donut
  // =========================================================================

  describe('Mode Pie vs Donut', () => {
    it('utilise innerRadius=0 par defaut (pie)', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-innerradius', '0')
    })

    it('cree un donut avec innerRadius > 0', () => {
      render(
        <PieChartWidget data={mockData} dataKey="value" innerRadius={60} />
      )

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-innerradius', '60')
    })

    it('utilise outerRadius=80 par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-outerradius', '80')
    })

    it('accepte un outerRadius personnalise', () => {
      render(
        <PieChartWidget data={mockData} dataKey="value" outerRadius={100} />
      )

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-outerradius', '100')
    })
  })

  // =========================================================================
  // Angles
  // =========================================================================

  describe('Angles', () => {
    it('utilise startAngle=0 par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-startangle', '0')
    })

    it('utilise endAngle=360 par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-endangle', '360')
    })

    it('accepte des angles personnalises', () => {
      render(
        <PieChartWidget
          data={mockData}
          dataKey="value"
          startAngle={90}
          endAngle={450}
        />
      )

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-startangle', '90')
      expect(pie).toHaveAttribute('data-endangle', '450')
    })
  })

  // =========================================================================
  // Couleurs
  // =========================================================================

  describe('Couleurs', () => {
    it('cree un Cell pour chaque segment', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(mockData.length)
    })

    it('applique les couleurs par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const cells = screen.getAllByTestId('cell')
      cells.forEach((cell, index) => {
        expect(cell).toHaveAttribute('data-fill', CHART_COLORS.primary[index])
      })
    })

    it('applique des couleurs personnalisees', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
      render(
        <PieChartWidget data={mockData} dataKey="value" colors={customColors} />
      )

      const cells = screen.getAllByTestId('cell')
      cells.forEach((cell, index) => {
        expect(cell).toHaveAttribute('data-fill', customColors[index])
      })
    })
  })

  // =========================================================================
  // Labels
  // =========================================================================

  describe('Labels', () => {
    it('n\'affiche pas les labels par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-haslabel', 'false')
    })

    it('affiche les labels avec showLabels=true', () => {
      render(<PieChartWidget data={mockData} dataKey="value" showLabels />)

      const pie = screen.getByTestId('pie')
      expect(pie).toHaveAttribute('data-haslabel', 'true')
    })
  })

  // =========================================================================
  // Elements optionnels
  // =========================================================================

  describe('Elements optionnels', () => {
    it('affiche le tooltip par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('masque le tooltip avec showTooltip=false', () => {
      render(
        <PieChartWidget data={mockData} dataKey="value" showTooltip={false} />
      )

      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('n\'affiche pas la legende par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
    })

    it('affiche la legende avec showLegend=true', () => {
      render(<PieChartWidget data={mockData} dataKey="value" showLegend />)

      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Etats loading et empty
  // =========================================================================

  describe('Etats loading et empty', () => {
    it('affiche le skeleton en loading', () => {
      render(<PieChartWidget data={mockData} dataKey="value" isLoading />)

      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    })

    it('affiche l\'etat vide sans donnees', () => {
      render(<PieChartWidget data={[]} dataKey="value" />)

      expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
    })

    it('affiche un message personnalise pour l\'etat vide', () => {
      render(
        <PieChartWidget
          data={[]}
          dataKey="value"
          emptyMessage="Aucune repartition"
        />
      )

      expect(screen.getByText('Aucune repartition')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Accessibilite
  // =========================================================================

  describe('Accessibilite', () => {
    it('applique aria-label par defaut', () => {
      render(<PieChartWidget data={mockData} dataKey="value" />)

      const chart = screen.getByTestId('pie-chart')
      expect(chart).toHaveAttribute('aria-label', 'Graphique circulaire')
    })

    it('applique un titre personnalise comme aria-label', () => {
      render(
        <PieChartWidget
          data={mockData}
          dataKey="value"
          title="Repartition des ventes"
        />
      )

      const chart = screen.getByTestId('pie-chart')
      expect(chart).toHaveAttribute('aria-label', 'Repartition des ventes')
    })
  })

  // =========================================================================
  // Props du container
  // =========================================================================

  describe('Props du container', () => {
    it('applique une hauteur personnalisee', () => {
      render(<PieChartWidget data={mockData} dataKey="value" height={400} />)

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveStyle({ height: '400px' })
    })

    it('applique des classes CSS personnalisees', () => {
      render(
        <PieChartWidget data={mockData} dataKey="value" className="custom-pie" />
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveClass('custom-pie')
    })
  })
})
