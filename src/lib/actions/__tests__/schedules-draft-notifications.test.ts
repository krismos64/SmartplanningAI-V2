/**
 * Brouillons : modifier ou supprimer un brouillon ne prévient personne
 *
 * @ticket SP-618
 * @description Un employé ne voit que les créneaux CONFIRMED. SP-614 avait
 * arrêté la notification à la création d'un brouillon, mais cinq actions
 * prévenaient encore sans regarder le statut : l'employé recevait « planning
 * modifié » ou « supprimé » pour un créneau qu'il n'avait jamais vu.
 *
 * Chaque action est testée sur ce que l'employé voit changer : rien (brouillon
 * resté brouillon), une publication, une modification, un retrait.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockScheduleFindUnique,
  mockScheduleFindMany,
  mockScheduleUpdate,
  mockScheduleUpdateMany,
  mockScheduleDelete,
  mockScheduleDeleteMany,
  mockEmployeeFindFirst,
  mockEmployeeFindMany,
  mockEmployeeFindUnique,
  mockNotification,
  mockBatchNotification,
  mockSendEmail,
} = vi.hoisted(() => ({
  mockScheduleFindUnique: vi.fn(),
  mockScheduleFindMany: vi.fn(),
  mockScheduleUpdate: vi.fn(),
  mockScheduleUpdateMany: vi.fn(),
  mockScheduleDelete: vi.fn(),
  mockScheduleDeleteMany: vi.fn(),
  mockEmployeeFindFirst: vi.fn(),
  mockEmployeeFindMany: vi.fn(),
  mockEmployeeFindUnique: vi.fn(),
  mockNotification:
    vi.fn<
      (
        scheduleId: string,
        employeeUserId: string,
        action: string
      ) => Promise<{ success: boolean }>
    >(),
  mockBatchNotification:
    vi.fn<
      (
        schedules: Array<{ id: string; startTime: string }>,
        employeeUserId: string,
        action: string
      ) => Promise<{ success: boolean }>
    >(),
  mockSendEmail:
    vi.fn<(input: { action: string }) => Promise<{ success: boolean }>>(),
}))

vi.mock('@/lib/prisma', () => {
  const client = {
    schedule: {
      findUnique: mockScheduleFindUnique,
      findMany: mockScheduleFindMany,
      findFirst: vi.fn().mockResolvedValue(null),
      update: mockScheduleUpdate,
      updateMany: mockScheduleUpdateMany,
      delete: mockScheduleDelete,
      deleteMany: mockScheduleDeleteMany,
      count: vi.fn().mockResolvedValue(0),
    },
    employee: {
      findFirst: mockEmployeeFindFirst,
      findMany: mockEmployeeFindMany,
      findUnique: mockEmployeeFindUnique,
    },
    leaveRequest: { findFirst: vi.fn().mockResolvedValue(null) },
    // SP-619 : updateSchedule vérifie et écrit dans une transaction
    // interactive, exécutée ici avec le client mocké lui-même
    $executeRaw: vi.fn().mockResolvedValue(0),
    $transaction: (callback: (tx: unknown) => unknown) =>
      Promise.resolve(callback(client)),
  }
  return { prisma: client }
})
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
  createPlanningNotification: mockNotification,
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
import { scheduleVisibilityChange } from '@/lib/utils/schedule-visibility'
import {
  deleteRecurrenceGroup,
  deleteSchedule,
  deleteScheduleGroup,
  updateRecurrenceGroup,
  updateSchedule,
  updateScheduleStatus,
} from '../schedules'

// ============================================================================
// Données
// ============================================================================

const COMPANY = 'cl000000000000000000comp1'
const ACTOR = 'cl000000000000000000user1'
const TEAM = 'cl000000000000000000team1'
const EMPLOYEE = 'cl000000000000000000empl1'
const EMPLOYEE_USER = 'cl000000000000000000user9'
const SCHEDULE = 'cl000000000000000000sche1'

type Status = 'DRAFT' | 'CONFIRMED'

/** Ligne de créneau à la forme de la table, relation `employee` comprise */
function schedule(status: Status, overrides: Record<string, unknown> = {}) {
  return {
    id: SCHEDULE,
    employeeId: EMPLOYEE,
    teamId: TEAM,
    companyId: COMPANY,
    startDate: new Date('2026-11-16T00:00:00.000Z'),
    endDate: new Date('2026-11-16T00:00:00.000Z'),
    startTime: '09:00',
    endTime: '17:00',
    type: 'WORK',
    status,
    title: null,
    description: null,
    location: null,
    color: null,
    isRecurring: false,
    recurrenceRule: null,
    recurrenceGroupId: null,
    scheduleGroupId: null,
    employee: { userId: EMPLOYEE_USER },
    ...overrides,
  }
}

/** Laisse s'exécuter les notifications fire-and-forget */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

/** Tout ce qui peut partir vers un employé, par action annoncée */
function sent() {
  return {
    notifications: mockNotification.mock.calls.map((call) => call[2]),
    batches: mockBatchNotification.mock.calls.map((call) => call[2]),
    emails: mockSendEmail.mock.calls.map((call) => call[0].action),
  }
}

const NOTHING = { notifications: [], batches: [], emails: [] }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({
    user: { id: ACTOR, role: 'DIRECTOR', companyId: COMPANY },
  } as never)
  vi.mocked(getEffectiveSessionData).mockResolvedValue({
    userId: ACTOR,
    role: 'DIRECTOR',
    companyId: COMPANY,
  } as never)

  const employee = {
    id: EMPLOYEE,
    userId: EMPLOYEE_USER,
    firstName: 'Charlotte',
    email: 'charlotte@example.com',
  }
  mockEmployeeFindFirst.mockResolvedValue(employee)
  mockEmployeeFindMany.mockResolvedValue([employee])
  // Deux appelants : l'authentification cherche la fiche du dirigeant par
  // userId (aucune ici), updateSchedule cherche le destinataire par id
  mockEmployeeFindUnique.mockImplementation(
    ({ where }: { where: { id?: string; userId?: string } }) =>
      Promise.resolve(where.id === EMPLOYEE ? employee : null)
  )
  mockScheduleFindMany.mockResolvedValue([])
  mockNotification.mockResolvedValue({ success: true })
  mockBatchNotification.mockResolvedValue({ success: true })
  mockSendEmail.mockResolvedValue({ success: true })
})

// ============================================================================
// La règle
// ============================================================================

describe('SP-618, scheduleVisibilityChange', () => {
  it.each([
    ['DRAFT', 'DRAFT', 'none'],
    ['DRAFT', 'CONFIRMED', 'published'],
    ['CONFIRMED', 'CONFIRMED', 'updated'],
    ['CONFIRMED', 'DRAFT', 'withdrawn'],
  ] as const)('%s vers %s : %s', (before, after, expected) => {
    expect(scheduleVisibilityChange(before, after)).toBe(expected)
  })
})

// ============================================================================
// updateSchedule
// ============================================================================

describe('SP-618, updateSchedule', () => {
  async function update(before: Status, after: Status) {
    mockScheduleFindUnique.mockResolvedValue(schedule(before))
    mockScheduleUpdate.mockResolvedValue(
      schedule(after, { startTime: '10:00' })
    )
    const result = await updateSchedule({
      id: SCHEDULE,
      startTime: '10:00',
      ...(before !== after && { status: after }),
    })
    await flush()
    return result
  }

  it('ne prévient personne quand un brouillon reste un brouillon', async () => {
    const result = await update('DRAFT', 'DRAFT')

    expect(result.success).toBe(true)
    expect(sent()).toEqual(NOTHING)
  })

  it('prévient d une modification quand le créneau était déjà publié', async () => {
    await update('CONFIRMED', 'CONFIRMED')

    expect(sent()).toEqual({
      notifications: ['updated'],
      batches: [],
      emails: ['updated'],
    })
  })

  it('annonce une publication quand le brouillon est confirmé', async () => {
    await update('DRAFT', 'CONFIRMED')

    expect(sent()).toEqual({
      notifications: [],
      batches: ['created'],
      emails: ['created'],
    })
    // L'employé reçoit les horaires publiés, pas ceux du brouillon
    expect(mockBatchNotification.mock.calls[0]?.[0][0]?.startTime).toBe('10:00')
    expect(mockBatchNotification.mock.calls[0]?.[1]).toBe(EMPLOYEE_USER)
  })

  it('annonce un retrait quand un créneau publié repasse en brouillon', async () => {
    await update('CONFIRMED', 'DRAFT')

    expect(sent()).toEqual({
      notifications: ['deleted'],
      batches: [],
      emails: ['deleted'],
    })
    expect(mockNotification.mock.calls[0]?.[1]).toBe(EMPLOYEE_USER)
  })
})

// ============================================================================
// updateScheduleStatus
// ============================================================================

describe('SP-618, updateScheduleStatus', () => {
  async function setStatus(before: Status, after: Status) {
    mockScheduleFindUnique.mockResolvedValue(schedule(before))
    mockScheduleUpdate.mockResolvedValue(schedule(after))
    const result = await updateScheduleStatus(SCHEDULE, after)
    await flush()
    return result
  }

  it('annonce une publication quand le brouillon est confirmé', async () => {
    const result = await setStatus('DRAFT', 'CONFIRMED')

    expect(result.success).toBe(true)
    expect(sent()).toEqual({
      notifications: [],
      batches: ['created'],
      emails: ['created'],
    })
  })

  it('annonce un retrait quand un créneau publié repasse en brouillon', async () => {
    await setStatus('CONFIRMED', 'DRAFT')

    expect(sent()).toEqual({
      notifications: ['deleted'],
      batches: [],
      emails: ['deleted'],
    })
  })

  it.each([
    ['DRAFT', 'DRAFT'],
    ['CONFIRMED', 'CONFIRMED'],
  ] as const)(
    'ne prévient personne quand le statut ne change pas (%s vers %s)',
    async (before, after) => {
      await setStatus(before, after)

      expect(sent()).toEqual(NOTHING)
    }
  )
})

// ============================================================================
// deleteSchedule
// ============================================================================

describe('SP-618, deleteSchedule', () => {
  async function remove(status: Status) {
    mockScheduleFindUnique.mockResolvedValue(schedule(status))
    mockScheduleDelete.mockResolvedValue(schedule(status))
    const result = await deleteSchedule(SCHEDULE)
    await flush()
    return result
  }

  it('ne prévient personne pour un brouillon supprimé', async () => {
    const result = await remove('DRAFT')

    expect(result.success).toBe(true)
    expect(mockScheduleDelete).toHaveBeenCalledTimes(1)
    expect(sent()).toEqual(NOTHING)
  })

  it('prévient pour un créneau publié supprimé', async () => {
    await remove('CONFIRMED')

    expect(sent()).toEqual({
      notifications: ['deleted'],
      batches: [],
      emails: ['deleted'],
    })
  })

  it('choisit le destinataire dans l entreprise du créneau', async () => {
    await remove('CONFIRMED')

    expect(mockEmployeeFindFirst).toHaveBeenCalledWith({
      where: { id: EMPLOYEE, companyId: COMPANY },
      select: { userId: true, firstName: true, email: true },
    })
  })
})

// ============================================================================
// deleteScheduleGroup
// ============================================================================

describe('SP-618, deleteScheduleGroup', () => {
  async function removeGroup(statuses: Status[]) {
    mockScheduleFindMany.mockResolvedValue(
      statuses.map((status, index) =>
        schedule(status, { id: `groupe-${index}`, scheduleGroupId: 'g1' })
      )
    )
    mockScheduleDeleteMany.mockResolvedValue({ count: statuses.length })
    const result = await deleteScheduleGroup('g1')
    await flush()
    return result
  }

  it('ne prévient personne pour un groupe de brouillons', async () => {
    const result = await removeGroup(['DRAFT', 'DRAFT'])

    expect(result.success).toBe(true)
    expect(sent()).toEqual(NOTHING)
  })

  it('n annonce que les créneaux publiés d un groupe mixte', async () => {
    await removeGroup(['DRAFT', 'CONFIRMED', 'DRAFT', 'CONFIRMED'])

    expect(sent().batches).toEqual(['deleted'])
    expect(mockBatchNotification.mock.calls[0]?.[0].map((s) => s.id)).toEqual([
      'groupe-1',
      'groupe-3',
    ])
  })
})

// ============================================================================
// deleteRecurrenceGroup
// ============================================================================

describe('SP-618, deleteRecurrenceGroup', () => {
  async function removeSeries(statuses: Status[]) {
    const series = statuses.map((status, index) =>
      schedule(status, { id: `serie-${index}`, recurrenceGroupId: 'r1' })
    )
    mockScheduleFindUnique.mockResolvedValue(series[0])
    mockScheduleFindMany.mockResolvedValue(series)
    mockScheduleDeleteMany.mockResolvedValue({ count: series.length })
    const result = await deleteRecurrenceGroup('serie-0')
    await flush()
    return result
  }

  it('ne prévient personne pour une série de brouillons', async () => {
    const result = await removeSeries(['DRAFT', 'DRAFT', 'DRAFT'])

    expect(result.success).toBe(true)
    expect(sent()).toEqual(NOTHING)
  })

  it('n annonce que les créneaux publiés d une série mixte', async () => {
    await removeSeries(['CONFIRMED', 'DRAFT', 'CONFIRMED'])

    expect(sent().batches).toEqual(['deleted'])
    expect(mockBatchNotification.mock.calls[0]?.[0].map((s) => s.id)).toEqual([
      'serie-0',
      'serie-2',
    ])
  })
})

// ============================================================================
// updateRecurrenceGroup
// ============================================================================

describe('SP-618, updateRecurrenceGroup', () => {
  async function updateSeries(
    statuses: Status[],
    input: { startTime?: string; status?: string }
  ) {
    const series = statuses.map((status, index) =>
      schedule(status, { id: `serie-${index}`, recurrenceGroupId: 'r1' })
    )
    mockScheduleFindUnique.mockResolvedValue(series[0])
    // La série d'abord, puis les autres créneaux de l'employé que SP-628
    // cherche pour les chevauchements : aucun ici
    mockScheduleFindMany.mockResolvedValueOnce(series).mockResolvedValue([])
    mockScheduleUpdateMany.mockResolvedValue({ count: series.length })
    const result = await updateRecurrenceGroup('clserie000000000000', input)
    await flush()
    return result
  }

  it('ne prévient personne pour une série de brouillons modifiée', async () => {
    const result = await updateSeries(['DRAFT', 'DRAFT'], {
      startTime: '10:00',
    })

    expect(result.success).toBe(true)
    expect(sent()).toEqual(NOTHING)
  })

  it('n annonce que les créneaux publiés d une série mixte modifiée', async () => {
    await updateSeries(['CONFIRMED', 'DRAFT', 'CONFIRMED'], {
      startTime: '10:00',
    })

    expect(sent()).toEqual({
      notifications: [],
      batches: ['updated'],
      emails: [],
    })
    const [announced] = mockBatchNotification.mock.calls[0] ?? []
    expect(announced?.map((s) => s.id)).toEqual(['serie-0', 'serie-2'])
    expect(announced?.every((s) => s.startTime === '10:00')).toBe(true)
  })

  it('annonce une publication quand la série de brouillons est confirmée', async () => {
    await updateSeries(['DRAFT', 'DRAFT'], { status: 'CONFIRMED' })

    expect(sent()).toEqual({
      notifications: [],
      batches: ['created'],
      emails: ['created'],
    })
    expect(mockBatchNotification.mock.calls[0]?.[0]).toHaveLength(2)
  })

  it('annonce un retrait quand une série publiée repasse en brouillon', async () => {
    await updateSeries(['CONFIRMED', 'CONFIRMED'], { status: 'DRAFT' })

    expect(sent().batches).toEqual(['deleted'])
  })

  it('range chaque créneau d une série mixte que l on confirme', async () => {
    // Le brouillon est publié, le créneau déjà publié est modifié
    await updateSeries(['DRAFT', 'CONFIRMED'], {
      status: 'CONFIRMED',
      startTime: '10:00',
    })

    expect([...sent().batches].sort()).toEqual(['created', 'updated'])
    const byAction = new Map(
      mockBatchNotification.mock.calls.map((call) => [
        call[2],
        call[0].map((s) => s.id),
      ])
    )
    expect(byAction.get('created')).toEqual(['serie-0'])
    expect(byAction.get('updated')).toEqual(['serie-1'])
  })
})
