/**
 * Fonctions d'envoi des emails de notification de compte
 *
 * Regroupe les emails liés au cycle de vie du compte utilisateur :
 * - Changement de mot de passe (sécurité)
 * - Suppression de compte (RGPD article 17)
 * - Export de données (RGPD article 20)
 * - Activation de compte employé
 * - Désactivation de compte employé
 *
 * @ticket SP-480
 */

import { render } from '@react-email/components'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'

import { PasswordChangedEmail } from '../../../../emails/templates/PasswordChangedEmail'
import { AccountDeletedEmail } from '../../../../emails/templates/AccountDeletedEmail'
import { DataExportEmail } from '../../../../emails/templates/DataExportEmail'
import { EmployeeActivatedEmail } from '../../../../emails/templates/EmployeeActivatedEmail'
import { EmployeeDeactivatedEmail } from '../../../../emails/templates/EmployeeDeactivatedEmail'

// ============================================================================
// Types
// ============================================================================

type EmailResult = { success: boolean; messageId?: string; error?: string }

// ============================================================================
// Changement de mot de passe
// ============================================================================

export async function sendPasswordChangedEmail(params: {
  firstName: string
  email: string
}): Promise<EmailResult> {
  try {
    const baseUrl = getBaseUrl()
    const html = await render(
      PasswordChangedEmail({
        firstName: params.firstName,
        changedAt: new Date().toLocaleString('fr-FR', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'Europe/Paris',
        }),
        dashboardUrl: `${baseUrl}/app/profile`,
      })
    )

    return await sendEmail({
      to: params.email,
      subject: 'Votre mot de passe a été modifié',
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendPasswordChangedEmail] Error:', error)
    }
    return { success: false, error: errorMessage }
  }
}

// ============================================================================
// Suppression de compte (RGPD article 17)
// ============================================================================

export async function sendAccountDeletedEmail(params: {
  firstName: string
  email: string
}): Promise<EmailResult> {
  try {
    const html = await render(
      AccountDeletedEmail({
        firstName: params.firstName,
        email: params.email,
        deletedAt: new Date().toLocaleString('fr-FR', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'Europe/Paris',
        }),
      })
    )

    return await sendEmail({
      to: params.email,
      subject: 'Votre compte SmartPlanning a été supprimé',
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendAccountDeletedEmail] Error:', error)
    }
    return { success: false, error: errorMessage }
  }
}

// ============================================================================
// Export de données (RGPD article 20)
// ============================================================================

export async function sendDataExportEmail(params: {
  firstName: string
  email: string
}): Promise<EmailResult> {
  try {
    const baseUrl = getBaseUrl()
    const html = await render(
      DataExportEmail({
        firstName: params.firstName,
        exportedAt: new Date().toLocaleString('fr-FR', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'Europe/Paris',
        }),
        dashboardUrl: `${baseUrl}/app/profile`,
      })
    )

    return await sendEmail({
      to: params.email,
      subject: 'Export de vos données personnelles',
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendDataExportEmail] Error:', error)
    }
    return { success: false, error: errorMessage }
  }
}

// ============================================================================
// Activation de compte employé
// ============================================================================

export async function sendEmployeeActivatedEmail(params: {
  firstName: string
  email: string
  companyName: string
}): Promise<EmailResult> {
  try {
    const baseUrl = getBaseUrl()
    const html = await render(
      EmployeeActivatedEmail({
        firstName: params.firstName,
        companyName: params.companyName,
        dashboardUrl: `${baseUrl}/app/dashboard`,
      })
    )

    return await sendEmail({
      to: params.email,
      subject: `Bienvenue chez ${params.companyName}, ${params.firstName} !`,
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendEmployeeActivatedEmail] Error:', error)
    }
    return { success: false, error: errorMessage }
  }
}

// ============================================================================
// Désactivation de compte employé
// ============================================================================

export async function sendEmployeeDeactivatedEmail(params: {
  firstName: string
  email: string
  companyName: string
}): Promise<EmailResult> {
  try {
    const html = await render(
      EmployeeDeactivatedEmail({
        firstName: params.firstName,
        companyName: params.companyName,
      })
    )

    return await sendEmail({
      to: params.email,
      subject: 'Votre accès SmartPlanning a été désactivé',
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendEmployeeDeactivatedEmail] Error:', error)
    }
    return { success: false, error: errorMessage }
  }
}
