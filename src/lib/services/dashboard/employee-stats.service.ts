/**
 * Service de statistiques pour le role EMPLOYEE
 *
 * Recupere les donnees personnelles de l'employe :
 * - Heures travaillees (avec tendance)
 * - Shifts a venir
 * - Solde de conges
 * - Demandes en attente
 * - Planning de la semaine
 *
 * @ticket SP-144
 * @see Context7 - Prisma Best Practices Data Access Layer
 */

import { prisma } from '@/lib/prisma'
import type {
  EmployeeStatsParams,
  EmployeeStatsResult,
  ServiceResult,
} from './types'
import {
  calculateTrend,
  getDefaultDateRange,
  getPreviousPeriod,
  getWeekStart,
  getWeekEnd,
  getYearStart,
  calculateHoursBetween,
  roundToOneDecimal,
  WEEKDAY_LABELS,
  verifyEmployeeBelongsToCompany,
} from './base-stats.service'

// Nombre de jours de conges annuels par defaut
const DEFAULT_ANNUAL_LEAVE = 25

/**
 * Recupere les statistiques completes d'un employe
 *
 * @param params - Parametres de la requete
 * @returns Statistiques de l'employe ou erreur
 */
export async function getEmployeeStats(
  params: EmployeeStatsParams
): Promise<ServiceResult<EmployeeStatsResult>> {
  const { employeeId, companyId, dateRange = getDefaultDateRange() } = params

  try {
    // Verification de l'acces multi-tenant
    const hasAccess = await verifyEmployeeBelongsToCompany(
      employeeId,
      companyId
    )
    if (!hasAccess) {
      return {
        success: false,
        error: 'Acces non autorise a cet employe',
      }
    }

    // Recuperation des donnees en parallele
    const [
      hoursWorked,
      upcomingShifts,
      leaveBalance,
      pendingRequests,
      nextShift,
      weeklySchedule,
    ] = await Promise.all([
      getHoursWorked(employeeId, dateRange),
      getUpcomingShiftsCount(employeeId),
      getLeaveBalance(employeeId),
      getPendingRequestsCount(employeeId),
      getNextShift(employeeId),
      getWeeklySchedule(employeeId),
    ])

    return {
      success: true,
      data: {
        hoursWorked,
        upcomingShifts,
        leaveBalance,
        pendingRequests,
        nextShift,
        weeklySchedule,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return {
      success: false,
      error: `Erreur lors de la recuperation des stats employe: ${message}`,
    }
  }
}

/**
 * Calcule les heures travaillees sur une periode avec tendance
 */
async function getHoursWorked(
  employeeId: string,
  dateRange: { from: Date; to: Date }
): Promise<EmployeeStatsResult['hoursWorked']> {
  const previousPeriod = getPreviousPeriod(dateRange)

  // Recuperer les schedules de la periode courante
  const currentSchedules = await prisma.schedule.findMany({
    where: {
      employeeId,
      startDate: { gte: dateRange.from },
      endDate: { lte: dateRange.to },
      status: 'COMPLETED',
      type: 'WORK',
    },
    select: {
      startTime: true,
      endTime: true,
    },
  })

  // Recuperer les schedules de la periode precedente
  const previousSchedules = await prisma.schedule.findMany({
    where: {
      employeeId,
      startDate: { gte: previousPeriod.from },
      endDate: { lte: previousPeriod.to },
      status: 'COMPLETED',
      type: 'WORK',
    },
    select: {
      startTime: true,
      endTime: true,
    },
  })

  // Calculer les heures
  const currentHours = currentSchedules.reduce((total, schedule) => {
    return total + calculateHoursBetween(schedule.startTime, schedule.endTime)
  }, 0)

  const previousHours = previousSchedules.reduce((total, schedule) => {
    return total + calculateHoursBetween(schedule.startTime, schedule.endTime)
  }, 0)

  return {
    current: roundToOneDecimal(currentHours),
    previous: roundToOneDecimal(previousHours),
    trend: calculateTrend(currentHours, previousHours),
  }
}

/**
 * Compte les shifts a venir
 */
async function getUpcomingShiftsCount(employeeId: string): Promise<number> {
  const now = new Date()

  return prisma.schedule.count({
    where: {
      employeeId,
      startDate: { gt: now },
      status: { in: ['DRAFT', 'CONFIRMED'] },
    },
  })
}

/**
 * Calcule le solde de conges de l'employe
 */
async function getLeaveBalance(
  employeeId: string
): Promise<EmployeeStatsResult['leaveBalance']> {
  const yearStart = getYearStart(new Date())

  // Recuperer les conges approuves de l'annee
  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: { gte: yearStart },
    },
    select: {
      days: true,
    },
  })

  const usedDays = approvedLeaves.reduce((total, leave) => {
    return total + leave.days
  }, 0)

  return {
    remaining: roundToOneDecimal(DEFAULT_ANNUAL_LEAVE - usedDays),
    used: roundToOneDecimal(usedDays),
    total: DEFAULT_ANNUAL_LEAVE,
  }
}

/**
 * Compte les demandes de conges en attente
 */
async function getPendingRequestsCount(employeeId: string): Promise<number> {
  return prisma.leaveRequest.count({
    where: {
      employeeId,
      status: 'PENDING',
    },
  })
}

/**
 * Recupere le prochain shift programme
 */
async function getNextShift(
  employeeId: string
): Promise<EmployeeStatsResult['nextShift']> {
  const now = new Date()

  const nextSchedule = await prisma.schedule.findFirst({
    where: {
      employeeId,
      startDate: { gte: now },
      status: { in: ['DRAFT', 'CONFIRMED'] },
    },
    orderBy: { startDate: 'asc' },
    select: {
      startDate: true,
      startTime: true,
      endTime: true,
    },
  })

  if (!nextSchedule) return null

  return {
    date: nextSchedule.startDate,
    startTime: nextSchedule.startTime,
    endTime: nextSchedule.endTime,
  }
}

/**
 * Construit le planning de la semaine courante
 */
async function getWeeklySchedule(
  employeeId: string
): Promise<EmployeeStatsResult['weeklySchedule']> {
  const now = new Date()
  const weekStart = getWeekStart(now)
  const weekEnd = getWeekEnd(now)

  // Recuperer tous les schedules de la semaine
  const schedules = await prisma.schedule.findMany({
    where: {
      employeeId,
      startDate: { gte: weekStart, lte: weekEnd },
      status: { in: ['CONFIRMED', 'COMPLETED'] },
      type: 'WORK',
    },
    select: {
      startDate: true,
      startTime: true,
      endTime: true,
    },
    orderBy: { startDate: 'asc' },
  })

  // Construire le planning par jour
  return WEEKDAY_LABELS.map((day, index) => {
    // Calculer la date du jour (index 0 = lundi)
    const dayDate = new Date(weekStart)
    dayDate.setDate(dayDate.getDate() + index)

    // Trouver les schedules de ce jour
    const daySchedules = schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startDate)
      return (
        scheduleDate.getFullYear() === dayDate.getFullYear() &&
        scheduleDate.getMonth() === dayDate.getMonth() &&
        scheduleDate.getDate() === dayDate.getDate()
      )
    })

    // Calculer les heures totales du jour
    const hours = daySchedules.reduce((total, schedule) => {
      return total + calculateHoursBetween(schedule.startTime, schedule.endTime)
    }, 0)

    return {
      day,
      hours: roundToOneDecimal(hours),
    }
  })
}

/**
 * Recupere uniquement les heures travaillees (version simplifiee)
 * Utile pour les widgets compacts
 */
export async function getEmployeeHoursOnly(
  employeeId: string,
  companyId: string
): Promise<ServiceResult<{ current: number; trend: number }>> {
  try {
    const hasAccess = await verifyEmployeeBelongsToCompany(
      employeeId,
      companyId
    )
    if (!hasAccess) {
      return { success: false, error: 'Acces non autorise' }
    }

    const hoursWorked = await getHoursWorked(employeeId, getDefaultDateRange())

    return {
      success: true,
      data: {
        current: hoursWorked.current,
        trend: hoursWorked.trend,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Recupere uniquement le solde de conges (version simplifiee)
 * Utile pour les widgets compacts
 */
export async function getEmployeeLeaveBalanceOnly(
  employeeId: string,
  companyId: string
): Promise<ServiceResult<{ remaining: number; total: number }>> {
  try {
    const hasAccess = await verifyEmployeeBelongsToCompany(
      employeeId,
      companyId
    )
    if (!hasAccess) {
      return { success: false, error: 'Acces non autorise' }
    }

    const balance = await getLeaveBalance(employeeId)

    return {
      success: true,
      data: {
        remaining: balance.remaining,
        total: balance.total,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
