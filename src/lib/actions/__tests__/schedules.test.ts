/**
 * Tests unitaires pour les Server Actions Schedules
 *
 * @ticket SP-394
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  deleteScheduleGroup,
  duplicateSchedule,
  updateScheduleStatus,
  getEmployeeSchedules,
  getTeamSchedules,
} from '../schedules'

// Mock des dependances
vi.mock('@/lib/prisma', () => ({
  prisma: {
    schedule: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    employee: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    team: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// ============================================================================
// Helpers de test
// ============================================================================

const mockEmployee = (overrides = {}) => ({
  id: 'clxxxxxxxxxxxxxxxxxx1',
  firstName: 'Jean',
  lastName: 'Dupont',
  companyId: 'clcompany0000000001',
  teams: [{ id: 'clteam00000000000001' }],
  managedTeams: [],
  ...overrides,
})

const mockSchedule = (overrides = {}) => ({
  id: 'clschedule000000001',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-01'),
  startTime: '09:00',
  endTime: '17:00',
  type: 'WORK',
  status: 'DRAFT',
  title: null,
  description: null,
  location: null,
  color: '#10B981',
  isRecurring: false,
  recurrenceRule: null,
  recurrenceGroupId: null,
  scheduleGroupId: null,
  employeeId: 'clxxxxxxxxxxxxxxxxxx1',
  teamId: 'clteam00000000000001',
  companyId: 'clcompany0000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'clxxxxxxxxxxxxxxxxxx1',
    firstName: 'Jean',
    lastName: 'Dupont',
  },
  team: {
    id: 'clteam00000000000001',
    name: 'Equipe A',
  },
  ...overrides,
})

const mockSession = (role: string, companyId: string | null = 'clcompany0000000001') => ({
  user: {
    id: 'cluser00000000000001',
    email: 'user@test.com',
    role,
    companyId,
  },
})

// ============================================================================
// Tests
// ============================================================================

describe('schedules actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // getSchedules
  // ==========================================================================

  describe('getSchedules', () => {
    it('retourne une erreur si non authentifie', async () => {
      vi.mocked(auth).mockResolvedValue(null as never)

      const result = await getSchedules({})

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Vous devez être connecté pour effectuer cette action')
      }
    })

    it('retourne les schedules pour un DIRECTOR', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.$transaction).mockResolvedValue([
        [mockSchedule()],
        1,
      ])

      const result = await getSchedules({})

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.schedules).toHaveLength(1)
        expect(result.data.total).toBe(1)
      }
    })

    it('filtre les schedules pour un EMPLOYEE', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('EMPLOYEE') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(
        mockEmployee({ id: 'empId' }) as never
      )
      vi.mocked(prisma.$transaction).mockResolvedValue([[], 0])

      const result = await getSchedules({})

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.schedules).toHaveLength(0)
      }
    })

    it('filtre par type', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.$transaction).mockResolvedValue([
        [mockSchedule({ type: 'MEETING' })],
        1,
      ])

      const result = await getSchedules({ type: 'MEETING' })

      expect(result.success).toBe(true)
    })

    it('applique la pagination', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.$transaction).mockResolvedValue([
        [mockSchedule()],
        50,
      ])

      const result = await getSchedules({ page: 2, limit: 10 })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(10)
        expect(result.data.totalPages).toBe(5)
      }
    })
  })

  // ==========================================================================
  // getScheduleById
  // ==========================================================================

  describe('getScheduleById', () => {
    it('retourne le schedule si autorise', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)

      const result = await getScheduleById('clschedule000000001')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('clschedule000000001')
      }
    })

    it('retourne une erreur si non trouve', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(null)

      const result = await getScheduleById('invalid')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Planning non trouvé')
      }
    })

    it('refuse acces si company differente', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR', 'otherCompany') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)

      const result = await getScheduleById('clschedule000000001')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Accès non autorisé')
      }
    })
  })

  // ==========================================================================
  // createSchedule
  // ==========================================================================

  describe('createSchedule', () => {
    const validInput = {
      employeeId: 'clxxxxxxxxxxxxxxxxxx1',
      companyId: 'clcompany0000000001',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-01'),
      startTime: '09:00',
      endTime: '17:00',
      type: 'WORK' as const,
      status: 'DRAFT' as const,
      isRecurring: false,
    }

    it('refuse la creation pour un EMPLOYEE', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('EMPLOYEE') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(
        mockEmployee() as never
      )

      const result = await createSchedule(validInput)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('ne pouvez pas créer')
      }
    })

    it('refuse la creation pour un SYSTEM_ADMIN', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('SYSTEM_ADMIN', null) as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)

      const result = await createSchedule(validInput)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisée')
      }
    })

    it('cree un schedule pour un DIRECTOR', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        mockEmployee() as never,
      ])
      vi.mocked(prisma.$transaction).mockResolvedValue([mockSchedule()])

      const result = await createSchedule(validInput)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })

    it('cree plusieurs schedules avec employeeIds', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        mockEmployee({ id: 'clemployee00000000001' }) as never,
        mockEmployee({ id: 'clemployee00000000002' }) as never,
      ])
      vi.mocked(prisma.$transaction).mockResolvedValue([
        mockSchedule({ employeeId: 'clemployee00000000001' }),
        mockSchedule({ employeeId: 'clemployee00000000002' }),
      ])

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { employeeId: _, ...inputWithoutEmployeeId } = validInput
      const result = await createSchedule({
        ...inputWithoutEmployeeId,
        employeeIds: ['clemployee00000000001', 'clemployee00000000002'],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
      }
    })

    it('refuse si employe invalide', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.employee.findMany).mockResolvedValue([])

      const result = await createSchedule(validInput)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('employés sont invalides')
      }
    })

    it('refuse si company differente', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR', 'otherCompany') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)

      const result = await createSchedule(validInput)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisé')
      }
    })
  })

  // ==========================================================================
  // updateSchedule
  // ==========================================================================

  describe('updateSchedule', () => {
    it('refuse la modification pour un EMPLOYEE', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('EMPLOYEE') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(
        mockEmployee() as never
      )
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)

      const result = await updateSchedule({
        id: 'clschedule000000001',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisée')
      }
    })

    it('modifie un schedule pour un DIRECTOR', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)
      vi.mocked(prisma.schedule.update).mockResolvedValue(
        mockSchedule({ title: 'Updated' }) as never
      )

      const result = await updateSchedule({
        id: 'clschedule000000001',
        title: 'Updated',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('Updated')
      }
    })

    it('retourne erreur si schedule non trouve', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(null)

      const result = await updateSchedule({
        id: 'clinvalidxxxxxxxxxx1',
        title: 'Updated',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Planning non trouvé')
      }
    })
  })

  // ==========================================================================
  // deleteSchedule
  // ==========================================================================

  describe('deleteSchedule', () => {
    it('supprime un schedule pour un DIRECTOR', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)
      vi.mocked(prisma.schedule.delete).mockResolvedValue(mockSchedule() as never)

      const result = await deleteSchedule('clschedule000000001')

      expect(result.success).toBe(true)
    })

    it('refuse pour un EMPLOYEE', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('EMPLOYEE') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(
        mockEmployee() as never
      )
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)

      const result = await deleteSchedule('clschedule000000001')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisée')
      }
    })
  })

  // ==========================================================================
  // deleteScheduleGroup
  // ==========================================================================

  describe('deleteScheduleGroup', () => {
    it('supprime un groupe de schedules', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findMany).mockResolvedValue([
        mockSchedule({ scheduleGroupId: 'group1' }) as never,
        mockSchedule({ scheduleGroupId: 'group1', id: 'sch2' }) as never,
      ])
      vi.mocked(prisma.schedule.deleteMany).mockResolvedValue({ count: 2 })

      const result = await deleteScheduleGroup('group1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.deletedCount).toBe(2)
      }
    })

    it('retourne erreur si groupe vide', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findMany).mockResolvedValue([])

      const result = await deleteScheduleGroup('invalidGroup')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Aucun planning')
      }
    })
  })

  // ==========================================================================
  // duplicateSchedule
  // ==========================================================================

  describe('duplicateSchedule', () => {
    it('duplique un schedule avec decalage', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        mockEmployee() as never,
      ])
      vi.mocked(prisma.$transaction).mockResolvedValue([
        mockSchedule({ id: 'newSchedule' }),
      ])

      const result = await duplicateSchedule('clschedule000000001', { shiftDays: 7 })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })

    it('refuse pour un EMPLOYEE', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('EMPLOYEE') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(
        mockEmployee() as never
      )

      const result = await duplicateSchedule('clschedule000000001')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisée')
      }
    })
  })

  // ==========================================================================
  // updateScheduleStatus
  // ==========================================================================

  describe('updateScheduleStatus', () => {
    it('change le statut en CONFIRMED', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)
      vi.mocked(prisma.schedule.update).mockResolvedValue(
        mockSchedule({ status: 'CONFIRMED' }) as never
      )

      const result = await updateScheduleStatus('clschedule000000001', 'CONFIRMED')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('CONFIRMED')
      }
    })

    it('change le statut en CANCELLED', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.schedule.findUnique).mockResolvedValue(mockSchedule() as never)
      vi.mocked(prisma.schedule.update).mockResolvedValue(
        mockSchedule({ status: 'CANCELLED' }) as never
      )

      const result = await updateScheduleStatus('clschedule000000001', 'CANCELLED')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('CANCELLED')
      }
    })
  })

  // ==========================================================================
  // getEmployeeSchedules
  // ==========================================================================

  describe('getEmployeeSchedules', () => {
    it('retourne les schedules d\'un employe', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(
        mockEmployee() as never
      )
      vi.mocked(prisma.schedule.findMany).mockResolvedValue([
        mockSchedule() as never,
      ])

      const result = await getEmployeeSchedules(
        'clxxxxxxxxxxxxxxxxxx1',
        new Date('2026-02-01'),
        new Date('2026-02-28')
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })

    it('retourne erreur si employe non trouve', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      // First call for getAuthenticatedUser (returns null = no employee linked)
      // Second call in getEmployeeSchedules (returns null = employee not found)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)

      const result = await getEmployeeSchedules(
        'clinvalidxxxxxxxxxx1',
        new Date('2026-02-01'),
        new Date('2026-02-28')
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Employé non trouvé')
      }
    })
  })

  // ==========================================================================
  // getTeamSchedules
  // ==========================================================================

  describe('getTeamSchedules', () => {
    it('retourne les schedules d\'une equipe', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: 'clteam00000000000001',
        companyId: 'clcompany0000000001',
      } as never)
      vi.mocked(prisma.schedule.findMany).mockResolvedValue([
        mockSchedule() as never,
      ])

      const result = await getTeamSchedules(
        'clteam00000000000001',
        new Date('2026-02-01'),
        new Date('2026-02-28')
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })

    it('retourne erreur si equipe non trouvee', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.team.findUnique).mockResolvedValue(null)

      const result = await getTeamSchedules(
        'clinvalidxxxxxxxxxx1',
        new Date('2026-02-01'),
        new Date('2026-02-28')
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Équipe non trouvée')
      }
    })

    it('refuse acces pour EMPLOYEE', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('EMPLOYEE') as never)
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(
        mockEmployee() as never
      )
      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: 'clteam00000000000001',
        companyId: 'clcompany0000000001',
      } as never)

      const result = await getTeamSchedules(
        'clteam00000000000001',
        new Date('2026-02-01'),
        new Date('2026-02-28')
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisé')
      }
    })
  })
})
