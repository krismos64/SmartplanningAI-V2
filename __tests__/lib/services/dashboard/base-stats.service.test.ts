/**
 * Tests unitaires pour base-stats.service.ts
 *
 * Teste les fonctions utilitaires :
 * - Calculs de dates et periodes
 * - Calculs de tendances
 * - Calculs d'heures
 * - Fonctions de formatage
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
  calculateTrend,
  getDefaultDateRange,
  getPreviousPeriod,
  getWeekStart,
  getWeekEnd,
  getYearStart,
  getLastMonthsLabels,
  calculateHoursBetween,
  roundToOneDecimal,
  verifyCompanyAccess,
  verifyEmployeeBelongsToCompany,
  verifyManagerOfTeam,
  formatDateForChart,
  WEEKDAY_LABELS,
  calculateWorkingDays,
} from '@/lib/services/dashboard/base-stats.service'

const prismaMock = prisma as unknown as ReturnType<
  typeof mockDeep<PrismaClient>
>

describe('base-stats.service', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T10:00:00'))
  })

  // ==========================================================================
  // calculateTrend
  // ==========================================================================

  describe('calculateTrend', () => {
    it('devrait calculer une augmentation positive', () => {
      expect(calculateTrend(120, 100)).toBe(20)
    })

    it('devrait calculer une diminution negative', () => {
      expect(calculateTrend(80, 100)).toBe(-20)
    })

    it('devrait retourner 0 si les valeurs sont identiques', () => {
      expect(calculateTrend(100, 100)).toBe(0)
    })

    it('devrait retourner 100 si previous est 0 et current > 0', () => {
      expect(calculateTrend(50, 0)).toBe(100)
    })

    it('devrait retourner 0 si les deux valeurs sont 0', () => {
      expect(calculateTrend(0, 0)).toBe(0)
    })

    it('devrait arrondir le resultat', () => {
      expect(calculateTrend(133, 100)).toBe(33)
      expect(calculateTrend(166, 100)).toBe(66)
    })

    it('devrait gerer les grandes variations', () => {
      expect(calculateTrend(1000, 10)).toBe(9900)
    })

    it('devrait gerer les valeurs decimales', () => {
      expect(calculateTrend(10.5, 10)).toBe(5)
    })
  })

  // ==========================================================================
  // getDefaultDateRange
  // ==========================================================================

  describe('getDefaultDateRange', () => {
    it('devrait retourner le mois courant', () => {
      const range = getDefaultDateRange()

      expect(range.from.getFullYear()).toBe(2025)
      expect(range.from.getMonth()).toBe(5) // Juin (0-indexed)
      expect(range.from.getDate()).toBe(1)
    })

    it('devrait avoir le premier jour a minuit', () => {
      const range = getDefaultDateRange()

      expect(range.from.getHours()).toBe(0)
      expect(range.from.getMinutes()).toBe(0)
      expect(range.from.getSeconds()).toBe(0)
    })

    it('devrait avoir le dernier jour a 23:59:59', () => {
      const range = getDefaultDateRange()

      expect(range.to.getHours()).toBe(23)
      expect(range.to.getMinutes()).toBe(59)
      expect(range.to.getSeconds()).toBe(59)
    })

    it('devrait retourner le dernier jour du mois', () => {
      const range = getDefaultDateRange()

      // Juin a 30 jours
      expect(range.to.getDate()).toBe(30)
    })
  })

  // ==========================================================================
  // getPreviousPeriod
  // ==========================================================================

  describe('getPreviousPeriod', () => {
    it('devrait retourner la periode precedente de meme duree', () => {
      const currentRange = {
        from: new Date('2025-06-01'),
        to: new Date('2025-06-30'),
      }

      const previousRange = getPreviousPeriod(currentRange)

      expect(previousRange.to.getTime()).toBeLessThan(
        currentRange.from.getTime()
      )
    })

    it('devrait avoir la meme duree que la periode courante', () => {
      const currentRange = {
        from: new Date('2025-06-01'),
        to: new Date('2025-06-30'),
      }

      const previousRange = getPreviousPeriod(currentRange)
      const currentDuration =
        currentRange.to.getTime() - currentRange.from.getTime()
      const previousDuration =
        previousRange.to.getTime() - previousRange.from.getTime()

      // Tolerance d'une seconde
      expect(Math.abs(currentDuration - previousDuration)).toBeLessThan(1000)
    })
  })

  // ==========================================================================
  // getWeekStart / getWeekEnd
  // ==========================================================================

  describe('getWeekStart', () => {
    it('devrait retourner le lundi de la semaine', () => {
      // 15 juin 2025 est un dimanche
      const date = new Date('2025-06-15')
      const weekStart = getWeekStart(date)

      expect(weekStart.getDay()).toBe(1) // Lundi
      expect(weekStart.getDate()).toBe(9) // Lundi 9 juin
    })

    it("devrait retourner la meme date si c'est deja lundi", () => {
      const monday = new Date('2025-06-09') // Lundi
      const weekStart = getWeekStart(monday)

      expect(weekStart.getDate()).toBe(9)
    })

    it("devrait avoir l'heure a minuit", () => {
      const date = new Date('2025-06-15T15:30:00')
      const weekStart = getWeekStart(date)

      expect(weekStart.getHours()).toBe(0)
      expect(weekStart.getMinutes()).toBe(0)
    })
  })

  describe('getWeekEnd', () => {
    it('devrait retourner le dimanche de la semaine', () => {
      const date = new Date('2025-06-10') // Mardi
      const weekEnd = getWeekEnd(date)

      expect(weekEnd.getDay()).toBe(0) // Dimanche
      expect(weekEnd.getDate()).toBe(15) // Dimanche 15 juin
    })

    it("devrait avoir l'heure a 23:59:59", () => {
      const date = new Date('2025-06-10')
      const weekEnd = getWeekEnd(date)

      expect(weekEnd.getHours()).toBe(23)
      expect(weekEnd.getMinutes()).toBe(59)
      expect(weekEnd.getSeconds()).toBe(59)
    })
  })

  // ==========================================================================
  // getYearStart
  // ==========================================================================

  describe('getYearStart', () => {
    it('devrait retourner le 1er janvier', () => {
      const date = new Date('2025-06-15')
      const yearStart = getYearStart(date)

      expect(yearStart.getMonth()).toBe(0) // Janvier
      expect(yearStart.getDate()).toBe(1)
      expect(yearStart.getFullYear()).toBe(2025)
    })

    it("devrait avoir l'heure a minuit", () => {
      const date = new Date('2025-06-15T15:30:00')
      const yearStart = getYearStart(date)

      expect(yearStart.getHours()).toBe(0)
      expect(yearStart.getMinutes()).toBe(0)
    })
  })

  // ==========================================================================
  // getLastMonthsLabels
  // ==========================================================================

  describe('getLastMonthsLabels', () => {
    it('devrait retourner 6 mois par defaut', () => {
      const labels = getLastMonthsLabels()

      expect(labels).toHaveLength(6)
    })

    it('devrait retourner le nombre de mois demande', () => {
      const labels = getLastMonthsLabels(3)

      expect(labels).toHaveLength(3)
    })

    it('devrait se terminer par le mois courant', () => {
      const labels = getLastMonthsLabels(6)

      // Juin 2025
      expect(labels[5]).toBe('Juin')
    })

    it('devrait avoir les labels en francais', () => {
      const labels = getLastMonthsLabels(12)

      expect(labels).toContain('Jan')
      expect(labels).toContain('Fév')
      expect(labels).toContain('Déc')
    })
  })

  // ==========================================================================
  // calculateHoursBetween
  // ==========================================================================

  describe('calculateHoursBetween', () => {
    it('devrait calculer 8 heures pour une journee standard', () => {
      expect(calculateHoursBetween('09:00', '17:00')).toBe(8)
    })

    it('devrait calculer les demi-heures', () => {
      expect(calculateHoursBetween('09:00', '12:30')).toBe(3.5)
    })

    it("devrait calculer les quarts d'heure", () => {
      expect(calculateHoursBetween('09:00', '09:15')).toBe(0.25)
    })

    it('devrait gerer les shifts de nuit (passage minuit)', () => {
      expect(calculateHoursBetween('22:00', '06:00')).toBe(8)
    })

    it('devrait retourner 0 pour des heures identiques', () => {
      expect(calculateHoursBetween('09:00', '09:00')).toBe(0)
    })

    it('devrait gerer minuit comme fin', () => {
      expect(calculateHoursBetween('20:00', '00:00')).toBe(4)
    })
  })

  // ==========================================================================
  // roundToOneDecimal
  // ==========================================================================

  describe('roundToOneDecimal', () => {
    it('devrait arrondir a une decimale', () => {
      expect(roundToOneDecimal(3.14159)).toBe(3.1)
    })

    it('devrait arrondir vers le haut a 0.05+', () => {
      expect(roundToOneDecimal(3.15)).toBe(3.2)
    })

    it('devrait garder les entiers tels quels', () => {
      expect(roundToOneDecimal(5)).toBe(5)
    })

    it('devrait gerer les nombres negatifs', () => {
      expect(roundToOneDecimal(-3.14)).toBe(-3.1)
    })
  })

  // ==========================================================================
  // WEEKDAY_LABELS
  // ==========================================================================

  describe('WEEKDAY_LABELS', () => {
    it('devrait avoir 7 jours', () => {
      expect(WEEKDAY_LABELS).toHaveLength(7)
    })

    it('devrait commencer par lundi', () => {
      expect(WEEKDAY_LABELS[0]).toBe('Lun')
    })

    it('devrait terminer par dimanche', () => {
      expect(WEEKDAY_LABELS[6]).toBe('Dim')
    })
  })

  // ==========================================================================
  // calculateWorkingDays
  // ==========================================================================

  describe('calculateWorkingDays', () => {
    it('devrait compter 5 jours pour une semaine standard', () => {
      // Lundi 9 juin au vendredi 13 juin 2025
      const start = new Date('2025-06-09')
      const end = new Date('2025-06-13')

      expect(calculateWorkingDays(start, end)).toBe(5)
    })

    it('devrait exclure les week-ends', () => {
      // Lundi 9 juin au dimanche 15 juin 2025
      const start = new Date('2025-06-09')
      const end = new Date('2025-06-15')

      expect(calculateWorkingDays(start, end)).toBe(5)
    })

    it('devrait retourner 0 pour un week-end uniquement', () => {
      const start = new Date('2025-06-14') // Samedi
      const end = new Date('2025-06-15') // Dimanche

      expect(calculateWorkingDays(start, end)).toBe(0)
    })

    it('devrait retourner 1 pour un seul jour ouvre', () => {
      const start = new Date('2025-06-09') // Lundi
      const end = new Date('2025-06-09')

      expect(calculateWorkingDays(start, end)).toBe(1)
    })
  })

  // ==========================================================================
  // formatDateForChart
  // ==========================================================================

  describe('formatDateForChart', () => {
    it('devrait formater en mode short par defaut', () => {
      const date = new Date('2025-06-15')
      const formatted = formatDateForChart(date)

      expect(formatted).toContain('15')
      expect(formatted.toLowerCase()).toContain('juin')
    })

    it('devrait formater en mode day', () => {
      const date = new Date('2025-06-15')
      const formatted = formatDateForChart(date, 'day')

      expect(formatted).toContain('15')
      expect(formatted).toContain('06')
    })

    it('devrait formater en mode month', () => {
      const date = new Date('2025-06-15')
      const formatted = formatDateForChart(date, 'month')

      expect(formatted.toLowerCase()).toContain('juin')
    })
  })

  // ==========================================================================
  // verifyCompanyAccess
  // ==========================================================================

  describe('verifyCompanyAccess', () => {
    it('devrait autoriser SYSTEM_ADMIN pour toute entreprise', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'SYSTEM_ADMIN',
        companyId: 'company-1',
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

      const result = await verifyCompanyAccess('user-1', 'any-company')

      expect(result).toBe(true)
    })

    it('devrait autoriser un utilisateur pour sa propre entreprise', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'EMPLOYEE',
        companyId: 'company-1',
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

      const result = await verifyCompanyAccess('user-1', 'company-1')

      expect(result).toBe(true)
    })

    it('devrait refuser un utilisateur pour une autre entreprise', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'EMPLOYEE',
        companyId: 'company-1',
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

      const result = await verifyCompanyAccess('user-1', 'other-company')

      expect(result).toBe(false)
    })

    it("devrait refuser si l'utilisateur n'existe pas", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await verifyCompanyAccess('invalid-user', 'company-1')

      expect(result).toBe(false)
    })
  })

  // ==========================================================================
  // verifyEmployeeBelongsToCompany
  // ==========================================================================

  describe('verifyEmployeeBelongsToCompany', () => {
    it("devrait retourner true si l'employe appartient a l'entreprise", async () => {
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

      const result = await verifyEmployeeBelongsToCompany('emp-1', 'company-1')

      expect(result).toBe(true)
    })

    it("devrait retourner false si l'employe n'appartient pas a l'entreprise", async () => {
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

      const result = await verifyEmployeeBelongsToCompany(
        'emp-1',
        'other-company'
      )

      expect(result).toBe(false)
    })

    it("devrait retourner false si l'employe n'existe pas", async () => {
      prismaMock.employee.findUnique.mockResolvedValue(null)

      const result = await verifyEmployeeBelongsToCompany(
        'invalid-emp',
        'company-1'
      )

      expect(result).toBe(false)
    })
  })

  // ==========================================================================
  // verifyManagerOfTeam
  // ==========================================================================

  describe('verifyManagerOfTeam', () => {
    it("devrait retourner true si l'employe est manager de l'equipe", async () => {
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

      const result = await verifyManagerOfTeam('emp-1', 'team-1')

      expect(result).toBe(true)
    })

    it("devrait retourner false si l'employe n'est pas manager", async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team-1',
        managerId: 'other-emp',
        companyId: 'company-1',
        name: 'Team A',
        description: null,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await verifyManagerOfTeam('emp-1', 'team-1')

      expect(result).toBe(false)
    })

    it("devrait retourner false si l'equipe n'existe pas", async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)

      const result = await verifyManagerOfTeam('emp-1', 'invalid-team')

      expect(result).toBe(false)
    })

    it("devrait retourner false si l'equipe n'a pas de manager", async () => {
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

      const result = await verifyManagerOfTeam('emp-1', 'team-1')

      expect(result).toBe(false)
    })
  })
})
