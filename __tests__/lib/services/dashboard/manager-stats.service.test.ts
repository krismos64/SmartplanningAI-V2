/**
 * Tests unitaires pour manager-stats.service.ts
 *
 * Teste les fonctions du service Manager :
 * - getManagerStats (complet)
 * - getManagerPendingRequestsOnly
 * - getManagerTodayAbsencesOnly
 *
 * @ticket SP-144
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '@/lib/prisma'
import {
  getManagerStats,
  getManagerPendingRequestsOnly,
  getManagerTodayAbsencesOnly,
} from '@/lib/services/dashboard/manager-stats.service'

const prismaMock = prisma as unknown as ReturnType<
  typeof mockDeep<PrismaClient>
>

describe('manager-stats.service', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T10:00:00'))
  })

  // ==========================================================================
  // getManagerStats
  // ==========================================================================

  describe('getManagerStats', () => {
    it("devrait retourner une erreur si le manager ne gere pas l'equipe", async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'other-manager',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Accès non autorisé')
    })

    it("devrait retourner une erreur si l'equipe n'appartient pas a l'entreprise", async () => {
      prismaMock.team.findUnique
        .mockResolvedValueOnce({
          id: 'team-1',
          managerId: 'emp-1',
          companyId: 'company-1',
          name: 'Team A',
          description: null,
          color: '#3B82F6',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 'team-1',
          managerId: 'emp-1',
          companyId: 'other-company',
          name: 'Team A',
          description: null,
          color: '#3B82F6',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Équipe non trouvée')
    })

    it('devrait retourner les stats completes pour un manager valide', async () => {
      // Mock verification manager (appelé 2 fois: verifyManagerOfTeam + verification companyId)
      const teamMock = {
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prismaMock.team.findUnique.mockResolvedValue(teamMock)

      // Mock taille equipe
      prismaMock.employee.count.mockResolvedValue(5)

      // Mock employes de l'equipe (appelé plusieurs fois pour differentes fonctions)
      prismaMock.employee.findMany.mockResolvedValue([
        {
          id: 'emp-2',
          companyId: 'company-1',
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Doe',
          jobTitle: null,
          department: null,
          phone: null,
          hireDate: null,
          weeklyHours: 35,
          skills: [],
          preferences: null,
          teamId: 'team-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      // Mock demandes en attente
      prismaMock.leaveRequest.count.mockResolvedValue(2)

      // Mock leaveRequest.findMany pour getLeaveRequestsTrend
      prismaMock.leaveRequest.findMany.mockResolvedValue([])

      // Mock schedules
      prismaMock.schedule.count.mockResolvedValue(10)
      prismaMock.schedule.findMany.mockResolvedValue([
        {
          id: 's-1',
          employeeId: 'emp-2',
          companyId: 'company-1',
          teamId: 'team-1',
          startDate: new Date('2025-06-10'),
          endDate: new Date('2025-06-10'),
          startTime: '09:00',
          endTime: '17:00',
          type: 'WORK',
          status: 'CONFIRMED',
          title: null,
          description: null,
          location: null,
          color: '#10B981',
          createdById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.teamSize).toBe(5)
      expect(result.data?.pendingLeaveRequests).toBeDefined()
      expect(result.data?.coverageRate).toBeDefined()
      expect(result.data?.teamHoursWorked).toBeDefined()
      expect(result.data?.teamPerformance).toBeDefined()
      expect(result.data?.leaveRequestsTrend).toBeDefined()
    })

    it('devrait calculer correctement le taux de couverture', async () => {
      const teamMock = {
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prismaMock.team.findUnique.mockResolvedValue(teamMock)

      prismaMock.employee.count.mockResolvedValue(5)
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])

      // 8 schedules confirmes sur 10 total = 80%
      prismaMock.schedule.count
        .mockResolvedValueOnce(8) // Confirmes
        .mockResolvedValueOnce(10) // Total

      prismaMock.schedule.findMany.mockResolvedValue([])

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.coverageRate).toBe(80)
    })

    it('devrait retourner 100% de couverture si pas de schedules', async () => {
      const teamMock = {
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prismaMock.team.findUnique.mockResolvedValue(teamMock)

      prismaMock.employee.count.mockResolvedValue(5)
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.schedule.count.mockResolvedValue(0)
      prismaMock.schedule.findMany.mockResolvedValue([])

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.coverageRate).toBe(100)
    })

    it('devrait gerer les erreurs Prisma', async () => {
      prismaMock.team.findUnique.mockRejectedValue(
        new Error('Database connection error')
      )

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database connection error')
    })
  })

  // ==========================================================================
  // getManagerPendingRequestsOnly
  // ==========================================================================

  describe('getManagerPendingRequestsOnly', () => {
    it('devrait retourner une erreur si acces non autorise', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'other-manager',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await getManagerPendingRequestsOnly('emp-1', 'team-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Accès non autorisé')
    })

    it('devrait retourner le nombre de demandes en attente', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.findMany.mockResolvedValue([
        {
          id: 'emp-2',
          companyId: 'company-1',
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Doe',
          jobTitle: null,
          department: null,
          phone: null,
          hireDate: null,
          weeklyHours: 35,
          skills: [],
          preferences: null,
          teamId: 'team-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      prismaMock.leaveRequest.count.mockResolvedValue(3)

      const result = await getManagerPendingRequestsOnly('emp-1', 'team-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(3)
    })

    it('devrait retourner 0 si aucune demande en attente', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.count.mockResolvedValue(0)

      const result = await getManagerPendingRequestsOnly('emp-1', 'team-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(0)
    })
  })

  // ==========================================================================
  // getManagerTodayAbsencesOnly
  // ==========================================================================

  describe('getManagerTodayAbsencesOnly', () => {
    it('devrait retourner une erreur si acces non autorise', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'other-manager',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await getManagerTodayAbsencesOnly('emp-1', 'team-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Accès non autorisé')
    })

    it("devrait retourner le nombre d'absences du jour", async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.findMany.mockResolvedValue([
        {
          id: 'emp-2',
          companyId: 'company-1',
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Doe',
          jobTitle: null,
          department: null,
          phone: null,
          hireDate: null,
          weeklyHours: 35,
          skills: [],
          preferences: null,
          teamId: 'team-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      prismaMock.leaveRequest.findMany.mockResolvedValue([
        { employeeId: 'emp-2', type: 'PAID_LEAVE' },
        { employeeId: 'emp-2', type: 'RTT' },
      ] as never)
      prismaMock.schedule.findMany.mockResolvedValue([])

      const result = await getManagerTodayAbsencesOnly('emp-1', 'team-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(2)
    })

    it('devrait retourner 0 si aucune absence', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])

      const result = await getManagerTodayAbsencesOnly('emp-1', 'team-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(0)
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('Edge cases', () => {
    it('devrait gerer une equipe vide', async () => {
      const teamMock = {
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prismaMock.team.findUnique.mockResolvedValue(teamMock)

      prismaMock.employee.count.mockResolvedValue(0)
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.schedule.count.mockResolvedValue(0)
      prismaMock.schedule.findMany.mockResolvedValue([])

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.teamSize).toBe(0)
      expect(result.data?.pendingLeaveRequests).toBe(0)
      expect(result.data?.todayAbsences).toBe(0)
    })

    it('devrait gerer une equipe sans manager (null)', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: null,
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Accès non autorisé')
    })

    it('devrait retourner les tendances des 4 dernieres semaines', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(5)
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.schedule.count.mockResolvedValue(0)
      prismaMock.schedule.findMany.mockResolvedValue([])

      const result = await getManagerStats({
        teamId: 'team-1',
        managerId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.leaveRequestsTrend).toHaveLength(4)
      expect(result.data?.leaveRequestsTrend[0]).toHaveProperty('date')
      expect(result.data?.leaveRequestsTrend[0]).toHaveProperty('pending')
      expect(result.data?.leaveRequestsTrend[0]).toHaveProperty('approved')
      expect(result.data?.leaveRequestsTrend[0]).toHaveProperty('rejected')
    })
  })
})
