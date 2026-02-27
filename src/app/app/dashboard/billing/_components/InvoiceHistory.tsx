/**
 * InvoiceHistory — Historique des factures Stripe
 *
 * Affiche les 5 derniers paiements dans un tableau avec statut,
 * montant, date et lien vers la facture Stripe.
 * Bouton pour ouvrir le portail client Stripe complet.
 *
 * @ticket SP-360
 */
'use client'

import { ExternalLink, FileText, Loader2 } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { motion, fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

/** Paiement sérialisé (dates en ISO string) */
export interface SerializedPayment {
  id: string
  amount: number
  currency: string
  status: string
  paidAt: string | null
  createdAt: string
  stripeInvoiceId: string | null
  paymentMethod: string | null
  invoiceUrl: string | null
}

export interface InvoiceHistoryProps {
  /** Liste des paiements (max 5, triés par date desc) */
  payments: SerializedPayment[]
  /** Callback pour ouvrir le portail Stripe */
  onOpenPortal: () => void
  /** État de chargement du bouton portail */
  isPortalLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

// =============================================================================
// CONSTANTES
// =============================================================================

const PAYMENT_STATUS_CONFIG: Record<
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

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoString))
}

function formatCurrency(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100)
}

// =============================================================================
// COMPONENT
// =============================================================================

export function InvoiceHistory({
  payments,
  onOpenPortal,
  isPortalLoading = false,
  className,
}: InvoiceHistoryProps) {
  const shouldReduceMotion = useReducedMotion()

  const content = (
    <Card
      className={cn('glass-strong', className)}
      data-testid="invoice-history"
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">Historique des factures</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {payments.length === 0 ? (
          <EmptyState
            variant="search"
            title="Aucune facture"
            description="Les factures apparaîtront ici après votre premier paiement."
            size="sm"
            data-testid="invoice-empty-state"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Moyen</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Facture</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const statusConfig = PAYMENT_STATUS_CONFIG[
                    payment.status
                  ] ?? {
                    label: payment.status,
                    variant: 'secondary' as const,
                  }
                  return (
                    <TableRow
                      key={payment.id}
                      data-testid={`payment-row-${payment.id}`}
                    >
                      <TableCell className="whitespace-nowrap">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.paymentMethod ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.invoiceUrl ? (
                          <a
                            href={payment.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            data-testid={`invoice-link-${payment.id}`}
                          >
                            Voir
                            <ExternalLink
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {payments.length > 0 && (
        <CardFooter>
          <Button
            variant="outline"
            onClick={onOpenPortal}
            disabled={isPortalLoading}
            className="w-full"
            data-testid="view-all-invoices-btn"
          >
            {isPortalLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Voir tout l&apos;historique
          </Button>
        </CardFooter>
      )}
    </Card>
  )

  if (shouldReduceMotion) {
    return content
  }

  return (
    <motion.div
      variants={fadeSlideUpVariants}
      initial="hidden"
      animate="visible"
    >
      {content}
    </motion.div>
  )
}
