/**
 * Tests pour le hook useNotificationsStream
 *
 * @ticket SP-327
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

import { useNotificationsStream } from '@/hooks/use-notifications-stream'

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = []

  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  readyState: number = 0

  constructor(public url: string) {
    MockEventSource.instances.push(this)
  }

  close() {
    this.readyState = 2
  }

  simulateOpen() {
    this.readyState = 1
    if (this.onopen) {
      this.onopen(new Event('open'))
    }
  }

  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(
        new MessageEvent('message', { data: JSON.stringify(data) })
      )
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

// Setup global EventSource mock
const originalEventSource = global.EventSource
beforeEach(() => {
  MockEventSource.instances = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.EventSource = MockEventSource as any
})

afterEach(() => {
  global.EventSource = originalEventSource
  vi.clearAllMocks()
})

const mockNotification = {
  id: 'notif-1',
  title: 'Test Notification',
  message: 'Test message',
  type: 'PLANNING' as const,
  priority: 'LOW' as const,
  actionUrl: '/app/tableau-de-bord',
  relatedType: 'Schedule',
  relatedId: 'schedule-1',
  isRead: false,
  readAt: null,
  createdAt: new Date('2026-01-30T10:00:00'),
}

describe('useNotificationsStream', () => {
  describe('Connection', () => {
    it('should not connect when disabled', () => {
      renderHook(() => useNotificationsStream({ enabled: false }))

      expect(MockEventSource.instances).toHaveLength(0)
    })

    it('should connect when enabled', () => {
      renderHook(() => useNotificationsStream({ enabled: true }))

      expect(MockEventSource.instances).toHaveLength(1)
      expect(MockEventSource.instances[0].url).toBe('/api/notifications/stream')
    })

    it('should be connecting initially', () => {
      const { result } = renderHook(() =>
        useNotificationsStream({ enabled: true })
      )

      expect(result.current.isConnecting).toBe(true)
      expect(result.current.isConnected).toBe(false)
    })

    it('should update isConnected when connection opens', async () => {
      const { result } = renderHook(() =>
        useNotificationsStream({ enabled: true })
      )

      act(() => {
        MockEventSource.instances[0].simulateOpen()
      })

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
        expect(result.current.isConnecting).toBe(false)
      })
    })
  })

  describe('Messages', () => {
    it('should handle notification messages', async () => {
      const onNotification = vi.fn()
      const { result } = renderHook(() =>
        useNotificationsStream({ enabled: true, onNotification })
      )

      act(() => {
        MockEventSource.instances[0].simulateOpen()
      })

      act(() => {
        MockEventSource.instances[0].simulateMessage({
          type: 'notification',
          data: mockNotification,
        })
      })

      await waitFor(() => {
        expect(onNotification).toHaveBeenCalled()
        expect(result.current.lastNotification?.id).toBe(mockNotification.id)
        expect(result.current.lastNotification?.title).toBe(
          mockNotification.title
        )
      })
    })

    it('should ignore ping messages', async () => {
      const onNotification = vi.fn()
      renderHook(() =>
        useNotificationsStream({ enabled: true, onNotification })
      )

      act(() => {
        MockEventSource.instances[0].simulateOpen()
      })

      act(() => {
        MockEventSource.instances[0].simulateMessage({
          type: 'ping',
          timestamp: Date.now(),
        })
      })

      expect(onNotification).not.toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('should set error on connection failure', async () => {
      const { result } = renderHook(() =>
        useNotificationsStream({ enabled: true })
      )

      act(() => {
        MockEventSource.instances[0].simulateError()
      })

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false)
        expect(result.current.error).toBeTruthy()
      })
    })

    it('should increment reconnectCount on error', async () => {
      const { result } = renderHook(() =>
        useNotificationsStream({ enabled: true })
      )

      act(() => {
        MockEventSource.instances[0].simulateError()
      })

      // Just check reconnectCount is incremented
      expect(result.current.reconnectCount).toBe(1)
    })
  })

  describe('Reconnection', () => {
    it('should provide reconnect function', () => {
      const { result } = renderHook(() =>
        useNotificationsStream({ enabled: true })
      )

      expect(typeof result.current.reconnect).toBe('function')
    })

    it('should close connection when disabled', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useNotificationsStream({ enabled }),
        { initialProps: { enabled: true } }
      )

      act(() => {
        MockEventSource.instances[0].simulateOpen()
      })

      expect(result.current.isConnected).toBe(true)

      // Disable
      rerender({ enabled: false })

      // Should be disconnected
      expect(result.current.isConnected).toBe(false)
    })
  })

  describe('Default state', () => {
    it('should have correct default values', () => {
      const { result } = renderHook(() =>
        useNotificationsStream({ enabled: false })
      )

      expect(result.current.isConnected).toBe(false)
      expect(result.current.isConnecting).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastNotification).toBeNull()
      expect(result.current.reconnectCount).toBe(0)
    })
  })
})
