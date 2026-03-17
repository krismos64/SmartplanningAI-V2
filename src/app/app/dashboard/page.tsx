/**
 * Page Dashboard Employee
 *
 * Server Component qui affiche le tableau de bord personnalise
 * pour les employes avec leurs statistiques et planning.
 *
 * @ticket SP-145
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getEmployeeStats } from '@/lib/services/dashboard'

import { EmployeeWelcome } from './_components/EmployeeWelcome'
import { EmployeeStats } from './_components/EmployeeStats'
import { EmployeeSchedule } from './_components/EmployeeSchedule'
import { EmployeeLeaveBalance } from './_components/EmployeeLeaveBalance'
import { EmployeeQuickActions } from './_components/EmployeeQuickActions'
import { PersonalTasksWidget } from '@/components/dashboard'
import { getPersonalTasksForWidget } from '@/lib/actions/personal-tasks'
import { getLeaveBalance } from '@/lib/actions/leaves'
import { LeaveBalanceCard } from '@/components/leaves/LeaveBalanceCard'

export const metadata = {
  title: 'Mon Dashboard | SmartPlanning',
  description:
    'Tableau de bord employé - consultez vos heures, congés et planning',
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
 * Composant pour profil employe non configure
 */
function NoEmployeeProfile() {
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
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Profil employé non configuré</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre compte utilisateur n&apos;est pas lié à un profil employé.
        </p>
        <p className="text-sm text-muted-foreground">
          Contactez votre administrateur pour configurer votre profil.
        </p>
      </div>
    </div>
  )
}

export default async function EmployeeDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Verification du role - Employee ou redirection vers le dashboard approprié
  if (session.user.role === 'SYSTEM_ADMIN') {
    redirect('/app/admin/dashboard')
  }
  if (session.user.role === 'DIRECTOR') {
    redirect('/app/director/dashboard')
  }
  if (session.user.role === 'MANAGER') {
    redirect('/app/manager/dashboard')
  }

  // Recuperer l'utilisateur avec son profil employe
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      employee: {
        select: {
          id: true,
          companyId: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  // Verifier que l'utilisateur a un profil employe
  if (!user?.employee) {
    return <NoEmployeeProfile />
  }

  // Recuperer les statistiques via le service SP-144
  const statsResult = await getEmployeeStats({
    companyId: user.employee.companyId,
    employeeId: user.employee.id,
  })

  // Gestion des erreurs du service
  if (!statsResult.success || !statsResult.data) {
    return <ErrorState message={statsResult.error ?? 'Erreur inconnue'} />
  }

  const stats = statsResult.data

  // Recuperer les taches personnelles et le solde de conges en parallele
  const [tasksResult, leaveBalanceResult] = await Promise.all([
    getPersonalTasksForWidget(5),
    getLeaveBalance(),
  ])
  const personalTasks = tasksResult.success ? tasksResult.data : []

  // Compter le total des taches non completees
  const totalPendingCount = tasksResult.success ? personalTasks.length : 0

  // Nom d'affichage : prenom de l'employe ou nom du compte
  const displayName =
    user.employee.firstName ||
    user.name ||
    session.user.email?.split('@')[0] ||
    'Employe'

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <EmployeeWelcome userName={displayName} nextShift={stats.nextShift} />

      {/* Grille de statistiques */}
      <EmployeeStats stats={stats} />

      {/* Charts en 2 colonnes */}
      <div className="grid gap-6 md:grid-cols-2">
        <EmployeeSchedule weeklySchedule={stats.weeklySchedule} />
        {leaveBalanceResult.success && leaveBalanceResult.data ? (
          <LeaveBalanceCard balance={leaveBalanceResult.data} />
        ) : (
          <EmployeeLeaveBalance leaveBalance={stats.leaveBalance} />
        )}
      </div>

      {/* Widget Taches Personnelles (SP-420) */}
      <PersonalTasksWidget
        initialTasks={personalTasks}
        totalPendingCount={totalPendingCount}
      />

      {/* Actions rapides */}
      <EmployeeQuickActions pendingRequests={stats.pendingRequests} />
    </div>
  )
}
