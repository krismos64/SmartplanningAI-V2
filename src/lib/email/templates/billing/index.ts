/**
 * Fonctions d'envoi d'emails billing - Barrel Export
 *
 * @ticket SP-369
 */

export { sendSubscriptionActivatedEmail } from './subscription-activated'
export type { SendSubscriptionActivatedEmailParams } from './subscription-activated'

export { sendPaymentConfirmedEmail } from './payment-confirmed'
export type { SendPaymentConfirmedEmailParams } from './payment-confirmed'

export { sendPaymentFailedEmail } from './payment-failed'
export type { SendPaymentFailedEmailParams } from './payment-failed'

export { sendTrialEndingSoonEmail } from './trial-ending-soon'
export type { SendTrialEndingSoonEmailParams } from './trial-ending-soon'

export { sendTrialExpiredEmail } from './trial-expired'
export type { SendTrialExpiredEmailParams } from './trial-expired'

export { sendSubscriptionCanceledEmail } from './subscription-canceled'
export type { SendSubscriptionCanceledEmailParams } from './subscription-canceled'

export { sendQuantityUpdatedEmail } from './quantity-updated'
export type { SendQuantityUpdatedEmailParams } from './quantity-updated'
