/**
 * Tests pour NotificationToast
 *
 * @ticket SP-327
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from 'sonner'

import {
  showNotificationToast,
  showNotificationToastSimple,
} from '@/components/notifications/NotificationToast'

// Mock sonner
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    custom: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

const mockNotification = {
  id: 'notif-1',
  title: 'Test Notification',
  message: 'Test message content',
  type: 'PLANNING' as const,
  priority: 'LOW' as const,
  actionUrl: '/app/dashboard/schedule',
  relatedType: 'Schedule',
  relatedId: 'schedule-1',
  isRead: false,
  readAt: null,
  createdAt: new Date('2026-01-30T10:00:00'),
}

describe('NotificationToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showNotificationToast', () => {
    it('should call toast.custom with notification content', () => {
      showNotificationToast(mockNotification)

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 5000,
          position: 'top-right',
        })
      )
    })

    it('should call toast.custom with onAction callback', () => {
      const onAction = vi.fn()
      showNotificationToast(mockNotification, onAction)

      expect(toast.custom).toHaveBeenCalled()
    })

    it('should work for different notification types', () => {
      const types = ['PLANNING', 'LEAVE', 'INCIDENT', 'REPORT', 'SYSTEM', 'OTHER'] as const

      for (const type of types) {
        vi.clearAllMocks()
        showNotificationToast({ ...mockNotification, type })
        expect(toast.custom).toHaveBeenCalled()
      }
    })

    it('should work for different priorities', () => {
      const priorities = ['HIGH', 'MEDIUM', 'LOW'] as const

      for (const priority of priorities) {
        vi.clearAllMocks()
        showNotificationToast({ ...mockNotification, priority })
        expect(toast.custom).toHaveBeenCalled()
      }
    })
  })

  describe('showNotificationToastSimple', () => {
    it('should call toast with title and message', () => {
      showNotificationToastSimple(mockNotification)

      expect(toast).toHaveBeenCalledWith(
        mockNotification.title,
        expect.objectContaining({
          description: mockNotification.message,
          duration: 5000,
          position: 'top-right',
        })
      )
    })

    it('should include icon based on notification type', () => {
      showNotificationToastSimple(mockNotification)

      expect(toast).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          icon: expect.anything(),
        })
      )
    })
  })
})
