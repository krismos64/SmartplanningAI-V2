/**
 * Fonction d'envoi de l'email de réinitialisation de mot de passe
 *
 * @ticket SP-298
 * @description Envoie l'email de réinitialisation lorsqu'un utilisateur demande
 *              à changer son mot de passe
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'

import { ResetPasswordEmail } from '../../../../emails/templates/ResetPasswordEmail'

export interface SendResetPasswordEmailParams {
  /** Prénom de l'utilisateur (optionnel) */
  firstName?: string
  /** Adresse email de l'utilisateur */
  email: string
  /** Token de réinitialisation */
  token: string
  /** Durée de validité du lien (ex: "1 heure") */
  expiresIn?: string
}

/**
 * Envoie l'email de réinitialisation de mot de passe
 *
 * @param params - Paramètres de l'email (firstName, email, token, expiresIn)
 * @returns Résultat de l'envoi (success, messageId ou error)
 *
 * @example
 * const result = await sendResetPasswordEmail({
 *   firstName: 'Christophe',
 *   email: 'christophe@example.com',
 *   token: 'abc123...',
 *   expiresIn: '1 heure'
 * })
 */
export async function sendResetPasswordEmail(
  params: SendResetPasswordEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { firstName, email, token, expiresIn = '1 heure' } = params
  const baseUrl = getBaseUrl()
  const resetUrl = `${baseUrl}/reinitialisation-mot-de-passe?token=${encodeURIComponent(token)}`

  try {
    // Rendre le template React Email en HTML
    const html = await render(
      ResetPasswordEmail({
        firstName,
        email,
        resetUrl,
        expiresIn,
      })
    )

    // Envoyer l'email
    const result = await sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe SmartPlanning',
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendResetPasswordEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
