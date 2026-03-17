/**
 * Tests pour NotificationsFilters
 *
 * @ticket SP-324
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock complet du composant Select pour éviter les problèmes avec Radix UI dans JSDOM
vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
  }) => (
    <div data-testid="mock-select">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="select-native"
      >
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({
    children,
    'data-testid': testId,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    'data-testid'?: string
    'aria-label'?: string
    className?: string
  }) => (
    <div data-testid={testId} aria-label={ariaLabel}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string
    children: React.ReactNode
  }) => <option value={value}>{children}</option>,
}))

import { NotificationsFilters } from '@/app/app/tableau-de-bord/notifications/_components/NotificationsFilters'

describe('NotificationsFilters', () => {
  const defaultProps = {
    filters: { type: 'ALL' as const, isRead: 'ALL' as const },
    onTypeChange: vi.fn(),
    onReadChange: vi.fn(),
    onClear: vi.fn(),
    hasActiveFilters: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait afficher les selects de filtre', () => {
    render(<NotificationsFilters {...defaultProps} />)

    expect(screen.getByTestId('filter-type')).toBeInTheDocument()
    expect(screen.getByTestId('filter-status')).toBeInTheDocument()
  })

  it('devrait afficher le bouton reset si filtres actifs', () => {
    render(<NotificationsFilters {...defaultProps} hasActiveFilters={true} />)

    expect(screen.getByTestId('filter-reset')).toBeInTheDocument()
  })

  it('ne devrait pas afficher le bouton reset si pas de filtres actifs', () => {
    render(<NotificationsFilters {...defaultProps} hasActiveFilters={false} />)

    expect(screen.queryByTestId('filter-reset')).not.toBeInTheDocument()
  })

  it('devrait appeler onClear au clic sur reset', async () => {
    const user = userEvent.setup()
    render(<NotificationsFilters {...defaultProps} hasActiveFilters={true} />)

    await user.click(screen.getByTestId('filter-reset'))

    expect(defaultProps.onClear).toHaveBeenCalled()
  })

  it('devrait avoir les bons aria-labels', () => {
    render(<NotificationsFilters {...defaultProps} />)

    expect(screen.getByLabelText('Filtrer par type')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrer par statut')).toBeInTheDocument()
  })

  it('devrait avoir le data-testid notifications-filters', () => {
    render(<NotificationsFilters {...defaultProps} />)

    expect(screen.getByTestId('notifications-filters')).toBeInTheDocument()
  })
})
