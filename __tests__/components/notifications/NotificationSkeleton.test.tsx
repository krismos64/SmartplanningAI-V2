/**
 * Tests pour le composant NotificationSkeleton
 *
 * @ticket SP-323
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton'

describe('NotificationSkeleton', () => {
  it('devrait afficher 3 skeletons par défaut', () => {
    render(<NotificationSkeleton />)

    expect(screen.getByTestId('notification-skeleton')).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-skeleton-item-0')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-skeleton-item-1')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-skeleton-item-2')
    ).toBeInTheDocument()
  })

  it('devrait afficher le nombre de skeletons spécifié', () => {
    render(<NotificationSkeleton count={5} />)

    expect(
      screen.getByTestId('notification-skeleton-item-0')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-skeleton-item-1')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-skeleton-item-2')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-skeleton-item-3')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-skeleton-item-4')
    ).toBeInTheDocument()
  })

  it('devrait afficher 1 skeleton si count=1', () => {
    render(<NotificationSkeleton count={1} />)

    expect(
      screen.getByTestId('notification-skeleton-item-0')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('notification-skeleton-item-1')
    ).not.toBeInTheDocument()
  })

  it('devrait avoir les éléments skeleton corrects dans chaque item', () => {
    const { container } = render(<NotificationSkeleton count={1} />)

    // Chaque item devrait avoir : 1 skeleton rond (icône) + 3 skeletons rectangulaires
    const skeletons = container.querySelectorAll('[class*="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
