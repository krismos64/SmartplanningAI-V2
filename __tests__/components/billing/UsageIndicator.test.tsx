/**
 * Tests unitaires pour UsageIndicator
 *
 * @ticket SP-360
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UsageIndicator } from '@/app/app/dashboard/billing/_components/UsageIndicator'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('@/lib/animations', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  fadeSlideUpVariants: {},
  useReducedMotion: () => true,
}))

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Tooltip: ({ children }: React.PropsWithChildren) => <>{children}</>,
  TooltipTrigger: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
  TooltipContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}))

// ============================================================================
// Fixtures
// ============================================================================

const defaultProps = {
  employeeCount: 8,
  quantity: 10,
  pricePerEmployee: 290,
  monthlyAmount: 29,
}

// ============================================================================
// Tests
// ============================================================================

describe('UsageIndicator', () => {
  it('affiche le nombre d\'employés actifs', () => {
    render(<UsageIndicator {...defaultProps} />)
    expect(screen.getByTestId('employee-count')).toHaveTextContent('8')
  })

  it('affiche le nombre de sièges total', () => {
    render(<UsageIndicator {...defaultProps} />)
    expect(screen.getByText(/10 sièges utilisés/)).toBeInTheDocument()
  })

  it('calcule le taux d\'utilisation correct (80%)', () => {
    render(<UsageIndicator {...defaultProps} />)
    expect(screen.getByTestId('usage-percent')).toHaveTextContent('80%')
  })

  it('affiche 100% maximum même si employeeCount > quantity', () => {
    render(
      <UsageIndicator {...defaultProps} employeeCount={12} quantity={10} />
    )
    expect(screen.getByTestId('usage-percent')).toHaveTextContent('100%')
  })

  it('affiche le prix unitaire par employé', () => {
    render(<UsageIndicator {...defaultProps} />)
    expect(screen.getByTestId('price-per-employee')).toHaveTextContent('2,90')
  })

  it('affiche le montant mensuel total', () => {
    render(<UsageIndicator {...defaultProps} />)
    expect(screen.getByTestId('monthly-total')).toHaveTextContent('29,00')
  })

  it('affiche le message prorata', () => {
    render(<UsageIndicator {...defaultProps} />)
    expect(screen.getByTestId('prorata-info')).toHaveTextContent(
      /prorata/i
    )
  })

  it('a le data-testid correct sur le conteneur', () => {
    render(<UsageIndicator {...defaultProps} />)
    expect(screen.getByTestId('usage-indicator')).toBeInTheDocument()
  })
})
