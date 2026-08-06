/**
 * Tests d'isolation multi-tenant des factories de notifications
 *
 * Un utilisateur ne doit jamais recevoir de notification portant sur une
 * entité (congé, planning, incident) d'une autre entreprise, même si
 * l'appelant se trompe de destinataire. Ces gardes sont la défense en
 * profondeur derrière le filtrage des destinataires côté appelant.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

const mockLeaveFindUnique = vi.fn()
const mockScheduleFindUnique = vi.fn()
const mockIncidentFindUnique = vi.fn()
const mockUserFindUnique = vi.fn()
const mockNotificationCreate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    leaveRequest: {
      findUnique: (...args: any[]) => mockLeaveFindUnique(...args),
    },
    schedule: {
      findUnique: (...args: any[]) => mockScheduleFindUnique(...args),
    },
    incidentNote: {
      findUnique: (...args: any[]) => mockIncidentFindUnique(...args),
    },
    employee: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
    },
    notification: {
      create: (...args: any[]) => mockNotificationCreate(...args),
    },
  },
}))

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const mockEmitNotification = vi.fn()
vi.mock('@/lib/notifications', () => ({
  emitNotification: (...args: any[]) => mockEmitNotification(...args),
}))

import {
  createLeaveNotification,
  createPlanningNotification,
  createIncidentNotification,
  createBatchPlanningNotification,
} from '../notifications'

// ============================================================================
// Fixtures
// ============================================================================

const COMPANY_A = 'clcompanyaaaaaaaaaa1'
const COMPANY_B = 'clcompanybbbbbbbbbb1'
const TARGET_USER_ID = 'cluser0000000000001'

/** Utilisateur destinataire, rattaché à l'entreprise passée en paramètre */
const mockTargetUser = (companyId: string) => ({
  id: TARGET_USER_ID,
  email: 'destinataire@test.fr',
  name: 'Alex Martin',
  companyId,
  // Préférences par défaut : tous les canaux actifs
  preferences: null,
})

beforeEach(() => {
  vi.clearAllMocks()
  mockNotificationCreate.mockResolvedValue({
    id: 'clnotif000000000001',
    title: 'x',
    message: 'x',
    type: 'LEAVE',
    priority: 'MEDIUM',
    actionUrl: null,
    relatedType: null,
    relatedId: null,
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    userId: TARGET_USER_ID,
  })
})

// ============================================================================
// Congés
// ============================================================================

describe('createLeaveNotification : isolation multi-tenant', () => {
  const leaveRequest = (companyId: string) => ({
    id: 'clleave00000000001',
    type: 'PAID_LEAVE',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-05'),
    companyId,
    employee: { firstName: 'Jean', lastName: 'Dupont' },
  })

  it('crée la notification quand le destinataire est dans la même entreprise', async () => {
    mockLeaveFindUnique.mockResolvedValue(leaveRequest(COMPANY_A))
    mockUserFindUnique.mockResolvedValue(mockTargetUser(COMPANY_A))

    const result = await createLeaveNotification(
      'clleave00000000001',
      TARGET_USER_ID,
      'requested'
    )

    expect(result.success).toBe(true)
    expect(mockNotificationCreate).toHaveBeenCalled()
  })

  it("refuse un destinataire d'une autre entreprise", async () => {
    mockLeaveFindUnique.mockResolvedValue(leaveRequest(COMPANY_A))
    mockUserFindUnique.mockResolvedValue(mockTargetUser(COMPANY_B))

    const result = await createLeaveNotification(
      'clleave00000000001',
      TARGET_USER_ID,
      'requested'
    )

    expect(result.success).toBe(false)
    expect(mockNotificationCreate).not.toHaveBeenCalled()
    expect(mockEmitNotification).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Plannings
// ============================================================================

describe('createPlanningNotification : isolation multi-tenant', () => {
  it("refuse un destinataire d'une autre entreprise", async () => {
    mockScheduleFindUnique.mockResolvedValue({
      id: 'clsched000000000001',
      startTime: new Date('2026-09-01T09:00:00Z'),
      endTime: new Date('2026-09-01T17:00:00Z'),
      companyId: COMPANY_A,
    })
    mockUserFindUnique.mockResolvedValue(mockTargetUser(COMPANY_B))

    const result = await createPlanningNotification(
      'clsched000000000001',
      TARGET_USER_ID,
      'created'
    )

    expect(result.success).toBe(false)
    expect(mockNotificationCreate).not.toHaveBeenCalled()
  })

  it('accepte un destinataire de la même entreprise', async () => {
    mockScheduleFindUnique.mockResolvedValue({
      id: 'clsched000000000001',
      startTime: new Date('2026-09-01T09:00:00Z'),
      endTime: new Date('2026-09-01T17:00:00Z'),
      companyId: COMPANY_A,
    })
    mockUserFindUnique.mockResolvedValue(mockTargetUser(COMPANY_A))

    const result = await createPlanningNotification(
      'clsched000000000001',
      TARGET_USER_ID,
      'created'
    )

    expect(result.success).toBe(true)
    expect(mockNotificationCreate).toHaveBeenCalled()
  })
})

describe('createBatchPlanningNotification : isolation multi-tenant', () => {
  const batchSchedule = (companyId: string, id: string) => ({
    id,
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-01'),
    startTime: '09:00',
    endTime: '17:00',
    type: 'WORK',
    companyId,
  })

  it('refuse si un seul créneau appartient à une autre entreprise', async () => {
    mockUserFindUnique.mockResolvedValue(mockTargetUser(COMPANY_A))

    const result = await createBatchPlanningNotification(
      [
        batchSchedule(COMPANY_A, 'clsched000000000001'),
        batchSchedule(COMPANY_B, 'clsched000000000002'),
      ],
      TARGET_USER_ID,
      'created'
    )

    expect(result.success).toBe(false)
    expect(mockNotificationCreate).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Incidents
// ============================================================================

describe('createIncidentNotification : isolation multi-tenant', () => {
  it("refuse un destinataire d'une autre entreprise", async () => {
    mockIncidentFindUnique.mockResolvedValue({
      id: 'clincident00000001',
      title: 'Retard répété',
      date: new Date('2026-08-01'),
      visibility: 'ALL',
      companyId: COMPANY_A,
      subject: { firstName: 'Jean', lastName: 'Dupont' },
    })
    mockUserFindUnique.mockResolvedValue(mockTargetUser(COMPANY_B))

    const result = await createIncidentNotification(
      'clincident00000001',
      TARGET_USER_ID,
      'created'
    )

    expect(result.success).toBe(false)
    expect(mockNotificationCreate).not.toHaveBeenCalled()
  })
})
