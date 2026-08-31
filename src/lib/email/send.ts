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
    console.warn(
      '[Email] Service non configuré, email ignoré:',
      options.subject
    )
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

      const info = (await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || stripHtml(options.html),
        replyTo: options.replyTo,
        attachments: options.attachments,
      })) as SendMailInfo

      const rejected = normalizeAddresses(info.rejected)

      // SP-579 : un destinataire refuse pendant le dialogue SMTP figure dans
      // `rejected`. L'ancien cast en `{ messageId: string }` jetait ce champ,
      // et un refus ressortait donc comme un envoi reussi.
      if (rejected.length > 0) {
        console.warn(
          `[Email] Destinataire refusé par le serveur SMTP : ${rejected.join(', ')}`,
          info.response ?? ''
        )

        return {
          success: false,
          outcome: 'BOUNCED',
          messageId: info.messageId,
          rejected,
          smtpResponse: info.response,
          error: `Adresse refusée par le serveur destinataire : ${rejected.join(', ')}`,
        }
      }

      // eslint-disable-next-line no-console
      console.info(
        `[Email] Envoi réussi à ${options.to} - MessageId: ${info.messageId}`
      )

      return {
        success: true,
        outcome: 'SENT',
        messageId: info.messageId,
        smtpResponse: info.response,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // SP-579 : quand TOUS les destinataires sont refuses, Nodemailer leve une
      // erreur EENVELOPE au lieu de renseigner `rejected` sur un retour normal.
      // C'est le chemin emprunte par nos envois, qui sont mono-destinataire :
      // sans ce cas, un refus ressortirait en FAILED et serait retente trois
      // fois pour rien, l'adresse etant definitivement invalide.
      const envelopeRejection = extractEnvelopeRejection(lastError)

      if (envelopeRejection) {
        console.warn(
          `[Email] Enveloppe refusée pour ${options.to}:`,
          lastError.message
        )

        return {
          success: false,
          outcome: 'BOUNCED',
          rejected: envelopeRejection,
          smtpResponse: lastError.message,
          error: `Adresse refusée par le serveur destinataire : ${envelopeRejection.join(', ')}`,
        }
      }

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

  console.error(
    `[Email] Échec définitif pour ${options.to}:`,
    lastError?.message
  )

  return {
    success: false,
    outcome: 'FAILED',
    error: lastError?.message || "Erreur inconnue lors de l'envoi",
  }
}

/**
 * Envoie plusieurs emails en parallèle
 *
 * @param emailsList - Liste des emails à envoyer
 * @returns Tableau des résultats d'envoi
 */
export async function sendEmails(
  emailsList: EmailOptions[]
): Promise<EmailResult[]> {
  return Promise.all(emailsList.map(sendEmail))
}

/**
 * Retour de `transporter.sendMail` pour un transport SMTP.
 *
 * Les champs varient selon le transport, d'où le typage permissif sur
 * `accepted` et `rejected` : Nodemailer y met des chaînes, ou des objets
 * `{ address }` quand le message porte des noms d'affichage.
 */
interface SendMailInfo {
  messageId?: string
  response?: string
  accepted?: unknown[]
  rejected?: unknown[]
}

/**
 * Normalise une liste d'adresses Nodemailer en chaînes.
 */
function normalizeAddresses(addresses: unknown[] | undefined): string[] {
  if (!Array.isArray(addresses)) return []

  return addresses
    .map((entry) => {
      if (typeof entry === 'string') return entry
      if (
        entry &&
        typeof entry === 'object' &&
        'address' in entry &&
        typeof (entry as { address: unknown }).address === 'string'
      ) {
        return (entry as { address: string }).address
      }
      return null
    })
    .filter((address): address is string => Boolean(address))
}

/**
 * Extrait les adresses refusées d'une erreur d'enveloppe SMTP.
 *
 * Renvoie `null` quand l'erreur n'est pas un refus de destinataire, pour ne
 * pas confondre une adresse invalide avec une panne de transport.
 */
function extractEnvelopeRejection(error: Error): string[] | null {
  const candidate = error as Error & { code?: string; rejected?: unknown[] }

  if (candidate.code !== 'EENVELOPE') {
    return null
  }

  const rejected = normalizeAddresses(candidate.rejected)

  // EENVELOPE couvre aussi l'expediteur refuse, qui est une erreur de
  // configuration et non une adresse destinataire invalide.
  return rejected.length > 0 ? rejected : null
}

/**
 * Vérifie si l'erreur est une erreur d'authentification
 */
function isAuthError(error: Error): boolean {
  const authErrors = ['EAUTH', 'Invalid login', 'authentication failed']
  return authErrors.some((msg) =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  )
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
