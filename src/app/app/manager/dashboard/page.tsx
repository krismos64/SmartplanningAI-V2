/**
 * Dashboard Manager - Route /app/manager/dashboard
 *
 * Page d'accueil pour les utilisateurs avec role MANAGER.
 * Affiche une vue d'ensemble de l'equipe geree avec KPIs,
 * graphiques et liste des conges en attente.
 *
 * @ticket SP-316
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { hasRequiredRole } from '@/lib/permissions'
import { getManagerStats } from '@/lib/services/dashboard'

import { ManagerWelcome } from './_components/ManagerWelcome'
import { ManagerStats } from './_components/ManagerStats'
import { ManagerTeamChart } from './_components/ManagerTeamChart'
import { ManagerPendingLeaves } from './_components/ManagerPendingLeaves'
import type { PendingLeaveItem } from './_components/ManagerPendingLeaves'
import { ManagerQuickActions } from './_components/ManagerQuickActions'
import { PersonalTasksWidget } from '@/components/dashboard'
import { getPersonalTasksForWidget } from '@/lib/actions/personal-tasks'

export const metadata = {
  title: 'Dashboard Manager | SmartPlanning',
  description: "Tableau de bord manager - vue d'ensemble de votre equipe",
}

/**
 * Composant d'erreur pour les cas d'echec
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-destructive"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Erreur de chargement</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Composant pour manager sans equipe assignee
 */
function NoTeamAssigned() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-warning/10 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-warning"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Aucune équipe assignée</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vous n&apos;êtes pas assigné à une équipe en tant que manager.
        </p>
        <p className="text-sm text-muted-foreground">
          Contactez votre administrateur pour configurer votre accès.
        </p>
      </div>
    </div>
  )
}

export default async function ManagerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Verification du role (MANAGER ou superieur mais pas SYSTEM_ADMIN)
  if (session.user.role === 'SYSTEM_ADMIN') {
    redirect('/app/admin/dashboard')
  }
  if (session.user.role === 'DIRECTOR') {
    redirect('/app/director/dashboard')
  }
  if (!hasRequiredRole(session.user.role, 'MANAGER')) {
    redirect('/app/dashboard')
  }

  // Recuperer l'utilisateur avec son employee et son equipe geree
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      employee: {
        select: {
          id: true,
          companyId: true,
          firstName: true,
          lastName: true,
          managedTeams: {
            select: {
              id: true,
              name: true,
            },
            take: 1, // Premier equipe geree
          },
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Verifier que l'utilisateur a un profil employee et gere une equipe
  const managedTeam = user?.employee?.managedTeams?.[0]
  if (!user?.employee || !managedTeam) {
    return <NoTeamAssigned />
  }

  const companyId = user.employee.companyId

  // Recuperer les statistiques via le service
  const statsResult = await getManagerStats({
    companyId,
    teamId: managedTeam.id,
    managerId: user.employee.id,
  })

  // Gestion des erreurs du service
  if (!statsResult.success || !statsResult.data) {
    return <ErrorState message={statsResult.error ?? 'Erreur inconnue'} />
  }

  const stats = statsResult.data

  // Recuperer les demandes de conges en attente avec details
  const pendingLeaves = await prisma.leaveRequest.findMany({
    where: {
      employee: {
        teamId: managedTeam.id,
      },
      status: 'PENDING',
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  })

  // Transformer les conges pour le composant
  const pendingLeavesFormatted: PendingLeaveItem[] = pendingLeaves.map(
    (leave) => ({
      id: leave.id,
      employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
      startDate: leave.startDate,
      endDate: leave.endDate,
      type: leave.type,
      reason: leave.reason ?? undefined,
    })
  )

  // Recuperer les taches personnelles pour le widget (SP-420)
  const tasksResult = await getPersonalTasksForWidget(5)
  const personalTasks = tasksResult.success ? tasksResult.data : []
  const totalPendingCount = tasksResult.success ? personalTasks.length : 0

  // Nom d'affichage
  const displayName =
    user.employee.firstName ||
    user.name ||
    session.user.email?.split('@')[0] ||
    'Manager'

  return (
    <div className="space-y-6">
      {/* Message de bienvenue avec alertes */}
      <ManagerWelcome
        userName={displayName}
        pendingLeaveRequests={stats.pendingLeaveRequests}
        todayAbsences={stats.todayAbsences}
      />

      {/* Grille de 4 KPIs */}
      <ManagerStats stats={stats} />

      {/* Charts en 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ManagerTeamChart teamPerformance={stats.teamPerformance} />
        <ManagerPendingLeaves pendingLeaves={pendingLeavesFormatted} />
      </div>

      {/* Widget Taches Personnelles (SP-420) */}
      <PersonalTasksWidget
        initialTasks={personalTasks}
        totalPendingCount={totalPendingCount}
      />

      {/* Actions rapides */}
      <ManagerQuickActions pendingLeaveRequests={stats.pendingLeaveRequests} />
    </div>
  )
}
