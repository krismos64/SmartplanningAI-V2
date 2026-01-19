/**
 * Template d'email de vérification d'adresse email SmartPlanning
 *
 * @ticket SP-299
 * @description Email envoyé lors de l'inscription pour vérifier l'adresse email
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

export interface VerificationEmailProps {
  /** Prénom de l'utilisateur (optionnel) */
  firstName?: string
  /** Adresse email de l'utilisateur */
  email: string
  /** URL avec token de vérification */
  verificationUrl: string
  /** Durée de validité du lien (ex: "24 heures") */
  expiresIn: string
}

/**
 * Email de vérification d'adresse email
 *
 * Contenu :
 * - Message de bienvenue
 * - Explication de la vérification
 * - Mention de la durée de validité
 * - Bouton CTA vers la vérification
 * - Note de sécurité
 */
export function VerificationEmail({
  firstName,
  email,
  verificationUrl,
  expiresIn,
}: VerificationEmailProps) {
  const previewText = 'Confirmez votre adresse email SmartPlanning'
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,'

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>
        Bienvenue sur SmartPlanning !
      </Text>

      {/* Message d'introduction */}
      <Text style={presetStyles.paragraph}>{greeting}</Text>

      <Text style={presetStyles.paragraph}>
        Merci de vous être inscrit sur SmartPlanning. Pour activer votre compte
        et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse
        email <strong>{email}</strong>.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Avertissement durée de validité */}
      <Section style={infoContainerStyle}>
        <Text style={infoIconStyle}>📧</Text>
        <Text style={infoTextStyle}>
          Ce lien de vérification est valable pendant <strong>{expiresIn}</strong>.
          Passé ce délai, vous pourrez demander un nouveau lien de vérification.
        </Text>
      </Section>

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Cliquez sur le bouton ci-dessous pour confirmer votre adresse email :
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href={verificationUrl} variant="primary" size="lg">
          Vérifier mon adresse email
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Avantages de la vérification */}
      <Section style={benefitsContainerStyle}>
        <Text style={benefitsTitleStyle}>Pourquoi vérifier votre email ?</Text>
        <Text style={benefitsTextStyle}>
          • Sécurisez votre compte et vos données
        </Text>
        <Text style={benefitsTextStyle}>
          • Recevez les notifications importantes
        </Text>
        <Text style={benefitsTextStyle}>
          • Récupérez l&apos;accès à votre compte en cas d&apos;oubli de mot de passe
        </Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Note de sécurité */}
      <Section style={securityNoteContainerStyle}>
        <Text style={securityNoteTitleStyle}>Note de sécurité</Text>
        <Text style={securityNoteTextStyle}>
          Si vous n&apos;avez pas créé de compte sur SmartPlanning, vous pouvez
          ignorer cet email en toute sécurité.
        </Text>
        <Text style={securityNoteTextStyle}>
          Ne partagez jamais ce lien avec quelqu&apos;un d&apos;autre.
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

const infoContainerStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
  textAlign: 'center',
}

const infoIconStyle: React.CSSProperties = {
  fontSize: '24px',
  lineHeight: '1',
  margin: `0 0 ${spacing.xs} 0`,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.info.dark,
  margin: 0,
  lineHeight: typography.lineHeight.normal,
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const benefitsContainerStyle: React.CSSProperties = {
  backgroundColor: colors.success.light,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
}

const benefitsTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.success.dark,
  margin: `0 0 ${spacing.sm} 0`,
}

const benefitsTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.success.dark,
  margin: `0 0 ${spacing.xs} 0`,
  lineHeight: typography.lineHeight.normal,
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

export default VerificationEmail
