/**
 * Types TypeScript pour le service Stripe
 *
 * @description Types pour checkout, subscriptions, webhooks et billing portal.
 * Utilisés par le service Stripe (src/lib/services/stripe/) et la route webhook.
 *
 * @ticket SP-351
 */

// ============================================================================
// Inputs Service
// ============================================================================

/** Input pour créer une session Checkout Stripe */
export interface CreateCheckoutSessionInput {
  companyId: string
  email: string
  companyName: string
  quantity: number
  trialEndsAt?: Date | null
  successUrl?: string
  cancelUrl?: string
}

/** Input pour mettre à jour la quantité d'un abonnement per-seat */
export interface UpdateSubscriptionQuantityInput {
  subscriptionId: string
  newQuantity: number
}

/** Input pour annuler un abonnement */
export interface CancelSubscriptionInput {
  subscriptionId: string
  cancelImmediately?: boolean
}

/** Input pour créer une session Billing Portal */
export interface CreateBillingPortalInput {
  customerId: string
  returnUrl: string
}

// ============================================================================
// Résultats Service
// ============================================================================

/** Résultat d'une création de session Checkout */
export interface CheckoutSessionResult {
  sessionId: string
  url: string
}

/** Résultat d'une création de session Billing Portal */
export interface BillingPortalResult {
  url: string
}

/** Résultat du traitement d'un événement webhook */
export interface WebhookHandlerResult {
  handled: boolean
  eventType: string
  action?: string
}

// ============================================================================
// Billing Data (SP-352, enrichi SP-360)
// ============================================================================

/** Données de facturation pour le dashboard billing */
export interface BillingData {
  subscription: {
    plan: string
    status: string
    quantity: number
    pricePerEmployee: number
    planPrice: number
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
    canceledAt: Date | null
    createdAt: Date
    stripeCustomerId: string
  } | null
  payments: {
    id: string
    amount: number
    currency: string
    status: string
    paidAt: Date | null
    createdAt: Date
    stripeInvoiceId: string | null
    paymentMethod: string | null
    invoiceUrl: string | null
  }[]
  employeeCount: number
  monthlyAmount: number
  trialEndsAt: Date | null
}
