/**
 * SubscriptionStatus — Statut de l'abonnement Stripe
 *
 * Affiche le plan actuel, le statut avec badge coloré, le montant mensuel,
 * la période de facturation et les actions (gérer / annuler).
 * Si aucun abonnement, affiche un EmptyState avec CTA.
 *
 * @ticket SP-360
 */
'use client'

import {
  Crown,
  CreditCard,
  CalendarDays,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { motion, fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

/** Données subscription sérialisées (dates en ISO string) */
export interface SerializedSubscription {
  plan: string
  status: string
  quantity: number
  pricePerEmployee: number
  planPrice: number
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  createdAt: string
  stripeCustomerId: string
}

export interface SubscriptionStatusProps {
  /** Données d'abonnement (null si aucun abonnement) */
  subscription: SerializedSubscription | null
  /** Date de fin d'essai (ISO string, depuis Company.trialEndsAt) */
  trialEndsAt: string | null
  /** Montant mensuel calculé en euros */
  monthlyAmount: number
  /** Callback pour créer un checkout Stripe (nouvel abonnement) */
  onSubscribe: () => void
  /** État de chargement du bouton "S'abonner" */
  isSubscribeLoading?: boolean
  /** Callback pour ouvrir le portail Stripe */
  onManageSubscription: () => void
  /** Callback pour annuler l'abonnement */
  onCancelSubscription: () => void
  /** État de chargement du bouton "Gérer" */
  isManageLoading?: boolean
  /** État de chargement du bouton "Annuler" */
  isCancelLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

// =============================================================================
// CONSTANTES
// =============================================================================

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info'
    icon: React.ReactNode
  }
> = {
  TRIAL: {
    label: 'Essai gratuit',
    variant: 'warning',
    icon: <Clock className="h-3 w-3" aria-hidden="true" />,
  },
  ACTIVE: {
    label: 'Actif',
    variant: 'success',
    icon: <Crown className="h-3 w-3" aria-hidden="true" />,
  },
  PAST_DUE: {
    label: 'Paiement en retard',
    variant: 'warning',
    icon: <AlertTriangle className="h-3 w-3" aria-hidden="true" />,
  },
  CANCELED: {
    label: 'Annulé',
    variant: 'destructive',
    icon: <XCircle className="h-3 w-3" aria-hidden="true" />,
  },
  EXPIRED: {
    label: 'Expiré',
    variant: 'secondary',
    icon: <XCircle className="h-3 w-3" aria-hidden="true" />,
  },
  INCOMPLETE: {
    label: 'En attente',
    variant: 'info',
    icon: <Clock className="h-3 w-3" aria-hidden="true" />,
  },
}

const PLAN_LABELS: Record<string, string> = {
  PER_SEAT: 'Per-Seat',
  FREE: 'Gratuit',
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(isoString: string | null): string {
  if (!isoString) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoString))
}

function formatCurrency(amountInEuros: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountInEuros)
}

function getTrialDaysRemaining(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null
  const now = new Date()
  const end = new Date(trialEndsAt)
  const diffMs = end.getTime() - now.getTime()
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SubscriptionStatus({
  subscription,
  trialEndsAt,
  monthlyAmount,
  onSubscribe,
  isSubscribeLoading = false,
  onManageSubscription,
  onCancelSubscription,
  isManageLoading = false,
  isCancelLoading = false,
  className,
}: SubscriptionStatusProps) {
  const shouldReduceMotion = useReducedMotion()

  // Aucun abonnement
  if (!subscription) {
    return (
      <Card
        className={cn('glass-strong', className)}
        data-testid="subscription-status"
      >
        <CardContent className="p-6">
          <EmptyState
            title="Aucun abonnement"
            description="Souscrivez à un abonnement pour accéder à toutes les fonctionnalités de SmartPlanning."
            action={{
              label: isSubscribeLoading ? 'Redirection...' : "S'abonner",
              onClick: onSubscribe,
            }}
            size="sm"
          />
        </CardContent>
      </Card>
    )
  }

  const statusConfig = STATUS_CONFIG[subscription.status] ?? {
    label: subscription.status,
    variant: 'secondary' as const,
    icon: <Clock className="h-3 w-3" aria-hidden="true" />,
  }
  const trialDays = getTrialDaysRemaining(trialEndsAt)
  const pricePerEmployee = subscription.pricePerEmployee / 100

  const content = (
    <Card
      className={cn('glass-strong', className)}
      data-testid="subscription-status"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-lg">Abonnement</CardTitle>
              <CardDescription>
                Plan {PLAN_LABELS[subscription.plan] ?? subscription.plan}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusConfig.variant} icon={statusConfig.icon}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trial countdown */}
        {subscription.status === 'TRIAL' && trialDays !== null && (
          <Alert data-testid="trial-alert">
            <Clock className="h-4 w-4" />
            <AlertTitle>Période d&apos;essai</AlertTitle>
            <AlertDescription>
              {trialDays > 0
                ? `Il vous reste ${trialDays} jour${trialDays > 1 ? 's' : ''} d'essai gratuit.`
                : "Votre période d'essai est terminée."}
            </AlertDescription>
          </Alert>
        )}

        {/* Annulation programmée */}
        {subscription.cancelAtPeriodEnd && (
          <Alert variant="destructive" data-testid="cancel-alert">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Annulation programmée</AlertTitle>
            <AlertDescription>
              Votre abonnement sera annulé le{' '}
              {formatDate(subscription.currentPeriodEnd)}.
            </AlertDescription>
          </Alert>
        )}

        {/* Détails */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Montant mensuel</p>
            <p className="text-xl font-bold" data-testid="monthly-amount">
              {formatCurrency(monthlyAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pricePerEmployee)} / employé
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Sièges</p>
            <p className="text-xl font-bold" data-testid="seat-count">
              {subscription.quantity}
            </p>
            <p className="text-xs text-muted-foreground">
              employé{subscription.quantity > 1 ? 's' : ''} facturé
              {subscription.quantity > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Période */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <span data-testid="billing-period">
            Période : {formatDate(subscription.currentPeriodStart)} →{' '}
            {formatDate(subscription.currentPeriodEnd)}
          </span>
        </div>

        {/* Date annulation */}
        {subscription.canceledAt && (
          <p
            className="text-sm text-muted-foreground"
            data-testid="canceled-at"
          >
            Annulé le {formatDate(subscription.canceledAt)}
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          onClick={onManageSubscription}
          disabled={isManageLoading}
          data-testid="manage-subscription-btn"
        >
          {isManageLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gérer mon abonnement
        </Button>
        {!subscription.cancelAtPeriodEnd &&
          subscription.status !== 'CANCELED' &&
          subscription.status !== 'EXPIRED' && (
            <Button
              variant="outline"
              onClick={onCancelSubscription}
              disabled={isCancelLoading}
              className="text-destructive hover:text-destructive"
              data-testid="cancel-subscription-btn"
            >
              {isCancelLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Annuler
            </Button>
          )}
      </CardFooter>
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
