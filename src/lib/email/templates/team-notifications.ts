/**
 * Fonctions d'envoi des emails de notification d'équipe
 *
 * @ticket SP-480
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'

import { TeamMemberAddedEmail } from '../../../../emails/templates/TeamMemberAddedEmail'

type EmailResult = { success: boolean; messageId?: string; error?: string }

/**
 * Notifie un employé qu'il a été ajouté à une équipe
 */
export async function sendTeamMemberAddedEmail(params: {
  firstName: string
  email: string
  teamName: string
  managerName: string | null
}): Promise<EmailResult> {
  try {
    const baseUrl = getBaseUrl()
    const html = await render(
      TeamMemberAddedEmail({
        firstName: params.firstName,
        teamName: params.teamName,
        managerName: params.managerName,
        dashboardUrl: `${baseUrl}/app/dashboard`,
      })
    )

    return await sendEmail({
      to: params.email,
      subject: `Vous avez rejoint l'équipe ${params.teamName}`,
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendTeamMemberAddedEmail] Error:', error)
    }
    return { success: false, error: errorMessage }
  }
}
