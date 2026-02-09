/**
 * Server Actions Stripe — Checkout, Portal, Quantity, Cancel, Billing
 *
 * @description Connecte le service Stripe (SP-351) au frontend avec
 * authentification RBAC, validation Zod et conversion ServiceResult → CrudActionResult.
 *
 * Toutes les actions sont réservées au rôle DIRECTOR.
 * Le SYSTEM_ADMIN gère les abonnements via l'admin panel, pas via billing.
 *
 * @ticket SP-352
 * @see SP-351 pour le service Stripe sous-jacent
 * @see SP-349 pour la configuration SDK Stripe
 */

'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createCheckoutSession,
  updateSubscriptionQuantity,
  cancelSubscription,
  createBillingPortalSession,
} from '@/lib/services/stripe'
import {
  checkoutSessionSchema,
  updateSubscriptionQuantitySchema,
  customerPortalSchema,
} from '@/lib/validations/stripe'
import { checkPermission } from '@/lib/actions/crud-utils'
import { validateData } from '@/lib/actions/crud-helpers'
import type { CrudActionResult } from '@/types/crud'
import type {
  CheckoutSessionResult,
  BillingPortalResult,
  BillingData,
} from '@/types/stripe'

// ============================================================================
// Constantes
// ============================================================================

const BILLING_PATH = '/app/dashboard/billing'

// ============================================================================
// Actions
// ============================================================================

/**
 * Crée une session Stripe Checkout pour souscrire à un abonnement per-seat.
 *
 * Retourne l'URL de redirection Stripe (le client redirige côté navigateur).
 * N'utilise PAS redirect() car le client doit gérer le loading state.
 *
 * @param input - { quantity, successUrl?, cancelUrl? }
 */
export async function createCheckoutAction(
  input: unknown
): Promise<CrudActionResult<CheckoutSessionResult>> {
  // 1. Auth — DIRECTOR uniquement
  const authResult = await checkPermission('DIRECTOR')
  if (!authResult.success) return authResult
  const user = authResult.data

  // 2. Vérifier companyId (SYSTEM_ADMIN n'a pas de company)
  if (!user.companyId) {
    return { success: false, error: 'Aucune entreprise associée à ce compte' }
  }

  // 3. Validation Zod
  const validation = validateData(checkoutSessionSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error, field: validation.field }
  }

  // 4. Récupérer email depuis la session (pas dans AuthenticatedUser)
  const session = await auth()
  const email = session?.user?.email
  if (!email) {
    return { success: false, error: 'Email utilisateur introuvable' }
  }

  // 5. Récupérer le nom de l'entreprise pour le customer Stripe
  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { name: true },
  })
  if (!company) {
    return { success: false, error: 'Entreprise introuvable' }
  }

  // 6. Appeler le service Stripe
  const result = await createCheckoutSession({
    companyId: user.companyId,
    email,
    companyName: company.name,
    quantity: validation.data.quantity,
    successUrl: validation.data.successUrl,
    cancelUrl: validation.data.cancelUrl,
  })

  // 7. Convertir ServiceResult → CrudActionResult
  if (!result.success) {
    return {
      success: false,
      error: result.error ?? 'Erreur lors de la création du checkout',
    }
  }
  return { success: true, data: result.data! }
}

/**
 * Crée une session Stripe Billing Portal pour gérer l'abonnement.
 *
 * Retourne l'URL du portail (le client redirige côté navigateur).
 *
 * @param input - { returnUrl? }
 */
export async function createBillingPortalAction(
  input: unknown
): Promise<CrudActionResult<BillingPortalResult>> {
  // 1. Auth — DIRECTOR
  const authResult = await checkPermission('DIRECTOR')
  if (!authResult.success) return authResult
  const user = authResult.data

  if (!user.companyId) {
    return { success: false, error: 'Aucune entreprise associée à ce compte' }
  }

  // 2. Validation Zod (returnUrl optionnel)
  const validation = validateData(customerPortalSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error, field: validation.field }
  }

  // 3. Récupérer stripeCustomerId depuis la subscription
  const subscription = await prisma.subscription.findUnique({
    where: { companyId: user.companyId },
    select: { stripeCustomerId: true },
  })
  if (!subscription?.stripeCustomerId) {
    return {
      success: false,
      error: 'Aucun abonnement Stripe trouvé pour cette entreprise',
    }
  }

  // 4. Appeler le service
  const returnUrl =
    validation.data.returnUrl ??
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'}${BILLING_PATH}`
  const result = await createBillingPortalSession({
    customerId: subscription.stripeCustomerId,
    returnUrl,
  })

  // 5. Convertir
  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Erreur lors de l'ouverture du portail",
    }
  }
  return { success: true, data: result.data! }
}

/**
 * Met à jour la quantité de sièges d'un abonnement per-seat existant.
 *
 * Déclenche un prorata automatique côté Stripe.
 *
 * @param input - { quantity }
 */
export async function updateSubscriptionQuantityAction(
  input: unknown
): Promise<CrudActionResult<void>> {
  // 1. Auth — DIRECTOR
  const authResult = await checkPermission('DIRECTOR')
  if (!authResult.success) return authResult
  const user = authResult.data

  if (!user.companyId) {
    return { success: false, error: 'Aucune entreprise associée à ce compte' }
  }

  // 2. Validation Zod
  const validation = validateData(updateSubscriptionQuantitySchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error, field: validation.field }
  }

  // 3. Récupérer stripeSubscriptionId
  const subscription = await prisma.subscription.findUnique({
    where: { companyId: user.companyId },
    select: { stripeSubscriptionId: true },
  })
  if (!subscription?.stripeSubscriptionId) {
    return { success: false, error: 'Aucun abonnement actif trouvé' }
  }

  // 4. Appeler le service
  const result = await updateSubscriptionQuantity({
    subscriptionId: subscription.stripeSubscriptionId,
    newQuantity: validation.data.quantity,
  })

  // 5. Convertir + revalidate (la quantité en DB a changé)
  if (!result.success) {
    return {
      success: false,
      error:
        result.error ?? 'Erreur lors de la mise à jour du nombre de sièges',
    }
  }
  revalidatePath(BILLING_PATH)
  return { success: true, data: undefined as void }
}

/**
 * Annule un abonnement Stripe.
 *
 * Par défaut, l'annulation prend effet en fin de période de facturation.
 * Passer cancelImmediately: true pour une annulation immédiate.
 *
 * @param cancelImmediately - false = fin de période (défaut), true = immédiat
 */
export async function cancelSubscriptionAction(
  cancelImmediately?: boolean
): Promise<CrudActionResult<void>> {
  // 1. Auth — DIRECTOR
  const authResult = await checkPermission('DIRECTOR')
  if (!authResult.success) return authResult
  const user = authResult.data

  if (!user.companyId) {
    return { success: false, error: 'Aucune entreprise associée à ce compte' }
  }

  // 2. Récupérer stripeSubscriptionId
  const subscription = await prisma.subscription.findUnique({
    where: { companyId: user.companyId },
    select: { stripeSubscriptionId: true },
  })
  if (!subscription?.stripeSubscriptionId) {
    return { success: false, error: 'Aucun abonnement actif trouvé' }
  }

  // 3. Appeler le service
  const result = await cancelSubscription({
    subscriptionId: subscription.stripeSubscriptionId,
    cancelImmediately: cancelImmediately ?? false,
  })

  // 4. Convertir + revalidate
  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Erreur lors de l'annulation de l'abonnement",
    }
  }
  revalidatePath(BILLING_PATH)
  return { success: true, data: undefined as void }
}

/**
 * Récupère les données de facturation pour le dashboard billing.
 *
 * Retourne la subscription, les 5 derniers paiements, le nombre
 * d'employés actifs et le montant mensuel calculé.
 */
export async function getBillingDataAction(): Promise<
  CrudActionResult<BillingData>
> {
  // 1. Auth — DIRECTOR
  const authResult = await checkPermission('DIRECTOR')
  if (!authResult.success) return authResult
  const user = authResult.data

  if (!user.companyId) {
    return { success: false, error: 'Aucune entreprise associée à ce compte' }
  }

  try {
    // 2. Récupérer Subscription + derniers Payments en parallèle
    const [subscription, payments, employeeCount] = await Promise.all([
      prisma.subscription.findUnique({
        where: { companyId: user.companyId },
      }),
      prisma.payment.findMany({
        where: { companyId: user.companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.employee.count({
        where: { companyId: user.companyId, isActive: true },
      }),
    ])

    // 3. Formater et retourner
    return {
      success: true,
      data: {
        subscription: subscription
          ? {
              plan: subscription.plan,
              status: subscription.status,
              quantity: subscription.quantity,
              pricePerEmployee: subscription.pricePerEmployee,
              planPrice: subscription.planPrice,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              stripeCustomerId: subscription.stripeCustomerId,
            }
          : null,
        payments: payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          paidAt: p.paidAt,
          createdAt: p.createdAt,
        })),
        employeeCount,
        monthlyAmount: subscription
          ? (subscription.quantity * subscription.pricePerEmployee) / 100
          : 0,
      },
    }
  } catch (error) {
    console.error('[getBillingDataAction] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des données de facturation',
    }
  }
}
