/**
 * Envoi de la notification admin lors d'une nouvelle inscription
 *
 * @ticket SP-480
 * @description Envoie un email à contact@smartplanning.fr quand une
 * nouvelle entreprise s'inscrit sur la plateforme.
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl, getContactEmail } from '@/lib/email/config'

import { NewRegistrationEmail } from '../../../../emails/templates/NewRegistrationEmail'

export interface SendNewRegistrationEmailParams {
  companyName: string
  directorName: string
  directorEmail: string
  phone: string | null
}

/**
 * Envoie la notification de nouvelle inscription à l'admin
 *
 * @param params - Données de l'inscription
 * @returns Résultat de l'envoi
 */
export async function sendNewRegistrationEmail(
  params: SendNewRegistrationEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { companyName, directorName, directorEmail, phone } = params
  const baseUrl = getBaseUrl()
  const adminEmail = getContactEmail()

  try {
    const html = await render(
      NewRegistrationEmail({
        companyName,
        directorName,
        directorEmail,
        phone,
        registeredAt: new Date().toLocaleString('fr-FR', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'Europe/Paris',
        }),
        adminUrl: `${baseUrl}/app/admin/logs`,
      })
    )

    const result = await sendEmail({
      to: adminEmail,
      subject: `Nouvelle inscription : ${companyName}`,
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[sendNewRegistrationEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
