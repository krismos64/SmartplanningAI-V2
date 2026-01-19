/**
 * Fonction d'envoi de l'email de bienvenue
 *
 * @ticket SP-297
 * @description Envoie l'email de bienvenue après inscription d'un nouvel utilisateur
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'

import { WelcomeEmail } from '../../../../emails/templates/WelcomeEmail'

export interface SendWelcomeEmailParams {
  /** Prénom de l'utilisateur */
  firstName: string
  /** Adresse email de l'utilisateur */
  email: string
}

/**
 * Envoie l'email de bienvenue à un nouvel utilisateur
 *
 * @param params - Paramètres de l'email (firstName, email)
 * @returns Résultat de l'envoi (success, messageId ou error)
 *
 * @example
 * const result = await sendWelcomeEmail({
 *   firstName: 'Christophe',
 *   email: 'christophe@example.com'
 * })
 */
export async function sendWelcomeEmail(
  params: SendWelcomeEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { firstName, email } = params
  const baseUrl = getBaseUrl()
  const loginUrl = `${baseUrl}/connexion`

  try {
    // Rendre le template React Email en HTML
    const html = await render(
      WelcomeEmail({
        firstName,
        email,
        loginUrl,
      })
    )

    // Envoyer l'email
    const result = await sendEmail({
      to: email,
      subject: `Bienvenue sur SmartPlanning, ${firstName} !`,
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendWelcomeEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
