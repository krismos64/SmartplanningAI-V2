/**
 * Tests unitaires pour employee-stats.service.ts
 *
 * Teste les fonctions du service Employee :
 * - getEmployeeStats (complet)
 * - getEmployeeHoursOnly
 * - getEmployeeLeaveBalanceOnly
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
  getEmployeeStats,
  getEmployeeHoursOnly,
  getEmployeeLeaveBalanceOnly,
} from '@/lib/services/dashboard/employee-stats.service'

const prismaMock = prisma as unknown as ReturnType<
  typeof mockDeep<PrismaClient>
>

describe('employee-stats.service', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T10:00:00'))
  })

  // ==========================================================================
  // getEmployeeStats
  // ==========================================================================

  describe('getEmployeeStats', () => {
    it("devrait retourner une erreur si l'employe n'appartient pas a l'entreprise", async () => {
      prismaMock.employee.findUnique.mockResolvedValue(null)

      const result = await getEmployeeStats({
        employeeId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acces non autorise')
    })

    it('devrait retourner les stats completes pour un employe valide', async () => {
      // Mock verification appartenance
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        companyId: 'company-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        department: null,
        phone: null,
        hireDate: null,
        weeklyHours: 35,
        skills: [],
        preferences: null,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock heures travaillees
      prismaMock.schedule.findMany.mockResolvedValue([
        {
          id: 's-1',
          employeeId: 'emp-1',
          companyId: 'company-1',
          teamId: null,
          startDate: new Date('2025-06-10'),
          endDate: new Date('2025-06-10'),
          startTime: '09:00',
          endTime: '17:00',
          type: 'WORK',
          status: 'COMPLETED',
          title: null,
          description: null,
          location: null,
          color: '#10B981',
          createdById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      // Mock shifts a venir
      prismaMock.schedule.count.mockResolvedValue(3)

      // Mock conges approuves
      prismaMock.leaveRequest.findMany.mockResolvedValue([
        {
          id: 'lr-1',
          employeeId: 'emp-1',
          companyId: 'company-1',
          startDate: new Date('2025-03-01'),
          endDate: new Date('2025-03-05'),
          days: 5,
          type: 'PAID_LEAVE',
          status: 'APPROVED',
          reason: null,
          comment: null,
          attachments: [],
          reviewedById: null,
          reviewedAt: null,
          reviewComment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      // Mock demandes en attente
      prismaMock.leaveRequest.count.mockResolvedValue(1)

      // Mock prochain shift
      prismaMock.schedule.findFirst.mockResolvedValue({
        id: 's-2',
        employeeId: 'emp-1',
        companyId: 'company-1',
        teamId: null,
        startDate: new Date('2025-06-16'),
        endDate: new Date('2025-06-16'),
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
      })

      const result = await getEmployeeStats({
        employeeId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.hoursWorked).toBeDefined()
      expect(result.data?.upcomingShifts).toBe(3)
      expect(result.data?.leaveBalance).toBeDefined()
      expect(result.data?.pendingRequests).toBe(1)
      expect(result.data?.nextShift).toBeDefined()
      expect(result.data?.weeklySchedule).toHaveLength(7)
    })

    it('devrait retourner nextShift null si aucun shift a venir', async () => {
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        companyId: 'company-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        department: null,
        phone: null,
        hireDate: null,
        weeklyHours: 35,
        skills: [],
        preferences: null,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.schedule.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.schedule.findFirst.mockResolvedValue(null)

      const result = await getEmployeeStats({
        employeeId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.nextShift).toBeNull()
    })

    it('devrait calculer correctement le solde de conges', async () => {
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        companyId: 'company-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        department: null,
        phone: null,
        hireDate: null,
        weeklyHours: 35,
        skills: [],
        preferences: null,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.schedule.count.mockResolvedValue(0)

      // 10 jours de conges pris
      prismaMock.leaveRequest.findMany.mockResolvedValue([
        {
          id: 'lr-1',
          employeeId: 'emp-1',
          companyId: 'company-1',
          startDate: new Date('2025-03-01'),
          endDate: new Date('2025-03-05'),
          days: 5,
          type: 'PAID_LEAVE',
          status: 'APPROVED',
          reason: null,
          comment: null,
          attachments: [],
          reviewedById: null,
          reviewedAt: null,
          reviewComment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'lr-2',
          employeeId: 'emp-1',
          companyId: 'company-1',
          startDate: new Date('2025-05-01'),
          endDate: new Date('2025-05-05'),
          days: 5,
          type: 'PAID_LEAVE',
          status: 'APPROVED',
          reason: null,
          comment: null,
          attachments: [],
          reviewedById: null,
          reviewedAt: null,
          reviewComment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.schedule.findFirst.mockResolvedValue(null)

      const result = await getEmployeeStats({
        employeeId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.leaveBalance.used).toBe(10)
      expect(result.data?.leaveBalance.remaining).toBe(15) // 25 - 10
      expect(result.data?.leaveBalance.total).toBe(25)
    })

    it('devrait gerer les erreurs Prisma', async () => {
      prismaMock.employee.findUnique.mockRejectedValue(
        new Error('Database connection error')
      )

      const result = await getEmployeeStats({
        employeeId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database connection error')
    })
  })

  // ==========================================================================
  // getEmployeeHoursOnly
  // ==========================================================================

  describe('getEmployeeHoursOnly', () => {
    it('devrait retourner une erreur si acces non autorise', async () => {
      prismaMock.employee.findUnique.mockResolvedValue(null)

      const result = await getEmployeeHoursOnly('emp-1', 'company-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acces non autorise')
    })

    it('devrait retourner uniquement les heures et tendance', async () => {
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        companyId: 'company-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        department: null,
        phone: null,
        hireDate: null,
        weeklyHours: 35,
        skills: [],
        preferences: null,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mois courant: 16h
      prismaMock.schedule.findMany
        .mockResolvedValueOnce([
          {
            id: 's-1',
            employeeId: 'emp-1',
            companyId: 'company-1',
            teamId: null,
            startDate: new Date('2025-06-10'),
            endDate: new Date('2025-06-10'),
            startTime: '09:00',
            endTime: '17:00',
            type: 'WORK',
            status: 'COMPLETED',
            title: null,
            description: null,
            location: null,
            color: '#10B981',
            createdById: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 's-2',
            employeeId: 'emp-1',
            companyId: 'company-1',
            teamId: null,
            startDate: new Date('2025-06-11'),
            endDate: new Date('2025-06-11'),
            startTime: '09:00',
            endTime: '17:00',
            type: 'WORK',
            status: 'COMPLETED',
            title: null,
            description: null,
            location: null,
            color: '#10B981',
            createdById: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
        // Mois precedent: 8h
        .mockResolvedValueOnce([
          {
            id: 's-3',
            employeeId: 'emp-1',
            companyId: 'company-1',
            teamId: null,
            startDate: new Date('2025-05-10'),
            endDate: new Date('2025-05-10'),
            startTime: '09:00',
            endTime: '17:00',
            type: 'WORK',
            status: 'COMPLETED',
            title: null,
            description: null,
            location: null,
            color: '#10B981',
            createdById: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])

      const result = await getEmployeeHoursOnly('emp-1', 'company-1')

      expect(result.success).toBe(true)
      expect(result.data?.current).toBe(16)
      expect(result.data?.trend).toBe(100) // Doublement
    })
  })

  // ==========================================================================
  // getEmployeeLeaveBalanceOnly
  // ==========================================================================

  describe('getEmployeeLeaveBalanceOnly', () => {
    it('devrait retourner une erreur si acces non autorise', async () => {
      prismaMock.employee.findUnique.mockResolvedValue(null)

      const result = await getEmployeeLeaveBalanceOnly('emp-1', 'company-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acces non autorise')
    })

    it('devrait retourner uniquement le solde', async () => {
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        companyId: 'company-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        department: null,
        phone: null,
        hireDate: null,
        weeklyHours: 35,
        skills: [],
        preferences: null,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.leaveRequest.findMany.mockResolvedValue([
        {
          id: 'lr-1',
          employeeId: 'emp-1',
          companyId: 'company-1',
          startDate: new Date('2025-03-01'),
          endDate: new Date('2025-03-05'),
          days: 10,
          type: 'PAID_LEAVE',
          status: 'APPROVED',
          reason: null,
          comment: null,
          attachments: [],
          reviewedById: null,
          reviewedAt: null,
          reviewComment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const result = await getEmployeeLeaveBalanceOnly('emp-1', 'company-1')

      expect(result.success).toBe(true)
      expect(result.data?.remaining).toBe(15)
      expect(result.data?.total).toBe(25)
    })

    it('devrait retourner le total complet si aucun conge pris', async () => {
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        companyId: 'company-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        department: null,
        phone: null,
        hireDate: null,
        weeklyHours: 35,
        skills: [],
        preferences: null,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.leaveRequest.findMany.mockResolvedValue([])

      const result = await getEmployeeLeaveBalanceOnly('emp-1', 'company-1')

      expect(result.success).toBe(true)
      expect(result.data?.remaining).toBe(25)
      expect(result.data?.total).toBe(25)
    })
  })

  // ==========================================================================
  // Cas limites et edge cases
  // ==========================================================================

  describe('Edge cases', () => {
    it('devrait gerer un employe sans aucune donnee', async () => {
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        companyId: 'company-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        department: null,
        phone: null,
        hireDate: null,
        weeklyHours: 35,
        skills: [],
        preferences: null,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.schedule.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.schedule.findFirst.mockResolvedValue(null)

      const result = await getEmployeeStats({
        employeeId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.hoursWorked.current).toBe(0)
      expect(result.data?.hoursWorked.previous).toBe(0)
      expect(result.data?.hoursWorked.trend).toBe(0)
      expect(result.data?.upcomingShifts).toBe(0)
      expect(result.data?.pendingRequests).toBe(0)
      expect(result.data?.nextShift).toBeNull()
    })

    it('devrait retourner un planning semaine avec 0 heures par jour', async () => {
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        companyId: 'company-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        department: null,
        phone: null,
        hireDate: null,
        weeklyHours: 35,
        skills: [],
        preferences: null,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      prismaMock.schedule.findMany.mockResolvedValue([])
      prismaMock.schedule.count.mockResolvedValue(0)
      prismaMock.leaveRequest.findMany.mockResolvedValue([])
      prismaMock.leaveRequest.count.mockResolvedValue(0)
      prismaMock.schedule.findFirst.mockResolvedValue(null)

      const result = await getEmployeeStats({
        employeeId: 'emp-1',
        companyId: 'company-1',
      })

      expect(result.success).toBe(true)
      expect(result.data?.weeklySchedule).toEqual([
        { day: 'Lun', hours: 0 },
        { day: 'Mar', hours: 0 },
        { day: 'Mer', hours: 0 },
        { day: 'Jeu', hours: 0 },
        { day: 'Ven', hours: 0 },
        { day: 'Sam', hours: 0 },
        { day: 'Dim', hours: 0 },
      ])
    })
  })
})
