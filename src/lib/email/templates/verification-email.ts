/**
 * Fonction d'envoi de l'email de vérification d'adresse email
 *
 * @ticket SP-299
 * @description Envoie l'email de vérification lorsqu'un utilisateur s'inscrit
 *              ou demande un nouveau lien de vérification
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'
import type { EmailResult } from '@/lib/email/types'

import { VerificationEmail } from '../../../../emails/templates/VerificationEmail'

export interface SendVerificationEmailParams {
  /** Prénom de l'utilisateur (optionnel) */
  firstName?: string
  /** Adresse email de l'utilisateur */
  email: string
  /** Token de vérification */
  token: string
  /** Durée de validité du lien (ex: "24 heures") */
  expiresIn?: string
}

/**
 * Envoie l'email de vérification d'adresse email
 *
 * @param params - Paramètres de l'email (firstName, email, token, expiresIn)
 * @returns Résultat de l'envoi (success, messageId ou error)
 *
 * @example
 * const result = await sendVerificationEmail({
 *   firstName: 'Christophe',
 *   email: 'christophe@example.com',
 *   token: 'abc123...',
 *   expiresIn: '24 heures'
 * })
 */
export async function sendVerificationEmail(
  params: SendVerificationEmailParams
): Promise<EmailResult> {
  const { firstName, email, token, expiresIn = '24 heures' } = params
  const baseUrl = getBaseUrl()
  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`

  try {
    // Rendre le template React Email en HTML
    const html = await render(
      VerificationEmail({
        firstName,
        email,
        verificationUrl,
        expiresIn,
      })
    )

    // Envoyer l'email
    const result = await sendEmail({
      to: email,
      subject: 'Confirmez votre adresse email SmartPlanning',
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendVerificationEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
