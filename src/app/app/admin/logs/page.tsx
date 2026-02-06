/**
 * Page Logs Système - Coming Soon
 *
 * Placeholder pour la consultation des logs applicatifs (V2).
 * Accessible uniquement au SYSTEM_ADMIN.
 *
 * @ticket SP-451
 */
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { AlertCircle } from 'lucide-react'
import { ComingSoonPage } from '@/components/ui/coming-soon-page'

export const metadata: Metadata = {
  title: 'Logs système | SmartPlanning',
  description:
    'Consultation des logs applicatifs et erreurs de la plateforme SmartPlanning',
}

export default async function LogsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  return (
    <div className="space-y-6">
      <ComingSoonPage
        title="Logs système"
        description="Consultez et analysez les logs applicatifs pour diagnostiquer les erreurs et surveiller l'activité de la plateforme."
        icon={
          <AlertCircle
            className="h-12 w-12 text-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        }
        features={[
          {
            label: 'Logs en temps réel',
            description:
              'Flux de logs applicatifs avec filtrage par niveau (info, warning, error)',
          },
          {
            label: 'Recherche avancée',
            description:
              'Recherche full-text dans les logs avec filtres par date, utilisateur et type',
          },
          {
            label: 'Erreurs et exceptions',
            description:
              "Agrégation des erreurs avec stack traces et fréquence d'occurrence",
          },
          {
            label: 'Export et rétention',
            description:
              'Export des logs en CSV et configuration de la durée de rétention',
          },
        ]}
      />
    </div>
  )
}
