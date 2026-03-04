/**
 * Tests unitaires pour exportSchedulesCsv
 *
 * @ticket SP-333
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportSchedulesCsv } from '@/lib/actions/schedules'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findUnique: vi.fn(),
    },
    schedule: {
      findMany: vi.fn(),
    },
  },
}))

// Mock Auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// Import après les mocks
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const mockAuth = vi.mocked(auth)
const mockPrisma = vi.mocked(prisma)

describe('exportSchedulesCsv', () => {
  const mockSchedule = {
    startDate: new Date('2026-02-02'),
    startTime: '09:00',
    endTime: '17:00',
    type: 'WORK',
    status: 'CONFIRMED',
    title: 'Sprint Review',
    location: 'Bureau',
    employee: { firstName: 'Marie', lastName: 'Dupont' },
    team: { name: 'Team Alpha' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // AUTHENTIFICATION
  // ============================================
  describe('Authentification', () => {
    it('retourne erreur si non authentifié', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await exportSchedulesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Vous devez être connecté pour effectuer cette action'
      )
    })
  })

  // ============================================
  // RBAC
  // ============================================
  describe('RBAC', () => {
    it('EMPLOYEE peut exporter ses schedules CONFIRMED', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'EMPLOYEE', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        teamId: 'team-1',
        managedTeams: [],
      } as never)

      mockPrisma.schedule.findMany.mockResolvedValue([mockSchedule] as never)

      const result = await exportSchedulesCsv()

      expect(result.success).toBe(true)
    })

    it('DIRECTOR exporte son entreprise', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue(null)
      mockPrisma.schedule.findMany.mockResolvedValue([mockSchedule] as never)

      await exportSchedulesCsv()

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: 'company-1' }),
        })
      )
    })

    it('MANAGER exporte ses équipes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'MANAGER', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        managedTeams: [{ id: 'team-1' }, { id: 'team-2' }],
      } as never)

      mockPrisma.schedule.findMany.mockResolvedValue([mockSchedule] as never)

      await exportSchedulesCsv()

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employee: { teamId: { in: ['team-1', 'team-2'] } },
          }),
        })
      )
    })

    it('MANAGER sans équipes reçoit erreur', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'MANAGER', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        managedTeams: [],
      } as never)

      const result = await exportSchedulesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Vous ne gérez aucune équipe')
    })

    it('SYSTEM_ADMIN exporte tout', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'SYSTEM_ADMIN' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue(null)
      mockPrisma.schedule.findMany.mockResolvedValue([mockSchedule] as never)

      await exportSchedulesCsv()

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      )
    })
  })

  // ============================================
  // EXPORT RÉUSSI
  // ============================================
  describe('Export réussi', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue(null)
      mockPrisma.schedule.findMany.mockResolvedValue([mockSchedule] as never)
    })

    it('retourne un fichier CSV valide', async () => {
      const result = await exportSchedulesCsv()

      expect(result.success).toBe(true)
      expect(result.data?.mimeType).toBe('text/csv;charset=utf-8')
      expect(result.data?.filename).toMatch(/^plannings-export-.*\.csv$/)
    })

    it('contient les en-têtes français', async () => {
      const result = await exportSchedulesCsv()

      expect(result.data?.data).toContain('Employé')
      expect(result.data?.data).toContain('Date')
      expect(result.data?.data).toContain('Jour')
      expect(result.data?.data).toContain('Début')
      expect(result.data?.data).toContain('Fin')
      expect(result.data?.data).toContain('Durée (h)')
      expect(result.data?.data).toContain('Type')
      expect(result.data?.data).toContain('Statut')
      expect(result.data?.data).toContain('Équipe')
    })

    it('contient les données des plannings', async () => {
      const result = await exportSchedulesCsv()

      expect(result.data?.data).toContain('Dupont Marie')
      expect(result.data?.data).toContain('09:00')
      expect(result.data?.data).toContain('17:00')
      expect(result.data?.data).toContain('Team Alpha')
      expect(result.data?.data).toContain('Sprint Review')
    })

    it('formate les dates en DD/MM/YYYY', async () => {
      const result = await exportSchedulesCsv()

      expect(result.data?.data).toContain('02/02/2026')
    })

    it('traduit les types de planning', async () => {
      const result = await exportSchedulesCsv()

      expect(result.data?.data).toContain('Travail')
    })

    it('traduit les statuts', async () => {
      const result = await exportSchedulesCsv()

      expect(result.data?.data).toContain('Confirme')
    })

    it('calcule la durée correctement', async () => {
      const result = await exportSchedulesCsv()

      // 17:00 - 09:00 = 8 heures
      expect(result.data?.data).toContain('8.0')
    })
  })

  // ============================================
  // FILTRES
  // ============================================
  describe('Filtres', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue(null)
      mockPrisma.schedule.findMany.mockResolvedValue([mockSchedule] as never)
    })

    it('applique le filtre de date de début', async () => {
      await exportSchedulesCsv({ startDate: '2026-01-01' })

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      )
    })

    it('applique le filtre de date de fin', async () => {
      await exportSchedulesCsv({ endDate: '2026-12-31' })

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              lte: expect.any(Date),
            }),
          }),
        })
      )
    })

    it('applique le filtre employeeId', async () => {
      await exportSchedulesCsv({ employeeId: 'emp-1' })

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ employeeId: 'emp-1' }),
        })
      )
    })
  })

  // ============================================
  // LIMITES ET ORDRE
  // ============================================
  describe('Limites et ordre', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue(null)
      mockPrisma.schedule.findMany.mockResolvedValue([mockSchedule] as never)
    })

    it('limite à 10000 résultats', async () => {
      await exportSchedulesCsv()

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10000,
        })
      )
    })

    it('trie par date puis heure de début', async () => {
      await exportSchedulesCsv()

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
        })
      )
    })
  })

  // ============================================
  // GESTION DES ERREURS
  // ============================================
  describe('Gestion des erreurs', () => {
    it("retourne erreur générique en cas d'exception", async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue(null)
      mockPrisma.schedule.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await exportSchedulesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe("Erreur lors de l'export")
    })
  })
})
