/**
 * Tests unitaires pour NotificationsPageContent
 *
 * @ticket SP-275
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationsPageContent } from '../NotificationsPageContent'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/preferences'

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/hooks', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

// Mock with inline values (cannot use imports or external variables in vi.mock factory due to hoisting)
vi.mock('@/lib/actions/notification-preferences', () => ({
  updateNotificationPreferences: vi.fn().mockResolvedValue({
    success: true,
    data: {
      email: { planning: true, leaves: true, tasks: true, system: true },
      inApp: { planning: true, leaves: true, tasks: true, system: true },
    },
  }),
  resetNotificationPreferences: vi.fn().mockResolvedValue({
    success: true,
    data: {
      email: { planning: true, leaves: true, tasks: true, system: true },
      inApp: { planning: true, leaves: true, tasks: true, system: true },
    },
  }),
}))

import {
  updateNotificationPreferences,
  resetNotificationPreferences,
} from '@/lib/actions/notification-preferences'

describe('NotificationsPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with data-testid', () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )
    expect(screen.getByTestId('notifications-page')).toBeInTheDocument()
  })

  it('should display header with title', () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('should display header with description', () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )
    expect(
      screen.getByText(/Configurez vos préférences de notifications/)
    ).toBeInTheDocument()
  })

  it('should display back button', () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )
    expect(
      screen.getByRole('link', { name: /Retour aux paramètres/ })
    ).toBeInTheDocument()
  })

  it('should display all 4 categories', () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )
    expect(
      screen.getByTestId('notification-category-planning')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-category-leaves')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-category-tasks')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('notification-category-system')
    ).toBeInTheDocument()
  })

  it('should display reset button', () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )
    expect(screen.getByTestId('reset-button')).toBeInTheDocument()
    expect(screen.getByText('Réinitialiser par défaut')).toBeInTheDocument()
  })

  it('should reflect initial preferences in switches', () => {
    const prefs = {
      email: { planning: false, leaves: true, tasks: true, system: true },
      inApp: { planning: true, leaves: false, tasks: true, system: true },
    }
    render(<NotificationsPageContent initialPreferences={prefs} />)

    const emailPlanning = screen.getByTestId('notification-email-planning')
    const inAppLeaves = screen.getByTestId('notification-inapp-leaves')

    expect(emailPlanning).toHaveAttribute('data-state', 'unchecked')
    expect(inAppLeaves).toHaveAttribute('data-state', 'unchecked')
  })

  it('should call updateNotificationPreferences when toggling email', async () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )

    const emailPlanning = screen.getByTestId('notification-email-planning')
    fireEvent.click(emailPlanning)

    await waitFor(() => {
      expect(updateNotificationPreferences).toHaveBeenCalledWith({
        email: { planning: false },
      })
    })
  })

  it('should call updateNotificationPreferences when toggling inApp', async () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )

    const inAppLeaves = screen.getByTestId('notification-inapp-leaves')
    fireEvent.click(inAppLeaves)

    await waitFor(() => {
      expect(updateNotificationPreferences).toHaveBeenCalledWith({
        inApp: { leaves: false },
      })
    })
  })

  it('should call resetNotificationPreferences when clicking reset', async () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )

    const resetButton = screen.getByTestId('reset-button')
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(resetNotificationPreferences).toHaveBeenCalled()
    })
  })

  it('should optimistically update switch state', async () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )

    const emailPlanning = screen.getByTestId('notification-email-planning')

    // Initially checked
    expect(emailPlanning).toHaveAttribute('data-state', 'checked')

    // Click to toggle
    fireEvent.click(emailPlanning)

    // Should optimistically update
    await waitFor(() => {
      expect(emailPlanning).toHaveAttribute('data-state', 'unchecked')
    })
  })

  it('should have back link pointing to settings', () => {
    render(
      <NotificationsPageContent
        initialPreferences={DEFAULT_NOTIFICATION_PREFERENCES}
      />
    )

    const backLink = screen.getByRole('link', { name: /Retour aux paramètres/ })
    expect(backLink).toHaveAttribute('href', '/app/settings')
  })
})
