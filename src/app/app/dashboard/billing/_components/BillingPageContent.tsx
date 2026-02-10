/**
 * BillingPageContent — Orchestrateur client de la page billing
 *
 * Reçoit les données sérialisées depuis le Server Component page.tsx,
 * gère les appels aux Server Actions (portail, annulation)
 * et distribue les props aux 3 composants enfants.
 *
 * @ticket SP-360, SP-440, SP-441
 */
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Rocket, Sparkles } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { SubscriptionStatus } from './SubscriptionStatus'
import type { SerializedSubscription } from './SubscriptionStatus'
import { UsageIndicator } from './UsageIndicator'
import { InvoiceHistory } from './InvoiceHistory'
import type { SerializedPayment } from './InvoiceHistory'
import {
  createCheckoutAction,
  createBillingPortalAction,
  cancelSubscriptionAction,
} from '@/lib/actions/stripe'
import { PRICING, formatPrice } from '@/lib/config/pricing'

// =============================================================================
// TYPES
// =============================================================================

/** BillingData sérialisée (toutes les dates en ISO string) */
export interface SerializedBillingData {
  subscription: SerializedSubscription | null
  payments: SerializedPayment[]
  employeeCount: number
  monthlyAmount: number
  trialEndsAt: string | null
}

export interface BillingPageContentProps {
  /** Données de facturation sérialisées */
  billingData: SerializedBillingData
  /** Motif de blocage transmis par le middleware subscription guard (SP-440) */
  blockingReason?: string
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Messages d'alerte affichés quand le middleware redirige vers billing
 * avec un query param ?reason=XXX.
 *
 * @ticket SP-440
 */
const BLOCKING_REASONS: Record<
  string,
  { title: string; message: string; variant: 'warning' | 'destructive' }
> = {
  trial_expired: {
    title: 'Votre essai gratuit est terminé',
    message:
      'Pour continuer à utiliser SmartPlanning, choisissez un abonnement ci-dessous.',
    variant: 'warning',
  },
  payment_overdue: {
    title: 'Paiement en retard',
    message:
      'Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour rétablir l\u2019accès.',
    variant: 'destructive',
  },
  subscription_canceled: {
    title: 'Abonnement annulé',
    message:
      'Votre abonnement a été annulé. Réabonnez-vous pour retrouver l\u2019accès à vos fonctionnalités.',
    variant: 'warning',
  },
  subscription_expired: {
    title: 'Abonnement expiré',
    message: 'Votre abonnement a expiré. Renouvelez-le pour continuer.',
    variant: 'destructive',
  },
  payment_incomplete: {
    title: 'Paiement en attente',
    message:
      'Votre paiement n\u2019a pas été finalisé. Complétez le processus pour activer votre abonnement.',
    variant: 'warning',
  },
  no_subscription: {
    title: 'Aucun abonnement actif',
    message:
      'Souscrivez à un abonnement pour accéder à toutes les fonctionnalités de SmartPlanning.',
    variant: 'warning',
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BillingPageContent({
  billingData,
  blockingReason,
  className,
}: BillingPageContentProps) {
  const router = useRouter()
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false)
  const [isManageLoading, setIsManageLoading] = useState(false)
  const [isCancelLoading, setIsCancelLoading] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleSubscribe = useCallback(async () => {
    setIsSubscribeLoading(true)
    setActionError(null)
    try {
      const quantity = Math.max(billingData.employeeCount, 1)
      const result = await createCheckoutAction({ quantity })
      if (result.success) {
        window.location.href = result.data.url
      } else {
        setActionError(result.error ?? 'Erreur lors de la création du checkout')
      }
    } catch {
      setActionError('Une erreur inattendue est survenue')
    } finally {
      setIsSubscribeLoading(false)
    }
  }, [billingData.employeeCount])

  const handleManageSubscription = useCallback(async () => {
    setIsManageLoading(true)
    setActionError(null)
    try {
      const result = await createBillingPortalAction({})
      if (result.success) {
        window.location.href = result.data.url
      } else {
        setActionError(result.error ?? 'Erreur lors de la redirection')
      }
    } catch {
      setActionError('Une erreur inattendue est survenue')
    } finally {
      setIsManageLoading(false)
    }
  }, [])

  const handleOpenPortal = useCallback(async () => {
    setIsPortalLoading(true)
    setActionError(null)
    try {
      const result = await createBillingPortalAction({})
      if (result.success) {
        window.location.href = result.data.url
      } else {
        setActionError(result.error ?? 'Erreur lors de la redirection')
      }
    } catch {
      setActionError('Une erreur inattendue est survenue')
    } finally {
      setIsPortalLoading(false)
    }
  }, [])

  const handleCancelSubscription = useCallback(() => {
    setShowCancelDialog(true)
  }, [])

  const handleConfirmCancel = useCallback(async () => {
    setIsCancelLoading(true)
    setActionError(null)
    try {
      const result = await cancelSubscriptionAction()
      if (result.success) {
        router.refresh()
      } else {
        setActionError(result.error ?? "Erreur lors de l'annulation")
      }
    } catch {
      setActionError('Une erreur inattendue est survenue')
    } finally {
      setIsCancelLoading(false)
      setShowCancelDialog(false)
    }
  }, [router])

  return (
    <div className={className} data-testid="billing-page-content">
      {/* SP-441 : Héro conversion quand trial expiré ou pas d'abonnement */}
      {(blockingReason === 'trial_expired' ||
        blockingReason === 'no_subscription') && (
        <div
          className="mb-6 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-8 text-center"
          data-testid="billing-conversion-hero"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {blockingReason === 'trial_expired' ? (
              <Rocket className="h-6 w-6 text-primary" aria-hidden="true" />
            ) : (
              <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
            )}
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            {blockingReason === 'trial_expired'
              ? 'Votre essai gratuit est terminé'
              : 'Activez votre abonnement SmartPlanning'}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {blockingReason === 'trial_expired'
              ? `Continuez à gérer vos plannings et vos équipes pour seulement ${formatPrice(PRICING.PRICE_PER_EMPLOYEE)}/employé/mois.`
              : `Commencez à organiser votre équipe pour seulement ${formatPrice(PRICING.PRICE_PER_EMPLOYEE)}/employé/mois.`}
          </p>
          <Button size="lg" className="px-8 text-lg" asChild>
            <a href="#subscription-section">Choisir mon abonnement</a>
          </Button>
        </div>
      )}

      {/* SP-440 : Alerte de blocage subscription guard */}
      {blockingReason && BLOCKING_REASONS[blockingReason] && (
        <div
          className={`mb-4 rounded-lg border p-4 ${
            BLOCKING_REASONS[blockingReason].variant === 'destructive'
              ? 'border-destructive/50 bg-destructive/10 text-destructive'
              : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400'
          }`}
          role="alert"
          data-testid="subscription-blocking-alert"
        >
          <h3 className="font-semibold">
            {BLOCKING_REASONS[blockingReason].title}
          </h3>
          <p className="mt-1 text-sm opacity-90">
            {BLOCKING_REASONS[blockingReason].message}
          </p>
        </div>
      )}

      {/* Erreur action */}
      {actionError && (
        <div
          className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
          data-testid="billing-error"
        >
          {actionError}
        </div>
      )}

      {/* Statut abonnement — pleine largeur */}
      <div id="subscription-section">
        <SubscriptionStatus
          subscription={billingData.subscription}
          trialEndsAt={billingData.trialEndsAt}
          monthlyAmount={billingData.monthlyAmount}
          onSubscribe={() => void handleSubscribe()}
          isSubscribeLoading={isSubscribeLoading}
          onManageSubscription={() => void handleManageSubscription()}
          onCancelSubscription={handleCancelSubscription}
          isManageLoading={isManageLoading}
          isCancelLoading={isCancelLoading}
        />
      </div>

      {/* Usage + Factures — 2 colonnes sur md+ */}
      {billingData.subscription && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <UsageIndicator
            employeeCount={billingData.employeeCount}
            quantity={billingData.subscription.quantity}
            pricePerEmployee={billingData.subscription.pricePerEmployee}
            monthlyAmount={billingData.monthlyAmount}
          />
          <InvoiceHistory
            payments={billingData.payments}
            onOpenPortal={() => void handleOpenPortal()}
            isPortalLoading={isPortalLoading}
          />
        </div>
      )}

      {/* Dialog de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l&apos;abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Votre abonnement restera actif jusqu&apos;à la fin de la période
              de facturation en cours. Après cette date, vous perdrez
              l&apos;accès aux fonctionnalités premium.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelLoading}>
              Conserver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmCancel()}
              disabled={isCancelLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-cancel-btn"
            >
              {isCancelLoading ? 'Annulation...' : "Oui, annuler l'abonnement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
