/**
 * Brouillons : notification à la publication, pas à la création
 *
 * @ticket SP-614
 * @description Le 22 octobre 2026, Patisserie CARL a posé 40 créneaux en
 * brouillon que ses employées ne verront jamais. Un employé ne voit que les
 * créneaux CONFIRMED, et pourtant la création d'un brouillon le prévenait
 * déjà. Ces tests couvrent la publication groupée et son périmètre.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterAll,
  beforeAll,
} from 'vitest'

const {
  mockScheduleFindMany,
  mockScheduleUpdateMany,
  mockEmployeeFindMany,
  mockEmployeeFindUnique,
  mockTransaction,
  mockBatchNotification,
  mockSendEmail,
} = vi.hoisted(() => ({
  mockScheduleFindMany: vi.fn(),
  mockScheduleUpdateMany: vi.fn(),
  mockEmployeeFindMany: vi.fn(),
  mockEmployeeFindUnique: vi.fn(),
  mockTransaction: vi.fn(),
  mockBatchNotification: vi.fn(),
  mockSendEmail: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    schedule: {
      findMany: mockScheduleFindMany,
      updateMany: mockScheduleUpdateMany,
      create: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    employee: {
      findMany: mockEmployeeFindMany,
      findUnique: mockEmployeeFindUnique,
    },
    leaveRequest: { findFirst: vi.fn().mockResolvedValue(null) },
    $transaction: mockTransaction,
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/impersonation', () => ({
  getEffectiveSessionData: vi.fn(),
  assertNotImpersonating: vi.fn().mockResolvedValue(null),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/services/audit', () => ({
  logAuditAction: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/services/funnel-milestones.service', () => ({
  trackFirstScheduleIfApplicable: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/cache', () => ({
  invalidateDashboardCache: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/actions/notifications', () => ({
  createPlanningNotification: vi.fn(),
  createBatchPlanningNotification: mockBatchNotification,
}))
vi.mock('@/lib/email/templates/schedule-notification', () => ({
  sendScheduleNotificationEmail: mockSendEmail,
}))
vi.mock('@/lib/email/check-preference', () => ({
  canSendEmailToEmployee: vi.fn().mockResolvedValue(true),
}))

import { auth } from '@/lib/auth'
import { getEffectiveSessionData } from '@/lib/impersonation'
import { createSchedule, publishDraftSchedules } from '../schedules'

// ============================================================================
// Données
// ============================================================================

const COMPANY = 'cl000000000000000000comp1'
const ACTOR = 'cl000000000000000000user1'
const TEAM = 'cl000000000000000000team1'
const EMPLOYEE = 'cl000000000000000000empl1'
const EMPLOYEE_USER = 'cl000000000000000000user9'

function as(role: string, managedTeamIds: string[] = []) {
  vi.mocked(auth).mockResolvedValue({
    user: { id: ACTOR, role, companyId: COMPANY },
  } as never)
  vi.mocked(getEffectiveSessionData).mockResolvedValue({
    userId: ACTOR,
    role,
    companyId: role === 'SYSTEM_ADMIN' ? null : COMPANY,
  } as never)
  mockEmployeeFindUnique.mockResolvedValue(
    role === 'MANAGER'
      ? {
          id: 'cl000000000000000000mana1',
          teamId: TEAM,
          managedTeams: managedTeamIds.map((id) => ({ id })),
        }
      : null
  )
}

/** Ligne de créneau à la forme du select de publishDraftSchedules */
function draft(id: string) {
  return {
    id,
    employeeId: EMPLOYEE,
    startDate: new Date('2026-10-30T00:00:00.000Z'),
    endDate: new Date('2026-10-30T00:00:00.000Z'),
    startTime: '08:30',
    endTime: '18:30',
    type: 'WORK',
    companyId: COMPANY,
  }
}

/** Semaine du lundi 26 octobre 2026, bornes envoyées par un navigateur à Paris */
const WEEK = {
  startDate: new Date('2026-10-25T23:00:00.000Z'),
  endDate: new Date('2026-11-01T22:59:59.999Z'),
}

/** Laisse s'exécuter les notifications fire-and-forget */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function whereOfFindMany(): Record<string, unknown> {
  const call = mockScheduleFindMany.mock.calls[0] as
    | [{ where: Record<string, unknown> }]
    | undefined
  if (!call) throw new Error('findMany non appelé')
  return call[0].where
}

// ============================================================================
// publishDraftSchedules
// ============================================================================

describe('SP-614, publishDraftSchedules', () => {
  const previousTz = process.env.TZ
  beforeAll(() => {
    process.env.TZ = 'UTC'
  })
  afterAll(() => {
    process.env.TZ = previousTz
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockEmployeeFindMany.mockResolvedValue([
      {
        id: EMPLOYEE,
        userId: EMPLOYEE_USER,
        firstName: 'Charlotte',
        email: 'charlotte@example.com',
      },
    ])
    mockBatchNotification.mockResolvedValue({ success: true })
    mockSendEmail.mockResolvedValue({ success: true })
  })

  it('publie les brouillons de la semaine de Paris, dans l’entreprise, et prévient une fois', async () => {
    as('DIRECTOR')
    mockScheduleFindMany.mockResolvedValue([draft('a'), draft('b')])
    mockScheduleUpdateMany.mockResolvedValue({ count: 2 })

    const result = await publishDraftSchedules(WEEK)
    await flush()

    expect(result).toEqual({ success: true, data: { published: 2 } })
    const where = whereOfFindMany()
    expect(where.companyId).toBe(COMPANY)
    expect(where.employee).toEqual({ companyId: COMPANY })
    expect(where.status).toBe('DRAFT')
    expect(where.startDate).toEqual({
      gte: new Date('2026-10-26T00:00:00.000Z'),
      lte: new Date('2026-11-01T23:59:59.999Z'),
    })
    expect(where.OR).toBeUndefined()

    const updateCall = mockScheduleUpdateMany.mock.calls[0] as [
      { where: Record<string, unknown>; data: Record<string, unknown> },
    ]
    expect(updateCall[0].where).toEqual({
      id: { in: ['a', 'b'] },
      companyId: COMPANY,
      status: 'DRAFT',
    })
    expect(updateCall[0].data).toEqual({ status: 'CONFIRMED' })

    expect(mockBatchNotification).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it('borne un MANAGER à ses équipes', async () => {
    as('MANAGER', [TEAM])
    mockScheduleFindMany.mockResolvedValue([])

    await publishDraftSchedules(WEEK)

    expect(whereOfFindMany().OR).toEqual([
      { teamId: { in: [TEAM] } },
      { employee: { teamId: { in: [TEAM] } } },
    ])
  })

  it('ne laisse rien passer à un MANAGER sans équipe gérée', async () => {
    as('MANAGER', [])
    mockScheduleFindMany.mockResolvedValue([])

    await publishDraftSchedules(WEEK)

    expect(whereOfFindMany().OR).toEqual([
      { teamId: { in: [] } },
      { employee: { teamId: { in: [] } } },
    ])
  })

  it.each(['EMPLOYEE', 'SYSTEM_ADMIN'])(
    'refuse le rôle %s sans lire la base',
    async (role) => {
      as(role)

      const result = await publishDraftSchedules(WEEK)

      expect(result.success).toBe(false)
      expect(mockScheduleFindMany).not.toHaveBeenCalled()
      expect(mockScheduleUpdateMany).not.toHaveBeenCalled()
    }
  )

  it('un double clic concurrent ne publie rien et ne notifie personne', async () => {
    as('DIRECTOR')
    mockScheduleFindMany.mockResolvedValue([draft('a'), draft('b')])
    mockScheduleUpdateMany.mockResolvedValue({ count: 0 })

    const result = await publishDraftSchedules(WEEK)
    await flush()

    expect(result).toEqual({ success: true, data: { published: 0 } })
    expect(mockBatchNotification).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it("sans brouillon, n'écrit rien", async () => {
    as('DIRECTOR')
    mockScheduleFindMany.mockResolvedValue([])

    const result = await publishDraftSchedules(WEEK)

    expect(result).toEqual({ success: true, data: { published: 0 } })
    expect(mockScheduleUpdateMany).not.toHaveBeenCalled()
  })

  it('refuse une période inversée', async () => {
    as('DIRECTOR')

    const result = await publishDraftSchedules({
      startDate: WEEK.endDate,
      endDate: WEEK.startDate,
    })

    expect(result.success).toBe(false)
    expect(mockScheduleFindMany).not.toHaveBeenCalled()
  })
})

// ============================================================================
// createSchedule : un brouillon ne prévient personne
// ============================================================================

describe('SP-614, createSchedule et notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    as('DIRECTOR')
    mockScheduleFindMany.mockResolvedValue([])
    mockEmployeeFindMany.mockResolvedValue([
      {
        id: EMPLOYEE,
        userId: EMPLOYEE_USER,
        firstName: 'Charlotte',
        lastName: 'Parmentier',
        email: 'charlotte@example.com',
        companyId: COMPANY,
        teamId: TEAM,
      },
    ])
    mockTransaction.mockResolvedValue([
      { ...draft('c'), status: 'DRAFT', employee: { id: EMPLOYEE } },
    ])
    mockBatchNotification.mockResolvedValue({ success: true })
    mockSendEmail.mockResolvedValue({ success: true })
  })

  const input = (status: 'DRAFT' | 'CONFIRMED') => ({
    employeeId: EMPLOYEE,
    companyId: COMPANY,
    startDate: new Date('2026-10-30T00:00:00.000Z'),
    endDate: new Date('2026-10-30T00:00:00.000Z'),
    startTime: '08:30',
    endTime: '18:30',
    type: 'WORK' as const,
    status,
    isRecurring: false,
  })

  it('un brouillon ne déclenche ni notification ni email', async () => {
    const result = await createSchedule(input('DRAFT'))
    await flush()

    expect(result.success).toBe(true)
    expect(mockBatchNotification).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('un créneau confirmé prévient toujours l’employé', async () => {
    const result = await createSchedule(input('CONFIRMED'))
    await flush()

    expect(result.success).toBe(true)
    expect(mockBatchNotification).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })
})
