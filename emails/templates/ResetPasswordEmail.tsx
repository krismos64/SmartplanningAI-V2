/**
 * Template d'email de réinitialisation de mot de passe SmartPlanning
 *
 * @ticket SP-298
 * @description Email envoyé lorsqu'un utilisateur demande à réinitialiser son mot de passe
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

export interface ResetPasswordEmailProps {
  /** Prénom de l'utilisateur (optionnel) */
  firstName?: string
  /** Adresse email de l'utilisateur */
  email: string
  /** URL avec token de réinitialisation */
  resetUrl: string
  /** Durée de validité du lien (ex: "1 heure") */
  expiresIn: string
}

/**
 * Email de réinitialisation de mot de passe
 *
 * Contenu :
 * - Titre explicite
 * - Explication de la demande
 * - Mention de la durée de validité
 * - Bouton CTA vers la réinitialisation
 * - Note de sécurité
 */
export function ResetPasswordEmail({
  firstName,
  email,
  resetUrl,
  expiresIn,
}: ResetPasswordEmailProps) {
  const previewText = 'Réinitialisez votre mot de passe SmartPlanning'
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,'

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>
        Réinitialisation de votre mot de passe
      </Text>

      {/* Message d'introduction */}
      <Text style={presetStyles.paragraph}>{greeting}</Text>

      <Text style={presetStyles.paragraph}>
        Vous avez demandé à réinitialiser le mot de passe de votre compte
        SmartPlanning associé à l&apos;adresse email <strong>{email}</strong>.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Avertissement durée de validité */}
      <Section style={warningContainerStyle}>
        <Text style={warningIconStyle}>⚠️</Text>
        <Text style={warningTextStyle}>
          Ce lien est valable pendant <strong>{expiresIn}</strong>. Passé ce
          délai, vous devrez effectuer une nouvelle demande.
        </Text>
      </Section>

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href={resetUrl} variant="primary" size="lg">
          Réinitialiser mon mot de passe
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Note de sécurité */}
      <Section style={securityNoteContainerStyle}>
        <Text style={securityNoteTitleStyle}>Note de sécurité</Text>
        <Text style={securityNoteTextStyle}>
          Si vous n&apos;êtes pas à l&apos;origine de cette demande, vous pouvez
          ignorer cet email en toute sécurité. Votre mot de passe actuel restera
          inchangé.
        </Text>
        <Text style={securityNoteTextStyle}>
          Ne partagez jamais ce lien avec quelqu&apos;un d&apos;autre.
          L&apos;équipe SmartPlanning ne vous demandera jamais votre mot de
          passe.
        </Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Message de support */}
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

const warningContainerStyle: React.CSSProperties = {
  backgroundColor: colors.warning.light,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
  textAlign: 'center',
}

const warningIconStyle: React.CSSProperties = {
  fontSize: '24px',
  lineHeight: '1',
  margin: `0 0 ${spacing.xs} 0`,
}

const warningTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.warning.dark,
  margin: 0,
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

export default ResetPasswordEmail
