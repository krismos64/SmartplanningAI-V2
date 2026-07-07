'use client'

/**
 * SubscriptionsDataTable — Liste admin cross-company des abonnements
 *
 * Fonctionnalités : filtres statut/plan, pagination serveur, contribution MRR
 * par ligne, badge annulation programmée, lien fiche entreprise.
 * Vue responsive : Table desktop (md+) / Cards mobile (<md).
 *
 * @ticket SP-542
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  getSubscriptionsAdmin,
  type AdminSubscriptionRow,
} from '@/lib/actions/admin-subscriptions'
import {
  subscriptionPlanLabels,
  subscriptionStatusLabels,
} from '@/lib/validations/company'

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 25

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'ACTIVE', label: subscriptionStatusLabels.ACTIVE },
  { value: 'TRIAL', label: subscriptionStatusLabels.TRIAL },
  { value: 'PAST_DUE', label: subscriptionStatusLabels.PAST_DUE },
  { value: 'CANCELED', label: subscriptionStatusLabels.CANCELED },
  { value: 'EXPIRED', label: subscriptionStatusLabels.EXPIRED },
  { value: 'INCOMPLETE', label: subscriptionStatusLabels.INCOMPLETE },
] as const

const PLAN_OPTIONS = [
  { value: 'ALL', label: 'Tous les plans' },
  { value: 'FREE', label: subscriptionPlanLabels.FREE },
  { value: 'PER_SEAT', label: subscriptionPlanLabels.PER_SEAT },
] as const

type StatusFilter = (typeof STATUS_OPTIONS)[number]['value']
type PlanFilter = (typeof PLAN_OPTIONS)[number]['value']

const STATUS_BADGE_VARIANT: Record<
  string,
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
> = {
  ACTIVE: 'success',
  TRIAL: 'info',
  PAST_DUE: 'destructive',
  CANCELED: 'secondary',
  EXPIRED: 'secondary',
  INCOMPLETE: 'warning',
}

// ============================================================================
// Helpers
// ============================================================================

function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

// ============================================================================
// SubscriptionCard — Vue mobile
// ============================================================================

function SubscriptionCard({ row }: { row: AdminSubscriptionRow }) {
  return (
    <Card
      className="transition-all hover:border-primary/50"
      data-testid="subscription-card"
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/app/admin/companies/${row.companyId}`}
              className="flex min-w-0 items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <Building2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{row.companyName}</span>
            </Link>
            <Badge variant={STATUS_BADGE_VARIANT[row.status] ?? 'secondary'}>
              {subscriptionStatusLabels[row.status]}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{subscriptionPlanLabels[row.plan]}</Badge>
            {row.cancelAtPeriodEnd && (
              <Badge variant="warning" size="sm">
                Annulation programmée
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
            <span>
              {row.quantity} employé{row.quantity > 1 ? 's' : ''} —{' '}
              <span className="font-medium text-foreground">
                {formatEuro(row.mrr)}/mois
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              <span>Échéance : {formatDate(row.currentPeriodEnd)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Component
// ============================================================================

export function SubscriptionsDataTable() {
  const [rows, setRows] = useState<AdminSubscriptionRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchRows = useCallback(
    async (p: number, status: StatusFilter, plan: PlanFilter) => {
      setIsLoading(true)
      try {
        const result = await getSubscriptionsAdmin({
          page: p,
          pageSize: PAGE_SIZE,
          status: status === 'ALL' ? undefined : status,
          plan: plan === 'ALL' ? undefined : plan,
        })
        setRows(result.subscriptions)
        setTotal(result.total)
      } finally {
        setIsLoading(false)
        setIsInitialLoad(false)
      }
    },
    []
  )

  useEffect(() => {
    void fetchRows(1, 'ALL', 'ALL')
  }, [fetchRows])

  const handleStatusChange = (value: string) => {
    const status = value as StatusFilter
    setStatusFilter(status)
    setPage(1)
    void fetchRows(1, status, planFilter)
  }

  const handlePlanChange = (value: string) => {
    const plan = value as PlanFilter
    setPlanFilter(plan)
    setPage(1)
    void fetchRows(1, statusFilter, plan)
  }

  const handlePrev = () => {
    if (page <= 1) return
    const newPage = page - 1
    setPage(newPage)
    void fetchRows(newPage, statusFilter, planFilter)
  }

  const handleNext = () => {
    if (page >= totalPages) return
    const newPage = page + 1
    setPage(newPage)
    void fetchRows(newPage, statusFilter, planFilter)
  }

  if (isInitialLoad) {
    return <Skeleton className="h-96 w-full rounded-md" />
  }

  return (
    <div className="space-y-4" data-testid="subscriptions-table">
      {/* Section header + filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Abonnements ({total})</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger
              className="w-full sm:w-48"
              data-testid="subscriptions-status-filter"
            >
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={handlePlanChange}>
            <SelectTrigger
              className="w-full sm:w-56"
              data-testid="subscriptions-plan-filter"
            >
              <SelectValue placeholder="Filtrer par plan" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table desktop (md+) */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Employés</TableHead>
              <TableHead className="text-right">MRR</TableHead>
              <TableHead>Prochaine échéance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Chargement...
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun abonnement trouvé
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/app/admin/companies/${row.companyId}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Building2 className="h-3 w-3" aria-hidden="true" />
                      {row.companyName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {subscriptionPlanLabels[row.plan]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant={
                          STATUS_BADGE_VARIANT[row.status] ?? 'secondary'
                        }
                      >
                        {subscriptionStatusLabels[row.status]}
                      </Badge>
                      {row.cancelAtPeriodEnd && (
                        <Badge variant="warning" size="sm">
                          Annulation programmée
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.quantity}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatEuro(row.mrr)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(row.currentPeriodEnd)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards mobile (<md) */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Chargement...
          </div>
        ) : rows.length > 0 ? (
          rows.map((row) => <SubscriptionCard key={row.id} row={row} />)
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            Aucun abonnement trouvé
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Page {page} sur {totalPages} ({total} résultat
            {total > 1 ? 's' : ''})
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={page >= totalPages || isLoading}
            >
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
