/**
 * Fonction d'envoi de l'email d'invitation employe/manager/directeur
 *
 * @description Envoie l'email d'invitation lorsqu'un directeur cree un employe
 * avec email. L'invite recoit un lien pour activer son compte.
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'
import { AuthEmailType, logAuthEmail } from '@/lib/email/auth/log-auth-email'
import type { EmailResult } from '@/lib/email/types'

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
  /**
   * Identifiant de l'entreprise, pour journaliser l'envoi dans `EmailLog`.
   *
   * SP-579 : optionnel pour ne pas casser un appelant qui l'ignore, mais sans
   * lui l'invitation reste absente du journal de delivrabilite. La colonne
   * `companyId` de `EmailLog` est NOT NULL, il n'y a pas de repli possible.
   */
  companyId?: string
}

/**
 * Envoie l'email d'invitation a un employe/manager/directeur
 *
 * @param params - Parametres de l'email
 * @returns Resultat de l'envoi (success, messageId ou error)
 */
export async function sendInvitationEmail(
  params: SendInvitationEmailParams
): Promise<EmailResult> {
  const {
    firstName,
    email,
    token,
    companyName,
    roleName,
    expiresIn = '48 heures',
    companyId,
  } = params
  const baseUrl = getBaseUrl()
  const activationUrl = `${baseUrl}/activate-account?token=${encodeURIComponent(token)}`

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

    // SP-579 : le journal ne doit jamais faire echouer l'envoi, d'ou le
    // fire-and-forget conforme au pattern email du projet.
    if (companyId) {
      logAuthEmail({
        companyId,
        emailType: AuthEmailType.INVITATION,
        recipientEmail: email,
        success: result.success,
        outcome: result.outcome,
        messageId: result.messageId,
        error: result.error,
        rejected: result.rejected,
        smtpResponse: result.smtpResponse,
      }).catch((err) => {
        console.error('[sendInvitationEmail] Log failed:', err)
      })
    }

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    if (process.env.NODE_ENV === 'development') {
      console.error('[sendInvitationEmail] Error:', error)
    }

    if (companyId) {
      logAuthEmail({
        companyId,
        emailType: AuthEmailType.INVITATION,
        recipientEmail: email,
        success: false,
        outcome: 'FAILED',
        error: errorMessage,
      }).catch((err) => {
        console.error('[sendInvitationEmail] Log failed:', err)
      })
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
