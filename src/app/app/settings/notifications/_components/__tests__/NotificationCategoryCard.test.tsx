/**
 * Tests unitaires pour NotificationCategoryCard
 *
 * @ticket SP-275
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationCategoryCard } from '../NotificationCategoryCard'

describe('NotificationCategoryCard', () => {
  const defaultProps = {
    category: 'planning' as const,
    emailEnabled: true,
    inAppEnabled: true,
    onEmailChange: vi.fn(),
    onInAppChange: vi.fn(),
  }

  it('should render with correct data-testid', () => {
    render(<NotificationCategoryCard {...defaultProps} />)
    expect(
      screen.getByTestId('notification-category-planning')
    ).toBeInTheDocument()
  })

  it('should display category label', () => {
    render(<NotificationCategoryCard {...defaultProps} />)
    expect(screen.getByText('Plannings')).toBeInTheDocument()
  })

  it('should display category description', () => {
    render(<NotificationCategoryCard {...defaultProps} />)
    expect(screen.getByText(/Créneaux assignés/)).toBeInTheDocument()
  })

  it('should render email switch with correct data-testid', () => {
    render(<NotificationCategoryCard {...defaultProps} />)
    expect(
      screen.getByTestId('notification-email-planning')
    ).toBeInTheDocument()
  })

  it('should render inApp switch with correct data-testid', () => {
    render(<NotificationCategoryCard {...defaultProps} />)
    expect(
      screen.getByTestId('notification-inapp-planning')
    ).toBeInTheDocument()
  })

  it('should reflect emailEnabled=true state', () => {
    render(<NotificationCategoryCard {...defaultProps} emailEnabled={true} />)
    expect(screen.getByTestId('notification-email-planning')).toHaveAttribute(
      'data-state',
      'checked'
    )
  })

  it('should reflect emailEnabled=false state', () => {
    render(<NotificationCategoryCard {...defaultProps} emailEnabled={false} />)
    expect(screen.getByTestId('notification-email-planning')).toHaveAttribute(
      'data-state',
      'unchecked'
    )
  })

  it('should reflect inAppEnabled=true state', () => {
    render(<NotificationCategoryCard {...defaultProps} inAppEnabled={true} />)
    expect(screen.getByTestId('notification-inapp-planning')).toHaveAttribute(
      'data-state',
      'checked'
    )
  })

  it('should reflect inAppEnabled=false state', () => {
    render(<NotificationCategoryCard {...defaultProps} inAppEnabled={false} />)
    expect(screen.getByTestId('notification-inapp-planning')).toHaveAttribute(
      'data-state',
      'unchecked'
    )
  })

  it('should call onEmailChange when email switch is toggled', () => {
    const onEmailChange = vi.fn()
    render(
      <NotificationCategoryCard
        {...defaultProps}
        onEmailChange={onEmailChange}
      />
    )

    fireEvent.click(screen.getByTestId('notification-email-planning'))
    expect(onEmailChange).toHaveBeenCalledWith(false)
  })

  it('should call onInAppChange when inApp switch is toggled', () => {
    const onInAppChange = vi.fn()
    render(
      <NotificationCategoryCard
        {...defaultProps}
        onInAppChange={onInAppChange}
      />
    )

    fireEvent.click(screen.getByTestId('notification-inapp-planning'))
    expect(onInAppChange).toHaveBeenCalledWith(false)
  })

  it('should disable switches when disabled prop is true', () => {
    render(<NotificationCategoryCard {...defaultProps} disabled={true} />)

    expect(screen.getByTestId('notification-email-planning')).toBeDisabled()
    expect(screen.getByTestId('notification-inapp-planning')).toBeDisabled()
  })

  it('should have accessible aria-labels on switches', () => {
    render(<NotificationCategoryCard {...defaultProps} />)

    const emailSwitch = screen.getByTestId('notification-email-planning')
    const inAppSwitch = screen.getByTestId('notification-inapp-planning')

    expect(emailSwitch).toHaveAttribute(
      'aria-label',
      expect.stringContaining('email')
    )
    expect(inAppSwitch).toHaveAttribute(
      'aria-label',
      expect.stringContaining('in-app')
    )
  })

  it('should render leaves category correctly', () => {
    render(<NotificationCategoryCard {...defaultProps} category="leaves" />)

    expect(
      screen.getByTestId('notification-category-leaves')
    ).toBeInTheDocument()
    expect(screen.getByText('Congés')).toBeInTheDocument()
  })

  it('should render tasks category correctly', () => {
    render(<NotificationCategoryCard {...defaultProps} category="tasks" />)

    expect(
      screen.getByTestId('notification-category-tasks')
    ).toBeInTheDocument()
    expect(screen.getByText('Tâches')).toBeInTheDocument()
  })

  it('should render system category correctly', () => {
    render(<NotificationCategoryCard {...defaultProps} category="system" />)

    expect(
      screen.getByTestId('notification-category-system')
    ).toBeInTheDocument()
    expect(screen.getByText('Système')).toBeInTheDocument()
  })
})
