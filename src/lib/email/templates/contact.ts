/**
 * Fonctions d'envoi des emails de contact
 *
 * @ticket SP-288
 * @description Envoie les emails de confirmation et notification pour le formulaire de contact
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getContactEmail } from '@/lib/email/config'
import type {
  ContactConfirmationParams,
  ContactNotificationParams,
  ContactEmailResult,
} from '@/types/contact'

import { ContactConfirmationEmail } from '../../../../emails/templates/ContactConfirmationEmail'
import { ContactNotificationEmail } from '../../../../emails/templates/ContactNotificationEmail'

/**
 * Envoie l'email de confirmation à l'expéditeur du formulaire de contact
 *
 * @param params - Paramètres du message (name, email, subject, message)
 * @returns Résultat de l'envoi (success, messageId ou error)
 *
 * @example
 * ```typescript
 * const result = await sendContactConfirmation({
 *   name: 'Jean Dupont',
 *   email: 'jean@example.com',
 *   subject: 'Demande d\'information',
 *   message: 'Bonjour, je souhaite...'
 * })
 * ```
 */
export async function sendContactConfirmation(
  params: ContactConfirmationParams
): Promise<ContactEmailResult> {
  const { name, email, subject, message } = params

  try {
    // Rendre le template React Email en HTML
    const html = await render(
      ContactConfirmationEmail({
        name,
        subject,
        message,
      })
    )

    // Envoyer l'email
    const result = await sendEmail({
      to: email,
      subject: `Confirmation de réception : ${subject}`,
      html,
      replyTo: getContactEmail(),
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    if (process.env.NODE_ENV === 'development') {
      console.error('[sendContactConfirmation] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Envoie l'email de notification au Super Admin lors d'un nouveau contact
 *
 * @param params - Paramètres du message avec date de soumission
 * @returns Résultat de l'envoi (success, messageId ou error)
 *
 * @example
 * ```typescript
 * const result = await sendContactNotification({
 *   name: 'Jean Dupont',
 *   email: 'jean@example.com',
 *   subject: 'Demande d\'information',
 *   message: 'Bonjour, je souhaite...',
 *   submittedAt: new Date()
 * })
 * ```
 */
export async function sendContactNotification(
  params: ContactNotificationParams
): Promise<ContactEmailResult> {
  const { name, email, subject, message, submittedAt } = params
  const adminEmail = getContactEmail()

  try {
    // Rendre le template React Email en HTML
    const html = await render(
      ContactNotificationEmail({
        name,
        email,
        subject,
        message,
        submittedAt,
      })
    )

    // Envoyer l'email à l'admin
    const result = await sendEmail({
      to: adminEmail,
      subject: `[Contact] ${subject} - de ${name}`,
      html,
      replyTo: email, // Permet de répondre directement à l'expéditeur
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    if (process.env.NODE_ENV === 'development') {
      console.error('[sendContactNotification] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Envoie les deux emails de contact en parallèle
 * - Confirmation à l'expéditeur
 * - Notification à l'admin
 *
 * @param params - Paramètres du message
 * @returns Objet avec les résultats des deux envois
 *
 * @example
 * ```typescript
 * const { confirmation, notification } = await sendContactEmails({
 *   name: 'Jean Dupont',
 *   email: 'jean@example.com',
 *   subject: 'Demande',
 *   message: 'Bonjour...'
 * })
 * ```
 */
export async function sendContactEmails(
  params: ContactConfirmationParams
): Promise<{
  confirmation: ContactEmailResult
  notification: ContactEmailResult
}> {
  const submittedAt = new Date()

  // Envoyer les deux emails en parallèle
  const [confirmation, notification] = await Promise.all([
    sendContactConfirmation(params),
    sendContactNotification({ ...params, submittedAt }),
  ])

  return { confirmation, notification }
}
