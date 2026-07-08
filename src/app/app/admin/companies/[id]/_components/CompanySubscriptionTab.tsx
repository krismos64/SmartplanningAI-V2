/**
 * CompanySubscriptionTab — Détail abonnement + historique paiements
 *
 * Server Component (async, appelé dans un Suspense boundary depuis page.tsx).
 * Réutilise getCompanySubscriptionDetail et getPaymentsAdmin filtré par
 * companyId (SP-546).
 *
 * @ticket SP-546
 */

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  getCompanySubscriptionDetail,
  getPaymentsAdmin,
} from '@/lib/actions/admin-subscriptions'
import {
  subscriptionPlanLabels,
  subscriptionStatusLabels,
  subscriptionStatusBadgeVariants,
} from '@/lib/validations/company'
import { getPaymentStatusConfig } from '@/lib/billing/payment-status'
import {
  formatCentsAsCurrency,
  formatDateShortFr,
} from '@/lib/utils/formatters'

export interface CompanySubscriptionTabProps {
  companyId: string
}

export async function CompanySubscriptionTab({
  companyId,
}: CompanySubscriptionTabProps) {
  const [subscription, paymentsResult] = await Promise.all([
    getCompanySubscriptionDetail(companyId),
    getPaymentsAdmin({ companyId, pageSize: 20 }),
  ])

  return (
    <div className="space-y-6">
      {/* Détail abonnement */}
      <Card data-testid="company-subscription-detail">
        <CardHeader>
          <CardTitle className="text-base">Abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          {!subscription ? (
            <p className="text-sm text-muted-foreground">
              Aucun abonnement configuré pour cette entreprise
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <Badge variant="outline">
                  {subscriptionPlanLabels[subscription.plan]}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Statut</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={
                      subscriptionStatusBadgeVariants[subscription.status]
                    }
                  >
                    {subscriptionStatusLabels[subscription.status]}
                  </Badge>
                  {subscription.cancelAtPeriodEnd && (
                    <Badge variant="warning" size="sm">
                      Annulation programmée
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Employés</p>
                <p className="text-sm font-medium">{subscription.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prix / employé</p>
                <p className="text-sm font-medium">
                  {formatCentsAsCurrency(
                    subscription.pricePerEmployee,
                    subscription.currency
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Début période</p>
                <p className="text-sm">
                  {formatDateShortFr(subscription.currentPeriodStart)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fin période</p>
                <p className="text-sm">
                  {formatDateShortFr(subscription.currentPeriodEnd)}
                </p>
              </div>
              {subscription.canceledAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Annulé le</p>
                  <p className="text-sm">
                    {formatDateShortFr(subscription.canceledAt)}
                  </p>
                </div>
              )}
              {subscription.stripeCustomerId && (
                <div>
                  <p className="text-xs text-muted-foreground">Client Stripe</p>
                  {/* Base mode-aware (sk_test → /test) : un customer test
                      ouvert sur l'URL live → 404 (review PR #54) */}
                  <a
                    href={`${paymentsResult.stripeDashboardBaseUrl}/customers/${subscription.stripeCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    Voir dans Stripe
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique paiements */}
      <Card data-testid="company-payments-history">
        <CardHeader>
          <CardTitle className="text-base">
            Historique des paiements ({paymentsResult.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsResult.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun paiement enregistré
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Facture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsResult.payments.map((payment) => {
                    const config = getPaymentStatusConfig(payment.status)
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateShortFr(
                            payment.paidAt ?? payment.createdAt
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCentsAsCurrency(
                            payment.amount,
                            payment.currency
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} size="sm">
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.stripeInvoiceId ? (
                            <Button asChild variant="ghost" size="sm">
                              <a
                                href={`${paymentsResult.stripeDashboardBaseUrl}/invoices/${payment.stripeInvoiceId}`}
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
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lien vers la vue globale */}
      <div className="flex justify-end">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/admin/subscriptions">
            Voir tous les abonnements & paiements
          </Link>
        </Button>
      </div>
    </div>
  )
}
