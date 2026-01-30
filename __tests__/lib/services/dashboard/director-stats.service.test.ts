/**
 * Tests unitaires pour director-stats.service.ts
 *
 * Teste les fonctions du service Director :
 * - getDirectorStats (complet)
 * - getDirectorEmployeeCountOnly
 * - getDirectorPendingRequestsOnly
 * - getDirectorTeamDetails
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
  getDirectorStats,
  getDirectorEmployeeCountOnly,
  getDirectorPendingRequestsOnly,
  getDirectorTeamDetails,
} from '@/lib/services/dashboard/director-stats.service'

const prismaMock = prisma as unknown as ReturnType<
  typeof mockDeep<PrismaClient>
>

describe('director-stats.service', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T10:00:00'))
  })

  // ==========================================================================
  // getDirectorStats
  // ==========================================================================

  describe('getDirectorStats', () => {
    it('devrait retourner une erreur si acces non autorise', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'EMPLOYEE',
        companyId: 'other-company',
        email: 'user@test.com',
        password: 'hash',
        name: 'User',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acces non autorise')
    })

    it('devrait retourner les stats completes pour un director valide', async () => {
      // Mock verification acces
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock total employes
      prismaMock.employee.count.mockResolvedValue(25)

      // Mock total equipes
      prismaMock.team.count.mockResolvedValue(5)

      // Mock demandes en attente
      prismaMock.leaveRequest.count.mockResolvedValue(3)

      // Mock employes en conge
      prismaMock.leaveRequest.findMany.mockResolvedValue([])

      // Mock equipes
      prismaMock.team.findMany.mockResolvedValue([
        {
          id: 'team-1',
          managerId: 'emp-1',
          companyId: 'company-1',
          name: 'Team A',
          description: null,
          color: '#3B82F6',
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { employees: 5 },
        } as any,
      ])

      // Mock schedules
      prismaMock.schedule.findMany.mockResolvedValue([])

      // Mock employes par equipe
      prismaMock.employee.findMany.mockResolvedValue([])

      // Mock distribution types conges
      prismaMock.leaveRequest.groupBy.mockResolvedValue([
        { type: 'PAID_LEAVE', _count: 10 },
        { type: 'SICK_LEAVE', _count: 3 },
      ] as any)

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.totalEmployees).toBe(25)
      expect(result.data?.totalTeams).toBe(5)
      expect(result.data?.pendingLeaveRequests).toBe(3)
      expect(result.data?.teamStats).toBeDefined()
      expect(result.data?.leaveTypeDistribution).toBeDefined()
      expect(result.data?.employeeGrowth).toBeDefined()
    })

    it('devrait calculer correctement le taux de presence', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // 20 employes, 4 en conge = 80% presence
      prismaMock.employee.count.mockResolvedValue(20)
      prismaMock.team.count.mockResolvedValue(3)
      prismaMock.leaveRequest.count.mockResolvedValue(0)

      // 4 employes en conge
      prismaMock.leaveRequest.findMany.mockResolvedValue([
        { employeeId: 'emp-1' },
        { employeeId: 'emp-2' },
        { employeeId: 'emp-3' },
        { employeeId: 'emp-4' },
      ] as any)

      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.averageAttendanceRate).toBe(80)
    })

    it('devrait retourner 100% de presence si personne en conge', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(10)
      prismaMock.team.count.mockResolvedValue(2)
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.averageAttendanceRate).toBe(100)
    })

    it('devrait gerer les erreurs Prisma', async () => {
      prismaMock.user.findUnique.mockRejectedValue(
        new Error('Database connection error')
      )

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database connection error')
    })
  })

  // ==========================================================================
  // getDirectorEmployeeCountOnly
  // ==========================================================================

  describe('getDirectorEmployeeCountOnly', () => {
    it('devrait retourner une erreur si acces non autorise', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await getDirectorEmployeeCountOnly('user-1', 'company-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acces non autorise')
    })

    it("devrait retourner le nombre d'employes", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(15)

      const result = await getDirectorEmployeeCountOnly('user-1', 'company-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(15)
    })
  })

  // ==========================================================================
  // getDirectorPendingRequestsOnly
  // ==========================================================================

  describe('getDirectorPendingRequestsOnly', () => {
    it('devrait retourner une erreur si acces non autorise', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await getDirectorPendingRequestsOnly('user-1', 'company-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acces non autorise')
    })

    it('devrait retourner le nombre de demandes en attente', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.leaveRequest.count.mockResolvedValue(7)

      const result = await getDirectorPendingRequestsOnly('user-1', 'company-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(7)
    })

    it('devrait retourner 0 si aucune demande', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.leaveRequest.count.mockResolvedValue(0)

      const result = await getDirectorPendingRequestsOnly('user-1', 'company-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(0)
    })
  })

  // ==========================================================================
  // getDirectorTeamDetails
  // ==========================================================================

  describe('getDirectorTeamDetails', () => {
    it('devrait retourner une erreur si acces non autorise', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await getDirectorTeamDetails(
        'user-1',
        'company-1',
        'team-1'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acces non autorise')
    })

    it('devrait retourner une erreur si equipe non trouvee', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.team.findUnique.mockResolvedValue(null)

      const result = await getDirectorTeamDetails(
        'user-1',
        'company-1',
        'invalid-team'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Equipe non trouvee')
    })

    it("devrait retourner une erreur si equipe n'appartient pas a l'entreprise", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'emp-1',
        companyId: 'other-company',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await getDirectorTeamDetails(
        'user-1',
        'company-1',
        'team-1'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Equipe non trouvee')
    })
  })

  // ==========================================================================
  // plannedHoursThisMonth (SP-317)
  // ==========================================================================

  describe('plannedHoursThisMonth', () => {
    it('devrait calculer les heures planifiees du mois', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(10)
      prismaMock.team.count.mockResolvedValue(2)
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      // Mock des schedules avec des heures planifiees
      // 3 creneaux de 8h chacun = 24h
      prismaMock.schedule.findMany.mockResolvedValue([
        { startTime: '09:00', endTime: '17:00' },
        { startTime: '09:00', endTime: '17:00' },
        { startTime: '09:00', endTime: '17:00' },
      ] as any)

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.plannedHoursThisMonth).toBe(24)
    })

    it('devrait retourner 0 si aucun planning', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(10)
      prismaMock.team.count.mockResolvedValue(2)
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.plannedHoursThisMonth).toBe(0)
    })
  })

  // ==========================================================================
  // absencesLast7Days (SP-317)
  // ==========================================================================

  describe('absencesLast7Days', () => {
    it('devrait compter les absences des 7 derniers jours', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(10)
      prismaMock.team.count.mockResolvedValue(2)
      // Premier count pour pending, deuxieme pour absences 7j
      prismaMock.leaveRequest.count
        .mockResolvedValueOnce(0) // pending
        .mockResolvedValueOnce(5) // absences 7j
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.absencesLast7Days).toBe(5)
    })

    it('devrait retourner 0 si aucune absence', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(10)
      prismaMock.team.count.mockResolvedValue(2)
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.absencesLast7Days).toBe(0)
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('Edge cases', () => {
    it('devrait gerer une entreprise sans employes', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(0)
      prismaMock.team.count.mockResolvedValue(0)
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.totalEmployees).toBe(0)
      expect(result.data?.totalTeams).toBe(0)
      expect(result.data?.averageAttendanceRate).toBe(100) // Pas d'employes = 100% presence
    })

    it('devrait retourner la croissance sur 6 mois', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(10)
      prismaMock.team.count.mockResolvedValue(2)
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.employeeGrowth).toHaveLength(6)
      expect(result.data?.employeeGrowth[0]).toHaveProperty('month')
      expect(result.data?.employeeGrowth[0]).toHaveProperty('count')
    })

    it('devrait traduire les types de conges en francais', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'DIRECTOR',
        companyId: 'company-1',
        email: 'director@test.com',
        password: 'hash',
        name: 'Director',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(10)
      prismaMock.team.count.mockResolvedValue(2)
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([
        { type: 'PAID_LEAVE', _count: 10 },
        { type: 'SICK_LEAVE', _count: 5 },
        { type: 'RTT', _count: 3 },
      ] as any)

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.leaveTypeDistribution).toContainEqual({
        type: 'Congés payés',
        count: 10,
      })
      expect(result.data?.leaveTypeDistribution).toContainEqual({
        type: 'Maladie',
        count: 5,
      })
      expect(result.data?.leaveTypeDistribution).toContainEqual({
        type: 'RTT',
        count: 3,
      })
    })

    it('devrait autoriser SYSTEM_ADMIN pour toute entreprise', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'SYSTEM_ADMIN',
        companyId: null,
        email: 'admin@test.com',
        password: 'hash',
        name: 'Admin',
        emailVerified: null,
        image: null,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.employee.count.mockResolvedValue(5)
      prismaMock.team.count.mockResolvedValue(1)
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.team.findMany.mockResolvedValue([])
      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.employee.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.groupBy.mockResolvedValue([])

      const result = await getDirectorStats({
        userId: 'user-1',
        companyId: 'any-company',
      })

      expect(result.success).toBe(true)
    })
  })
})
