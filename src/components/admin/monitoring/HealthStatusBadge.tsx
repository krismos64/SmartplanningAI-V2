'use client'

/**
 * HealthStatusBadge - Badge de statut santé système
 *
 * Affiche le statut global (healthy/degraded/unhealthy) avec couleur sémantique,
 * icône et latence optionnelle.
 *
 * @ticket SP-464
 */

import { cn } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { HealthStatus } from '@/lib/db-health'

export interface HealthStatusBadgeProps {
  status: HealthStatus
  latency?: number
  className?: string
}

const STATUS_CONFIG = {
  healthy: {
    label: 'Opérationnel',
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  degraded: {
    label: 'Dégradé',
    icon: AlertTriangle,
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  unhealthy: {
    label: 'Hors service',
    icon: XCircle,
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
} as const

export function HealthStatusBadge({
  status,
  latency,
  className,
}: HealthStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2',
        config.bg,
        className
      )}
      role="status"
      aria-label={`Statut système : ${config.label}`}
      data-testid="health-status-badge"
    >
      <span
        className={cn('h-2 w-2 rounded-full', config.dot)}
        aria-hidden="true"
      />
      <Icon className={cn('h-4 w-4', config.text)} aria-hidden="true" />
      <span className={cn('text-sm font-medium', config.text)}>
        {config.label}
      </span>
      {latency !== undefined && (
        <span className={cn('text-xs opacity-75', config.text)}>
          ({latency}ms)
        </span>
      )}
    </div>
  )
}
