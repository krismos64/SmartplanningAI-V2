'use client'

/**
 * PaymentsDataTable — Historique admin cross-company des paiements
 *
 * Fonctionnalités : filtre statut (accès direct aux échecs), pagination
 * serveur, lien facture Stripe dashboard, message d'échec.
 * Vue responsive : Table desktop (md+) / Cards mobile (<md).
 *
 * @ticket SP-542
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Receipt,
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
  getPaymentsAdmin,
  type AdminPaymentRow,
} from '@/lib/actions/admin-subscriptions'

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 25

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'SUCCEEDED', label: 'Payé' },
  { value: 'FAILED', label: 'Échoué' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'REFUNDED', label: 'Remboursé' },
  { value: 'REQUIRES_ACTION', label: 'Action requise' },
] as const

type StatusFilter = (typeof STATUS_OPTIONS)[number]['value']

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    variant: 'success' | 'destructive' | 'warning' | 'secondary'
  }
> = {
  SUCCEEDED: { label: 'Payé', variant: 'success' },
  FAILED: { label: 'Échoué', variant: 'destructive' },
  PENDING: { label: 'En attente', variant: 'warning' },
  REFUNDED: { label: 'Remboursé', variant: 'secondary' },
  REQUIRES_ACTION: { label: 'Action requise', variant: 'warning' },
}

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100)
}

function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

/**
 * Lien vers la facture dans le dashboard Stripe (côté admin, pas portail client).
 * La base est résolue côté serveur selon le mode de la clé (live vs /test) —
 * une facture test ouverte sur l'URL live renvoie un 404.
 */
function stripeInvoiceUrl(baseUrl: string, invoiceId: string): string {
  return `${baseUrl}/invoices/${invoiceId}`
}

/** Fallback avant la première réponse serveur */
const DEFAULT_DASHBOARD_BASE_URL = 'https://dashboard.stripe.com'

// ============================================================================
// PaymentCard — Vue mobile
// ============================================================================

function PaymentCard({
  row,
  dashboardBaseUrl,
}: {
  row: AdminPaymentRow
  dashboardBaseUrl: string
}) {
  const config = STATUS_CONFIG[row.status] ?? {
    label: row.status,
    variant: 'secondary' as const,
  }

  return (
    <Card
      className="transition-all hover:border-primary/50"
      data-testid="payment-card"
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
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {formatCurrency(row.amount, row.currency)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(row.paidAt ?? row.createdAt)}
            </span>
          </div>

          {row.failureMessage && (
            <p className="text-xs text-destructive">{row.failureMessage}</p>
          )}

          {row.stripeInvoiceId && (
            <a
              href={stripeInvoiceUrl(dashboardBaseUrl, row.stripeInvoiceId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              Facture Stripe
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Component
// ============================================================================

export function PaymentsDataTable() {
  const [rows, setRows] = useState<AdminPaymentRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [dashboardBaseUrl, setDashboardBaseUrl] = useState(
    DEFAULT_DASHBOARD_BASE_URL
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchRows = useCallback(async (p: number, status: StatusFilter) => {
    setIsLoading(true)
    setHasError(false)
    try {
      const result = await getPaymentsAdmin({
        page: p,
        pageSize: PAGE_SIZE,
        status: status === 'ALL' ? undefined : status,
      })
      setRows(result.payments)
      setTotal(result.total)
      setDashboardBaseUrl(result.stripeDashboardBaseUrl)
    } catch (error) {
      // Sans catch, une erreur serveur (session expirée, DB down) serait
      // maquillée en « Aucun paiement trouvé » — on affiche un état d'erreur
      console.error('[PaymentsDataTable] Erreur chargement:', error)
      setHasError(true)
      setRows([])
      setTotal(0)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [])

  useEffect(() => {
    void fetchRows(1, 'ALL')
  }, [fetchRows])

  const handleStatusChange = (value: string) => {
    const status = value as StatusFilter
    setStatusFilter(status)
    setPage(1)
    void fetchRows(1, status)
  }

  const handlePrev = () => {
    if (page <= 1) return
    const newPage = page - 1
    setPage(newPage)
    void fetchRows(newPage, statusFilter)
  }

  const handleNext = () => {
    if (page >= totalPages) return
    const newPage = page + 1
    setPage(newPage)
    void fetchRows(newPage, statusFilter)
  }

  if (isInitialLoad) {
    return <Skeleton className="h-72 w-full rounded-md" />
  }

  return (
    <div className="space-y-4" data-testid="payments-table">
      {/* Section header + filtre */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Paiements récents ({total})</h2>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger
            className="w-full sm:w-48"
            data-testid="payments-status-filter"
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
      </div>

      {/* Table desktop (md+) */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Détail</TableHead>
              <TableHead className="text-right">Facture</TableHead>
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
                  Erreur de chargement des paiements — modifiez un filtre pour
                  réessayer
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun paiement trouvé
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const config = STATUS_CONFIG[row.status] ?? {
                  label: row.status,
                  variant: 'secondary' as const,
                }
                return (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(row.paidAt ?? row.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/app/admin/companies/${row.companyId}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Building2 className="h-3 w-3" aria-hidden="true" />
                        {row.companyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(row.amount, row.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      {row.failureMessage ? (
                        <span
                          className="block truncate text-xs text-destructive"
                          title={row.failureMessage}
                        >
                          {row.failureMessage}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.stripeInvoiceId ? (
                        <Button asChild variant="ghost" size="sm">
                          <a
                            href={stripeInvoiceUrl(
                              dashboardBaseUrl,
                              row.stripeInvoiceId
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink
                              className="mr-1 h-3 w-3"
                              aria-hidden="true"
                            />
                            Stripe
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
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
            Erreur de chargement des paiements — modifiez un filtre pour
            réessayer
          </p>
        ) : rows.length > 0 ? (
          rows.map((row) => (
            <PaymentCard
              key={row.id}
              row={row}
              dashboardBaseUrl={dashboardBaseUrl}
            />
          ))
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            Aucun paiement trouvé
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
