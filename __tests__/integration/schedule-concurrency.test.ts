/**
 * Créations et modifications simultanées d'un créneau, sur une vraie base
 *
 * Le 26 octobre 2026, deux exécutions E2E parallèles ont créé deux créneaux
 * identiques pour le même employé, à la même milliseconde : la vérification
 * des conflits lisait hors de la transaction qui écrivait. Ces tests lancent
 * les appels en même temps et comptent ce qui est réellement en base.
 *
 * Seuls l'authentification et les effets de bord (notifications, audit, cache,
 * analytics) sont remplacés. Prisma, le verrou et la vérification des
 * conflits tournent pour de vrai.
 *
 * @ticket SP-619
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
import { createSchedule, updateSchedule } from '@/lib/actions/schedules'

/** Nombre d'appels lancés ensemble : assez pour que la course se produise */
const PARALLEL_CALLS = 5

const DAY = new Date('2031-03-12T00:00:00.000Z')

let companyId = ''
let employeeA = ''
let employeeB = ''

function slot(employeeIds: string[], startTime: string, endTime: string) {
  return {
    companyId,
    employeeIds,
    startDate: DAY,
    endDate: DAY,
    startTime,
    endTime,
    type: 'WORK' as const,
    status: 'DRAFT' as const,
    isRecurring: false,
  }
}

function countSchedules(employeeId: string) {
  return prisma.schedule.count({ where: { employeeId, companyId } })
}

beforeAll(async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const company = await prisma.company.create({
    data: { name: 'SP-619 concurrence', slug: `sp619-concurrence-${suffix}` },
  })
  companyId = company.id
  const [a, b] = await Promise.all([
    prisma.employee.create({
      data: { firstName: 'Alice', lastName: 'Course', companyId },
    }),
    prisma.employee.create({
      data: { firstName: 'Bruno', lastName: 'Course', companyId },
    }),
  ])
  employeeA = a.id
  employeeB = b.id
  // Aucun utilisateur réel : un dirigeant sans fiche employé suffit à l'action
  session.user = { id: `sp619-director-${suffix}`, role: 'DIRECTOR', companyId }
})

beforeEach(async () => {
  await prisma.schedule.deleteMany({ where: { companyId } })
})

afterAll(async () => {
  // Cascade : employés et créneaux partent avec l'entreprise
  if (companyId) await prisma.company.delete({ where: { id: companyId } })
  await prisma.$disconnect()
})

describe('SP-619, créneaux posés en même temps', () => {
  it('cinq créations identiques et simultanées ne laissent qu’un créneau', async () => {
    const results = await Promise.all(
      Array.from({ length: PARALLEL_CALLS }, () =>
        createSchedule(slot([employeeA], '06:00', '21:00'))
      )
    )

    expect(await countSchedules(employeeA)).toBe(1)
    expect(results.filter((r) => r.success)).toHaveLength(1)
    // Les refusés reçoivent le message de conflit, pas une erreur technique
    for (const refused of results.filter((r) => !r.success)) {
      if (!refused.success) {
        expect(refused.error).toContain('a déjà un planning')
      }
    }
  })

  it('des créations qui se chevauchent sans être identiques sont aussi sérialisées', async () => {
    const results = await Promise.all([
      createSchedule(slot([employeeA], '08:00', '12:00')),
      createSchedule(slot([employeeA], '10:00', '14:00')),
      createSchedule(slot([employeeA], '11:00', '18:00')),
    ])

    expect(await countSchedules(employeeA)).toBe(1)
    expect(results.filter((r) => r.success)).toHaveLength(1)
  })

  it('deux créations groupées en ordre inverse ne s’interbloquent pas', async () => {
    const results = await Promise.all([
      createSchedule(slot([employeeA, employeeB], '09:00', '17:00')),
      createSchedule(slot([employeeB, employeeA], '09:00', '17:00')),
    ])

    // Postgres résout un interblocage en annulant l'une des deux : l'autre
    // réussit quand même. Seul le message du refusé distingue les deux cas.
    expect(results.filter((r) => r.success)).toHaveLength(1)
    const refused = results.find((r) => !r.success)
    expect(refused && !refused.success ? refused.error : '').toContain(
      'a déjà un planning'
    )
    expect(await countSchedules(employeeA)).toBe(1)
    expect(await countSchedules(employeeB)).toBe(1)
  })

  it('le verrou ne bloque pas des créneaux qui ne se chevauchent pas', async () => {
    const results = await Promise.all([
      createSchedule(slot([employeeA], '06:00', '10:00')),
      createSchedule(slot([employeeA], '10:00', '14:00')),
      createSchedule(slot([employeeB], '06:00', '10:00')),
    ])

    expect(results.every((r) => r.success)).toBe(true)
    expect(await countSchedules(employeeA)).toBe(2)
    expect(await countSchedules(employeeB)).toBe(1)
  })

  it('deux créneaux déplacés en même temps vers le même horaire : un seul y arrive', async () => {
    const [first, second] = await Promise.all([
      createSchedule(slot([employeeA], '06:00', '08:00')),
      createSchedule(slot([employeeA], '18:00', '20:00')),
    ])
    if (!first.success || !second.success) {
      throw new Error('Préparation : les deux créneaux auraient dû être créés')
    }
    const ids = [first.data[0].id, second.data[0].id]

    const results = await Promise.all(
      ids.map((id) =>
        updateSchedule({ id, startTime: '12:00', endTime: '14:00' })
      )
    )

    expect(results.filter((r) => r.success)).toHaveLength(1)
    const atNoon = await prisma.schedule.count({
      where: { employeeId: employeeA, startTime: '12:00' },
    })
    expect(atNoon).toBe(1)
  })

  it('une création et un déplacement simultanés vers le même horaire : un seul y arrive', async () => {
    const existing = await createSchedule(slot([employeeA], '06:00', '08:00'))
    if (!existing.success) {
      throw new Error('Préparation : le créneau aurait dû être créé')
    }

    const [moved, created] = await Promise.all([
      updateSchedule({
        id: existing.data[0].id,
        startTime: '15:00',
        endTime: '17:00',
      }),
      createSchedule(slot([employeeA], '15:00', '17:00')),
    ])

    expect([moved.success, created.success].filter(Boolean)).toHaveLength(1)
    const atThree = await prisma.schedule.count({
      where: { employeeId: employeeA, startTime: '15:00' },
    })
    expect(atThree).toBe(1)
  })
})
