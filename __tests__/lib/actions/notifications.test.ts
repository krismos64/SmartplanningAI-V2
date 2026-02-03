/**
 * Tests unitaires pour les Server Actions notifications
 *
 * @ticket SP-325
 * @description Tests des factory functions et CRUD notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NotificationType, NotificationPriority, UserRole } from '@prisma/client'

// Mock Prisma avec hoisting compatible
vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      createMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    schedule: {
      findUnique: vi.fn(),
    },
    leaveRequest: {
      findUnique: vi.fn(),
    },
    personalTask: {
      findUnique: vi.fn(),
    },
    incidentNote: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import après les mocks
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  createPlanningNotification,
  createLeaveNotification,
  createTaskNotification,
  createIncidentNotification,
  createSystemNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  cleanupOldNotifications,
} from '@/lib/actions/notifications'

// Type mocks
const mockPrisma = vi.mocked(prisma)
const mockAuth = vi.mocked(auth)

describe('Notification Server Actions - SP-325', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ========================================================================
  // Helper pour setup auth mock
  // ========================================================================

  function setupAuthMock(
    role: UserRole = 'EMPLOYEE',
    userId = 'user-123',
    companyId: string | null = 'company-123'
  ) {
    mockAuth.mockResolvedValue({
      user: { id: userId, role, companyId },
      expires: new Date().toISOString(),
    })
    mockPrisma.employee.findUnique.mockResolvedValue({
      id: 'employee-123',
    } as never)
  }

  // ========================================================================
  // Factory Functions - Planning
  // ========================================================================

  describe('createPlanningNotification', () => {
    it('should create notification for planning creation', async () => {
      const mockSchedule = {
        id: 'schedule-123',
        startTime: new Date('2026-02-10T09:00:00Z'),
        endTime: new Date('2026-02-10T17:00:00Z'),
        companyId: 'company-123',
        employee: { firstName: 'Jean', lastName: 'Dupont' },
      }

      const mockUser = { id: 'user-123', companyId: 'company-123' }
      const mockNotification = {
        id: 'notif-123',
        title: 'Nouveau planning assigné',
        type: 'PLANNING',
        priority: 'LOW',
      }

      mockPrisma.schedule.findUnique.mockResolvedValue(mockSchedule as never)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never)
      mockPrisma.notification.create.mockResolvedValue(mockNotification as never)

      const result = await createPlanningNotification(
        'schedule-123',
        'user-123',
        'created'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.notification.type).toBe('PLANNING')
        expect(result.notification.priority).toBe('LOW')
      }

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: NotificationType.PLANNING,
          priority: 'LOW',
          relatedType: 'Schedule',
          relatedId: 'schedule-123',
        }),
      })
    })

    it('should assign HIGH priority for deleted planning', async () => {
      const mockSchedule = {
        id: 'schedule-123',
        startTime: new Date(),
        endTime: new Date(),
        companyId: 'company-123',
        employee: { firstName: 'Jean', lastName: 'Dupont' },
      }

      mockPrisma.schedule.findUnique.mockResolvedValue(mockSchedule as never)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123', companyId: 'company-123' } as never)
      mockPrisma.notification.create.mockResolvedValue({ id: 'notif-123' } as never)

      await createPlanningNotification('schedule-123', 'user-123', 'deleted')

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          priority: 'HIGH',
        }),
      })
    })

    it('should return error for invalid action', async () => {
      // @ts-expect-error - Test avec action invalide
      const result = await createPlanningNotification('schedule-123', 'user-123', 'invalid')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('invalide')
      }
    })

    it('should return error when schedule not found', async () => {
      mockPrisma.schedule.findUnique.mockResolvedValue(null)

      const result = await createPlanningNotification('nonexistent', 'user-123', 'created')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non trouvé')
      }
    })
  })

  // ========================================================================
  // Factory Functions - Leave
  // ========================================================================

  describe('createLeaveNotification', () => {
    it('should create notification for leave request', async () => {
      const mockLeaveRequest = {
        id: 'leave-123',
        type: 'PAID_LEAVE',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-20'),
        companyId: 'company-123',
        employee: { firstName: 'Marie', lastName: 'Martin' },
      }

      mockPrisma.leaveRequest.findUnique.mockResolvedValue(mockLeaveRequest as never)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123', companyId: 'company-123' } as never)
      mockPrisma.notification.create.mockResolvedValue({
        id: 'notif-123',
        type: 'LEAVE',
        priority: 'MEDIUM',
      } as never)

      const result = await createLeaveNotification('leave-123', 'user-123', 'requested')

      expect(result.success).toBe(true)
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: NotificationType.LEAVE,
          priority: 'MEDIUM',
          relatedType: 'LeaveRequest',
        }),
      })
    })

    it('should assign LOW priority for approved leave', async () => {
      const mockLeaveRequest = {
        id: 'leave-123',
        type: 'PAID_LEAVE',
        startDate: new Date(),
        endDate: new Date(),
        companyId: 'company-123',
        employee: { firstName: 'Marie', lastName: 'Martin' },
      }

      mockPrisma.leaveRequest.findUnique.mockResolvedValue(mockLeaveRequest as never)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123', companyId: 'company-123' } as never)
      mockPrisma.notification.create.mockResolvedValue({ id: 'notif-123' } as never)

      await createLeaveNotification('leave-123', 'user-123', 'approved')

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          priority: 'LOW',
        }),
      })
    })

    it('should assign HIGH priority for rejected leave', async () => {
      const mockLeaveRequest = {
        id: 'leave-123',
        type: 'PAID_LEAVE',
        startDate: new Date(),
        endDate: new Date(),
        companyId: 'company-123',
        employee: { firstName: 'Marie', lastName: 'Martin' },
      }

      mockPrisma.leaveRequest.findUnique.mockResolvedValue(mockLeaveRequest as never)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123', companyId: 'company-123' } as never)
      mockPrisma.notification.create.mockResolvedValue({ id: 'notif-123' } as never)

      await createLeaveNotification('leave-123', 'user-123', 'rejected')

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          priority: 'HIGH',
        }),
      })
    })
  })

  // ========================================================================
  // Factory Functions - Task
  // ========================================================================

  describe('createTaskNotification', () => {
    it('should create notification for task reminder', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Préparer la réunion',
        dueDate: new Date('2026-02-15'),
        userId: 'user-123',
        user: { companyId: 'company-123' },
      }

      mockPrisma.personalTask.findUnique.mockResolvedValue(mockTask as never)
      mockPrisma.notification.create.mockResolvedValue({
        id: 'notif-123',
        type: 'TASK',
        priority: 'MEDIUM',
      } as never)

      const result = await createTaskNotification('task-123', 'user-123', 'reminder')

      expect(result.success).toBe(true)
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: NotificationType.TASK,
          priority: 'MEDIUM',
          relatedType: 'PersonalTask',
        }),
      })
    })

    it('should return error when user is not task owner', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Tâche privée',
        dueDate: null,
        userId: 'other-user',
        user: { companyId: 'company-123' },
      }

      mockPrisma.personalTask.findUnique.mockResolvedValue(mockTask as never)

      const result = await createTaskNotification('task-123', 'user-123', 'reminder')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Accès non autorisé')
      }
    })
  })

  // ========================================================================
  // Factory Functions - Incident
  // ========================================================================

  describe('createIncidentNotification', () => {
    it('should create notification for incident note', async () => {
      const mockIncidentNote = {
        id: 'incident-123',
        title: 'Retard répété',
        date: new Date(),
        visibility: 'ALL',
        companyId: 'company-123',
        subject: { firstName: 'Paul', lastName: 'Durand' },
      }

      mockPrisma.incidentNote.findUnique.mockResolvedValue(mockIncidentNote as never)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123', companyId: 'company-123' } as never)
      mockPrisma.notification.create.mockResolvedValue({
        id: 'notif-123',
        type: 'INCIDENT',
        priority: 'HIGH',
      } as never)

      const result = await createIncidentNotification('incident-123', 'user-123', 'created')

      expect(result.success).toBe(true)
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: NotificationType.INCIDENT,
          priority: 'HIGH',
          relatedType: 'IncidentNote',
        }),
      })
    })
  })

  // ========================================================================
  // Factory Functions - System
  // ========================================================================

  describe('createSystemNotification', () => {
    it('should create bulk notifications for all company users (DIRECTOR)', async () => {
      setupAuthMock('DIRECTOR', 'director-123', 'company-123')

      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
      ] as never)
      mockPrisma.notification.createMany.mockResolvedValue({ count: 3 })

      const result = await createSystemNotification(
        'company-123',
        'Maintenance planifiée',
        'Le système sera indisponible de 2h à 4h.',
        'HIGH'
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.count).toBe(3)
      }

      expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            type: NotificationType.SYSTEM,
            priority: 'HIGH',
            companyId: 'company-123',
          }),
        ]),
      })
    })

    it('should reject EMPLOYEE role', async () => {
      setupAuthMock('EMPLOYEE')

      const result = await createSystemNotification(
        'company-123',
        'Test',
        'Message test'
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('permissions')
      }
    })

    it('should reject access to other company', async () => {
      setupAuthMock('DIRECTOR', 'director-123', 'company-456')

      const result = await createSystemNotification(
        'company-123',
        'Test',
        'Message test'
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('accès')
      }
    })
  })

  // ========================================================================
  // CRUD Operations
  // ========================================================================

  describe('getNotifications', () => {
    it('should return paginated notifications for current user', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      const mockNotifications = [
        { id: 'notif-1', title: 'Notif 1', type: 'INFO', isRead: false },
        { id: 'notif-2', title: 'Notif 2', type: 'LEAVE', isRead: true },
      ]

      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications as never)
      mockPrisma.notification.count.mockResolvedValue(2)

      const result = await getNotifications({}, { page: 1, pageSize: 10 })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.data).toHaveLength(2)
        expect(result.data.total).toBe(2)
      }

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
          }),
        })
      )
    })

    it('should filter by type and isRead', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.findMany.mockResolvedValue([])
      mockPrisma.notification.count.mockResolvedValue(0)

      await getNotifications({ type: 'LEAVE' as never, isRead: false })

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
            type: 'LEAVE',
            isRead: false,
          }),
        })
      )
    })
  })

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.count.mockResolvedValue(5)

      const result = await getUnreadCount()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(5)
      }

      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isRead: false,
        },
      })
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 'notif-123',
        userId: 'user-123',
      } as never)
      mockPrisma.notification.update.mockResolvedValue({
        id: 'notif-123',
        isRead: true,
        readAt: new Date(),
      } as never)

      const result = await markAsRead('notif-123')

      expect(result.success).toBe(true)
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
        data: expect.objectContaining({
          isRead: true,
        }),
      })
    })

    it('should reject if notification belongs to other user', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 'notif-123',
        userId: 'other-user',
      } as never)

      const result = await markAsRead('notif-123')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Accès non autorisé')
      }
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.updateMany.mockResolvedValue({ count: 10 })

      const result = await markAllAsRead()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.count).toBe(10)
      }

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isRead: false,
        },
        data: expect.objectContaining({
          isRead: true,
        }),
      })
    })
  })

  describe('deleteNotification', () => {
    it('should delete notification owned by user', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 'notif-123',
        userId: 'user-123',
      } as never)
      mockPrisma.notification.delete.mockResolvedValue({ id: 'notif-123' } as never)

      const result = await deleteNotification('notif-123')

      expect(result.success).toBe(true)
      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
      })
    })

    it('should return error when notification not found', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.findUnique.mockResolvedValue(null)

      const result = await deleteNotification('nonexistent')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non trouvée')
      }
    })

    it('should return error when notification belongs to other user', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 'notif-123',
        userId: 'other-user',
      } as never)

      const result = await deleteNotification('notif-123')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Accès non autorisé')
      }
      expect(mockPrisma.notification.delete).not.toHaveBeenCalled()
    })

    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await deleteNotification('notif-123')

      expect(result.success).toBe(false)
      expect(mockPrisma.notification.delete).not.toHaveBeenCalled()
    })
  })

  // ========================================================================
  // deleteAllRead - SP-326
  // ========================================================================

  describe('deleteAllRead', () => {
    it('should delete all read notifications for current user', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.deleteMany.mockResolvedValue({ count: 5 })

      const result = await deleteAllRead()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.count).toBe(5)
      }

      expect(mockPrisma.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isRead: true,
        },
      })
    })

    it('should return count 0 when no read notifications', async () => {
      setupAuthMock('EMPLOYEE', 'user-123')

      mockPrisma.notification.deleteMany.mockResolvedValue({ count: 0 })

      const result = await deleteAllRead()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.count).toBe(0)
      }
    })

    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await deleteAllRead()

      expect(result.success).toBe(false)
      expect(mockPrisma.notification.deleteMany).not.toHaveBeenCalled()
    })

    it('should work for all user roles', async () => {
      const roles: UserRole[] = ['EMPLOYEE', 'MANAGER', 'DIRECTOR', 'SYSTEM_ADMIN']

      for (const role of roles) {
        vi.clearAllMocks()
        setupAuthMock(role, 'user-123')
        mockPrisma.notification.deleteMany.mockResolvedValue({ count: 1 })

        const result = await deleteAllRead()

        expect(result.success).toBe(true)
      }
    })
  })

  describe('cleanupOldNotifications', () => {
    it('should delete old read notifications (SYSTEM_ADMIN only)', async () => {
      setupAuthMock('SYSTEM_ADMIN', 'admin-123', null)

      mockPrisma.notification.deleteMany.mockResolvedValue({ count: 150 })

      const result = await cleanupOldNotifications(30)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.count).toBe(150)
      }

      expect(mockPrisma.notification.deleteMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isRead: true,
        }),
      })
    })

    it('should reject non-admin users', async () => {
      setupAuthMock('DIRECTOR')

      const result = await cleanupOldNotifications()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('permissions')
      }
    })
  })
})
