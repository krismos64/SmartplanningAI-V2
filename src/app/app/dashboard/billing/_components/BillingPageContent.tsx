/**
 * BillingPageContent — Orchestrateur client de la page billing
 *
 * Reçoit les données sérialisées depuis le Server Component page.tsx,
 * gère les appels aux Server Actions (portail, annulation)
 * et distribue les props aux 3 composants enfants.
 *
 * @ticket SP-360
 */
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import { SubscriptionStatus } from './SubscriptionStatus'
import type { SerializedSubscription } from './SubscriptionStatus'
import { UsageIndicator } from './UsageIndicator'
import { InvoiceHistory } from './InvoiceHistory'
import type { SerializedPayment } from './InvoiceHistory'
import {
  createBillingPortalAction,
  cancelSubscriptionAction,
} from '@/lib/actions/stripe'

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
  /** Classes CSS additionnelles */
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BillingPageContent({
  billingData,
  className,
}: BillingPageContentProps) {
  const router = useRouter()
  const [isManageLoading, setIsManageLoading] = useState(false)
  const [isCancelLoading, setIsCancelLoading] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

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
      <SubscriptionStatus
        subscription={billingData.subscription}
        trialEndsAt={billingData.trialEndsAt}
        monthlyAmount={billingData.monthlyAmount}
        onManageSubscription={handleManageSubscription}
        onCancelSubscription={handleCancelSubscription}
        isManageLoading={isManageLoading}
        isCancelLoading={isCancelLoading}
      />

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
            onOpenPortal={handleOpenPortal}
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
              Votre abonnement restera actif jusqu&apos;à la fin de la période de
              facturation en cours. Après cette date, vous perdrez l&apos;accès
              aux fonctionnalités premium.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelLoading}>
              Conserver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
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
