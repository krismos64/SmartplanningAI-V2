'use client'

/**
 * Composant StatCard - Carte de statistique KPI
 *
 * Affiche un KPI avec titre, valeur, icone optionnelle,
 * indicateur de tendance et etat de chargement.
 *
 * @ticket SP-142
 */

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendIndicator } from './TrendIndicator'
import type { StatCardProps } from '@/types/dashboard'

/**
 * Carte de statistique pour afficher un KPI
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
  className,
}: StatCardProps) {
  // Formater la valeur avec unite si presente
  const displayValue = unit ? `${value}${unit}` : value

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
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
        'overflow-hidden transition-shadow hover:shadow-md',
        className
      )}
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
