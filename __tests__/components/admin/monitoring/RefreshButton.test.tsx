/**
 * Tests unitaires pour RefreshButton
 *
 * Couvre :
 * - Rendu par défaut (label, état enabled)
 * - Clic → état refreshing (label, disabled, animation)
 * - Reset après 800ms
 * - Accessibilité (aria-label dynamique)
 *
 * @ticket SP-471
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// ============================================================================
// Import après mocks
// ============================================================================

import { RefreshButton } from '@/components/admin/monitoring/RefreshButton'

// ============================================================================
// Tests
// ============================================================================

describe('RefreshButton (SP-471)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // 1. Rendu par défaut
  it('affiche "Rafraîchir" et n\'est pas désactivé', () => {
    render(<RefreshButton />)

    const button = screen.getByRole('button', { name: 'Rafraîchir' })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
    expect(button).toHaveTextContent('Rafraîchir')
  })

  // 2. Clic → état refreshing
  it('passe en état refreshing au clic', () => {
    render(<RefreshButton />)

    const button = screen.getByRole('button', { name: 'Rafraîchir' })
    fireEvent.click(button)

    expect(mockRefresh).toHaveBeenCalledOnce()
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Rafraîchissement...')
  })

  // 3. Reset après 800ms
  it('revient à l\'état initial après 800ms', () => {
    render(<RefreshButton />)

    const button = screen.getByRole('button', { name: 'Rafraîchir' })
    fireEvent.click(button)

    expect(button).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(button).not.toBeDisabled()
    expect(button).toHaveTextContent('Rafraîchir')
  })

  // 4. Accessibilité — aria-label dynamique
  it('met à jour aria-label pendant le rafraîchissement', () => {
    render(<RefreshButton />)

    const button = screen.getByRole('button', { name: 'Rafraîchir' })
    expect(button).toHaveAttribute('aria-label', 'Rafraîchir')

    fireEvent.click(button)
    expect(button).toHaveAttribute(
      'aria-label',
      'Rafraîchissement en cours...'
    )

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(button).toHaveAttribute('aria-label', 'Rafraîchir')
  })
})
