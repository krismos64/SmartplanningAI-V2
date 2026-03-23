/**
 * Template d'email de changement de mot de passe
 *
 * @description Email envoyé automatiquement après modification du mot de passe
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

export interface PasswordChangedEmailProps {
  /** Prénom de l'utilisateur */
  firstName: string
  /** Date et heure du changement (ex: "23 mars 2026 à 14h35") */
  changedAt: string
  /** URL du tableau de bord */
  dashboardUrl: string
}

/**
 * Email de confirmation de changement de mot de passe
 *
 * Contenu :
 * - Confirmation du changement
 * - Alerte sécurité si non à l'origine
 * - Date/heure du changement
 * - Bouton CTA vers le tableau de bord
 */
export function PasswordChangedEmail({
  firstName,
  changedAt,
  dashboardUrl,
}: PasswordChangedEmailProps) {
  const previewText = `${firstName}, votre mot de passe SmartPlanning a été modifié.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message de confirmation */}
      <Text style={presetStyles.paragraph}>
        Votre mot de passe SmartPlanning a été modifié avec succès.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Info box avec date/heure */}
      <Section style={infoBoxStyle}>
        <Text style={infoTitleStyle}>Détails de la modification</Text>
        <Text style={infoTextStyle}>
          <strong>Date et heure :</strong> {changedAt}
        </Text>
      </Section>

      {/* Alerte sécurité */}
      <Section style={warningBoxStyle}>
        <Text style={warningTitleStyle}>⚠️ Avertissement de sécurité</Text>
        <Text style={warningTextStyle}>
          Si vous n&apos;êtes pas à l&apos;origine de cette modification,
          contactez-nous immédiatement à{' '}
          <a href="mailto:contact@smartplanning.fr" style={linkStyle}>
            contact@smartplanning.fr
          </a>{' '}
          afin de sécuriser votre compte.
        </Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Section style={ctaContainerStyle}>
        <Button href={dashboardUrl} variant="primary" size="lg">
          Accéder à mon espace
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Signature */}
      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeft: `4px solid ${colors.status.info}`,
}

const infoTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.info.dark,
  margin: `0 0 ${spacing.sm} 0`,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.info.dark,
  margin: 0,
  lineHeight: typography.lineHeight.relaxed,
}

const warningBoxStyle: React.CSSProperties = {
  backgroundColor: colors.warning.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeft: `4px solid ${colors.status.warning}`,
}

const warningTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.warning.dark,
  margin: `0 0 ${spacing.sm} 0`,
}

const warningTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.warning.dark,
  margin: 0,
  lineHeight: typography.lineHeight.relaxed,
}

const linkStyle: React.CSSProperties = {
  color: colors.primary,
  textDecoration: 'underline',
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const signatureStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic',
  margin: 0,
}

export default PasswordChangedEmail
