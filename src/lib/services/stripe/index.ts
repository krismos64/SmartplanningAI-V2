/**
 * Stripe service — barrel export
 *
 * @ticket SP-351, SP-439
 */

export {
  createCheckoutSession,
  updateSubscriptionQuantity,
  cancelSubscription,
  createBillingPortalSession,
  handleWebhookEvent,
} from './stripe.service'

export {
  syncEmployeeCountToStripe,
  type SyncResult,
} from './subscription-sync.service'
