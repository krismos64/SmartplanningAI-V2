/**
 * EmailLogsKpis — Indicateurs délivrabilité 7 jours
 *
 * Composant présentationnel (Server Component compatible).
 * Le taux d'échec passe en rouge dès qu'il est non nul : un échec
 * d'email transactionnel est toujours anormal (leçon Sprint 16).
 *
 * @ticket SP-545
 */

import { Send, AlertTriangle, PieChart } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getEmailTypeLabel } from '@/lib/validations/email-logs'
import type { EmailLogsKpis as EmailLogsKpisData } from '@/lib/actions/admin-email-logs'

export interface EmailLogsKpisProps {
  kpis: EmailLogsKpisData
}

export function EmailLogsKpis({ kpis }: EmailLogsKpisProps) {
  const hasFailures = kpis.failed7d > 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Volume 7 jours */}
      <Card data-testid="kpi-emails-7d">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Send
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-xs text-muted-foreground">Envois (7 jours)</p>
          </div>
          <p className="mt-2 text-2xl font-bold">{kpis.total7d}</p>
        </CardContent>
      </Card>

      {/* Taux d'échec */}
      <Card
        data-testid="kpi-failure-rate"
        className={cn(hasFailures && 'border-destructive/50')}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={cn(
                'h-4 w-4',
                hasFailures ? 'text-destructive' : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
            <p className="text-xs text-muted-foreground">
              Taux d&apos;échec (7 jours)
            </p>
          </div>
          <p
            className={cn(
              'mt-2 text-2xl font-bold',
              hasFailures && 'text-destructive'
            )}
          >
            {kpis.failureRate7d}%
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({kpis.failed7d} échec{kpis.failed7d > 1 ? 's' : ''})
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Top types */}
      <Card data-testid="kpi-top-types">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <PieChart
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-xs text-muted-foreground">
              Types les plus envoyés (7 jours)
            </p>
          </div>
          {kpis.topTypes.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Aucun envoi</p>
          ) : (
            <ul className="mt-2 space-y-0.5 text-sm">
              {kpis.topTypes.slice(0, 3).map((item) => (
                <li
                  key={item.emailType}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate">
                    {getEmailTypeLabel(item.emailType)}
                  </span>
                  <span className="font-medium tabular-nums">{item.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
