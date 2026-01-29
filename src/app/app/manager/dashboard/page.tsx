/**
 * Dashboard Manager - Route /app/manager/dashboard
 *
 * Page d'accueil pour les utilisateurs avec role MANAGER ou superieur.
 * Affiche une vue d'ensemble de l'équipe managée.
 *
 * @ticket SP-110, SP-146
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PersonalTasksWidget } from '@/components/dashboard'
import { getPersonalTasksForWidget } from '@/lib/actions/personal-tasks'

export const metadata = {
  title: 'Dashboard Manager | SmartPlanning',
  description: "Tableau de bord manager - vue d'ensemble de votre équipe",
}

export default async function ManagerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Nom d'affichage
  const displayName =
    session.user.name || session.user.email?.split('@')[0] || 'Manager'

  // Recuperer les taches personnelles pour le widget (SP-420)
  const tasksResult = await getPersonalTasksForWidget(5)
  const personalTasks = tasksResult.success ? tasksResult.data : []
  const totalPendingCount = tasksResult.success ? personalTasks.length : 0

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <Card className="border-none bg-gradient-to-r from-blue-500/10 to-blue-500/5">
        <CardContent className="pt-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Bienvenue, {displayName} !
            </h1>
            <p className="text-muted-foreground">
              Vue d&apos;ensemble de votre équipe
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs placeholder */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membres équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Collaborateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Congés à valider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Demandes en attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Absents aujourd&apos;hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Collaborateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Heures équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="default">
              <Link href="/team">Gérer mon équipe</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/leaves/pending">Congés en attente</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/planning">Voir le planning</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Widget Taches Personnelles (SP-420) */}
      <PersonalTasksWidget
        initialTasks={personalTasks}
        totalPendingCount={totalPendingCount}
      />

      {/* Info role */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Role: <span className="font-medium">{session.user.role}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
