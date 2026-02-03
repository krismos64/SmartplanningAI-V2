/**
 * Tests unitaires pour les types de notification
 *
 * SP-321 : Enrichissement du modèle Notification
 *
 * @see src/types/notification.ts
 */

import { describe, it, expect } from 'vitest'
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_PRIORITY_ICONS,
  NOTIFICATION_TYPE_TO_RELATED_TYPE,
  notificationTypeOptions,
  notificationPriorityOptions,
} from '@/types/notification'
import type {
  NotificationType,
  NotificationPriority,
  CreateNotificationInput,
  NotificationFilters,
} from '@/types/notification'

describe('Notification Types - SP-321', () => {
  describe('NotificationType enum values', () => {
    it('should have all expected notification types', () => {
      const expectedTypes: NotificationType[] = [
        'INFO',
        'SUCCESS',
        'WARNING',
        'ERROR',
        'SYSTEM',
        'PLANNING',
        'LEAVE',
        'TASK',
        'INCIDENT',
      ]

      expectedTypes.forEach((type) => {
        expect(NOTIFICATION_TYPE_LABELS[type]).toBeDefined()
      })
    })

    it('should have French labels for all types', () => {
      expect(NOTIFICATION_TYPE_LABELS.INFO).toBe('Information')
      expect(NOTIFICATION_TYPE_LABELS.SUCCESS).toBe('Succès')
      expect(NOTIFICATION_TYPE_LABELS.WARNING).toBe('Avertissement')
      expect(NOTIFICATION_TYPE_LABELS.ERROR).toBe('Erreur')
      expect(NOTIFICATION_TYPE_LABELS.SYSTEM).toBe('Système')
      expect(NOTIFICATION_TYPE_LABELS.PLANNING).toBe('Planning')
      expect(NOTIFICATION_TYPE_LABELS.LEAVE).toBe('Congés')
      expect(NOTIFICATION_TYPE_LABELS.TASK).toBe('Tâche')
      expect(NOTIFICATION_TYPE_LABELS.INCIDENT).toBe('Incident')
    })
  })

  describe('NotificationPriority enum values', () => {
    it('should have all expected priority levels', () => {
      const expectedPriorities: NotificationPriority[] = [
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT',
      ]

      expectedPriorities.forEach((priority) => {
        expect(NOTIFICATION_PRIORITY_LABELS[priority]).toBeDefined()
      })
    })

    it('should have French labels for all priorities', () => {
      expect(NOTIFICATION_PRIORITY_LABELS.LOW).toBe('Basse')
      expect(NOTIFICATION_PRIORITY_LABELS.MEDIUM).toBe('Moyenne')
      expect(NOTIFICATION_PRIORITY_LABELS.HIGH).toBe('Haute')
      expect(NOTIFICATION_PRIORITY_LABELS.URGENT).toBe('Urgente')
    })
  })

  describe('NOTIFICATION_TYPE_COLORS', () => {
    it('should have colors for all notification types', () => {
      const types: NotificationType[] = [
        'INFO',
        'SUCCESS',
        'WARNING',
        'ERROR',
        'SYSTEM',
        'PLANNING',
        'LEAVE',
        'TASK',
        'INCIDENT',
      ]

      types.forEach((type) => {
        const colors = NOTIFICATION_TYPE_COLORS[type]
        expect(colors).toBeDefined()
        expect(colors.bg).toBeDefined()
        expect(colors.text).toBeDefined()
        expect(colors.border).toBeDefined()
        expect(colors.icon).toBeDefined()
      })
    })

    it('should have proper Tailwind classes format', () => {
      // Vérifier que les classes commencent par les préfixes attendus
      expect(NOTIFICATION_TYPE_COLORS.INFO.bg).toMatch(/^bg-/)
      expect(NOTIFICATION_TYPE_COLORS.INFO.text).toMatch(/^text-/)
      expect(NOTIFICATION_TYPE_COLORS.INFO.border).toMatch(/^border-/)
      expect(NOTIFICATION_TYPE_COLORS.INFO.icon).toMatch(/^text-/)
    })

    it('should have distinct colors for business types', () => {
      // Vérifier que les types métier ont des couleurs distinctes
      expect(NOTIFICATION_TYPE_COLORS.PLANNING.bg).not.toBe(
        NOTIFICATION_TYPE_COLORS.LEAVE.bg
      )
      expect(NOTIFICATION_TYPE_COLORS.TASK.bg).not.toBe(
        NOTIFICATION_TYPE_COLORS.INCIDENT.bg
      )
    })
  })

  describe('NOTIFICATION_PRIORITY_COLORS', () => {
    it('should have colors for all priorities', () => {
      const priorities: NotificationPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

      priorities.forEach((priority) => {
        const colors = NOTIFICATION_PRIORITY_COLORS[priority]
        expect(colors).toBeDefined()
        expect(colors.bg).toBeDefined()
        expect(colors.text).toBeDefined()
        expect(colors.border).toBeDefined()
        expect(colors.badge).toBeDefined()
      })
    })

    it('should have distinct badge colors for each priority', () => {
      expect(NOTIFICATION_PRIORITY_COLORS.LOW.badge).not.toBe(
        NOTIFICATION_PRIORITY_COLORS.MEDIUM.badge
      )
      expect(NOTIFICATION_PRIORITY_COLORS.HIGH.badge).not.toBe(
        NOTIFICATION_PRIORITY_COLORS.URGENT.badge
      )
    })
  })

  describe('NOTIFICATION_TYPE_ICONS', () => {
    it('should have icons for all notification types', () => {
      const types: NotificationType[] = [
        'INFO',
        'SUCCESS',
        'WARNING',
        'ERROR',
        'SYSTEM',
        'PLANNING',
        'LEAVE',
        'TASK',
        'INCIDENT',
      ]

      types.forEach((type) => {
        expect(NOTIFICATION_TYPE_ICONS[type]).toBeDefined()
        expect(typeof NOTIFICATION_TYPE_ICONS[type]).toBe('string')
        expect(NOTIFICATION_TYPE_ICONS[type].length).toBeGreaterThan(0)
      })
    })

    it('should have expected icon names', () => {
      expect(NOTIFICATION_TYPE_ICONS.PLANNING).toBe('Calendar')
      expect(NOTIFICATION_TYPE_ICONS.LEAVE).toBe('Palmtree')
      expect(NOTIFICATION_TYPE_ICONS.TASK).toBe('ListTodo')
      expect(NOTIFICATION_TYPE_ICONS.INCIDENT).toBe('AlertOctagon')
    })
  })

  describe('NOTIFICATION_PRIORITY_ICONS', () => {
    it('should have icons for all priorities', () => {
      const priorities: NotificationPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

      priorities.forEach((priority) => {
        expect(NOTIFICATION_PRIORITY_ICONS[priority]).toBeDefined()
        expect(typeof NOTIFICATION_PRIORITY_ICONS[priority]).toBe('string')
      })
    })
  })

  describe('NOTIFICATION_TYPE_TO_RELATED_TYPE mapping', () => {
    it('should map business types to related types correctly', () => {
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.PLANNING).toBe('Schedule')
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.LEAVE).toBe('LeaveRequest')
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.TASK).toBe('PersonalTask')
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.INCIDENT).toBe('IncidentNote')
    })

    it('should not have mappings for generic types', () => {
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.INFO).toBeUndefined()
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.SUCCESS).toBeUndefined()
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.WARNING).toBeUndefined()
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.ERROR).toBeUndefined()
      expect(NOTIFICATION_TYPE_TO_RELATED_TYPE.SYSTEM).toBeUndefined()
    })
  })

  describe('notificationTypeOptions', () => {
    it('should have options for all notification types', () => {
      expect(notificationTypeOptions.length).toBe(9)
    })

    it('should have correct structure', () => {
      notificationTypeOptions.forEach((option) => {
        expect(option.value).toBeDefined()
        expect(option.label).toBeDefined()
        expect(typeof option.value).toBe('string')
        expect(typeof option.label).toBe('string')
      })
    })

    it('should include business types', () => {
      const values = notificationTypeOptions.map((o) => o.value)
      expect(values).toContain('PLANNING')
      expect(values).toContain('LEAVE')
      expect(values).toContain('TASK')
      expect(values).toContain('INCIDENT')
    })
  })

  describe('notificationPriorityOptions', () => {
    it('should have options for all priorities', () => {
      expect(notificationPriorityOptions.length).toBe(4)
    })

    it('should have correct structure', () => {
      notificationPriorityOptions.forEach((option) => {
        expect(option.value).toBeDefined()
        expect(option.label).toBeDefined()
      })
    })

    it('should be ordered from LOW to URGENT', () => {
      const values = notificationPriorityOptions.map((o) => o.value)
      expect(values).toEqual(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    })
  })

  describe('Type definitions', () => {
    it('should allow creating valid CreateNotificationInput', () => {
      const input: CreateNotificationInput = {
        title: 'Test notification',
        message: 'This is a test',
        type: 'PLANNING',
        priority: 'HIGH',
        relatedType: 'Schedule',
        relatedId: 'schedule-123',
        actionUrl: '/app/dashboard/planning',
        userId: 'user-123',
        companyId: 'company-123',
      }

      expect(input.title).toBe('Test notification')
      expect(input.type).toBe('PLANNING')
      expect(input.priority).toBe('HIGH')
    })

    it('should allow optional fields in CreateNotificationInput', () => {
      const input: CreateNotificationInput = {
        title: 'Minimal notification',
        message: 'Just the required fields',
        type: 'INFO',
        userId: 'user-123',
        companyId: 'company-123',
      }

      expect(input.priority).toBeUndefined()
      expect(input.actionUrl).toBeUndefined()
    })

    it('should allow creating valid NotificationFilters', () => {
      const filters: NotificationFilters = {
        userId: 'user-123',
        type: 'LEAVE',
        priority: 'URGENT',
        isRead: false,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      }

      expect(filters.type).toBe('LEAVE')
      expect(filters.priority).toBe('URGENT')
      expect(filters.isRead).toBe(false)
    })

    it('should allow empty NotificationFilters', () => {
      const filters: NotificationFilters = {}
      expect(Object.keys(filters).length).toBe(0)
    })
  })
})
