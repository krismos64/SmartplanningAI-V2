'use client'

/**
 * Composant StatCard - Carte de statistique KPI
 *
 * Affiche un KPI avec titre, valeur, icone optionnelle,
 * indicateur de tendance et etat de chargement.
 * Style: Cyber Glass 3D
 *
 * @ticket SP-142
 * @ticket SP-259 - Cyber Glass 3D Enhancement
 */

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendIndicator } from './TrendIndicator'
import type { StatCardProps } from '@/types/dashboard'

/**
 * Mapping des variantes de couleur pour les effets glow
 */
const glowVariants = {
  default: 'hover:shadow-md',
  primary: 'hover:shadow-stat-blue',
  success: 'hover:shadow-stat-emerald',
  warning: 'hover:shadow-stat-amber',
  danger: 'hover:shadow-stat-rose',
  info: 'hover:shadow-stat-cyan',
  accent: 'hover:shadow-stat-violet',
} as const

export type StatCardVariant = keyof typeof glowVariants

/**
 * Carte de statistique pour afficher un KPI
 * Style: Cyber Glass 3D avec effets glow au hover
 *
 * @example
 * // Basique
 * <StatCard title="Utilisateurs" value={1234} />
 *
 * // Avec icone et tendance
 * <StatCard
 *   title="Revenus"
 *   value="12 345 €"
 *   icon={EuroIcon}
 *   trend={{ value: 12.5, direction: 'up', label: 'vs mois dernier' }}
 * />
 *
 * // Avec variant coloré
 * <StatCard title="Actif" value={42} variant="success" />
 *
 * // En chargement
 * <StatCard title="Utilisateurs" value={0} isLoading />
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  unit,
  description,
  isLoading = false,
  variant = 'default',
  className,
}: StatCardProps) {
  // Formater la valeur avec unite si presente
  const displayValue = unit ? `${value}${unit}` : value

  if (isLoading) {
    return (
      <Card className={cn('glass overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'glass overflow-hidden transition-all duration-300 hover-lift',
        glowVariants[variant],
        className
      )}
      data-testid="stat-card"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="rounded-md bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{displayValue}</div>
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <TrendIndicator
              value={trend.value}
              direction={trend.direction}
              label={trend.label}
              size="sm"
            />
          )}
          {description && !trend && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {description && trend && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default StatCard
