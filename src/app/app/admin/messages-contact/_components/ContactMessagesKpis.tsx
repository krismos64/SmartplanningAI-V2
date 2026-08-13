/**
 * ContactMessagesKpis - Compteurs de suivi des demandes de contact
 *
 * Composant presentationnel (Server Component compatible).
 *
 * Le compteur « non notifiées » passe en rouge dès qu'il est non nul : ces
 * demandes sont arrivees sans qu'aucun email ne previenne l'equipe, elles ne
 * seront vues que sur cet ecran.
 *
 * @ticket SP-577
 */

import { Inbox, AlertTriangle, CalendarDays } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ContactMessagesKpis as ContactMessagesKpisData } from '@/lib/actions/admin-contact-messages'

export interface ContactMessagesKpisProps {
  kpis: ContactMessagesKpisData
}

export function ContactMessagesKpis({ kpis }: ContactMessagesKpisProps) {
  const hasFailures = kpis.failed > 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card data-testid="kpi-contact-unread">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Inbox
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-xs text-muted-foreground">À traiter</p>
          </div>
          <p className="mt-2 text-2xl font-bold">{kpis.unread}</p>
        </CardContent>
      </Card>

      <Card
        data-testid="kpi-contact-failed"
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
            <p className="text-xs text-muted-foreground">Non notifiées</p>
          </div>
          <p
            className={cn(
              'mt-2 text-2xl font-bold',
              hasFailures && 'text-destructive'
            )}
          >
            {kpis.failed}
          </p>
          {hasFailures && (
            <p className="mt-1 text-xs text-destructive">
              Aucun email n&apos;est parti pour ces demandes
            </p>
          )}
        </CardContent>
      </Card>

      <Card data-testid="kpi-contact-30d">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CalendarDays
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-xs text-muted-foreground">Reçues (30 jours)</p>
          </div>
          <p className="mt-2 text-2xl font-bold">{kpis.last30Days}</p>
        </CardContent>
      </Card>
    </div>
  )
}
