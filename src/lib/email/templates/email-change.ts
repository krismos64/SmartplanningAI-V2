/**
 * Fonctions d'envoi des emails de changement d'adresse email
 *
 * @description Deux envois complémentaires quand un responsable corrige
 * l'adresse de connexion d'un collaborateur :
 * - la nouvelle adresse reçoit un lien de confirmation (le changement n'est
 *   effectif qu'après le clic) ;
 * - l'ancienne adresse reçoit une alerte, garde-fou contre un détournement
 *   de compte par un responsable.
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'

import { EmailChangeConfirmEmail } from '../../../../emails/templates/EmailChangeConfirmEmail'
import { EmailChangeAlertEmail } from '../../../../emails/templates/EmailChangeAlertEmail'

export interface SendEmailChangeConfirmParams {
  /** Prénom du collaborateur concerné */
  firstName: string
  /** Nouvelle adresse email (destinataire) */
  newEmail: string
  /** Ancienne adresse email, encore valable pour se connecter */
  oldEmail: string
  /** Nom de l'entreprise */
  companyName: string
  /** Token de confirmation */
  token: string
  /** Durée de validité du lien (défaut: "48 heures") */
  expiresIn?: string
}

export interface SendEmailChangeAlertParams {
  /** Prénom du collaborateur concerné */
  firstName: string
  /** Ancienne adresse email (destinataire) */
  oldEmail: string
  /** Nouvelle adresse email demandée */
  newEmail: string
  /** Nom de l'entreprise */
  companyName: string
}

type EmailResult = { success: boolean; messageId?: string; error?: string }

/**
 * Envoie le lien de confirmation à la nouvelle adresse email
 */
export async function sendEmailChangeConfirmEmail(
  params: SendEmailChangeConfirmParams
): Promise<EmailResult> {
  const {
    firstName,
    newEmail,
    oldEmail,
    companyName,
    token,
    expiresIn = '48 heures',
  } = params
  const baseUrl = getBaseUrl()
  const confirmUrl = `${baseUrl}/confirm-email-change?token=${encodeURIComponent(token)}`

  try {
    const html = await render(
      EmailChangeConfirmEmail({
        firstName,
        newEmail,
        oldEmail,
        companyName,
        confirmUrl,
        expiresIn,
      })
    )

    return await sendEmail({
      to: newEmail,
      subject: 'Confirmez votre nouvelle adresse email SmartPlanning',
      html,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    if (process.env.NODE_ENV === 'development') {
      console.error('[sendEmailChangeConfirmEmail] Error:', error)
    }

    return { success: false, error: errorMessage }
  }
}

/**
 * Prévient l'ancienne adresse qu'un changement a été demandé
 */
export async function sendEmailChangeAlertEmail(
  params: SendEmailChangeAlertParams
): Promise<EmailResult> {
  const { firstName, oldEmail, newEmail, companyName } = params

  try {
    const html = await render(
      EmailChangeAlertEmail({
        firstName,
        oldEmail,
        newEmail,
        companyName,
      })
    )

    return await sendEmail({
      to: oldEmail,
      subject: 'Demande de changement de votre adresse email SmartPlanning',
      html,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    if (process.env.NODE_ENV === 'development') {
      console.error('[sendEmailChangeAlertEmail] Error:', error)
    }

    return { success: false, error: errorMessage }
  }
}
