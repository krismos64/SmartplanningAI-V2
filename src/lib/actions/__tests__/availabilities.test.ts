/**
 * Tests unitaires pour les Server Actions Availabilities
 *
 * @description Tests CRUD avec simulation RBAC
 * @ticket SP-401
 */

/* eslint-disable @typescript-eslint/unbound-method */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAvailabilities,
  getAvailabilityById,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getEmployeeAvailabilities,
  getTeamAvailabilities,
  getAvailabilitiesStats,
} from '../availabilities'
import type { AvailabilityWithRelations } from '../availabilities'

// ============================================================================
// Mocks
// ============================================================================

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    availability: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    team: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
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

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// ============================================================================
// Helpers
// ============================================================================

// Helper pour créer une session mock
function mockSession(
  role: string,
  companyId: string | null = 'clxxxxxxxxxxxxxxxxxx2'
) {
  return {
    user: {
      id: 'user1',
      role,
      companyId,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } as never
}

// ============================================================================
// Données de test
// ============================================================================

const mockAvailability: AvailabilityWithRelations = {
  id: 'clxxxxxxxxxxxxxxxxxx4',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  startTime: null,
  endTime: null,
  type: 'VACATION',
  reason: 'Vacances annuelles',
  isRecurring: false,
  recurrenceRule: null,
  employeeId: 'clxxxxxxxxxxxxxxxxxx1',
  companyId: 'clxxxxxxxxxxxxxxxxxx2',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'clxxxxxxxxxxxxxxxxxx1',
    firstName: 'Jean',
    lastName: 'Dupont',
  },
}

const validInput = {
  employeeId: 'clxxxxxxxxxxxxxxxxxx1',
  companyId: 'clxxxxxxxxxxxxxxxxxx2',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  type: 'VACATION' as const,
  isRecurring: false,
}

// ============================================================================
// Tests
// ============================================================================

describe('Availabilities Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // getAvailabilities
  // ==========================================================================

  describe('getAvailabilities', () => {
    it('retourne une erreur si non authentifié', async () => {
      vi.mocked(auth).mockResolvedValue(null as never)

      const result = await getAvailabilities()

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('connecté')
      }
    })

    it('retourne les availabilities pour un DIRECTOR', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockAvailability], 1])

      const result = await getAvailabilities()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.availabilities).toHaveLength(1)
        expect(result.data.total).toBe(1)
      }
    })

    it('accepte les filtres de pagination', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockAvailability], 1])

      const result = await getAvailabilities({
        page: 2,
        limit: 10,
        sortBy: 'type',
        sortOrder: 'desc',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(10)
      }
    })
  })

  // ==========================================================================
  // getAvailabilityById
  // ==========================================================================

  describe('getAvailabilityById', () => {
    it('retourne une erreur si non authentifié', async () => {
      vi.mocked(auth).mockResolvedValue(null as never)

      const result = await getAvailabilityById('clxxxxxxxxxxxxxxxxxx4')

      expect(result.success).toBe(false)
    })

    it('retourne une erreur si availability non trouvée', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.availability.findUnique).mockResolvedValue(null)

      const result = await getAvailabilityById('invalid-id')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non trouvée')
      }
    })

    it('retourne availability pour un DIRECTOR de la même company', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.availability.findUnique).mockResolvedValue(
        mockAvailability as unknown as Awaited<
          ReturnType<typeof prisma.availability.findUnique>
        >
      )

      const result = await getAvailabilityById('clxxxxxxxxxxxxxxxxxx4')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('clxxxxxxxxxxxxxxxxxx4')
      }
    })
  })

  // ==========================================================================
  // createAvailability
  // ==========================================================================

  describe('createAvailability', () => {
    it('retourne une erreur si non authentifié', async () => {
      vi.mocked(auth).mockResolvedValue(null as never)

      const result = await createAvailability(validInput)

      expect(result.success).toBe(false)
    })

    it('refuse création pour SYSTEM_ADMIN', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('SYSTEM_ADMIN', null))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)

      const result = await createAvailability(validInput)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisée')
      }
    })

    it('crée availability pour un DIRECTOR', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        id: 'clxxxxxxxxxxxxxxxxxx1',
        companyId: 'clxxxxxxxxxxxxxxxxxx2',
        teamId: 'clxxxxxxxxxxxxxxxxxx3',
        firstName: 'Jean',
        lastName: 'Dupont',
        managedTeams: [],
      } as unknown as Awaited<ReturnType<typeof prisma.employee.findUnique>>)
      vi.mocked(prisma.availability.create).mockResolvedValue(
        mockAvailability as unknown as Awaited<
          ReturnType<typeof prisma.availability.create>
        >
      )

      const result = await createAvailability(validInput)

      expect(result.success).toBe(true)
      expect(prisma.availability.create).toHaveBeenCalled()
    })

    it('rejette si company différente', async () => {
      vi.mocked(auth).mockResolvedValue(
        mockSession('DIRECTOR', 'different-company')
      )
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)

      const result = await createAvailability(validInput)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('entreprise')
      }
    })
  })

  // ==========================================================================
  // updateAvailability
  // ==========================================================================

  describe('updateAvailability', () => {
    const updateInput = {
      id: 'clxxxxxxxxxxxxxxxxxx4',
      reason: 'Mise à jour',
    }

    it('retourne une erreur si non authentifié', async () => {
      vi.mocked(auth).mockResolvedValue(null as never)

      const result = await updateAvailability(updateInput)

      expect(result.success).toBe(false)
    })

    it('retourne une erreur si availability non trouvée', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.availability.findUnique).mockResolvedValue(null)

      const result = await updateAvailability(updateInput)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non trouvée')
      }
    })

    it('DIRECTOR peut modifier toute availability de sa company', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.availability.findUnique).mockResolvedValue(
        mockAvailability as unknown as Awaited<
          ReturnType<typeof prisma.availability.findUnique>
        >
      )
      vi.mocked(prisma.availability.update).mockResolvedValue({
        ...mockAvailability,
        reason: 'Mise à jour',
      } as unknown as Awaited<ReturnType<typeof prisma.availability.update>>)

      const result = await updateAvailability(updateInput)

      expect(result.success).toBe(true)
      expect(prisma.availability.update).toHaveBeenCalled()
    })

    it('SYSTEM_ADMIN ne peut pas modifier', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('SYSTEM_ADMIN', null))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.availability.findUnique).mockResolvedValue(
        mockAvailability as unknown as Awaited<
          ReturnType<typeof prisma.availability.findUnique>
        >
      )

      const result = await updateAvailability(updateInput)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisée')
      }
    })
  })

  // ==========================================================================
  // deleteAvailability
  // ==========================================================================

  describe('deleteAvailability', () => {
    it('retourne une erreur si non authentifié', async () => {
      vi.mocked(auth).mockResolvedValue(null as never)

      const result = await deleteAvailability('clxxxxxxxxxxxxxxxxxx4')

      expect(result.success).toBe(false)
    })

    it('retourne une erreur si availability non trouvée', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.availability.findUnique).mockResolvedValue(null)

      const result = await deleteAvailability('invalid-id')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non trouvée')
      }
    })

    it('DIRECTOR peut supprimer toute availability de sa company', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.availability.findUnique).mockResolvedValue(
        mockAvailability as unknown as Awaited<
          ReturnType<typeof prisma.availability.findUnique>
        >
      )
      vi.mocked(prisma.availability.delete).mockResolvedValue(
        mockAvailability as unknown as Awaited<
          ReturnType<typeof prisma.availability.delete>
        >
      )

      const result = await deleteAvailability('clxxxxxxxxxxxxxxxxxx4')

      expect(result.success).toBe(true)
      expect(prisma.availability.delete).toHaveBeenCalledWith({
        where: { id: 'clxxxxxxxxxxxxxxxxxx4' },
      })
    })
  })

  // ==========================================================================
  // getEmployeeAvailabilities
  // ==========================================================================

  describe('getEmployeeAvailabilities', () => {
    const startDate = new Date('2026-02-01')
    const endDate = new Date('2026-02-28')

    it('retourne les availabilities pour une période', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        id: 'clxxxxxxxxxxxxxxxxxx1',
        companyId: 'clxxxxxxxxxxxxxxxxxx2',
        teamId: 'clxxxxxxxxxxxxxxxxxx3',
        managedTeams: [],
      } as unknown as Awaited<ReturnType<typeof prisma.employee.findUnique>>)
      vi.mocked(prisma.availability.findMany).mockResolvedValue([
        mockAvailability,
      ] as unknown as Awaited<ReturnType<typeof prisma.availability.findMany>>)

      const result = await getEmployeeAvailabilities(
        'clxxxxxxxxxxxxxxxxxx1',
        startDate,
        endDate
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })
  })

  // ==========================================================================
  // getTeamAvailabilities
  // ==========================================================================

  describe('getTeamAvailabilities', () => {
    const startDate = new Date('2026-02-01')
    const endDate = new Date('2026-02-28')

    it('DIRECTOR peut voir les availabilities de toute équipe', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: 'clxxxxxxxxxxxxxxxxxx3',
        companyId: 'clxxxxxxxxxxxxxxxxxx2',
      } as unknown as Awaited<ReturnType<typeof prisma.team.findUnique>>)
      vi.mocked(prisma.availability.findMany).mockResolvedValue([
        mockAvailability,
      ] as unknown as Awaited<ReturnType<typeof prisma.availability.findMany>>)

      const result = await getTeamAvailabilities(
        'clxxxxxxxxxxxxxxxxxx3',
        startDate,
        endDate
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })

    it('EMPLOYEE ne peut pas voir les availabilities équipe', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('EMPLOYEE'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        id: 'emp1',
        managedTeams: [],
      } as unknown as Awaited<ReturnType<typeof prisma.employee.findUnique>>)
      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: 'clxxxxxxxxxxxxxxxxxx3',
        companyId: 'clxxxxxxxxxxxxxxxxxx2',
      } as unknown as Awaited<ReturnType<typeof prisma.team.findUnique>>)

      const result = await getTeamAvailabilities(
        'clxxxxxxxxxxxxxxxxxx3',
        startDate,
        endDate
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisé')
      }
    })
  })

  // ==========================================================================
  // getAvailabilitiesStats
  // ==========================================================================

  describe('getAvailabilitiesStats', () => {
    const startDate = new Date('2026-02-01')
    const endDate = new Date('2026-02-28')

    it('DIRECTOR peut voir les stats', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('DIRECTOR'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.availability.groupBy).mockResolvedValue([
        { type: 'VACATION', _count: { id: 5 } },
        { type: 'SICK', _count: { id: 2 } },
      ] as unknown as Awaited<ReturnType<typeof prisma.availability.groupBy>>)

      const result = await getAvailabilitiesStats(
        'clxxxxxxxxxxxxxxxxxx2',
        startDate,
        endDate
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.VACATION).toBe(5)
        expect(result.data.SICK).toBe(2)
        expect(result.data.TRAINING).toBe(0)
      }
    })

    it('EMPLOYEE ne peut pas voir les stats globales', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession('EMPLOYEE'))
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        id: 'emp1',
        managedTeams: [],
      } as unknown as Awaited<ReturnType<typeof prisma.employee.findUnique>>)

      const result = await getAvailabilitiesStats(
        'clxxxxxxxxxxxxxxxxxx2',
        startDate,
        endDate
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('non autorisé')
      }
    })
  })
})
