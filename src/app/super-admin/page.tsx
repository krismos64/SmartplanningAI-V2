import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function SuperAdminPage() {
  const mockUser = {
    id: '1',
    name: 'Christophe Mostefaoui',
    email: 'admin@smartplanning.com',
    role: 'SUPER_ADMIN' as const,
  }

  return (
    <DashboardLayout user={mockUser}>
      <div className="flex min-h-[600px] items-center justify-center p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              🚧 Dashboard SaaS
            </CardTitle>
            <CardDescription>
              Administration globale - En cours de développement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Cette interface sera développée dans la <strong>Phase 5</strong>{' '}
              du projet (Epic "Administration SaaS").
            </p>

            <div>
              <h3 className="mb-3 font-semibold">Fonctionnalités prévues :</h3>
              <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Métriques SaaS globales</strong> : MRR, churn rate,
                  utilisateurs actifs
                </li>
                <li>
                  <strong>Liste organisations clientes</strong> : CRUD complet
                  avec pagination
                </li>
                <li>
                  <strong>Logs d'accès</strong> : Conformité RGPD, audit trail
                </li>
                <li>
                  <strong>Mode impersonate</strong> : Se connecter en tant
                  qu'un utilisateur client
                </li>
                <li>
                  <strong>Monitoring système</strong> : Health checks,
                  performances, erreurs
                </li>
                <li>
                  <strong>Gestion des abonnements</strong> : Stripe webhooks,
                  facturation
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Navigation actuelle :</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Dashboard SaaS (cette page)</li>
                <li>Organisations (à venir)</li>
                <li>Monitoring (à venir)</li>
                <li>Logs système (à venir)</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">📝 Note technique</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Le layout (Header + Sidebar + Footer) est fonctionnel pour
                tester la navigation. Les pages réelles seront développées
                ultérieurement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
