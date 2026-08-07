/**
 * Template d'alerte envoyée à l'ANCIENNE adresse email
 *
 * @description Prévient le collaborateur qu'un responsable a demandé le
 * changement de son adresse de connexion. Sert de garde-fou : si la demande
 * est illégitime, il peut réagir avant que la nouvelle adresse soit confirmée.
 */

import { Text, Hr, Section } from '@react-email/components'
import * as React from 'react'

import {
  Layout,
  colors,
  typography,
  spacing,
  presetStyles,
} from '../components'

export interface EmailChangeAlertEmailProps {
  /** Prénom du collaborateur concerné */
  firstName: string
  /** Ancienne adresse email (destinataire de cet email) */
  oldEmail: string
  /** Nouvelle adresse email demandée */
  newEmail: string
  /** Nom de l'entreprise */
  companyName: string
}

/**
 * Email d'alerte de demande de changement d'adresse
 */
export function EmailChangeAlertEmail({
  firstName,
  oldEmail,
  newEmail,
  companyName,
}: EmailChangeAlertEmailProps) {
  const previewText = 'Demande de changement de votre adresse email'

  return (
    <Layout preview={previewText}>
      <Text style={presetStyles.heading1}>
        Demande de changement d&apos;adresse
      </Text>

      <Text style={presetStyles.paragraph}>Bonjour {firstName},</Text>

      <Text style={presetStyles.paragraph}>
        Un responsable de <strong>{companyName}</strong> a demandé le changement
        de l&apos;adresse email de votre compte SmartPlanning.
      </Text>

      <Section style={infoContainerStyle}>
        <Text style={infoTextStyle}>
          Adresse actuelle : <strong>{oldEmail}</strong>
        </Text>
        <Text style={infoTextStyle}>
          Nouvelle adresse demandée : <strong>{newEmail}</strong>
        </Text>
      </Section>

      <Text style={presetStyles.paragraph}>
        Un email de confirmation a été envoyé à la nouvelle adresse. Le
        changement ne prendra effet que lorsque le lien qu&apos;il contient aura
        été utilisé. D&apos;ici là, vous continuez à vous connecter avec{' '}
        <strong>{oldEmail}</strong>.
      </Text>

      <Hr style={presetStyles.divider} />

      <Section style={warningContainerStyle}>
        <Text style={warningTitleStyle}>
          Vous n&apos;êtes pas à l&apos;origine de cette demande ?
        </Text>
        <Text style={warningTextStyle}>
          Contactez immédiatement votre responsable ou écrivez-nous à
          contact@smartplanning.fr. Ne communiquez votre mot de passe à
          personne.
        </Text>
      </Section>

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const infoContainerStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: `0 0 ${spacing.xs} 0`,
  lineHeight: typography.lineHeight.normal,
}

const warningContainerStyle: React.CSSProperties = {
  backgroundColor: colors.warning.light,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
}

const warningTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.warning.dark,
  margin: `0 0 ${spacing.sm} 0`,
}

const warningTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.warning.dark,
  margin: 0,
  lineHeight: typography.lineHeight.normal,
}

const signatureStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic',
  margin: 0,
}

export default EmailChangeAlertEmail
