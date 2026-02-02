/**
 * Tests unitaires pour la Server Action exportUserData
 *
 * @ticket SP-278
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { exportUserData } from '@/lib/actions/profile'

// Mock auth
const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

// Mock prisma
const mockUserFindUnique = vi.fn()
const mockEmployeeFindFirst = vi.fn()
const mockScheduleFindMany = vi.fn()
const mockLeaveRequestFindMany = vi.fn()
const mockLeaveBalanceFindMany = vi.fn()
const mockAvailabilityFindMany = vi.fn()
const mockPersonalTaskFindMany = vi.fn()
const mockNotificationFindMany = vi.fn()
const mockIncidentNoteFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: () => mockUserFindUnique(),
    },
    employee: {
      findFirst: () => mockEmployeeFindFirst(),
    },
    schedule: {
      findMany: () => mockScheduleFindMany(),
    },
    leaveRequest: {
      findMany: () => mockLeaveRequestFindMany(),
    },
    leaveBalance: {
      findMany: () => mockLeaveBalanceFindMany(),
    },
    availability: {
      findMany: () => mockAvailabilityFindMany(),
    },
    personalTask: {
      findMany: () => mockPersonalTaskFindMany(),
    },
    notification: {
      findMany: () => mockNotificationFindMany(),
    },
    incidentNote: {
      findMany: () => mockIncidentNoteFindMany(),
    },
  },
}))

// Mock console pour ne pas polluer les tests
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('exportUserData', () => {
  const mockUser = {
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    role: 'EMPLOYEE',
    emailVerified: new Date('2025-01-01'),
    isActive: true,
    createdAt: new Date('2025-01-01'),
    lastLoginAt: new Date('2026-02-01'),
  }

  const mockEmployee = {
    firstName: 'Test',
    lastName: 'User',
    phone: '+33612345678',
    email: 'test@example.com',
    jobTitle: 'Developer',
    department: 'Tech',
    hireDate: new Date('2025-01-01'),
    weeklyHours: 35,
    skills: ['React', 'TypeScript'],
    preferences: { theme: 'dark' },
    isActive: true,
    createdAt: new Date('2025-01-01'),
    team: { name: 'Web Team' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
    mockUserFindUnique.mockResolvedValue(mockUser)
    mockEmployeeFindFirst.mockResolvedValue(mockEmployee)
    mockScheduleFindMany.mockResolvedValue([])
    mockLeaveRequestFindMany.mockResolvedValue([])
    mockLeaveBalanceFindMany.mockResolvedValue([])
    mockAvailabilityFindMany.mockResolvedValue([])
    mockPersonalTaskFindMany.mockResolvedValue([])
    mockNotificationFindMany.mockResolvedValue([])
    mockIncidentNoteFindMany.mockResolvedValue([])
  })

  // ============================================
  // AUTHENTIFICATION
  // ============================================
  describe('Authentification', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await exportUserData()

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Vous devez être connecté pour exporter vos données'
      )
    })

    it('should return error when session has no user id', async () => {
      mockAuth.mockResolvedValue({ user: {} })

      const result = await exportUserData()

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Vous devez être connecté pour exporter vos données'
      )
    })
  })

  // ============================================
  // EXPORT RÉUSSI
  // ============================================
  describe('Export réussi', () => {
    it('should return data in JSON format', async () => {
      const result = await exportUserData()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.mimeType).toBe('application/json')
    })

    it('should generate correct filename', async () => {
      const result = await exportUserData()

      expect(result.data?.filename).toMatch(
        /^smartplanning-export-test-\d{4}-\d{2}-\d{2}\.json$/
      )
    })

    it('should include export info', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.exportInfo).toBeDefined()
      expect(data.exportInfo.format).toBe(
        'RGPD Article 20 - Portabilité des données'
      )
      expect(data.exportInfo.version).toBe('1.0')
      expect(data.exportInfo.exportDate).toBeDefined()
    })

    it('should include account data', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.account).toBeDefined()
      expect(data.account.email).toBe('test@example.com')
      expect(data.account.name).toBe('Test User')
      expect(data.account.role).toBe('EMPLOYEE')
    })

    it('should include employee profile', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.profile).toBeDefined()
      expect(data.profile.firstName).toBe('Test')
      expect(data.profile.lastName).toBe('User')
      expect(data.profile.team).toBe('Web Team')
    })

    it('should exclude password from export', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.account.password).toBeUndefined()
    })

    it('should exclude internal IDs from export', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.account.id).toBeUndefined()
      expect(data.profile?.id).toBeUndefined()
    })
  })

  // ============================================
  // DONNÉES MÉTIER
  // ============================================
  describe('Données métier', () => {
    it('should include schedules', async () => {
      const mockSchedule = {
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-15'),
        startTime: '09:00',
        endTime: '17:00',
        type: 'WORK',
        status: 'CONFIRMED',
        title: null,
        description: null,
        location: 'Office',
      }
      mockScheduleFindMany.mockResolvedValue([mockSchedule])

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.schedules).toHaveLength(1)
      expect(data.schedules[0].date).toBe('2026-01-15')
      expect(data.schedules[0].type).toBe('WORK')
      expect(data.schedules[0].location).toBe('Office')
    })

    it('should include leave requests', async () => {
      const mockLeaveRequest = {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-05'),
        days: 5,
        type: 'PAID_LEAVE',
        status: 'APPROVED',
        halfDay: false,
        halfDayPeriod: null,
        reason: 'Vacances',
        comment: null,
        reviewedAt: new Date('2026-02-15'),
        reviewComment: 'Approuvé',
      }
      mockLeaveRequestFindMany.mockResolvedValue([mockLeaveRequest])

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.leaveRequests).toHaveLength(1)
      expect(data.leaveRequests[0].days).toBe(5)
      expect(data.leaveRequests[0].type).toBe('PAID_LEAVE')
      expect(data.leaveRequests[0].status).toBe('APPROVED')
    })

    it('should calculate remaining balance for leave balances', async () => {
      const mockBalance = {
        year: 2026,
        paidLeaveTotal: 25,
        paidLeaveUsed: 5,
        rttTotal: 10,
        rttUsed: 2,
      }
      mockLeaveBalanceFindMany.mockResolvedValue([mockBalance])

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.leaveBalances[0].paidLeave.remaining).toBe(20)
      expect(data.leaveBalances[0].rtt.remaining).toBe(8)
    })

    it('should include availabilities', async () => {
      const mockAvailability = {
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-01-20'),
        startTime: '14:00',
        endTime: '18:00',
        type: 'UNAVAILABLE',
        reason: 'RDV médical',
        isRecurring: false,
      }
      mockAvailabilityFindMany.mockResolvedValue([mockAvailability])

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.availabilities).toHaveLength(1)
      expect(data.availabilities[0].type).toBe('UNAVAILABLE')
      expect(data.availabilities[0].reason).toBe('RDV médical')
    })

    it('should include personal tasks', async () => {
      const mockTask = {
        title: 'Ma tâche',
        description: 'Description de la tâche',
        dueDate: new Date('2026-02-10'),
        completed: false,
        createdAt: new Date('2026-01-15'),
      }
      mockPersonalTaskFindMany.mockResolvedValue([mockTask])

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.personalTasks).toHaveLength(1)
      expect(data.personalTasks[0].title).toBe('Ma tâche')
      expect(data.personalTasks[0].completed).toBe(false)
    })

    it('should include notifications', async () => {
      const mockNotification = {
        title: 'Notification test',
        message: 'Contenu de la notification',
        type: 'INFO',
        isRead: true,
        readAt: new Date('2026-01-16'),
        createdAt: new Date('2026-01-15'),
      }
      mockNotificationFindMany.mockResolvedValue([mockNotification])

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.notifications).toHaveLength(1)
      expect(data.notifications[0].title).toBe('Notification test')
      expect(data.notifications[0].isRead).toBe(true)
    })

    it('should include incident notes authored by user', async () => {
      const mockNote = {
        title: 'Note incident',
        content: 'Description de l incident',
        date: new Date('2026-01-10'),
        visibility: 'DIRECTOR_ONLY',
        createdAt: new Date('2026-01-10'),
      }
      mockIncidentNoteFindMany.mockResolvedValue([mockNote])

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.incidentNotesAuthored).toHaveLength(1)
      expect(data.incidentNotesAuthored[0].title).toBe('Note incident')
      expect(data.incidentNotesAuthored[0].visibility).toBe('DIRECTOR_ONLY')
    })
  })

  // ============================================
  // CAS PARTICULIERS
  // ============================================
  describe('Cas particuliers', () => {
    it('should handle users without employee profile', async () => {
      mockEmployeeFindFirst.mockResolvedValue(null)

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(result.success).toBe(true)
      expect(data.profile).toBeNull()
    })

    it('should return error when user not found', async () => {
      mockUserFindUnique.mockResolvedValue(null)

      const result = await exportUserData()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Compte introuvable')
    })

    it('should handle users with empty data arrays', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(result.success).toBe(true)
      expect(data.schedules).toEqual([])
      expect(data.leaveRequests).toEqual([])
      expect(data.leaveBalances).toEqual([])
      expect(data.availabilities).toEqual([])
      expect(data.personalTasks).toEqual([])
      expect(data.notifications).toEqual([])
      expect(data.incidentNotesAuthored).toEqual([])
    })

    it('should handle employee without team', async () => {
      mockEmployeeFindFirst.mockResolvedValue({
        ...mockEmployee,
        team: null,
      })

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.profile.team).toBeNull()
    })

    it('should handle null optional fields', async () => {
      mockEmployeeFindFirst.mockResolvedValue({
        ...mockEmployee,
        phone: null,
        hireDate: null,
        preferences: null,
      })

      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.profile.phone).toBeNull()
      expect(data.profile.hireDate).toBeNull()
      expect(data.profile.preferences).toBeNull()
    })
  })

  // ============================================
  // FORMAT DES DATES
  // ============================================
  describe('Format des dates', () => {
    it('should format full dates as ISO 8601', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.account.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      )
    })

    it('should format date-only fields as YYYY-MM-DD', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.profile.hireDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should include exportDate in ISO 8601 format', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      expect(data.exportInfo.exportDate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      )
    })
  })

  // ============================================
  // GESTION DES ERREURS
  // ============================================
  describe('Gestion des erreurs', () => {
    it('should handle database errors gracefully', async () => {
      mockUserFindUnique.mockRejectedValue(new Error('DB Error'))

      const result = await exportUserData()

      expect(result.success).toBe(false)
      expect(result.error).toBe("Une erreur est survenue lors de l'export")
    })

    it('should log errors to console', async () => {
      mockUserFindUnique.mockRejectedValue(new Error('Test error'))

      await exportUserData()

      expect(console.error).toHaveBeenCalledWith(
        '[exportUserData] Error:',
        expect.any(Error)
      )
    })
  })

  // ============================================
  // TRAÇABILITÉ RGPD
  // ============================================
  describe('Traçabilité RGPD', () => {
    it('should log export for RGPD traceability', async () => {
      await exportUserData()

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[exportUserData] User user-123 exported')
      )
    })
  })

  // ============================================
  // SÉCURITÉ
  // ============================================
  describe('Sécurité', () => {
    it('should not expose sensitive information in error messages', async () => {
      mockUserFindUnique.mockRejectedValue(new Error('Internal SQL error'))

      const result = await exportUserData()

      expect(result.error).toBe("Une erreur est survenue lors de l'export")
      expect(result.error).not.toContain('SQL')
      expect(result.error).not.toContain('Internal')
    })

    it('should verify authentication before querying data', async () => {
      mockAuth.mockResolvedValue(null)

      await exportUserData()

      expect(mockUserFindUnique).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // STRUCTURE JSON
  // ============================================
  describe('Structure JSON', () => {
    it('should produce valid JSON', async () => {
      const result = await exportUserData()

      expect(() => JSON.parse(result.data?.data || '')).not.toThrow()
    })

    it('should include all expected top-level keys', async () => {
      const result = await exportUserData()
      const data = JSON.parse(result.data?.data || '{}')

      const expectedKeys = [
        'exportInfo',
        'account',
        'profile',
        'schedules',
        'leaveRequests',
        'leaveBalances',
        'availabilities',
        'personalTasks',
        'notifications',
        'incidentNotesAuthored',
      ]

      for (const key of expectedKeys) {
        expect(data).toHaveProperty(key)
      }
    })

    it('should format JSON with indentation', async () => {
      const result = await exportUserData()

      // Le JSON formaté contient des sauts de ligne
      expect(result.data?.data).toContain('\n')
      expect(result.data?.data).toContain('  ')
    })
  })
})
