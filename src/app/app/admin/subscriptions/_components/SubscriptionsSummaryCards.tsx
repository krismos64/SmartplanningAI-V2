/**
 * SubscriptionsSummaryCards — KPIs de synthèse abonnements/paiements
 *
 * Composant présentationnel (Server Component compatible).
 * MRR issu du service partagé mrr.service (SP-469), cohérent avec le dashboard.
 *
 * @ticket SP-542
 */

import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatEurosAsCurrency } from '@/lib/utils/formatters'
import type { AdminSubscriptionsSummary } from '@/lib/actions/admin-subscriptions'

export interface SubscriptionsSummaryCardsProps {
  summary: AdminSubscriptionsSummary
}

export function SubscriptionsSummaryCards({
  summary,
}: SubscriptionsSummaryCardsProps) {
  const cards = [
    {
      label: 'MRR',
      value: formatEurosAsCurrency(summary.mrr),
      icon: TrendingUp,
      alert: false,
      testId: 'kpi-mrr',
    },
    {
      label: 'Abonnements actifs',
      value: String(summary.activeCount),
      icon: CheckCircle2,
      alert: false,
      testId: 'kpi-active',
    },
    {
      label: 'Essais en cours',
      value: String(summary.trialCount),
      icon: Clock,
      alert: false,
      testId: 'kpi-trial',
    },
    {
      label: 'Paiements en retard',
      value: String(summary.pastDueCount),
      icon: AlertTriangle,
      alert: summary.pastDueCount > 0,
      testId: 'kpi-past-due',
    },
    {
      label: 'Échecs (30 j)',
      value: String(summary.failedPayments30d),
      icon: XCircle,
      alert: summary.failedPayments30d > 0,
      testId: 'kpi-failed-30d',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.testId}
          data-testid={card.testId}
          className={cn(card.alert && 'border-destructive/50')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <card.icon
                className={cn(
                  'h-4 w-4',
                  card.alert ? 'text-destructive' : 'text-muted-foreground'
                )}
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
            <p
              className={cn(
                'mt-2 text-2xl font-bold',
                card.alert && 'text-destructive'
              )}
            >
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
