/**
 * Schemas de validation Zod pour Stripe
 *
 * Validation des données entrantes liées aux opérations Stripe :
 * checkout, webhooks, quantité de sièges, env vars.
 *
 * @ticket SP-349
 */

import { z } from 'zod'
import { PRICING } from '@/lib/config/pricing'

// =============================================================================
// Variables d'environnement Stripe
// =============================================================================

/**
 * Validation des env vars Stripe au démarrage.
 * Utilisé dans les Server Actions / API routes avant toute opération.
 */
export const stripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z
    .string()
    .min(1, 'STRIPE_SECRET_KEY est requise')
    .startsWith('sk_', 'STRIPE_SECRET_KEY doit commencer par sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est requise')
    .startsWith('pk_', 'La clé publique doit commencer par pk_'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'STRIPE_WEBHOOK_SECRET est requise')
    .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET doit commencer par whsec_'),
  STRIPE_PRICE_ID: z
    .string()
    .min(1, 'STRIPE_PRICE_ID est requis')
    .startsWith('price_', 'STRIPE_PRICE_ID doit commencer par price_'),
})

export type StripeEnv = z.infer<typeof stripeEnvSchema>

// =============================================================================
// Checkout Session
// =============================================================================

/**
 * Données pour créer une session Checkout Stripe.
 * Envoyées par le client lors du clic "S'abonner".
 */
export const checkoutSessionSchema = z.object({
  /** Nombre de sièges (employés) */
  quantity: z
    .number()
    .int('Le nombre de sièges doit être un entier')
    .min(PRICING.MIN_EMPLOYEES, `Minimum ${PRICING.MIN_EMPLOYEES} employé`)
    .max(PRICING.MAX_EMPLOYEES, `Maximum ${PRICING.MAX_EMPLOYEES} employés`),
  /** URL de succès après paiement */
  successUrl: z.string().url('URL de succès invalide').optional(),
  /** URL d'annulation */
  cancelUrl: z.string().url("URL d'annulation invalide").optional(),
})

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>

// =============================================================================
// Mise à jour quantité (sièges)
// =============================================================================

/**
 * Données pour mettre à jour le nombre de sièges d'un abonnement existant.
 */
export const updateSubscriptionQuantitySchema = z.object({
  /** Nouveau nombre de sièges */
  quantity: z
    .number()
    .int('Le nombre de sièges doit être un entier')
    .min(PRICING.MIN_EMPLOYEES, `Minimum ${PRICING.MIN_EMPLOYEES} employé`)
    .max(PRICING.MAX_EMPLOYEES, `Maximum ${PRICING.MAX_EMPLOYEES} employés`),
})

export type UpdateSubscriptionQuantityInput = z.infer<
  typeof updateSubscriptionQuantitySchema
>

// =============================================================================
// Webhook payload
// =============================================================================

/**
 * Validation minimale du header Stripe-Signature pour le webhook.
 * La vérification complète est faite par stripe.webhooks.constructEvent().
 */
export const stripeWebhookHeaderSchema = z.object({
  'stripe-signature': z.string().min(1, 'En-tête Stripe-Signature manquant'),
})

export type StripeWebhookHeader = z.infer<typeof stripeWebhookHeaderSchema>

// =============================================================================
// Customer Portal
// =============================================================================

/**
 * Données pour créer une session du portail client Stripe.
 */
export const customerPortalSchema = z.object({
  /** URL de retour après le portail */
  returnUrl: z.string().url('URL de retour invalide').optional(),
})

export type CustomerPortalInput = z.infer<typeof customerPortalSchema>
