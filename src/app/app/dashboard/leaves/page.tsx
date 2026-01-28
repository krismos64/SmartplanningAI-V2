/**
 * Page Leaves (Congés) - Server Component
 *
 * @description Page principale de gestion des congés avec fetch initial
 * @ticket SP-413
 */

import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLeaveRequests, getLeaveStats } from '@/lib/actions/leaves'
import { LeavesPageContent } from './_components/LeavesPageContent'
import LeavesLoading from './loading'

export default async function LeavesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const userRole = session.user.role
  const userId = session.user.id
  const companyId = session.user.companyId

  // Récupérer l'employeeId de l'utilisateur connecté
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: {
      id: true,
      teamId: true,
      managedTeams: { select: { id: true } },
    },
  })

  const employeeId = employee?.id ?? null
  const managedTeamIds = employee?.managedTeams?.map((t) => t.id) ?? []

  // Fetch initial data en parallèle
  const [requestsResult, statsResult] = await Promise.all([
    getLeaveRequests(undefined, { page: 1, pageSize: 10 }),
    getLeaveStats(),
  ])

  // Récupérer les équipes et employés pour les filtres (selon rôle)
  let teams: { id: string; name: string }[] = []
  let employees: { id: string; firstName: string; lastName: string }[] = []

  if (userRole === 'DIRECTOR' || userRole === 'SYSTEM_ADMIN') {
    // Director voit toutes les équipes et employés de son entreprise
    const [teamsData, employeesData] = await Promise.all([
      prisma.team.findMany({
        where: companyId ? { companyId } : {},
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.employee.findMany({
        where: companyId ? { companyId, isActive: true } : { isActive: true },
        select: { id: true, firstName: true, lastName: true },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
    ])
    teams = teamsData
    employees = employeesData
  } else if (userRole === 'MANAGER' && managedTeamIds.length > 0) {
    // Manager voit les employés de ses équipes
    employees = await prisma.employee.findMany({
      where: { teamId: { in: managedTeamIds }, isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })
  }

  // Préparer les données initiales
  const initialRequests = requestsResult.success ? requestsResult.data.data : []
  const initialPagination = requestsResult.success
    ? {
        page: requestsResult.data.page,
        pageSize: requestsResult.data.pageSize,
        total: requestsResult.data.total,
      }
    : { page: 1, pageSize: 10, total: 0 }

  const initialStats = statsResult.success
    ? {
        pending: statsResult.data.byStatus.PENDING ?? 0,
        approved: statsResult.data.byStatus.APPROVED ?? 0,
        rejected: statsResult.data.byStatus.REJECTED ?? 0,
        cancelled: statsResult.data.byStatus.CANCELLED ?? 0,
      }
    : { pending: 0, approved: 0, rejected: 0, cancelled: 0 }

  return (
    <Suspense fallback={<LeavesLoading />}>
      <LeavesPageContent
        initialRequests={initialRequests}
        initialPagination={initialPagination}
        initialStats={initialStats}
        currentUser={{
          id: userId,
          role: userRole,
          companyId: companyId ?? '',
          employeeId,
        }}
        employees={employees}
        teams={teams}
      />
    </Suspense>
  )
}
