/**
 * Stripe module — barrel export
 *
 * Point d'entrée unique pour tout le module Stripe.
 * Usage : import { stripe, STRIPE_PRICING, ... } from '@/lib/stripe'
 *
 * @ticket SP-349
 */

export { stripe } from './stripe'
export {
  STRIPE_PRICING,
  STRIPE_STATUS_MAP,
  STRIPE_WEBHOOK_EVENTS,
  ALL_WEBHOOK_EVENTS,
  STRIPE_METADATA_KEYS,
  type StripeSubscriptionStatus,
  type InternalSubscriptionStatus,
  type StripeWebhookEvent,
} from './stripe-config'
