/**
 * Fonction d'envoi de l'email d'invitation employe/manager/directeur
 *
 * @description Envoie l'email d'invitation lorsqu'un directeur cree un employe
 * avec email. L'invite recoit un lien pour activer son compte.
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'

import { InvitationEmail } from '../../../../emails/templates/InvitationEmail'

export interface SendInvitationEmailParams {
  /** Prenom de l'invite */
  firstName: string
  /** Adresse email de l'invite */
  email: string
  /** Token d'activation */
  token: string
  /** Nom de l'entreprise */
  companyName: string
  /** Nom du role attribue (Employe, Manager, Directeur) */
  roleName: string
  /** Duree de validite du lien (defaut: "48 heures") */
  expiresIn?: string
}

/**
 * Envoie l'email d'invitation a un employe/manager/directeur
 *
 * @param params - Parametres de l'email
 * @returns Resultat de l'envoi (success, messageId ou error)
 */
export async function sendInvitationEmail(
  params: SendInvitationEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    firstName,
    email,
    token,
    companyName,
    roleName,
    expiresIn = '48 heures',
  } = params
  const baseUrl = getBaseUrl()
  const activationUrl = `${baseUrl}/activation-compte?token=${encodeURIComponent(token)}`

  try {
    const html = await render(
      InvitationEmail({
        firstName,
        email,
        activationUrl,
        companyName,
        roleName,
        expiresIn,
      })
    )

    const result = await sendEmail({
      to: email,
      subject: `${firstName}, activez votre compte SmartPlanning`,
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    if (process.env.NODE_ENV === 'development') {
      console.error('[sendInvitationEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
