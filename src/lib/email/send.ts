/**
 * Fonction d'envoi d'emails générique
 *
 * @ticket SP-295
 * @description Service d'envoi d'emails via Nodemailer avec gestion d'erreurs
 *
 * ✅ Source : Context7 - Nodemailer + React Email Best Practices
 * - Retry logic avec backoff exponentiel
 * - Gestion des erreurs SMTP (ECONNREFUSED, EAUTH, timeouts)
 * - Logging des envois réussis/échoués
 */

import { getTransporter } from './transporter'
import { getEmailFrom, isEmailConfigured } from './config'
import type { EmailOptions, EmailResult } from './types'

/** Nombre maximum de tentatives d'envoi */
const MAX_RETRIES = 3

/** Délai initial entre les tentatives (ms) */
const INITIAL_RETRY_DELAY = 1000

/**
 * Envoie un email via le service SMTP configuré
 *
 * @param options - Options de l'email (to, subject, html, etc.)
 * @returns Résultat de l'envoi avec messageId ou erreur
 *
 * @example
 * ```typescript
 * import { sendEmail } from '@/lib/email'
 * import { render } from '@react-email/components'
 * import WelcomeEmail from '@/emails/templates/WelcomeEmail'
 *
 * const html = await render(WelcomeEmail({ firstName: 'John' }))
 * const result = await sendEmail({
 *   to: 'john@example.com',
 *   subject: 'Bienvenue sur SmartPlanning !',
 *   html,
 * })
 *
 * if (result.success) {
 *   console.log('Email envoyé:', result.messageId)
 * } else {
 *   console.error('Erreur:', result.error)
 * }
 * ```
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Vérification de la configuration
  if (!isEmailConfigured()) {
    console.warn('[Email] Service non configuré, email ignoré:', options.subject)
    return {
      success: false,
      error: 'Service email non configuré',
    }
  }

  // Validation des options
  if (!options.to || !options.subject || !options.html) {
    return {
      success: false,
      error: 'Options email invalides: to, subject et html sont requis',
    }
  }

  // Tentatives d'envoi avec retry
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const transporter = getTransporter()
      const from = getEmailFrom()

      const info = await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || stripHtml(options.html),
        replyTo: options.replyTo,
        attachments: options.attachments,
      })

      console.info(`[Email] Envoi réussi à ${options.to} - MessageId: ${info.messageId}`)

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      console.warn(
        `[Email] Tentative ${attempt}/${MAX_RETRIES} échouée pour ${options.to}:`,
        lastError.message
      )

      // Ne pas retry sur les erreurs d'authentification
      if (isAuthError(lastError)) {
        break
      }

      // Attendre avant la prochaine tentative (backoff exponentiel)
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)
        await sleep(delay)
      }
    }
  }

  console.error(`[Email] Échec définitif pour ${options.to}:`, lastError?.message)

  return {
    success: false,
    error: lastError?.message || 'Erreur inconnue lors de l\'envoi',
  }
}

/**
 * Envoie plusieurs emails en parallèle
 *
 * @param emailsList - Liste des emails à envoyer
 * @returns Tableau des résultats d'envoi
 */
export async function sendEmails(emailsList: EmailOptions[]): Promise<EmailResult[]> {
  return Promise.all(emailsList.map(sendEmail))
}

/**
 * Vérifie si l'erreur est une erreur d'authentification
 */
function isAuthError(error: Error): boolean {
  const authErrors = ['EAUTH', 'Invalid login', 'authentication failed']
  return authErrors.some((msg) => error.message.toLowerCase().includes(msg.toLowerCase()))
}

/**
 * Supprime les balises HTML pour générer le texte brut
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Attend un délai en millisecondes
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
