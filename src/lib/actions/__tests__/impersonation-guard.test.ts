/**
 * Tests unitaires pour le guard impersonation des Server Actions
 *
 * Vérifie que les Server Actions de mutation bloquent en mode impersonation.
 * Teste un échantillon représentatif de chaque module (1 action par module).
 *
 * @ticket SP-454
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks globaux
// ============================================================================

// Mock next/headers cookies() — contrôle du cookie impersonation
const mockGet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: mockGet,
      set: vi.fn(),
      delete: vi.fn(),
    })
  ),
}))

// Mock auth — session DIRECTOR authentifiée
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() =>
    Promise.resolve({
      user: {
        id: 'user-001',
        role: 'DIRECTOR',
        companyId: 'company-001',
      },
    })
  ),
}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    team: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    schedule: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    leaveRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    personalTask: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    incidentNote: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    availability: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    company: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    companySetting: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    notificationPreference: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    leaveBalance: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
    },
  },
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock audit service
vi.mock('@/lib/services/audit/audit.service', () => ({
  logAuditAction: vi.fn(() => Promise.resolve()),
}))

// Mock Stripe service
vi.mock('@/lib/services/stripe/stripe.service', () => ({
  StripeService: {
    createCheckoutSession: vi.fn(),
    createBillingPortalSession: vi.fn(),
    updateSubscriptionQuantity: vi.fn(),
    cancelSubscription: vi.fn(),
  },
  syncEmployeeCountToStripe: vi.fn(() => Promise.resolve()),
}))

// Mock Cloudinary
vi.mock('@/lib/cloudinary', () => ({
  uploadAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
}))

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed')),
    compare: vi.fn(() => Promise.resolve(true)),
  },
  hash: vi.fn(() => Promise.resolve('hashed')),
  compare: vi.fn(() => Promise.resolve(true)),
}))

// ============================================================================
// Imports — après les mocks
// ============================================================================

import { prisma } from '@/lib/prisma'
import { createEmployee } from '../employees'
import { createTeam } from '../teams'
import { deletePersonalTask } from '../personal-tasks'
import { createIncidentNote } from '../incident-notes'
import { updateProfile } from '../profile'
import { createAvailability } from '../availabilities'
import { updateCompanySettings } from '../company-settings'
import { updateNotificationPreferences } from '../notification-preferences'

// ============================================================================
// Cookie impersonation fixture
// ============================================================================

const IMPERSONATION_COOKIE_VALUE = JSON.stringify({
  originalAdminId: 'admin-001',
  targetUserId: 'user-001',
  targetCompanyId: 'company-001',
  targetRole: 'DIRECTOR',
  targetEmail: 'director@test.com',
  targetCompanyName: 'TestCorp',
  startedAt: Date.now(),
})

// ============================================================================
// Tests
// ============================================================================

describe('SP-454 : impersonation guard sur les Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Helper : configure le mock cookie pour simuler une impersonation active
   */
  function activateImpersonation() {
    mockGet.mockReturnValue({
      name: 'sp-impersonation',
      value: IMPERSONATION_COOKIE_VALUE,
    })
  }

  /**
   * Helper : désactive l'impersonation (pas de cookie)
   */
  function deactivateImpersonation() {
    mockGet.mockReturnValue(null)
  }

  // --------------------------------------------------------------------------
  // Employees
  // --------------------------------------------------------------------------

  it('createEmployee bloque en mode impersonation', async () => {
    activateImpersonation()

    const result = await createEmployee({
      companyId: 'company-001',
      firstName: 'Test',
      lastName: 'User',
      weeklyHours: 35,
      isActive: true,
      skills: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('mode support')
    }
  })

  // --------------------------------------------------------------------------
  // Teams
  // --------------------------------------------------------------------------

  it('createTeam bloque en mode impersonation', async () => {
    activateImpersonation()

    const result = await createTeam({
      companyId: 'company-001',
      name: 'Test Team',
      color: '#FF0000',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('mode support')
    }
  })

  // --------------------------------------------------------------------------
  // Personal Tasks
  // --------------------------------------------------------------------------

  it('deletePersonalTask bloque en mode impersonation', async () => {
    activateImpersonation()

    const result = await deletePersonalTask('task-001')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('mode support')
    }
  })

  // --------------------------------------------------------------------------
  // Incident Notes
  // --------------------------------------------------------------------------

  it('createIncidentNote bloque en mode impersonation', async () => {
    activateImpersonation()

    const result = await createIncidentNote({
      title: 'Test',
      content: 'Test content',
      date: new Date().toISOString(),
      visibility: 'DIRECTOR_ONLY',
      subjectId: 'employee-001',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('mode support')
    }
  })

  // --------------------------------------------------------------------------
  // Profile
  // --------------------------------------------------------------------------

  it('updateProfile bloque en mode impersonation', async () => {
    activateImpersonation()

    const result = await updateProfile({
      name: 'New Name',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('mode support')
    }
  })

  // --------------------------------------------------------------------------
  // Availabilities
  // --------------------------------------------------------------------------

  it('createAvailability bloque en mode impersonation', async () => {
    activateImpersonation()

    const result = await createAvailability({
      employeeId: 'employee-001',
      date: new Date().toISOString(),
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: false,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('mode support')
    }
  })

  // --------------------------------------------------------------------------
  // Company Settings
  // --------------------------------------------------------------------------

  it('updateCompanySettings bloque en mode impersonation', async () => {
    activateImpersonation()

    // Mock user lookup pour passer le checkAccess avant le guard
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-001',
      companyId: 'company-001',
    } as never)

    const result = await updateCompanySettings({
      weekStartsOn: 1,
      defaultWeeklyHours: 35,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('mode support')
    }
  })

  // --------------------------------------------------------------------------
  // Notification Preferences
  // --------------------------------------------------------------------------

  it('updateNotificationPreferences bloque en mode impersonation', async () => {
    activateImpersonation()

    const result = await updateNotificationPreferences({
      categories: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('mode support')
    }
  })

  // --------------------------------------------------------------------------
  // Vérification inverse : pas de blocage sans impersonation
  // --------------------------------------------------------------------------

  it('assertNotImpersonating laisse passer sans cookie', async () => {
    deactivateImpersonation()

    // Import direct pour tester le helper
    const { assertNotImpersonating } = await import('@/lib/impersonation')
    const result = await assertNotImpersonating()
    expect(result).toBeNull()
  })
})
