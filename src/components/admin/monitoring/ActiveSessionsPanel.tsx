'use client'

/**
 * ActiveSessionsPanel - Sessions actives (Redis)
 *
 * Liste les utilisateurs connectés (clés session:* Redis, TTL 24h),
 * triés par activité récente. Affiche les 8 plus récentes + compteur total.
 * ip/userAgent volontairement exclus de l'affichage (minimisation RGPD).
 *
 * @ticket SP-544
 */

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ROLE_LABELS_SHORT, ROLE_BADGE_VARIANTS } from '@/lib/permissions'
import { HEALTH_STATUS_STYLES } from './health-status-styles'
import { Users } from 'lucide-react'
import type { ActiveSessionInfo } from '@/lib/actions/monitoring'

export interface ActiveSessionsPanelProps {
  sessions: ActiveSessionInfo[]
  /** false si Redis est down (liste vide ≠ personne de connecté) */
  redisUp: boolean
  className?: string
}

const MAX_DISPLAYED = 8

/**
 * "il y a 3 minutes" / "il y a 2 heures" — même helper date-fns que le reste
 * de l'app (NotificationItem, AccountInfoCard, LeaveTimeline), au lieu d'une
 * réimplémentation maison qui affichait « il y a 30 h » au-delà de 24 h.
 */
function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { locale: fr, addSuffix: true })
}

export function ActiveSessionsPanel({
  sessions,
  redisUp,
  className,
}: ActiveSessionsPanelProps) {
  const displayed = sessions.slice(0, MAX_DISPLAYED)

  return (
    <Card
      className={cn('glass', className)}
      data-testid="active-sessions-panel"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
            Sessions actives
          </span>
          {redisUp && (
            <Badge variant="secondary" data-testid="sessions-count">
              {sessions.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!redisUp ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Indisponible : Redis est en mode dégradé, le suivi des sessions est
            suspendu
          </p>
        ) : displayed.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucune session active
          </p>
        ) : (
          <ul className="space-y-3">
            {displayed.map((session) => (
              <li
                key={session.userId}
                className="flex items-center justify-between gap-2"
                data-testid="active-session-row"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      'h-2 w-2 flex-shrink-0 rounded-full',
                      HEALTH_STATUS_STYLES.pass.dot
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm">{session.email}</span>
                  <Badge
                    variant={
                      ROLE_BADGE_VARIANTS[
                        session.role as keyof typeof ROLE_BADGE_VARIANTS
                      ] ?? 'secondary'
                    }
                    size="sm"
                  >
                    {ROLE_LABELS_SHORT[
                      session.role as keyof typeof ROLE_LABELS_SHORT
                    ] ?? session.role}
                  </Badge>
                </div>
                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(session.lastSeenAt)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {redisUp && sessions.length > MAX_DISPLAYED && (
          <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
            + {sessions.length - MAX_DISPLAYED} autre
            {sessions.length - MAX_DISPLAYED > 1 ? 's' : ''} session
            {sessions.length - MAX_DISPLAYED > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
