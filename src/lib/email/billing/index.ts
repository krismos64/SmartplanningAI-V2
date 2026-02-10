/**
 * Service d'emails billing Stripe - Barrel Export
 *
 * @ticket SP-368
 * @description Export centralisé du service email billing
 *
 * @example
 * ```typescript
 * import { sendBillingEmail, BillingEmailType } from '@/lib/email/billing'
 *
 * await sendBillingEmail({
 *   companyId: 'company-123',
 *   emailType: BillingEmailType.PAYMENT_CONFIRMED,
 *   recipientEmail: 'director@acme.com',
 *   subject: 'Paiement confirmé',
 *   html: renderedHtml,
 * })
 * ```
 */

// Types
export {
  BillingEmailType,
  type SendBillingEmailParams,
  type BillingEmailResult,
} from './types'

// Service d'envoi
export { sendBillingEmail } from './send-billing'
