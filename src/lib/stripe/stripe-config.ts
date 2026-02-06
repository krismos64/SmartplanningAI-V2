/**
 * Configuration Stripe centralisée — constantes partagées
 *
 * Regroupe les mappages de statuts, les événements webhook
 * attendus, et les références tarifaires Stripe.
 * Ce fichier peut être importé côté serveur uniquement.
 *
 * @ticket SP-349
 */

import { PRICING } from '@/lib/config/pricing'

// =============================================================================
// TARIFICATION STRIPE
// =============================================================================

/**
 * Configuration tarifaire alignée sur PRICING (source unique de vérité).
 * Le STRIPE_PRICE_ID réel vient de l'env var ; on centralise ici
 * les valeurs métier.
 */
export const STRIPE_PRICING = {
  /** Prix unitaire par siège en centimes (Stripe travaille en minor units) */
  UNIT_AMOUNT_CENTS: Math.round(PRICING.PRICE_PER_EMPLOYEE * 100), // 290
  /** Devise ISO 4217 */
  CURRENCY: PRICING.CURRENCY.toLowerCase() as 'eur',
  /** Intervalle de facturation */
  BILLING_INTERVAL: 'month' as const,
  /** Durée de l'essai gratuit (jours) */
  TRIAL_PERIOD_DAYS: PRICING.TRIAL_DAYS, // 21
  /** Limites de sièges */
  MIN_QUANTITY: PRICING.MIN_EMPLOYEES, // 1
  MAX_QUANTITY: PRICING.MAX_EMPLOYEES, // 250
} as const

// =============================================================================
// MAPPAGE DES STATUTS
// =============================================================================

/**
 * Mappage statut Stripe Subscription → statut interne SmartPlanning.
 *
 * Correspondance avec l'enum SubscriptionStatus du schéma Prisma :
 * TRIAL | ACTIVE | PAST_DUE | CANCELED | EXPIRED
 */
export const STRIPE_STATUS_MAP = {
  trialing: 'TRIAL',
  active: 'ACTIVE',
  past_due: 'PAST_DUE',
  canceled: 'CANCELED',
  unpaid: 'PAST_DUE',
  incomplete: 'PAST_DUE',
  incomplete_expired: 'EXPIRED',
  paused: 'CANCELED',
} as const satisfies Record<string, string>

export type StripeSubscriptionStatus = keyof typeof STRIPE_STATUS_MAP
export type InternalSubscriptionStatus =
  (typeof STRIPE_STATUS_MAP)[StripeSubscriptionStatus]

// =============================================================================
// ÉVÉNEMENTS WEBHOOK
// =============================================================================

/**
 * Événements Stripe à écouter dans le webhook handler (SP-351).
 *
 * Groupés par domaine pour faciliter la maintenance.
 */
export const STRIPE_WEBHOOK_EVENTS = {
  /** Cycle de vie de l'abonnement */
  SUBSCRIPTION: [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.trial_will_end',
  ],
  /** Paiements et factures */
  INVOICE: [
    'invoice.paid',
    'invoice.payment_failed',
    'invoice.finalized',
  ],
  /** Checkout (création d'abonnement) */
  CHECKOUT: ['checkout.session.completed'],
} as const

/** Liste plate de tous les événements pour la config du webhook */
export const ALL_WEBHOOK_EVENTS = [
  ...STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION,
  ...STRIPE_WEBHOOK_EVENTS.INVOICE,
  ...STRIPE_WEBHOOK_EVENTS.CHECKOUT,
] as const

export type StripeWebhookEvent = (typeof ALL_WEBHOOK_EVENTS)[number]

// =============================================================================
// MÉTADONNÉES
// =============================================================================

/**
 * Clés de métadonnées utilisées dans les objets Stripe
 * pour relier aux entités SmartPlanning.
 */
export const STRIPE_METADATA_KEYS = {
  COMPANY_ID: 'smartplanning_company_id',
  USER_ID: 'smartplanning_user_id',
} as const
