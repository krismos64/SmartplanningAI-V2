/**
 * Template d'email de confirmation de changement d'adresse email
 *
 * @description Envoyé à la NOUVELLE adresse quand un directeur ou manager
 * corrige l'email d'un collaborateur. Tant que ce lien n'est pas cliqué,
 * l'adresse de connexion reste inchangée.
 */

import { Text, Hr, Section } from '@react-email/components'
import * as React from 'react'

import {
  Layout,
  Button,
  colors,
  typography,
  spacing,
  presetStyles,
} from '../components'

export interface EmailChangeConfirmEmailProps {
  /** Prénom du collaborateur concerné */
  firstName: string
  /** Nouvelle adresse email à confirmer */
  newEmail: string
  /** Ancienne adresse email (celle encore utilisée pour se connecter) */
  oldEmail: string
  /** Nom de l'entreprise */
  companyName: string
  /** URL avec token de confirmation */
  confirmUrl: string
  /** Durée de validité du lien (ex: "48 heures") */
  expiresIn: string
}

/**
 * Email de confirmation de changement d'adresse email
 */
export function EmailChangeConfirmEmail({
  firstName,
  newEmail,
  oldEmail,
  companyName,
  confirmUrl,
  expiresIn,
}: EmailChangeConfirmEmailProps) {
  const previewText = 'Confirmez votre nouvelle adresse email SmartPlanning'

  return (
    <Layout preview={previewText}>
      <Text style={presetStyles.heading1}>
        Confirmez votre nouvelle adresse
      </Text>

      <Text style={presetStyles.paragraph}>Bonjour {firstName},</Text>

      <Text style={presetStyles.paragraph}>
        L&apos;adresse email de votre compte SmartPlanning chez{' '}
        <strong>{companyName}</strong> a été modifiée par un responsable. Pour
        que le changement prenne effet, confirmez que cette adresse vous
        appartient.
      </Text>

      <Section style={infoContainerStyle}>
        <Text style={infoTextStyle}>
          Ancienne adresse : <strong>{oldEmail}</strong>
        </Text>
        <Text style={infoTextStyle}>
          Nouvelle adresse : <strong>{newEmail}</strong>
        </Text>
      </Section>

      <Text style={presetStyles.paragraph}>
        Tant que vous n&apos;avez pas cliqué sur le bouton ci-dessous, vous
        continuez à vous connecter avec votre ancienne adresse.
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href={confirmUrl} variant="primary" size="lg">
          Confirmer ma nouvelle adresse
        </Button>
      </Section>

      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Ce lien est valable pendant <strong>{expiresIn}</strong>.
      </Text>

      <Hr style={presetStyles.divider} />

      <Section style={securityNoteContainerStyle}>
        <Text style={securityNoteTitleStyle}>Note de sécurité</Text>
        <Text style={securityNoteTextStyle}>
          Si vous n&apos;attendiez pas ce changement, ne cliquez pas sur le lien
          et prévenez votre responsable. Votre compte reste accessible avec
          votre ancienne adresse.
        </Text>
        <Text style={securityNoteTextStyle}>
          Ne partagez jamais ce lien avec quelqu&apos;un d&apos;autre.
        </Text>
      </Section>

      <Hr style={presetStyles.divider} />

      <Text style={supportTextStyle}>
        Une question ? Contactez-nous à{' '}
        <a href="mailto:contact@smartplanning.fr" style={linkStyle}>
          contact@smartplanning.fr
        </a>
      </Text>

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const infoContainerStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.info.dark,
  margin: `0 0 ${spacing.xs} 0`,
  lineHeight: typography.lineHeight.normal,
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const securityNoteContainerStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
}

const securityNoteTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.sm} 0`,
}

const securityNoteTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: `0 0 ${spacing.xs} 0`,
  lineHeight: typography.lineHeight.normal,
}

const supportTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  margin: `0 0 ${spacing.md} 0`,
  lineHeight: typography.lineHeight.relaxed,
}

const linkStyle: React.CSSProperties = {
  color: colors.primary,
  textDecoration: 'underline',
}

const signatureStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic',
  margin: 0,
}

export default EmailChangeConfirmEmail
