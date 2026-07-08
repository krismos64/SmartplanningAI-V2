'use client'

/**
 * RedisHealthPanel - Panneau santé Redis
 *
 * Affiche le statut PING/PONG et la latence Redis.
 * Redis down = mode dégradé (rate limiting en mémoire, cache désactivé),
 * jamais une panne bloquante — le message l'explique à l'admin.
 *
 * @ticket SP-544
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Database, Zap, ShieldCheck } from 'lucide-react'
import type { RedisHealthInfo } from '@/lib/actions/monitoring'
import { HEALTH_STATUS_STYLES } from './health-status-styles'

export interface RedisHealthPanelProps {
  redis: RedisHealthInfo
  className?: string
}

export function RedisHealthPanel({ redis, className }: RedisHealthPanelProps) {
  const isUp = redis.status === 'up'

  return (
    <Card className={cn('glass', className)} data-testid="redis-health-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-5 w-5 text-primary" aria-hidden="true" />
          Santé Redis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut PING */}
        <div className="space-y-1.5" data-testid="check-redis-ping">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm font-medium">Connexion (PING)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isUp
                    ? HEALTH_STATUS_STYLES.pass.dot
                    : HEALTH_STATUS_STYLES.warn.dot
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isUp
                    ? HEALTH_STATUS_STYLES.pass.text
                    : HEALTH_STATUS_STYLES.warn.text
                )}
              >
                {isUp ? 'OK' : 'Dégradé'}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {isUp
              ? `PONG reçu en ${redis.latency}ms`
              : 'Redis injoignable — mode dégradé actif'}
          </p>
        </div>

        {/* Impact fonctionnel */}
        <div className="space-y-1.5" data-testid="check-redis-impact">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm font-medium">Services dépendants</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isUp
              ? 'Rate limiting distribué, cache dashboards et suivi des sessions opérationnels'
              : "Fallback automatique : rate limiting en mémoire, cache désactivé, sessions non tracées. L'application reste fonctionnelle."}
          </p>
        </div>

        {/* Métriques brutes */}
        <div className="flex gap-4 border-t pt-3 text-xs text-muted-foreground">
          <span>
            Latence : {redis.latency !== null ? `${redis.latency}ms` : '—'}
          </span>
          <span>Statut : {isUp ? 'up' : 'down'}</span>
        </div>
      </CardContent>
    </Card>
  )
}
