'use client'

/**
 * DatabaseHealthPanel - Panneau santé base de données
 *
 * Affiche les 4 checks DB (connexion, latence, migrations, pool) avec
 * ProgressBar pour l'utilisation du pool de connexions.
 *
 * @ticket SP-464
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'
import { Database, Zap, GitBranch, Layers } from 'lucide-react'
import type { HealthCheckResult } from '@/lib/db-health'

export interface DatabaseHealthPanelProps {
  health: HealthCheckResult
  className?: string
}

const CHECK_META = {
  connection: { label: 'Connexion', icon: Database },
  latency: { label: 'Latence', icon: Zap },
  migrations: { label: 'Schéma DB', icon: GitBranch },
  poolSize: { label: 'Pool connexions', icon: Layers },
} as const

const CHECK_STATUS_STYLES = {
  pass: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  warn: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
  fail: {
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
  },
} as const

function parsePoolPercentage(value?: number | string | boolean): number | null {
  if (typeof value === 'string' && value.includes('/')) {
    const parts = value.split('/')
    const a = parseInt(parts[0] ?? '', 10)
    const t = parseInt(parts[1] ?? '', 10)
    if (!isNaN(a) && !isNaN(t) && t > 0) {
      return Math.round((a / t) * 100)
    }
  }
  return null
}

function getPoolProgressColor(
  status: 'pass' | 'warn' | 'fail'
): 'success' | 'warning' | 'destructive' {
  if (status === 'fail') return 'destructive'
  if (status === 'warn') return 'warning'
  return 'success'
}

export function DatabaseHealthPanel({
  health,
  className,
}: DatabaseHealthPanelProps) {
  const poolPercentage = parsePoolPercentage(health.checks.poolSize.value)

  return (
    <Card className={cn('glass', className)} data-testid="db-health-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-5 w-5 text-primary" aria-hidden="true" />
          Santé base de données
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(CHECK_META) as Array<keyof typeof CHECK_META>).map(
          (key) => {
            const check = health.checks[key]
            const meta = CHECK_META[key]
            const styles = CHECK_STATUS_STYLES[check.status]
            const Icon = meta.icon

            return (
              <div
                key={key}
                className="space-y-1.5"
                data-testid={`check-${key}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn('h-2 w-2 rounded-full', styles.dot)}
                      aria-hidden="true"
                    />
                    <span className={cn('text-xs font-medium', styles.text)}>
                      {check.status === 'pass'
                        ? 'OK'
                        : check.status === 'warn'
                          ? 'Attention'
                          : 'Erreur'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{check.message}</p>

                {key === 'poolSize' && poolPercentage !== null && (
                  <ProgressBar
                    value={poolPercentage}
                    color={getPoolProgressColor(check.status)}
                    size="sm"
                    showLabel
                    aria-label="Utilisation du pool de connexions"
                  />
                )}
              </div>
            )
          }
        )}

        {/* Métriques brutes */}
        <div className="flex gap-4 border-t pt-3 text-xs text-muted-foreground">
          <span>Latence : {health.metrics.latency}ms</span>
          {health.metrics.activeConnections !== undefined && (
            <span>Actives : {health.metrics.activeConnections}</span>
          )}
          {health.metrics.idleConnections !== undefined && (
            <span>Idle : {health.metrics.idleConnections}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
