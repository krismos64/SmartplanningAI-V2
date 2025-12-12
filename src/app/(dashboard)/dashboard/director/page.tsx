/**
 * Page Dashboard Director
 *
 * Server Component qui affiche le tableau de bord global de l'entreprise
 * pour les directeurs avec KPIs, graphiques et liste des conges.
 *
 * @ticket SP-147
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { hasRequiredRole } from '@/lib/permissions'
import { getDirectorStats } from '@/lib/services/dashboard'

import { DirectorWelcome } from './_components/DirectorWelcome'
import { DirectorStats } from './_components/DirectorStats'
import { DirectorTeamsChart } from './_components/DirectorTeamsChart'
import { DirectorTrendsChart } from './_components/DirectorTrendsChart'
import { DirectorPendingLeaves } from './_components/DirectorPendingLeaves'
import { DirectorQuickActions } from './_components/DirectorQuickActions'
import type { PendingLeaveItem } from './_components/DirectorPendingLeaves'

export const metadata = {
  title: 'Dashboard Director | SmartPlanning',
  description:
    'Tableau de bord directeur - vue globale entreprise, equipes et conges',
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
 * Composant pour entreprise non assignee
 */
function NoCompanyAssigned() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="bg-warning/10 rounded-full p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-warning h-8 w-8"
          aria-hidden="true"
        >
          <path d="M3 21h18" />
          <path d="M9 8h1" />
          <path d="M9 12h1" />
          <path d="M9 16h1" />
          <path d="M14 8h1" />
          <path d="M14 12h1" />
          <path d="M14 16h1" />
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Entreprise non configuree</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre compte n&apos;est pas associe a une entreprise.
        </p>
        <p className="text-sm text-muted-foreground">
          Contactez l&apos;administrateur pour configurer votre acces.
        </p>
      </div>
    </div>
  )
}

export default async function DirectorDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Verification du role (DIRECTOR ou superieur)
  if (!hasRequiredRole(session.user.role, 'DIRECTOR')) {
    redirect('/dashboard')
  }

  // Recuperer l'utilisateur avec son entreprise
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Verifier que l'utilisateur a une entreprise assignee
  if (!user?.company) {
    return <NoCompanyAssigned />
  }

  // Recuperer les statistiques via le service SP-144
  const statsResult = await getDirectorStats({
    userId: session.user.id,
    companyId: user.company.id,
  })

  // Gestion des erreurs du service
  if (!statsResult.success || !statsResult.data) {
    return <ErrorState message={statsResult.error ?? 'Erreur inconnue'} />
  }

  const stats = statsResult.data

  // Recuperer les 5 derniers conges en attente pour la liste
  const pendingLeaves = await prisma.leaveRequest.findMany({
    where: {
      companyId: user.company.id,
      status: 'PENDING',
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          team: {
            select: {
              name: true,
            },
          },
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
      teamName: leave.employee.team?.name ?? 'Sans equipe',
      startDate: leave.startDate,
      endDate: leave.endDate,
      type: leave.type,
    })
  )

  // Nom d'affichage
  const displayName =
    user.name || session.user.email?.split('@')[0] || 'Directeur'

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <DirectorWelcome
        userName={displayName}
        companyName={user.company.name}
        pendingLeaves={stats.pendingLeaveRequests}
        attendanceRate={stats.averageAttendanceRate}
      />

      {/* Grille de 6 KPIs */}
      <DirectorStats stats={stats} />

      {/* Charts en 2 colonnes */}
      <div className="grid gap-6 md:grid-cols-2">
        <DirectorTeamsChart teamStats={stats.teamStats} />
        <DirectorTrendsChart employeeGrowth={stats.employeeGrowth} />
      </div>

      {/* Liste des conges en attente */}
      <DirectorPendingLeaves
        pendingLeaves={pendingLeavesFormatted}
        totalPending={stats.pendingLeaveRequests}
      />

      {/* Actions rapides */}
      <DirectorQuickActions pendingLeaves={stats.pendingLeaveRequests} />
    </div>
  )
}
