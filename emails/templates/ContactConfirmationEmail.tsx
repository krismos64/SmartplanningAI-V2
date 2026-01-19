/**
 * Template d'email de confirmation de contact
 *
 * @ticket SP-288
 * @description Email envoyé à l'expéditeur pour confirmer la réception de son message
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

export interface ContactConfirmationEmailProps {
  /** Nom de l'expéditeur */
  name: string
  /** Sujet du message envoyé */
  subject: string
  /** Contenu du message envoyé */
  message: string
}

/**
 * Email de confirmation envoyé après soumission du formulaire de contact
 *
 * Contenu :
 * - Accusé de réception personnalisé
 * - Récapitulatif du message envoyé
 * - Informations sur le délai de réponse
 */
export function ContactConfirmationEmail({
  name,
  subject,
  message,
}: ContactConfirmationEmailProps) {
  const previewText = `Merci ${name} ! Nous avons bien reçu votre message.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>
        Merci pour votre message, {name} !
      </Text>

      {/* Message de confirmation */}
      <Text style={presetStyles.paragraph}>
        Nous avons bien reçu votre message et nous vous remercions de votre
        intérêt pour SmartPlanning. Notre équipe va étudier votre demande avec
        attention.
      </Text>

      <Text style={presetStyles.paragraph}>
        Nous nous engageons à vous répondre dans un délai de{' '}
        <strong>24 à 48 heures ouvrées</strong>.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Récapitulatif du message */}
      <Text style={headingStyle}>Récapitulatif de votre message :</Text>

      <Section style={messageBoxStyle}>
        <Text style={messageLabelStyle}>Sujet :</Text>
        <Text style={messageValueStyle}>{subject}</Text>

        <Text style={{ ...messageLabelStyle, marginTop: spacing.md }}>
          Message :
        </Text>
        <Text style={messageContentStyle}>{message}</Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        En attendant notre réponse, découvrez nos fonctionnalités :
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href="https://smartplanning.fr" variant="primary" size="lg">
          Visiter notre site
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Informations de contact */}
      <Text style={infoTextStyle}>
        Si vous avez des questions urgentes, vous pouvez nous contacter
        directement à{' '}
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

const headingStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.md} 0`,
}

const messageBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const messageLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const messageValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  color: colors.primary,
  margin: `${spacing.xs} 0 0 0`,
}

const messageContentStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.text.secondary,
  margin: `${spacing.xs} 0 0 0`,
  lineHeight: typography.lineHeight.relaxed,
  whiteSpace: 'pre-wrap' as const,
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const infoTextStyle: React.CSSProperties = {
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

export default ContactConfirmationEmail
