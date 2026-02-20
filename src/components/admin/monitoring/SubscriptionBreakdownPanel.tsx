'use client'

/**
 * SubscriptionBreakdownPanel - Répartition des abonnements par statut
 *
 * Affiche un tableau simple avec badges colorés pour chaque statut Stripe.
 *
 * @ticket SP-464
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubscriptionBreakdownItem } from '@/lib/actions/monitoring'

export interface SubscriptionBreakdownPanelProps {
  breakdown: SubscriptionBreakdownItem[]
  className?: string
}

const STATUS_LABELS: Record<string, string> = {
  TRIAL: 'Essai',
  ACTIVE: 'Actif',
  PAST_DUE: 'Impayé',
  CANCELED: 'Annulé',
  EXPIRED: 'Expiré',
  INCOMPLETE: 'Incomplet',
}

const STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  TRIAL: 'outline',
  ACTIVE: 'default',
  PAST_DUE: 'destructive',
  CANCELED: 'secondary',
  EXPIRED: 'secondary',
  INCOMPLETE: 'outline',
}

export function SubscriptionBreakdownPanel({
  breakdown,
  className,
}: SubscriptionBreakdownPanelProps) {
  const total = breakdown.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card
      className={cn('glass', className)}
      data-testid="subscription-breakdown"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
          Abonnements
          <span className="text-sm font-normal text-muted-foreground">
            ({total} total)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun abonnement</p>
        ) : (
          <div className="space-y-3">
            {breakdown.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between"
              >
                <Badge variant={STATUS_VARIANTS[item.status] ?? 'outline'}>
                  {STATUS_LABELS[item.status] ?? item.status}
                </Badge>
                <span className="text-sm font-medium tabular-nums">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
