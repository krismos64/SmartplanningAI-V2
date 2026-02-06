/**
 * Page Monitoring - Coming Soon
 *
 * Placeholder pour la fonctionnalité de surveillance système (V2).
 * Accessible uniquement au SYSTEM_ADMIN.
 *
 * @ticket SP-451
 */
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { Activity } from 'lucide-react'
import { ComingSoonPage } from '@/components/ui/coming-soon-page'

export const metadata: Metadata = {
  title: 'Monitoring | SmartPlanning',
  description:
    'Surveillance système et performance en temps réel de la plateforme SmartPlanning',
}

export default async function MonitoringPage() {
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
        title="Monitoring système"
        description="Surveillez les performances, la disponibilité et la santé de la plateforme SmartPlanning en temps réel."
        icon={
          <Activity
            className="h-12 w-12 text-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        }
        features={[
          {
            label: 'Uptime & disponibilité',
            description:
              'Suivi en temps réel du taux de disponibilité de la plateforme',
          },
          {
            label: 'Métriques de performance',
            description:
              'Temps de réponse API, utilisation CPU/RAM, requêtes par seconde',
          },
          {
            label: 'Alertes automatiques',
            description:
              'Notifications en cas de dégradation de performance ou de panne',
          },
          {
            label: 'Historique des incidents',
            description:
              'Journal des incidents passés avec analyse des causes racines',
          },
        ]}
      />
    </div>
  )
}
