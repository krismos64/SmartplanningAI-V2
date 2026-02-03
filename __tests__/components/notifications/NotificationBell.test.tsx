/**
 * Tests unitaires pour NotificationBell
 *
 * @ticket SP-322
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock du hook useNotificationsCount
const mockMutate = vi.fn()
vi.mock('@/hooks/useNotificationsCount', () => ({
  useNotificationsCount: vi.fn(),
}))

// Mock de framer-motion pour simplifier les tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock de next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

import { useNotificationsCount } from '@/hooks/useNotificationsCount'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const mockUseNotificationsCount = vi.mocked(useNotificationsCount)

describe('NotificationBell - SP-322', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNotificationsCount.mockReturnValue({
      count: 0,
      isLoading: false,
      isValidating: false,
      isError: false,
      error: undefined,
      mutate: mockMutate,
    })
  })

  describe('Rendu de base', () => {
    it('affiche l\'icône cloche', () => {
      render(<NotificationBell />)

      const button = screen.getByTestId('notification-bell-button')
      expect(button).toBeInTheDocument()
    })

    it('a aria-label="Notifications" sur le bouton', () => {
      render(<NotificationBell />)

      const button = screen.getByTestId('notification-bell-button')
      expect(button).toHaveAttribute('aria-label', 'Notifications')
    })
  })

  describe('Badge compteur', () => {
    it('affiche le badge quand count > 0', () => {
      mockUseNotificationsCount.mockReturnValue({
        count: 5,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      const badge = screen.getByTestId('notification-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('5')
    })

    it('masque le badge quand count === 0', () => {
      mockUseNotificationsCount.mockReturnValue({
        count: 0,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument()
    })

    it('affiche "9+" quand count > 9', () => {
      mockUseNotificationsCount.mockReturnValue({
        count: 15,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveTextContent('9+')
    })

    it('affiche le compteur exact (ex: 7)', () => {
      mockUseNotificationsCount.mockReturnValue({
        count: 7,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveTextContent('7')
    })

    it('badge a aria-live="polite"', () => {
      mockUseNotificationsCount.mockReturnValue({
        count: 3,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('État de chargement', () => {
    it('affiche skeleton pendant loading', () => {
      mockUseNotificationsCount.mockReturnValue({
        count: 0,
        isLoading: true,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      expect(screen.getByTestId('notification-loading')).toBeInTheDocument()
    })

    it('masque skeleton quand loading terminé', () => {
      mockUseNotificationsCount.mockReturnValue({
        count: 5,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      expect(screen.queryByTestId('notification-loading')).not.toBeInTheDocument()
    })
  })

  describe('Dropdown', () => {
    it('ouvre le dropdown au clic', async () => {
      const user = userEvent.setup()
      render(<NotificationBell />)

      const button = screen.getByTestId('notification-bell-button')
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument()
      })
    })

    it('affiche le header "Notifications"', async () => {
      const user = userEvent.setup()
      render(<NotificationBell />)

      await user.click(screen.getByTestId('notification-bell-button'))

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument()
      })
    })

    it('contient le lien "Voir toutes les notifications"', async () => {
      const user = userEvent.setup()
      render(<NotificationBell />)

      await user.click(screen.getByTestId('notification-bell-button'))

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /voir toutes les notifications/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/app/dashboard/notifications')
      })
    })

    it('affiche "Aucune notification" quand count = 0', async () => {
      const user = userEvent.setup()
      mockUseNotificationsCount.mockReturnValue({
        count: 0,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      await user.click(screen.getByTestId('notification-bell-button'))

      await waitFor(() => {
        expect(screen.getByText('Aucune notification')).toBeInTheDocument()
      })
    })

    it('affiche le compteur de notifications dans le dropdown', async () => {
      const user = userEvent.setup()
      mockUseNotificationsCount.mockReturnValue({
        count: 5,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      await user.click(screen.getByTestId('notification-bell-button'))

      await waitFor(() => {
        expect(screen.getByText('5 non lues')).toBeInTheDocument()
      })
    })

    it('affiche "1 non lue" au singulier', async () => {
      const user = userEvent.setup()
      mockUseNotificationsCount.mockReturnValue({
        count: 1,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      await user.click(screen.getByTestId('notification-bell-button'))

      await waitFor(() => {
        expect(screen.getByText('1 non lue')).toBeInTheDocument()
      })
    })
  })

  describe('Gestion des erreurs', () => {
    it('affiche message d\'erreur dans le dropdown', async () => {
      const user = userEvent.setup()
      mockUseNotificationsCount.mockReturnValue({
        count: 0,
        isLoading: false,
        isValidating: false,
        isError: true,
        error: 'Erreur de connexion',
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      await user.click(screen.getByTestId('notification-bell-button'))

      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement')).toBeInTheDocument()
      })
    })
  })

  describe('Animations', () => {
    it('badge a la classe animate-pulse quand count > 0', () => {
      mockUseNotificationsCount.mockReturnValue({
        count: 3,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        mutate: mockMutate,
      })

      render(<NotificationBell />)

      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveClass('animate-pulse')
    })
  })
})
