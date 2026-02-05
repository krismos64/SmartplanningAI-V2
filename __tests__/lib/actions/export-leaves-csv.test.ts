/**
 * Tests unitaires pour exportLeavesCsv
 *
 * @ticket SP-333
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportLeavesCsv } from '@/lib/actions/leaves'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findUnique: vi.fn(),
    },
    leaveRequest: {
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

describe('exportLeavesCsv', () => {
  const mockLeave = {
    startDate: new Date('2026-02-10'),
    endDate: new Date('2026-02-14'),
    days: 5,
    type: 'PAID_LEAVE',
    status: 'APPROVED',
    halfDay: false,
    halfDayPeriod: null,
    reason: 'Vacances',
    reviewedAt: new Date('2026-02-08T10:30:00'),
    employee: { firstName: 'Marie', lastName: 'Dupont' },
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

      const result = await exportLeavesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Non authentifié')
    })
  })

  // ============================================
  // RBAC
  // ============================================
  describe('RBAC', () => {
    it('EMPLOYEE exporte ses propres demandes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'EMPLOYEE', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
      } as never)

      mockPrisma.leaveRequest.findMany.mockResolvedValue([mockLeave] as never)

      await exportLeavesCsv()

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ employeeId: 'emp-1' }),
        })
      )
    })

    it('EMPLOYEE sans profil reçoit erreur', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'EMPLOYEE', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue(null)

      const result = await exportLeavesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Profil employé non trouvé')
    })

    it('DIRECTOR exporte son entreprise', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR', companyId: 'company-1' },
      } as never)

      mockPrisma.leaveRequest.findMany.mockResolvedValue([mockLeave] as never)

      await exportLeavesCsv()

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
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

      mockPrisma.leaveRequest.findMany.mockResolvedValue([mockLeave] as never)

      await exportLeavesCsv()

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
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

      const result = await exportLeavesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Vous ne gérez aucune équipe')
    })

    it('SYSTEM_ADMIN exporte tout', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'SYSTEM_ADMIN' },
      } as never)

      mockPrisma.leaveRequest.findMany.mockResolvedValue([mockLeave] as never)

      await exportLeavesCsv()

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
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

      mockPrisma.leaveRequest.findMany.mockResolvedValue([mockLeave] as never)
    })

    it('retourne un fichier CSV valide', async () => {
      const result = await exportLeavesCsv()

      expect(result.success).toBe(true)
      expect(result.data?.mimeType).toBe('text/csv;charset=utf-8')
      expect(result.data?.filename).toMatch(/^conges-export-.*\.csv$/)
    })

    it('contient les en-têtes français', async () => {
      const result = await exportLeavesCsv()

      expect(result.data?.data).toContain('Employé')
      expect(result.data?.data).toContain('Type')
      expect(result.data?.data).toContain('Date début')
      expect(result.data?.data).toContain('Date fin')
      expect(result.data?.data).toContain('Jours')
      expect(result.data?.data).toContain('Demi-journée')
      expect(result.data?.data).toContain('Période')
      expect(result.data?.data).toContain('Statut')
      expect(result.data?.data).toContain('Motif')
      expect(result.data?.data).toContain('Validé le')
    })

    it('contient les données des congés', async () => {
      const result = await exportLeavesCsv()

      expect(result.data?.data).toContain('Dupont Marie')
      expect(result.data?.data).toContain('5')
      expect(result.data?.data).toContain('Vacances')
    })

    it('formate les dates en DD/MM/YYYY', async () => {
      const result = await exportLeavesCsv()

      expect(result.data?.data).toContain('10/02/2026')
      expect(result.data?.data).toContain('14/02/2026')
    })

    it('traduit les types de congés', async () => {
      const result = await exportLeavesCsv()

      expect(result.data?.data).toContain('Congés payés')
    })

    it('traduit les statuts', async () => {
      const result = await exportLeavesCsv()

      expect(result.data?.data).toContain('Approuvé')
    })

    it('formate les booléens en Oui/Non', async () => {
      const result = await exportLeavesCsv()

      expect(result.data?.data).toContain('Non')
    })

    it('gère les demi-journées', async () => {
      mockPrisma.leaveRequest.findMany.mockResolvedValue([
        {
          ...mockLeave,
          halfDay: true,
          halfDayPeriod: 'AM',
          days: 0.5,
        },
      ] as never)

      const result = await exportLeavesCsv()

      expect(result.data?.data).toContain('Oui')
      expect(result.data?.data).toContain('Matin')
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

      mockPrisma.leaveRequest.findMany.mockResolvedValue([mockLeave] as never)
    })

    it('applique le filtre de date de début', async () => {
      await exportLeavesCsv({ startDate: '2026-01-01' })

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
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
      await exportLeavesCsv({ endDate: '2026-12-31' })

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              lte: expect.any(Date),
            }),
          }),
        })
      )
    })

    it('applique le filtre de statut', async () => {
      await exportLeavesCsv({ status: 'PENDING' })

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        })
      )
    })

    it('applique le filtre de type', async () => {
      await exportLeavesCsv({ type: 'RTT' })

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'RTT' }),
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

      mockPrisma.leaveRequest.findMany.mockResolvedValue([mockLeave] as never)
    })

    it('limite à 10000 résultats', async () => {
      await exportLeavesCsv()

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10000,
        })
      )
    })

    it('trie par date de début décroissante', async () => {
      await exportLeavesCsv()

      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ startDate: 'desc' }],
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

      mockPrisma.leaveRequest.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await exportLeavesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe("Erreur lors de l'export")
    })
  })
})
