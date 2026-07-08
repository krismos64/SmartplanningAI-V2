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
import { Building2, Calendar, CreditCard } from 'lucide-react'

import { ServerPagination } from '@/components/ui/server-pagination'
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
  subscriptionStatusBadgeVariants,
} from '@/lib/validations/company'
import {
  formatEurosAsCurrency,
  formatDateShortFr,
} from '@/lib/utils/formatters'

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

// ============================================================================
// Helpers
// ============================================================================

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
            <Badge variant={subscriptionStatusBadgeVariants[row.status]}>
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
                {formatEurosAsCurrency(row.mrr)}/mois
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              <span>Échéance : {formatDateShortFr(row.currentPeriodEnd)}</span>
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
  const [hasError, setHasError] = useState(false)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchRows = useCallback(
    async (p: number, status: StatusFilter, plan: PlanFilter) => {
      setIsLoading(true)
      setHasError(false)
      try {
        const result = await getSubscriptionsAdmin({
          page: p,
          pageSize: PAGE_SIZE,
          status: status === 'ALL' ? undefined : status,
          plan: plan === 'ALL' ? undefined : plan,
        })
        setRows(result.subscriptions)
        setTotal(result.total)
      } catch (error) {
        // Sans catch, une erreur serveur (session expirée, DB down) serait
        // maquillée en « Aucun abonnement trouvé » — on affiche un état d'erreur
        console.error('[SubscriptionsDataTable] Erreur chargement:', error)
        setHasError(true)
        setRows([])
        setTotal(0)
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
            ) : hasError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-destructive"
                >
                  Erreur de chargement des abonnements — modifiez un filtre pour
                  réessayer
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
                        variant={subscriptionStatusBadgeVariants[row.status]}
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
                    {formatEurosAsCurrency(row.mrr)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateShortFr(row.currentPeriodEnd)}
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
        ) : hasError ? (
          <p className="py-12 text-center text-destructive">
            Erreur de chargement des abonnements — modifiez un filtre pour
            réessayer
          </p>
        ) : rows.length > 0 ? (
          rows.map((row) => <SubscriptionCard key={row.id} row={row} />)
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            Aucun abonnement trouvé
          </p>
        )}
      </div>

      {/* Pagination (composant partagé SP-547) */}
      <ServerPagination
        page={page}
        totalPages={totalPages}
        total={total}
        isLoading={isLoading}
        onPrevious={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}
