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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'
import type { ActiveSessionInfo } from '@/lib/actions/monitoring'

export interface ActiveSessionsPanelProps {
  sessions: ActiveSessionInfo[]
  /** false si Redis est down (liste vide ≠ personne de connecté) */
  redisUp: boolean
  className?: string
}

const MAX_DISPLAYED = 8

const ROLE_BADGE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'info'
> = {
  SYSTEM_ADMIN: 'destructive',
  DIRECTOR: 'default',
  MANAGER: 'info',
  EMPLOYEE: 'secondary',
}

const ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: 'Admin',
  DIRECTOR: 'Directeur',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employé',
}

/** "il y a 3 min" / "il y a 2 h" à partir d'un ISO 8601 */
function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `il y a ${hours} h`
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
            Indisponible — Redis est en mode dégradé, le suivi des sessions est
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
                    className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm">{session.email}</span>
                  <Badge
                    variant={ROLE_BADGE_VARIANT[session.role] ?? 'secondary'}
                    size="sm"
                  >
                    {ROLE_LABELS[session.role] ?? session.role}
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
