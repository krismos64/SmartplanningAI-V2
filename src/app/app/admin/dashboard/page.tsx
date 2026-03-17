/**
 * Page Dashboard Super Admin
 *
 * Server Component qui affiche le tableau de bord global de la plateforme SaaS
 * pour les super administrateurs avec KPIs, graphiques et liste des entreprises.
 *
 * @ticket SP-148
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { getAdminStats } from '@/lib/services/dashboard'

import { AdminWelcome } from './_components/AdminWelcome'
import { AdminStats } from './_components/AdminStats'
import { AdminMrrChart } from './_components/AdminMrrChart'
import { AdminSignupsChart } from './_components/AdminSignupsChart'
import { AdminPlansChart } from './_components/AdminPlansChart'
import { AdminRecentCompanies } from './_components/AdminRecentCompanies'
import { AdminQuickActions } from './_components/AdminQuickActions'
import { TrialsAtRiskWidget } from './_components/TrialsAtRiskWidget'
import { PersonalTasksWidget } from '@/components/dashboard'
import { getPersonalTasksForWidget } from '@/lib/actions/personal-tasks'

export const metadata = {
  title: 'Dashboard Admin | SmartPlanning',
  description:
    'Tableau de bord administrateur - KPIs SaaS, MRR, entreprises et abonnements',
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

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Verification du role (SYSTEM_ADMIN uniquement)
  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  // Recuperer les statistiques via le service SP-144
  const statsResult = await getAdminStats()

  // Gestion des erreurs du service
  if (!statsResult.success || !statsResult.data) {
    return <ErrorState message={statsResult.error ?? 'Erreur inconnue'} />
  }

  const stats = statsResult.data

  // Nom d'affichage
  const displayName =
    session.user.name || session.user.email?.split('@')[0] || 'Administrateur'

  // Recuperer les taches personnelles pour le widget (SP-420)
  const tasksResult = await getPersonalTasksForWidget(5)
  const personalTasks = tasksResult.success ? tasksResult.data : []
  const totalPendingCount = tasksResult.success ? personalTasks.length : 0

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <AdminWelcome
        userName={displayName}
        totalCompanies={stats.totalCompanies.current}
        totalUsers={stats.totalUsers.current}
        mrr={stats.mrr.current}
        churnRate={stats.churnRate}
      />

      {/* Grille de 6 KPIs */}
      <AdminStats stats={stats} />

      {/* Charts en 2 colonnes */}
      <div className="grid gap-6 md:grid-cols-2">
        <AdminMrrChart companiesGrowth={stats.companiesGrowth} />
        <AdminSignupsChart companiesGrowth={stats.companiesGrowth} />
      </div>

      {/* Widget Trials at risk (SP-473) */}
      <TrialsAtRiskWidget />

      {/* Charts plans + dernières entreprises */}
      <div className="grid gap-6 md:grid-cols-2">
        <AdminPlansChart
          revenueByPlan={stats.revenueByPlan}
          subscriptionStatusDistribution={stats.subscriptionStatusDistribution}
        />
        <AdminRecentCompanies />
      </div>

      {/* Widget Taches Personnelles (SP-420) */}
      <PersonalTasksWidget
        initialTasks={personalTasks}
        totalPendingCount={totalPendingCount}
      />

      {/* Actions rapides */}
      <AdminQuickActions
        totalCompanies={stats.totalCompanies.current}
        activeSubscriptions={stats.activeSubscriptions}
      />
    </div>
  )
}
