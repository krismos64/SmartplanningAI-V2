/**
 * Changer les horaires d'une série ne recouvre plus un autre créneau (SP-628)
 *
 * `updateRecurrenceGroup` réécrivait les horaires de toute la série par un
 * seul `updateMany`, sans vérifier les conflits. Ces tests posent une série
 * hebdomadaire et un créneau isolé sur l'une de ses dates, sur une vraie
 * base, puis comptent ce qui y est réellement.
 *
 * @ticket SP-628
 */

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const session = vi.hoisted(() => ({
  user: { id: '', role: 'DIRECTOR', companyId: '' },
}))

vi.mock('@/lib/auth', () => ({ auth: vi.fn(() => Promise.resolve(session)) }))
vi.mock('@/lib/impersonation', () => ({
  assertNotImpersonating: vi.fn(() => Promise.resolve(null)),
  getEffectiveSessionData: vi.fn(() =>
    Promise.resolve({
      userId: session.user.id,
      role: session.user.role,
      companyId: session.user.companyId,
    })
  ),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/actions/notifications', () => ({
  createPlanningNotification: vi.fn(() => Promise.resolve({ success: true })),
  createBatchPlanningNotification: vi.fn(() =>
    Promise.resolve({ success: true })
  ),
}))
vi.mock('@/lib/services/audit', () => ({
  logAuditAction: vi.fn(() => Promise.resolve()),
}))
vi.mock('@/lib/services/funnel-milestones.service', () => ({
  trackFirstScheduleIfApplicable: vi.fn(() => Promise.resolve()),
}))
vi.mock('@/lib/cache', () => ({
  invalidateDashboardCache: vi.fn(() => Promise.resolve()),
}))

import { prisma } from '@/lib/prisma'
import { createSchedule, updateRecurrenceGroup } from '@/lib/actions/schedules'

const DAY = new Date('2031-06-02T00:00:00.000Z')
const WEEK_LATER = new Date('2031-06-09T00:00:00.000Z')

/** Tours de la course simultanée */
const ROUNDS = 15

let companyId = ''
let employeeId = ''
let seriesReferenceId = ''

function slot(startTime: string, endTime: string, date = DAY) {
  return {
    companyId,
    employeeId,
    startDate: date,
    endDate: date,
    startTime,
    endTime,
    type: 'WORK' as const,
    status: 'DRAFT' as const,
    isRecurring: false,
  }
}

async function createWeeklySeries(): Promise<string> {
  const result = await createSchedule({
    ...slot('07:00', '12:00'),
    isRecurring: true,
    recurrenceRule: { frequency: 'WEEKLY', interval: 1, occurrences: 3 },
  })
  if (!result.success) throw new Error(`Série non créée : ${result.error}`)
  expect(result.data).toHaveLength(3)
  return result.data[0]!.id
}

function seriesTimes() {
  return prisma.schedule.findMany({
    where: { employeeId, recurrenceGroupId: { not: null } },
    select: { startTime: true, endTime: true },
  })
}

function overlapsInDatabase() {
  return prisma.$queryRaw<{ n: bigint }[]>`
    SELECT count(*) AS n FROM schedules a JOIN schedules b
      ON a."employeeId" = b."employeeId" AND a.id < b.id
     AND a."startDate" <= b."endDate" AND b."startDate" <= a."endDate"
     AND a."startTime" < b."endTime" AND b."startTime" < a."endTime"
     WHERE a."employeeId" = ${employeeId}`
}

beforeAll(async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const company = await prisma.company.create({
    data: { name: 'SP-628 séries', slug: `sp628-series-${suffix}` },
  })
  companyId = company.id
  const employee = await prisma.employee.create({
    data: { firstName: 'Serge', lastName: 'Série', companyId },
  })
  employeeId = employee.id
  session.user = { id: `sp628-director-${suffix}`, role: 'DIRECTOR', companyId }
})

beforeEach(async () => {
  await prisma.leaveRequest.deleteMany({ where: { companyId } })
  await prisma.schedule.deleteMany({ where: { companyId } })
  seriesReferenceId = await createWeeklySeries()
})

afterAll(async () => {
  if (companyId) await prisma.company.delete({ where: { id: companyId } })
  await prisma.$disconnect()
})

describe('SP-628, horaires d’une série', () => {
  it('refuse un horaire qui recouvrirait un créneau isolé, et n’écrit rien', async () => {
    const meeting = await createSchedule(slot('14:00', '15:00', WEEK_LATER))
    expect(meeting.success).toBe(true)

    const result = await updateRecurrenceGroup(seriesReferenceId, {
      startTime: '09:00',
      endTime: '17:00',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('14:00 à 15:00')
    }
    const times = await seriesTimes()
    expect(
      times.every((t) => t.startTime === '07:00' && t.endTime === '12:00')
    ).toBe(true)
    expect((await overlapsInDatabase())[0]?.n).toBe(0n)
  })

  it('accepte un horaire qui ne recouvre rien', async () => {
    await createSchedule(slot('14:00', '15:00', WEEK_LATER))

    const result = await updateRecurrenceGroup(seriesReferenceId, {
      startTime: '07:00',
      endTime: '13:00',
    })

    expect(result.success).toBe(true)
    const times = await seriesTimes()
    expect(times).toHaveLength(3)
    expect(times.every((t) => t.endTime === '13:00')).toBe(true)
  })

  it('un passage en repos (journée entière) compte comme un chevauchement', async () => {
    await createSchedule(slot('14:00', '15:00', WEEK_LATER))

    const result = await updateRecurrenceGroup(seriesReferenceId, {
      type: 'REST',
    })

    expect(result.success).toBe(false)
  })

  it('un congé approuvé après la série ne bloque pas un changement d’horaire', async () => {
    await prisma.leaveRequest.create({
      data: {
        employeeId,
        companyId,
        startDate: WEEK_LATER,
        endDate: WEEK_LATER,
        days: 1,
        status: 'APPROVED',
      },
    })

    const result = await updateRecurrenceGroup(seriesReferenceId, {
      endTime: '11:00',
    })

    expect(result.success).toBe(true)
  })

  it('un changement de série et une création simultanés : un seul passe', async () => {
    // Les lectures qui précèdent chaque action décalent les deux appels : un
    // seul essai atteint rarement la fenêtre de course. Plusieurs tours,
    // chacun sur un état neuf, la rendent reproductible sans le verrou.
    for (let round = 0; round < ROUNDS; round++) {
      await prisma.schedule.deleteMany({ where: { companyId } })
      seriesReferenceId = await createWeeklySeries()

      const [series, meeting] = await Promise.all([
        updateRecurrenceGroup(seriesReferenceId, {
          startTime: '09:00',
          endTime: '17:00',
        }),
        createSchedule(slot('14:00', '15:00', WEEK_LATER)),
      ])

      expect([series.success, meeting.success].filter(Boolean)).toHaveLength(1)
      expect((await overlapsInDatabase())[0]?.n).toBe(0n)
    }
  })
})
