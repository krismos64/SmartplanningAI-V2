'use client'

/**
 * TrialsAtRiskWidget — Entreprises en période d'essai expirant sous 7 jours
 *
 * Affiche les trials triés par urgence avec actions directes
 * (voir entreprise, prolonger +7j).
 *
 * @ticket SP-473
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Plus,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/toast/use-toast'
import {
  getTrialsAtRisk,
  extendTrial,
  type TrialAtRisk,
} from '@/lib/actions/admin-trials'

// ============================================================================
// Constants
// ============================================================================

const URGENCY_CONFIG = {
  critical: {
    variant: 'destructive' as const,
    label: 'Critique',
  },
  warning: {
    variant: 'outline' as const,
    label: 'Attention',
    className: 'border-orange-500 text-orange-600 dark:text-orange-400',
  },
  info: {
    variant: 'secondary' as const,
    label: 'Info',
  },
} as const

// ============================================================================
// Helpers
// ============================================================================

function formatDaysRemaining(days: number): string {
  if (days <= 0) return "Expiré aujourd'hui"
  if (days === 1) return '1 jour restant'
  return `${days} jours restants`
}

// ============================================================================
// Sub-components
// ============================================================================

function TrialRow({
  trial,
  onExtend,
  isExtending,
}: {
  trial: TrialAtRisk
  onExtend: (companyId: string) => void
  isExtending: string | null
}) {
  const urgencyConfig = URGENCY_CONFIG[trial.urgency]

  return (
    <div
      className="flex flex-col gap-3 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
      data-testid="trial-row"
    >
      {/* Info entreprise */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/app/admin/entreprises/${trial.companyId}`}
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
            <span className="truncate">{trial.companyName}</span>
          </Link>
          <Badge
            variant={urgencyConfig.variant}
            className={
              'className' in urgencyConfig ? urgencyConfig.className : undefined
            }
          >
            {urgencyConfig.label}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {formatDaysRemaining(trial.daysRemaining)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden />
            {trial.employeeCount} employé{trial.employeeCount > 1 ? 's' : ''}
          </span>
          {trial.ownerEmail && (
            <span className="flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 flex-shrink-0" aria-hidden />
              {trial.ownerEmail}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/app/admin/entreprises/${trial.companyId}`}>
            <ExternalLink className="mr-1 h-3.5 w-3.5" aria-hidden />
            Voir
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isExtending === trial.companyId}
          onClick={() => onExtend(trial.companyId)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden />
          +7j
        </Button>
      </div>
    </div>
  )
}

function WidgetSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Chargement des essais">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-500" aria-hidden />
      <p className="text-sm font-medium">Tout est en ordre</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Aucun essai n&apos;expire dans les 7 prochains jours
      </p>
    </div>
  )
}

// ============================================================================
// Component
// ============================================================================

export function TrialsAtRiskWidget() {
  const [trials, setTrials] = useState<TrialAtRisk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExtending, setIsExtending] = useState<string | null>(null)
  const { success, error: toastError } = useToast()

  const fetchTrials = useCallback(async () => {
    try {
      setError(null)
      const data = await getTrialsAtRisk()
      setTrials(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTrials()
  }, [fetchTrials])

  const handleExtend = useCallback(
    async (companyId: string) => {
      const confirmed = window.confirm(
        "Prolonger la période d'essai de 7 jours supplémentaires ?"
      )
      if (!confirmed) return

      setIsExtending(companyId)
      try {
        await extendTrial(companyId)
        success('Essai prolongé de 7 jours')
        await fetchTrials()
      } catch {
        toastError('Erreur lors de la prolongation')
      } finally {
        setIsExtending(null)
      }
    },
    [fetchTrials, success, toastError]
  )

  return (
    <Card data-testid="trials-at-risk-widget">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden />
          Essais en cours d&apos;expiration
        </CardTitle>
        {!isLoading && trials.length > 0 && (
          <Badge variant="destructive">{trials.length}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton />
        ) : error ? (
          <p className="py-4 text-center text-sm text-destructive">{error}</p>
        ) : trials.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {trials.map((trial) => (
              <TrialRow
                key={trial.companyId}
                trial={trial}
                onExtend={(id) => void handleExtend(id)}
                isExtending={isExtending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
