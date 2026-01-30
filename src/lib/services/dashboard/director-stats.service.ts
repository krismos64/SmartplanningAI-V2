/**
 * Service de statistiques pour le role DIRECTOR
 *
 * Recupere les donnees globales de l'entreprise :
 * - Total employes et equipes
 * - Demandes de conges en attente
 * - Taux de presence moyen
 * - Stats par equipe (chart)
 * - Repartition des types de conges (pie chart)
 * - Evolution des effectifs (area chart)
 *
 * @ticket SP-144
 * @see Context7 - Prisma Best Practices Data Access Layer
 */

import { prisma } from '@/lib/prisma'
import type {
  DirectorStatsParams,
  DirectorStatsResult,
  ServiceResult,
} from './types'
import { startOfMonth, endOfMonth, subDays } from 'date-fns'
import {
  getDefaultDateRange,
  verifyCompanyAccess,
  calculateHoursBetween,
  roundToOneDecimal,
  getLastMonthsLabels,
  getYearStart,
} from './base-stats.service'

/**
 * Recupere les statistiques completes d'un directeur
 *
 * @param params - Parametres de la requete
 * @returns Statistiques de l'entreprise ou erreur
 */
export async function getDirectorStats(
  params: DirectorStatsParams
): Promise<ServiceResult<DirectorStatsResult>> {
  const { userId, companyId, dateRange = getDefaultDateRange() } = params

  try {
    // Verification de l'acces multi-tenant
    const hasAccess = await verifyCompanyAccess(userId, companyId)
    if (!hasAccess) {
      return {
        success: false,
        error: 'Acces non autorise a cette entreprise',
      }
    }

    // Recuperation des donnees en parallele
    const [
      totalEmployees,
      totalTeams,
      pendingLeaveRequests,
      averageAttendanceRate,
      plannedHoursThisMonth,
      absencesLast7Days,
      teamStats,
      leaveTypeDistribution,
      employeeGrowth,
    ] = await Promise.all([
      getTotalEmployees(companyId),
      getTotalTeams(companyId),
      getPendingLeaveRequestsCount(companyId),
      getAverageAttendanceRate(companyId, dateRange),
      getPlannedHoursThisMonth(companyId),
      getAbsencesLast7Days(companyId),
      getTeamStats(companyId, dateRange),
      getLeaveTypeDistribution(companyId),
      getEmployeeGrowth(companyId),
    ])

    return {
      success: true,
      data: {
        totalEmployees,
        totalTeams,
        pendingLeaveRequests,
        averageAttendanceRate,
        plannedHoursThisMonth,
        absencesLast7Days,
        teamStats,
        leaveTypeDistribution,
        employeeGrowth,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return {
      success: false,
      error: `Erreur lors de la recuperation des stats director: ${message}`,
    }
  }
}

/**
 * Compte le nombre total d'employes actifs
 */
async function getTotalEmployees(companyId: string): Promise<number> {
  return prisma.employee.count({
    where: {
      companyId,
      isActive: true,
    },
  })
}

/**
 * Compte le nombre total d'equipes
 */
async function getTotalTeams(companyId: string): Promise<number> {
  return prisma.team.count({
    where: {
      companyId,
    },
  })
}

/**
 * Compte les demandes de conges en attente (toute l'entreprise)
 */
async function getPendingLeaveRequestsCount(
  companyId: string
): Promise<number> {
  return prisma.leaveRequest.count({
    where: {
      companyId,
      status: 'PENDING',
    },
  })
}

/**
 * Calcule les heures planifiees pour le mois en cours
 * @ticket SP-317
 */
async function getPlannedHoursThisMonth(companyId: string): Promise<number> {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Recuperer tous les schedules du mois
  const schedules = await prisma.schedule.findMany({
    where: {
      companyId,
      startDate: { gte: monthStart, lte: monthEnd },
      type: 'WORK', // Seulement les creneaux de travail
    },
    select: {
      startTime: true,
      endTime: true,
    },
  })

  // Calculer le total des heures
  const totalHours = schedules.reduce((total, schedule) => {
    return total + calculateHoursBetween(schedule.startTime, schedule.endTime)
  }, 0)

  return roundToOneDecimal(totalHours)
}

/**
 * Compte les absences sur les 7 derniers jours
 * (conges approuves qui chevauchent la periode)
 * @ticket SP-317
 */
async function getAbsencesLast7Days(companyId: string): Promise<number> {
  const now = new Date()
  const sevenDaysAgo = subDays(now, 7)

  // Conges approuves qui chevauchent les 7 derniers jours
  return prisma.leaveRequest.count({
    where: {
      companyId,
      status: 'APPROVED',
      OR: [
        // Commence dans la periode
        { startDate: { gte: sevenDaysAgo, lte: now } },
        // Finit dans la periode
        { endDate: { gte: sevenDaysAgo, lte: now } },
        // Englobe la periode
        {
          AND: [
            { startDate: { lte: sevenDaysAgo } },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
  })
}

/**
 * Calcule le taux de presence moyen de l'entreprise
 * (pourcentage d'employes presents vs en conge)
 */
async function getAverageAttendanceRate(
  companyId: string,
  dateRange: { from: Date; to: Date }
): Promise<number> {
  // Total employes
  const totalEmployees = await prisma.employee.count({
    where: {
      companyId,
      isActive: true,
    },
  })

  if (totalEmployees === 0) return 100

  // Employes en conge sur la periode
  const employeesOnLeave = await prisma.leaveRequest.findMany({
    where: {
      companyId,
      status: 'APPROVED',
      OR: [
        {
          startDate: { gte: dateRange.from, lte: dateRange.to },
        },
        {
          endDate: { gte: dateRange.from, lte: dateRange.to },
        },
        {
          AND: [
            { startDate: { lte: dateRange.from } },
            { endDate: { gte: dateRange.to } },
          ],
        },
      ],
    },
    select: {
      employeeId: true,
    },
    distinct: ['employeeId'],
  })

  const employeesOnLeaveCount = employeesOnLeave.length
  const presentRate =
    ((totalEmployees - employeesOnLeaveCount) / totalEmployees) * 100

  return Math.round(presentRate)
}

/**
 * Recupere les statistiques par equipe (pour chart)
 */
async function getTeamStats(
  companyId: string,
  dateRange: { from: Date; to: Date }
): Promise<DirectorStatsResult['teamStats']> {
  // Recuperer toutes les equipes de l'entreprise
  const teams = await prisma.team.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          employees: { where: { isActive: true } },
        },
      },
    },
  })

  // Pour chaque equipe, calculer les heures et le taux de conges
  const teamStats = await Promise.all(
    teams.map(async (team) => {
      // Heures travaillees par l'equipe
      const schedules = await prisma.schedule.findMany({
        where: {
          teamId: team.id,
          startDate: { gte: dateRange.from, lte: dateRange.to },
          status: 'CONFIRMED',
          type: 'WORK',
        },
        select: { startTime: true, endTime: true },
      })

      const hoursWorked = schedules.reduce((total, schedule) => {
        return (
          total + calculateHoursBetween(schedule.startTime, schedule.endTime)
        )
      }, 0)

      // Taux de conges de l'equipe
      const teamEmployees = await prisma.employee.findMany({
        where: { teamId: team.id, isActive: true },
        select: { id: true },
      })

      const employeeIds = teamEmployees.map((e) => e.id)

      const leaveRequests = await prisma.leaveRequest.count({
        where: {
          employeeId: { in: employeeIds },
          status: 'APPROVED',
          startDate: { gte: dateRange.from, lte: dateRange.to },
        },
      })

      // Taux de conges (nombre de demandes / nombre d'employes)
      const leaveRate =
        teamEmployees.length > 0
          ? Math.round((leaveRequests / teamEmployees.length) * 100)
          : 0

      return {
        name: team.name,
        employees: team._count.employees,
        hoursWorked: roundToOneDecimal(hoursWorked),
        leaveRate,
      }
    })
  )

  return teamStats
}

/**
 * Recupere la repartition des types de conges (pour pie chart)
 */
async function getLeaveTypeDistribution(
  companyId: string
): Promise<DirectorStatsResult['leaveTypeDistribution']> {
  const yearStart = getYearStart(new Date())

  // Grouper les conges par type
  const leavesByType = await prisma.leaveRequest.groupBy({
    by: ['type'],
    where: {
      companyId,
      status: 'APPROVED',
      startDate: { gte: yearStart },
    },
    _count: true,
  })

  // Mapper vers les labels francais
  const typeLabels: Record<string, string> = {
    PAID_LEAVE: 'Congés payés',
    SICK_LEAVE: 'Maladie',
    UNPAID_LEAVE: 'Sans solde',
    RTT: 'RTT',
    PARENTAL_LEAVE: 'Parental',
    OTHER: 'Autre',
  }

  return leavesByType.map((item) => ({
    type: typeLabels[item.type] || item.type,
    count: item._count,
  }))
}

/**
 * Recupere l'evolution des effectifs sur 6 mois (pour area chart)
 */
async function getEmployeeGrowth(
  companyId: string
): Promise<DirectorStatsResult['employeeGrowth']> {
  const labels = getLastMonthsLabels(6)
  const now = new Date()

  const growth = await Promise.all(
    labels.map(async (month, index) => {
      // Calculer la date de fin pour ce mois
      const monthsAgo = 5 - index
      const endDate = new Date(
        now.getFullYear(),
        now.getMonth() - monthsAgo + 1,
        0
      )

      // Compter les employes actifs a cette date
      const count = await prisma.employee.count({
        where: {
          companyId,
          isActive: true,
          createdAt: { lte: endDate },
        },
      })

      return { month, count }
    })
  )

  return growth
}

/**
 * Recupere uniquement le total d'employes (version simplifiee)
 */
export async function getDirectorEmployeeCountOnly(
  userId: string,
  companyId: string
): Promise<ServiceResult<number>> {
  try {
    const hasAccess = await verifyCompanyAccess(userId, companyId)
    if (!hasAccess) {
      return { success: false, error: 'Acces non autorise' }
    }

    const count = await getTotalEmployees(companyId)
    return { success: true, data: count }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Recupere uniquement les demandes en attente (version simplifiee)
 */
export async function getDirectorPendingRequestsOnly(
  userId: string,
  companyId: string
): Promise<ServiceResult<number>> {
  try {
    const hasAccess = await verifyCompanyAccess(userId, companyId)
    if (!hasAccess) {
      return { success: false, error: 'Acces non autorise' }
    }

    const count = await getPendingLeaveRequestsCount(companyId)
    return { success: true, data: count }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Recupere les stats d'une equipe specifique (pour drill-down)
 */
export async function getDirectorTeamDetails(
  userId: string,
  companyId: string,
  teamId: string
): Promise<ServiceResult<DirectorStatsResult['teamStats'][0]>> {
  try {
    const hasAccess = await verifyCompanyAccess(userId, companyId)
    if (!hasAccess) {
      return { success: false, error: 'Acces non autorise' }
    }

    // Verifier que l'equipe appartient a l'entreprise
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { companyId: true },
    })

    if (team?.companyId !== companyId) {
      return { success: false, error: 'Equipe non trouvee' }
    }

    const dateRange = getDefaultDateRange()
    const stats = await getTeamStats(companyId, dateRange)
    const teamStat = stats.find((t) => t.name === team?.companyId)

    if (!teamStat) {
      return { success: false, error: 'Statistiques equipe non trouvees' }
    }

    return { success: true, data: teamStat }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
