/**
 * Tests unitaires pour exportEmployeesCsv
 *
 * @ticket SP-333
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportEmployeesCsv } from '@/lib/actions/employees'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findUnique: vi.fn(),
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

describe('exportEmployeesCsv', () => {
  const mockEmployee = {
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie@example.com',
    phone: '0612345678',
    jobTitle: 'Développeur',
    department: 'IT',
    hireDate: new Date('2023-03-15'),
    weeklyHours: 35,
    isActive: true,
    createdAt: new Date('2024-01-01'),
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

      const result = await exportEmployeesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Vous devez être connecté pour effectuer cette action'
      )
    })

    it('retourne erreur si session sans user id', async () => {
      mockAuth.mockResolvedValue({ user: {} } as never)

      const result = await exportEmployeesCsv()

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
    it("refuse l'accès aux EMPLOYEE", async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'EMPLOYEE', companyId: 'company-1' },
      } as never)

      const result = await exportEmployeesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe("Vous n'avez pas les permissions nécessaires")
    })

    it('DIRECTOR exporte son entreprise uniquement', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'DIRECTOR', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findMany.mockResolvedValue([mockEmployee] as never)

      await exportEmployeesCsv()

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: 'company-1' }),
        })
      )
    })

    it('MANAGER exporte ses équipes uniquement', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'MANAGER', companyId: 'company-1' },
      } as never)

      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        managedTeams: [{ id: 'team-1' }, { id: 'team-2' }],
      } as never)

      mockPrisma.employee.findMany.mockResolvedValue([mockEmployee] as never)

      await exportEmployeesCsv()

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teamId: { in: ['team-1', 'team-2'] },
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

      const result = await exportEmployeesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Vous ne gérez aucune équipe')
    })

    it('SYSTEM_ADMIN exporte tout sans filtre', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'SYSTEM_ADMIN' },
      } as never)

      mockPrisma.employee.findMany.mockResolvedValue([mockEmployee] as never)

      await exportEmployeesCsv()

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
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
      mockPrisma.employee.findMany.mockResolvedValue([mockEmployee] as never)
    })

    it('retourne un fichier CSV valide', async () => {
      const result = await exportEmployeesCsv()

      expect(result.success).toBe(true)
      expect(result.data?.mimeType).toBe('text/csv;charset=utf-8')
      expect(result.data?.filename).toMatch(/^employes-export-.*\.csv$/)
    })

    it('contient les en-têtes français', async () => {
      const result = await exportEmployeesCsv()

      expect(result.data?.data).toContain('Prénom')
      expect(result.data?.data).toContain('Nom')
      expect(result.data?.data).toContain('Email')
      expect(result.data?.data).toContain('Téléphone')
      expect(result.data?.data).toContain('Poste')
      expect(result.data?.data).toContain('Département')
      expect(result.data?.data).toContain('Équipe')
      expect(result.data?.data).toContain('Heures/semaine')
      expect(result.data?.data).toContain('Actif')
    })

    it('contient les données des employés', async () => {
      const result = await exportEmployeesCsv()

      expect(result.data?.data).toContain('Marie')
      expect(result.data?.data).toContain('Dupont')
      expect(result.data?.data).toContain('marie@example.com')
      expect(result.data?.data).toContain('Team Alpha')
    })

    it('formate les dates en DD/MM/YYYY', async () => {
      const result = await exportEmployeesCsv()

      expect(result.data?.data).toContain('15/03/2023')
    })

    it('formate les booléens en Oui/Non', async () => {
      const result = await exportEmployeesCsv()

      expect(result.data?.data).toContain('Oui')
    })

    it('inclut le BOM UTF-8', async () => {
      const result = await exportEmployeesCsv()

      expect(result.data?.data.startsWith('\uFEFF')).toBe(true)
    })

    it('utilise le séparateur point-virgule', async () => {
      const result = await exportEmployeesCsv()

      expect(result.data?.data).toContain(';')
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
      mockPrisma.employee.findMany.mockResolvedValue([mockEmployee] as never)
    })

    it('applique le filtre par équipe', async () => {
      await exportEmployeesCsv({ teamId: 'team-specific' })

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ teamId: 'team-specific' }),
        })
      )
    })

    it('applique le filtre isActive=true', async () => {
      await exportEmployeesCsv({ isActive: true })

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      )
    })

    it('applique le filtre isActive=false', async () => {
      await exportEmployeesCsv({ isActive: false })

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        })
      )
    })

    it('combine plusieurs filtres', async () => {
      await exportEmployeesCsv({ teamId: 'team-1', isActive: true })

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teamId: 'team-1',
            isActive: true,
          }),
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
      mockPrisma.employee.findMany.mockResolvedValue([mockEmployee] as never)
    })

    it('limite à 10000 résultats', async () => {
      await exportEmployeesCsv()

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10000,
        })
      )
    })

    it('trie par nom puis prénom', async () => {
      await exportEmployeesCsv()

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
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

      mockPrisma.employee.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await exportEmployeesCsv()

      expect(result.success).toBe(false)
      expect(result.error).toBe("Erreur lors de l'export")
    })
  })
})
