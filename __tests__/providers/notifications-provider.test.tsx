/**
 * Tests pour NotificationsProvider
 *
 * @ticket SP-327
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

import {
  NotificationsProvider,
  useNotifications,
} from '@/providers/notifications-provider'

// Note: next-auth/react n'est plus utilisé par le provider

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

// Mock useNotificationsCount
vi.mock('@/hooks/useNotificationsCount', () => ({
  useNotificationsCount: vi.fn(() => ({
    count: 5,
    isLoading: false,
    mutate: vi.fn(),
  })),
}))

// Mock useNotificationsStream
vi.mock('@/hooks/useNotificationsStream', () => ({
  useNotificationsStream: vi.fn(() => ({
    isConnected: true,
    isConnecting: false,
    error: null,
    lastNotification: null,
    reconnect: vi.fn(),
  })),
}))

// Mock toast
vi.mock('@/components/notifications/NotificationToast', () => ({
  showNotificationToast: vi.fn(),
}))

function wrapper({ children }: { children: ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>
}

describe('NotificationsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Provider rendering', () => {
    it('should render children', () => {
      render(
        <NotificationsProvider>
          <div data-testid="child">Child content</div>
        </NotificationsProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('useNotifications hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useNotifications())
      }).toThrow('useNotifications must be used within a NotificationsProvider')

      consoleSpy.mockRestore()
    })

    it('should return context values', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper })

      expect(result.current).toHaveProperty('isConnected')
      expect(result.current).toHaveProperty('isConnecting')
      expect(result.current).toHaveProperty('connectionError')
      expect(result.current).toHaveProperty('lastNotification')
      expect(result.current).toHaveProperty('unreadCount')
      expect(result.current).toHaveProperty('isCountLoading')
      expect(result.current).toHaveProperty('refreshCount')
      expect(result.current).toHaveProperty('reconnect')
    })

    it('should provide unread count from useNotificationsCount', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper })

      expect(result.current.unreadCount).toBe(5)
    })

    it('should provide connection status from useNotificationsStream', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper })

      expect(result.current.isConnected).toBe(true)
      expect(result.current.isConnecting).toBe(false)
    })

    it('should provide reconnect function', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper })

      expect(typeof result.current.reconnect).toBe('function')
    })

    it('should provide refreshCount function', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper })

      expect(typeof result.current.refreshCount).toBe('function')
    })
  })
})
