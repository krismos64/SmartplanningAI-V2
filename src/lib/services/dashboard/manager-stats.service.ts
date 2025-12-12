/**
 * Service de statistiques pour le role MANAGER
 *
 * Recupere les donnees de l'equipe geree :
 * - Taille de l'equipe
 * - Demandes de conges en attente
 * - Absences du jour
 * - Taux de couverture planning
 * - Performance par membre (chart)
 * - Tendance des demandes (chart)
 *
 * @ticket SP-144
 * @see Context7 - Prisma Best Practices Data Access Layer
 */

import { prisma } from '@/lib/prisma'
import type {
  ManagerStatsParams,
  ManagerStatsResult,
  ServiceResult,
} from './types'
import {
  calculateTrend,
  getDefaultDateRange,
  getPreviousPeriod,
  calculateHoursBetween,
  roundToOneDecimal,
  verifyManagerOfTeam,
  formatDateForChart,
} from './base-stats.service'

/**
 * Recupere les statistiques completes d'un manager
 *
 * @param params - Parametres de la requete
 * @returns Statistiques de l'equipe ou erreur
 */
export async function getManagerStats(
  params: ManagerStatsParams
): Promise<ServiceResult<ManagerStatsResult>> {
  const {
    teamId,
    managerId,
    companyId,
    dateRange = getDefaultDateRange(),
  } = params

  try {
    // Verification de l'acces : le manager gere-t-il cette equipe ?
    const isManager = await verifyManagerOfTeam(managerId, teamId)
    if (!isManager) {
      return {
        success: false,
        error: 'Acces non autorise a cette equipe',
      }
    }

    // Verification multi-tenant
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { companyId: true },
    })
    if (team?.companyId !== companyId) {
      return {
        success: false,
        error: 'Equipe non trouvee dans cette entreprise',
      }
    }

    // Recuperation des donnees en parallele
    const [
      teamSize,
      pendingLeaveRequests,
      todayAbsences,
      coverageRate,
      teamHoursWorked,
      teamPerformance,
      leaveRequestsTrend,
    ] = await Promise.all([
      getTeamSize(teamId),
      getPendingLeaveRequestsCount(teamId),
      getTodayAbsencesCount(teamId),
      getCoverageRate(teamId, dateRange),
      getTeamHoursWorked(teamId, dateRange),
      getTeamPerformance(teamId, dateRange),
      getLeaveRequestsTrend(teamId),
    ])

    return {
      success: true,
      data: {
        teamSize,
        pendingLeaveRequests,
        todayAbsences,
        coverageRate,
        teamHoursWorked,
        teamPerformance,
        leaveRequestsTrend,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return {
      success: false,
      error: `Erreur lors de la recuperation des stats manager: ${message}`,
    }
  }
}

/**
 * Compte le nombre de membres dans l'equipe
 */
async function getTeamSize(teamId: string): Promise<number> {
  return prisma.employee.count({
    where: {
      teamId,
      isActive: true,
    },
  })
}

/**
 * Compte les demandes de conges en attente pour l'equipe
 */
async function getPendingLeaveRequestsCount(teamId: string): Promise<number> {
  // Recuperer les IDs des employes de l'equipe
  const employees = await prisma.employee.findMany({
    where: { teamId, isActive: true },
    select: { id: true },
  })

  const employeeIds = employees.map((e) => e.id)

  return prisma.leaveRequest.count({
    where: {
      employeeId: { in: employeeIds },
      status: 'PENDING',
    },
  })
}

/**
 * Compte les absences du jour (conges approuves en cours)
 */
async function getTodayAbsencesCount(teamId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Recuperer les IDs des employes de l'equipe
  const employees = await prisma.employee.findMany({
    where: { teamId, isActive: true },
    select: { id: true },
  })

  const employeeIds = employees.map((e) => e.id)

  return prisma.leaveRequest.count({
    where: {
      employeeId: { in: employeeIds },
      status: 'APPROVED',
      startDate: { lte: today },
      endDate: { gte: today },
    },
  })
}

/**
 * Calcule le taux de couverture planning (% de shifts pourvus)
 */
async function getCoverageRate(
  teamId: string,
  dateRange: { from: Date; to: Date }
): Promise<number> {
  // Compter les schedules confirmes
  const confirmedSchedules = await prisma.schedule.count({
    where: {
      teamId,
      startDate: { gte: dateRange.from, lte: dateRange.to },
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
  })

  // Compter tous les schedules (y compris brouillons)
  const totalSchedules = await prisma.schedule.count({
    where: {
      teamId,
      startDate: { gte: dateRange.from, lte: dateRange.to },
    },
  })

  if (totalSchedules === 0) return 100

  return Math.round((confirmedSchedules / totalSchedules) * 100)
}

/**
 * Calcule les heures travaillees par l'equipe avec tendance
 */
async function getTeamHoursWorked(
  teamId: string,
  dateRange: { from: Date; to: Date }
): Promise<ManagerStatsResult['teamHoursWorked']> {
  const previousPeriod = getPreviousPeriod(dateRange)

  // Heures periode courante
  const currentSchedules = await prisma.schedule.findMany({
    where: {
      teamId,
      startDate: { gte: dateRange.from, lte: dateRange.to },
      status: 'COMPLETED',
      type: 'WORK',
    },
    select: { startTime: true, endTime: true },
  })

  const currentHours = currentSchedules.reduce((total, schedule) => {
    return total + calculateHoursBetween(schedule.startTime, schedule.endTime)
  }, 0)

  // Heures periode precedente
  const previousSchedules = await prisma.schedule.findMany({
    where: {
      teamId,
      startDate: { gte: previousPeriod.from, lte: previousPeriod.to },
      status: 'COMPLETED',
      type: 'WORK',
    },
    select: { startTime: true, endTime: true },
  })

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
 * Recupere les performances par membre de l'equipe (pour chart)
 */
async function getTeamPerformance(
  teamId: string,
  dateRange: { from: Date; to: Date }
): Promise<ManagerStatsResult['teamPerformance']> {
  // Recuperer les employes de l'equipe
  const employees = await prisma.employee.findMany({
    where: { teamId, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      weeklyHours: true,
    },
  })

  // Pour chaque employe, calculer les heures travaillees
  const performance = await Promise.all(
    employees.map(async (employee) => {
      const schedules = await prisma.schedule.findMany({
        where: {
          employeeId: employee.id,
          startDate: { gte: dateRange.from, lte: dateRange.to },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          type: 'WORK',
        },
        select: { startTime: true, endTime: true },
      })

      const hoursWorked = schedules.reduce((total, schedule) => {
        return (
          total + calculateHoursBetween(schedule.startTime, schedule.endTime)
        )
      }, 0)

      // Calculer les heures attendues sur la periode
      const weeks =
        (dateRange.to.getTime() - dateRange.from.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
      const scheduledHours = employee.weeklyHours * weeks

      return {
        name: `${employee.firstName} ${employee.lastName.charAt(0)}.`,
        hoursWorked: roundToOneDecimal(hoursWorked),
        scheduledHours: roundToOneDecimal(scheduledHours),
      }
    })
  )

  return performance
}

/**
 * Recupere la tendance des demandes de conges (30 derniers jours)
 */
async function getLeaveRequestsTrend(
  teamId: string
): Promise<ManagerStatsResult['leaveRequestsTrend']> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Recuperer les IDs des employes de l'equipe
  const employees = await prisma.employee.findMany({
    where: { teamId, isActive: true },
    select: { id: true },
  })

  const employeeIds = employees.map((e) => e.id)

  // Recuperer toutes les demandes des 30 derniers jours
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      employeeId: { in: employeeIds },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      createdAt: true,
      status: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Agreger par semaine (4 points de donnees)
  const weeks: ManagerStatsResult['leaveRequestsTrend'] = []
  const now = new Date()

  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() - i * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 7)

    const weekRequests = leaveRequests.filter((req) => {
      const date = new Date(req.createdAt)
      return date >= weekStart && date < weekEnd
    })

    weeks.push({
      date: formatDateForChart(weekStart, 'short'),
      pending: weekRequests.filter((r) => r.status === 'PENDING').length,
      approved: weekRequests.filter((r) => r.status === 'APPROVED').length,
      rejected: weekRequests.filter((r) => r.status === 'REJECTED').length,
    })
  }

  return weeks
}

/**
 * Recupere uniquement le nombre de demandes en attente (version simplifiee)
 */
export async function getManagerPendingRequestsOnly(
  managerId: string,
  teamId: string
): Promise<ServiceResult<number>> {
  try {
    const isManager = await verifyManagerOfTeam(managerId, teamId)
    if (!isManager) {
      return { success: false, error: 'Acces non autorise' }
    }

    const count = await getPendingLeaveRequestsCount(teamId)
    return { success: true, data: count }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Recupere uniquement les absences du jour (version simplifiee)
 */
export async function getManagerTodayAbsencesOnly(
  managerId: string,
  teamId: string
): Promise<ServiceResult<number>> {
  try {
    const isManager = await verifyManagerOfTeam(managerId, teamId)
    if (!isManager) {
      return { success: false, error: 'Acces non autorise' }
    }

    const count = await getTodayAbsencesCount(teamId)
    return { success: true, data: count }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
