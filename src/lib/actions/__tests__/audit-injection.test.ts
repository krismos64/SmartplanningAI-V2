/**
 * Tests unitaires pour l'injection d'audit SP-444
 *
 * Vérifie que logAuditAction est appelé avec les bons paramètres
 * après chaque mutation réussie dans les Server Actions.
 *
 * Pattern : mock complet de prisma, auth, next/cache, et audit service
 * pour vérifier les appels fire-and-forget.
 *
 * @ticket SP-444
 */

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks communs
// ============================================================================

const mockLogAuditAction = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/services/audit', () => ({
  logAuditAction: (...args: unknown[]) => mockLogAuditAction(...args),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// ============================================================================
// Constants
// ============================================================================

const COMPANY_ID = 'clcompany0000000001'
const USER_ID = 'cluser000000000001'
const EMPLOYEE_ID = 'clemployee00000001'
const TEAM_ID = 'clteam00000000000001'

// ============================================================================
// 1. TEAMS - createTeam, deleteTeam, assignManager
// ============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    team: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    schedule: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    leaveRequest: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    leaveBalance: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    incidentNote: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    availability: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    company: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    verificationToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
    },
    personalTask: {
      findMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/email/templates/leave-decision', () => ({
  sendLeaveApprovedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendLeaveRejectedEmail: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/email/templates/leave-notification', () => ({
  notifyManagersOfNewLeaveRequest: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/email/templates/reset-password', () => ({
  sendResetPasswordEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2b$hashedpassword'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/services/stripe/stripe.service', () => ({
  syncEmployeeCountToStripe: vi.fn().mockResolvedValue(undefined),
}))

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// ============================================================================
// Helpers
// ============================================================================

function mockDirectorSession() {
  vi.mocked(auth).mockResolvedValue({
    user: {
      id: USER_ID,
      role: 'DIRECTOR',
      companyId: COMPANY_ID,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } as any)
}

function mockSystemAdminSession() {
  vi.mocked(auth).mockResolvedValue({
    user: {
      id: USER_ID,
      role: 'SYSTEM_ADMIN',
      companyId: null,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } as any)
}

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SP-444 Audit Injection - Teams', () => {
  it('createTeam appelle logAuditAction avec action CREATE', async () => {
    mockDirectorSession()

    // Mock employee lookup for auth
    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      userId: USER_ID,
      companyId: COMPANY_ID,
      teamId: null,
      managedTeams: [],
    } as any)

    vi.mocked(prisma.team.create).mockResolvedValue({
      id: 'new-team-id',
      name: 'Equipe Alpha',
      companyId: COMPANY_ID,
      managerId: null,
      manager: null,
      company: { id: COMPANY_ID, name: 'Test Corp' },
      _count: { employees: 0, schedules: 0 },
    } as any)

    const { createTeam } = await import('../teams')
    await createTeam({
      name: 'Equipe Alpha',
      companyId: COMPANY_ID,
      color: '#FF0000',
    })

    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entityType: 'TEAM',
        entityId: 'new-team-id',
        userId: USER_ID,
        companyId: COMPANY_ID,
      })
    )
  })

  it('deleteTeam appelle logAuditAction avec action DELETE', async () => {
    mockDirectorSession()

    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      userId: USER_ID,
      companyId: COMPANY_ID,
      teamId: null,
      managedTeams: [],
    } as any)

    vi.mocked(prisma.team.findUnique).mockResolvedValue({
      id: TEAM_ID,
      name: 'Equipe Alpha',
      companyId: COMPANY_ID,
      managerId: null,
      _count: { schedules: 0, employees: 2 },
    } as any)

    vi.mocked(prisma.employee.updateMany).mockResolvedValue({ count: 2 })
    vi.mocked(prisma.team.delete).mockResolvedValue({} as any)

    const { deleteTeam } = await import('../teams')
    await deleteTeam(TEAM_ID)

    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE',
        entityType: 'TEAM',
        entityId: TEAM_ID,
        userId: USER_ID,
        details: expect.objectContaining({ name: 'Equipe Alpha' }),
      })
    )
  })
})

describe('SP-444 Audit Injection - Incident Notes', () => {
  it('createIncidentNote appelle logAuditAction avec action CREATE', async () => {
    mockDirectorSession()

    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      userId: USER_ID,
      companyId: COMPANY_ID,
      teamId: TEAM_ID,
      managedTeams: [],
    } as any)

    const noteId = 'clnote00000000000001'
    vi.mocked(prisma.incidentNote.create).mockResolvedValue({
      id: noteId,
      title: 'Retard',
      content: 'Arrivé en retard',
      date: new Date(),
      visibility: 'ALL',
      subjectId: EMPLOYEE_ID,
      authorId: USER_ID,
      companyId: COMPANY_ID,
      subject: { id: EMPLOYEE_ID, firstName: 'Jean', lastName: 'Dupont' },
      author: { id: USER_ID, name: 'Admin', email: 'admin@test.com', image: null },
    } as any)

    const { createIncidentNote } = await import('../incident-notes')
    await createIncidentNote({
      title: 'Retard',
      content: 'Arrivé en retard',
      date: new Date(),
      visibility: 'ALL',
      subjectId: EMPLOYEE_ID,
    })

    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entityType: 'INCIDENT_NOTE',
        entityId: noteId,
        userId: USER_ID,
        companyId: COMPANY_ID,
      })
    )
  })

  it('deleteIncidentNote appelle logAuditAction avec action DELETE', async () => {
    mockDirectorSession()

    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      userId: USER_ID,
      companyId: COMPANY_ID,
      teamId: null,
      managedTeams: [],
    } as any)

    const noteId = 'clnote00000000000001'
    vi.mocked(prisma.incidentNote.findUnique).mockResolvedValue({
      id: noteId,
      authorId: USER_ID,
      companyId: COMPANY_ID,
    } as any)
    vi.mocked(prisma.incidentNote.delete).mockResolvedValue({} as any)

    const { deleteIncidentNote } = await import('../incident-notes')
    await deleteIncidentNote(noteId)

    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE',
        entityType: 'INCIDENT_NOTE',
        entityId: noteId,
        userId: USER_ID,
        companyId: COMPANY_ID,
      })
    )
  })
})

describe('SP-444 Audit Injection - Availabilities', () => {
  it('createAvailability appelle logAuditAction avec action CREATE', async () => {
    mockDirectorSession()

    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      userId: USER_ID,
      companyId: COMPANY_ID,
      teamId: TEAM_ID,
      firstName: 'Jean',
      lastName: 'Dupont',
      managedTeams: [],
    } as any)

    const availId = 'clavail0000000000001'
    vi.mocked(prisma.availability.create).mockResolvedValue({
      id: availId,
      employeeId: EMPLOYEE_ID,
      companyId: COMPANY_ID,
      startDate: new Date(),
      endDate: new Date(),
      type: 'UNAVAILABLE',
      employee: { id: EMPLOYEE_ID, firstName: 'Jean', lastName: 'Dupont' },
    } as any)

    const { createAvailability } = await import('../availabilities')
    await createAvailability({
      employeeId: EMPLOYEE_ID,
      companyId: COMPANY_ID,
      startDate: new Date(),
      endDate: new Date(),
      type: 'UNAVAILABLE' as any,
      isRecurring: false,
    })

    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entityType: 'AVAILABILITY',
        entityId: availId,
        userId: USER_ID,
        companyId: COMPANY_ID,
      })
    )
  })

  it('deleteAvailability appelle logAuditAction avec action DELETE', async () => {
    mockDirectorSession()

    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      userId: USER_ID,
      companyId: COMPANY_ID,
      teamId: TEAM_ID,
      managedTeams: [],
    } as any)

    const availId = 'clavail0000000000001'
    vi.mocked(prisma.availability.findUnique).mockResolvedValue({
      id: availId,
      employeeId: EMPLOYEE_ID,
      companyId: COMPANY_ID,
      type: 'UNAVAILABLE',
      teamId: null,
    } as any)
    vi.mocked(prisma.availability.delete).mockResolvedValue({} as any)

    const { deleteAvailability } = await import('../availabilities')
    await deleteAvailability(availId)

    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE',
        entityType: 'AVAILABILITY',
        entityId: availId,
        userId: USER_ID,
        companyId: COMPANY_ID,
      })
    )
  })
})

describe('SP-444 Audit Injection - Password Actions', () => {
  it('resetPasswordAction appelle logAuditAction avec action PASSWORD_CHANGE', async () => {
    const token = 'valid-token-123'
    const userId = 'cluser000000000099'

    vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue({
      identifier: 'user@test.com',
      token,
      expires: new Date(Date.now() + 3600000), // 1 heure dans le futur
    } as any)

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
    } as any)

    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}] as any)

    const { resetPasswordAction } = await import('../password-actions')
    const result = await resetPasswordAction({
      token,
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    })

    expect(result.success).toBe(true)
    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PASSWORD_CHANGE',
        entityType: 'USER',
        entityId: userId,
        userId,
        details: { method: 'reset-token' },
      })
    )
  })
})

describe('SP-444 Audit Injection - Profile', () => {
  it('changePassword appelle logAuditAction avec action PASSWORD_CHANGE', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: USER_ID,
        role: 'EMPLOYEE',
        companyId: COMPANY_ID,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: USER_ID,
      password: '$2b$existinghash',
    } as any)

    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const { changePassword } = await import('../profile')
    const result = await changePassword({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
      confirmNewPassword: 'NewPassword456!',
    } as any)

    expect(result.success).toBe(true)
    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PASSWORD_CHANGE',
        entityType: 'USER',
        entityId: USER_ID,
        userId: USER_ID,
        details: { method: 'change-password' },
      })
    )
  })

  it('deleteAccount appelle logAuditAction avec action DELETE avant suppression', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: USER_ID,
        role: 'EMPLOYEE',
        companyId: COMPANY_ID,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: USER_ID,
      email: 'user@test.com',
      password: '$2b$existinghash',
      name: 'Test User',
    } as any)

    vi.mocked(prisma.$transaction).mockResolvedValue(undefined as any)

    const { deleteAccount } = await import('../profile')
    const result = await deleteAccount({
      confirmEmail: 'user@test.com',
      password: 'Password123!',
      confirmDeletion: true,
    })

    expect(result.success).toBe(true)
    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE',
        entityType: 'USER',
        entityId: USER_ID,
        userId: USER_ID,
        details: expect.objectContaining({
          email: 'user@test.com',
          selfDeletion: true,
        }),
      })
    )
  })

  it('exportUserData appelle logAuditAction avec action EXPORT', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: USER_ID,
        role: 'EMPLOYEE',
        companyId: COMPANY_ID,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)

    // Mock all parallel queries for exportUserData
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'user@test.com',
      name: 'Test User',
      image: null,
      role: 'EMPLOYEE',
      emailVerified: new Date(),
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    } as any)

    vi.mocked(prisma.employee.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.schedule.findMany).mockResolvedValue([])
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([])
    vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue([])
    vi.mocked(prisma.availability.findMany).mockResolvedValue([])
    vi.mocked(prisma.personalTask.findMany).mockResolvedValue([])
    vi.mocked(prisma.notification.findMany).mockResolvedValue([])
    vi.mocked(prisma.incidentNote.findMany).mockResolvedValue([])

    const { exportUserData } = await import('../profile')
    const result = await exportUserData()

    expect(result.success).toBe(true)
    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'EXPORT',
        entityType: 'USER',
        entityId: USER_ID,
        userId: USER_ID,
        details: expect.objectContaining({ format: 'json' }),
      })
    )
  })
})

describe('SP-444 Audit Injection - Company Settings', () => {
  it('updateCompanySettings appelle logAuditAction avec action UPDATE', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: USER_ID,
        role: 'DIRECTOR',
        companyId: COMPANY_ID,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)

    // Mock for checkAccess
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: USER_ID,
      companyId: COMPANY_ID,
      role: 'DIRECTOR',
    } as any)

    // Mock for current company settings
    vi.mocked(prisma.company.findUnique)
      .mockResolvedValueOnce({
        name: 'Test Corp',
        address: '1 rue Test',
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        defaultOpeningHours: null,
      } as any)
      // Mock for updated settings retrieval
      .mockResolvedValueOnce({
        name: 'New Corp',
        address: '1 rue Test',
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        defaultOpeningHours: null,
      } as any)

    vi.mocked(prisma.company.update).mockResolvedValue({} as any)

    const { updateCompanySettings } = await import('../company-settings')
    const result = await updateCompanySettings({ name: 'New Corp' })

    expect(result.success).toBe(true)
    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE',
        entityType: 'SETTINGS',
        entityId: COMPANY_ID,
        userId: USER_ID,
        companyId: COMPANY_ID,
      })
    )
  })
})

describe('SP-444 Audit Injection - Companies (withRoleCheck)', () => {
  it('toggleCompanyStatus appelle logAuditAction avec action STATUS_CHANGE', async () => {
    mockSystemAdminSession()

    // Mock for checkPermission inside withRoleCheck
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: USER_ID,
      role: 'SYSTEM_ADMIN',
      companyId: null,
      isActive: true,
    } as any)

    vi.mocked(prisma.company.update).mockResolvedValue({
      id: 'company-123',
      name: 'Test Corp',
      isActive: false,
      slug: 'test-corp',
      logo: null,
      email: null,
      phone: null,
      address: null,
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      workingDays: ['MONDAY'],
      timezone: 'Europe/Paris',
      trialEndsAt: null,
      subscriptionEndsAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: null,
      _count: { users: 0, teams: 0, employees: 0 },
    } as any)

    const { toggleCompanyStatus } = await import('../companies')
    const result = await toggleCompanyStatus('company-123', false)

    expect(result.success).toBe(true)
    expect(mockLogAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'STATUS_CHANGE',
        entityType: 'COMPANY',
        entityId: 'company-123',
        userId: USER_ID,
        details: { from: true, to: false },
      })
    )
  })
})

describe('SP-444 Audit Injection - Erreur ne bloque pas', () => {
  it('logAuditAction en erreur ne fait pas échouer la mutation', async () => {
    mockDirectorSession()

    vi.mocked(prisma.employee.findUnique).mockResolvedValue({
      id: EMPLOYEE_ID,
      userId: USER_ID,
      companyId: COMPANY_ID,
      teamId: null,
      managedTeams: [],
    } as any)

    vi.mocked(prisma.team.create).mockResolvedValue({
      id: 'new-team-id',
      name: 'Test',
      companyId: COMPANY_ID,
      managerId: null,
      manager: null,
      company: { id: COMPANY_ID, name: 'Test Corp' },
      _count: { employees: 0, schedules: 0 },
    } as any)

    // Faire échouer l'audit
    mockLogAuditAction.mockRejectedValueOnce(new Error('Audit DB down'))

    const { createTeam } = await import('../teams')
    const result = await createTeam({
      name: 'Test',
      companyId: COMPANY_ID,
      color: '#000000',
    })

    // La mutation réussit malgré l'échec de l'audit
    expect(result.success).toBe(true)
  })
})
