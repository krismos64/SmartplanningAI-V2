/**
 * Tests pour ChartContainer
 *
 * Wrapper responsive pour les charts Recharts avec gestion des etats
 * loading et empty.
 *
 * @ticket SP-143
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CHART_HEIGHTS } from '@/components/charts/chartTheme'

// Mock simple pour ResponsiveContainer
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

describe('ChartContainer', () => {
  // =========================================================================
  // Rendu de base
  // =========================================================================

  describe('Rendu de base', () => {
    it('rend les children dans ResponsiveContainer', () => {
      render(
        <ChartContainer>
          <div data-testid="chart-child">Chart content</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('chart-child')).toBeInTheDocument()
    })

    it('applique la hauteur par defaut (300px)', () => {
      render(
        <ChartContainer>
          <div>Chart</div>
        </ChartContainer>
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveStyle({ height: `${CHART_HEIGHTS.md}px` })
    })

    it('applique le role img et aria-label pour accessibilite', () => {
      render(
        <ChartContainer>
          <div>Chart</div>
        </ChartContainer>
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveAttribute('role', 'img')
      expect(container).toHaveAttribute('aria-label', 'Graphique')
    })
  })

  // =========================================================================
  // Hauteur personnalisee
  // =========================================================================

  describe('Hauteur personnalisee', () => {
    it('applique une hauteur custom', () => {
      render(
        <ChartContainer height={500}>
          <div>Chart</div>
        </ChartContainer>
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveStyle({ height: '500px' })
    })

    it('accepte les hauteurs predefinies sm', () => {
      render(
        <ChartContainer height={CHART_HEIGHTS.sm}>
          <div>Chart</div>
        </ChartContainer>
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveStyle({ height: `${CHART_HEIGHTS.sm}px` })
    })

    it('accepte les hauteurs predefinies lg', () => {
      render(
        <ChartContainer height={CHART_HEIGHTS.lg}>
          <div>Chart</div>
        </ChartContainer>
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveStyle({ height: `${CHART_HEIGHTS.lg}px` })
    })
  })

  // =========================================================================
  // Etat de chargement
  // =========================================================================

  describe('Etat loading', () => {
    it('affiche le skeleton quand isLoading=true', () => {
      render(
        <ChartContainer isLoading>
          <div data-testid="chart-child">Chart</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
      expect(screen.queryByTestId('chart-child')).not.toBeInTheDocument()
      expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument()
    })

    it('applique role status et aria-busy pour accessibilite loading', () => {
      render(
        <ChartContainer isLoading>
          <div>Chart</div>
        </ChartContainer>
      )

      const loading = screen.getByTestId('chart-loading')
      expect(loading).toHaveAttribute('role', 'status')
      expect(loading).toHaveAttribute('aria-busy', 'true')
      expect(loading).toHaveAttribute('aria-label', 'Chargement du graphique')
    })

    it('applique la hauteur au skeleton', () => {
      render(
        <ChartContainer isLoading height={400}>
          <div>Chart</div>
        </ChartContainer>
      )

      const loading = screen.getByTestId('chart-loading')
      expect(loading).toHaveStyle({ height: '400px' })
    })
  })

  // =========================================================================
  // Etat vide
  // =========================================================================

  describe('Etat empty', () => {
    it('affiche le message vide quand isEmpty=true', () => {
      render(
        <ChartContainer isEmpty>
          <div data-testid="chart-child">Chart</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
      expect(screen.getByText('Aucune donnee disponible')).toBeInTheDocument()
      expect(screen.queryByTestId('chart-child')).not.toBeInTheDocument()
    })

    it('affiche un message personnalise', () => {
      render(
        <ChartContainer isEmpty emptyMessage="Pas de resultats">
          <div>Chart</div>
        </ChartContainer>
      )

      expect(screen.getByText('Pas de resultats')).toBeInTheDocument()
    })

    it('applique role status et aria-label pour accessibilite empty', () => {
      const customMessage = 'Donnees indisponibles'
      render(
        <ChartContainer isEmpty emptyMessage={customMessage}>
          <div>Chart</div>
        </ChartContainer>
      )

      const empty = screen.getByTestId('chart-empty')
      expect(empty).toHaveAttribute('role', 'status')
      expect(empty).toHaveAttribute('aria-label', customMessage)
    })

    it("applique la hauteur a l'etat vide", () => {
      render(
        <ChartContainer isEmpty height={350}>
          <div>Chart</div>
        </ChartContainer>
      )

      const empty = screen.getByTestId('chart-empty')
      expect(empty).toHaveStyle({ height: '350px' })
    })
  })

  // =========================================================================
  // Classes CSS personnalisees
  // =========================================================================

  describe('Classes CSS', () => {
    it('applique les classes personnalisees au container', () => {
      render(
        <ChartContainer className="custom-class another-class">
          <div>Chart</div>
        </ChartContainer>
      )

      const container = screen.getByTestId('chart-container')
      expect(container).toHaveClass('custom-class')
      expect(container).toHaveClass('another-class')
    })

    it('applique les classes au loading state', () => {
      render(
        <ChartContainer isLoading className="loading-custom">
          <div>Chart</div>
        </ChartContainer>
      )

      const loading = screen.getByTestId('chart-loading')
      expect(loading).toHaveClass('loading-custom')
    })

    it('applique les classes au empty state', () => {
      render(
        <ChartContainer isEmpty className="empty-custom">
          <div>Chart</div>
        </ChartContainer>
      )

      const empty = screen.getByTestId('chart-empty')
      expect(empty).toHaveClass('empty-custom')
    })
  })

  // =========================================================================
  // Priorite des etats
  // =========================================================================

  describe('Priorite des etats', () => {
    it('loading a priorite sur empty', () => {
      render(
        <ChartContainer isLoading isEmpty>
          <div>Chart</div>
        </ChartContainer>
      )

      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
      expect(screen.queryByTestId('chart-empty')).not.toBeInTheDocument()
    })
  })
})
