/**
 * Service d'envoi d'emails - Barrel Export
 *
 * @ticket SP-295
 * @description Export centralisé du service email
 *
 * @example
 * ```typescript
 * import { sendEmail, isEmailConfigured, getBaseUrl } from '@/lib/email'
 * ```
 */

// Types
export type {
  SmtpConfig,
  EmailOptions,
  EmailAttachment,
  EmailResult,
  BaseEmailProps,
} from './types'

// Configuration
export {
  isEmailConfigured,
  getSmtpConfig,
  getEmailFrom,
  getBaseUrl,
  getContactEmail,
} from './config'

// Transporter
export {
  getTransporter,
  verifyConnection,
  closeTransporter,
  resetTransporter,
} from './transporter'

// Envoi
export { sendEmail, sendEmails } from './send'
