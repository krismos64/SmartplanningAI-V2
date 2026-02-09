/**
 * Service de synchronisation employés → Stripe quantity
 *
 * Compte les employés actifs d'une company et met à jour
 * la quantité sur l'abonnement Stripe avec prorata automatique.
 *
 * @ticket SP-439
 * @see SP-351 pour le client Stripe singleton
 * @see SP-350 pour le modèle Subscription Prisma
 */

import Stripe from 'stripe'

import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// ============================================================================
// Types
// ============================================================================

/** Résultat de la synchronisation quantity → Stripe */
export interface SyncResult {
  /** true si la quantité a été mise à jour chez Stripe */
  synced: boolean
  /** Quantité avant synchronisation */
  previousQuantity: number
  /** Quantité après synchronisation (= employés actifs) */
  newQuantity: number
  /** Raison du skip si synced === false */
  reason?: string
}

/** Statuts d'abonnement pour lesquels on ne synchronise PAS */
const SKIP_STATUSES = ['TRIAL', 'CANCELED', 'EXPIRED', 'INCOMPLETE'] as const

// ============================================================================
// Service
// ============================================================================

/**
 * Synchronise le nombre d'employés actifs d'une company vers Stripe.
 *
 * - Récupère la company avec sa subscription et le count des employés actifs
 * - Skip si pas de subscription, pas de stripeSubscriptionId, ou statut incompatible
 * - Skip si la quantité n'a pas changé (optimisation réseau)
 * - Appelle `stripe.subscriptions.update()` avec `proration_behavior: 'create_prorations'`
 * - Met à jour `subscription.quantity` et `subscription.planPrice` en base
 *
 * Ne throw JAMAIS : retourne toujours un SyncResult.
 *
 * @param companyId - ID de la company dont on synchronise les employés
 * @returns SyncResult avec le détail de la synchronisation
 */
export async function syncEmployeeCountToStripe(
  companyId: string
): Promise<SyncResult> {
  try {
    // 1. Récupérer subscription + count employés en parallèle
    const [subscription, employeeCount] = await Promise.all([
      prisma.subscription.findUnique({
        where: { companyId },
        select: {
          id: true,
          stripeSubscriptionId: true,
          status: true,
          quantity: true,
          pricePerEmployee: true,
        },
      }),
      prisma.employee.count({
        where: { companyId, isActive: true },
      }),
    ])

    // 2. Early returns — conditions de skip
    if (!subscription) {
      console.info('[StripeSync]', {
        action: 'skipped',
        companyId,
        reason: 'no_subscription',
      })
      return {
        synced: false,
        previousQuantity: 0,
        newQuantity: employeeCount,
        reason: 'no_subscription',
      }
    }

    if (!subscription.stripeSubscriptionId) {
      return {
        synced: false,
        previousQuantity: subscription.quantity,
        newQuantity: employeeCount,
        reason: 'no_stripe_subscription_id',
      }
    }

    if (
      SKIP_STATUSES.includes(
        subscription.status as (typeof SKIP_STATUSES)[number]
      )
    ) {
      return {
        synced: false,
        previousQuantity: subscription.quantity,
        newQuantity: employeeCount,
        reason: `status_${subscription.status.toLowerCase()}`,
      }
    }

    // Stripe exige quantity >= 1
    const newQuantity = Math.max(1, employeeCount)

    // 3. Skip si la quantité n'a pas changé
    if (subscription.quantity === newQuantity) {
      return {
        synced: false,
        previousQuantity: subscription.quantity,
        newQuantity,
        reason: 'quantity_unchanged',
      }
    }

    // 4. Récupérer le subscription item ID depuis Stripe
    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    )
    const itemId = stripeSub.items.data[0]?.id

    if (!itemId) {
      return {
        synced: false,
        previousQuantity: subscription.quantity,
        newQuantity,
        reason: 'no_stripe_item_id',
      }
    }

    // 5. Mettre à jour chez Stripe avec prorata
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{ id: itemId, quantity: newQuantity }],
      proration_behavior: 'create_prorations',
    })

    // 6. Synchroniser en DB
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        quantity: newQuantity,
        planPrice: newQuantity * subscription.pricePerEmployee,
      },
    })

    console.info('[StripeSync]', {
      action: 'quantity_updated',
      companyId,
      previousQuantity: subscription.quantity,
      newQuantity,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      timestamp: new Date().toISOString(),
    })

    return {
      synced: true,
      previousQuantity: subscription.quantity,
      newQuantity,
    }
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? `Stripe: ${error.message}`
        : error instanceof Error
          ? error.message
          : 'Unknown error'

    console.error('[StripeSync]', {
      action: 'sync_failed',
      companyId,
      error: message,
      timestamp: new Date().toISOString(),
    })

    return {
      synced: false,
      previousQuantity: 0,
      newQuantity: 0,
      reason: message,
    }
  }
}
