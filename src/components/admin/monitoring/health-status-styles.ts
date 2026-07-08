/**
 * Palette de statut santé partagée entre les panneaux monitoring
 *
 * Source unique (SP-547) : était dupliquée entre DatabaseHealthPanel
 * (CHECK_STATUS_STYLES) et RedisHealthPanel/ActiveSessionsPanel (classes
 * inline). Un ajustement de la palette (ex : mode sombre) s'applique
 * désormais à tous les panneaux d'un coup.
 *
 * @ticket SP-547
 */

export type HealthStatusLevel = 'pass' | 'warn' | 'fail'

export const HEALTH_STATUS_STYLES: Record<
  HealthStatusLevel,
  { dot: string; text: string }
> = {
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
