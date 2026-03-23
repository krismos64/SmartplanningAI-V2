/**
 * Template d'email de suppression de compte
 *
 * @description Email envoyé après suppression du compte (RGPD Article 17)
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

export interface AccountDeletedEmailProps {
  /** Prénom de l'utilisateur */
  firstName: string
  /** Adresse email de l'utilisateur */
  email: string
  /** Date de suppression formatée (ex: "23 mars 2026 à 14h35") */
  deletedAt: string
}

/**
 * Email de confirmation de suppression de compte
 *
 * Contenu :
 * - Confirmation de la suppression
 * - Liste des données supprimées
 * - Référence RGPD Article 17
 * - Contact pour questions
 */
export function AccountDeletedEmail({
  firstName,
  email,
  deletedAt,
}: AccountDeletedEmailProps) {
  const previewText = `${firstName}, votre compte SmartPlanning a été supprimé.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message de confirmation */}
      <Text style={presetStyles.paragraph}>
        Conformément à votre demande et au titre du{' '}
        <strong>droit à l&apos;effacement (RGPD, Article 17)</strong>, votre
        compte SmartPlanning associé à l&apos;adresse <strong>{email}</strong> a
        été définitivement supprimé.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Détails de la suppression */}
      <Text style={headingStyle}>Données supprimées :</Text>

      <Section style={detailsBoxStyle}>
        <Text style={detailTextStyle}>
          <strong>Date de suppression :</strong> {deletedAt}
        </Text>
        <Text style={{ ...detailTextStyle, marginTop: spacing.md }}>
          Les données suivantes ont été définitivement effacées :
        </Text>
        <Text style={listItemStyle}>• Données personnelles (nom, prénom, email)</Text>
        <Text style={listItemStyle}>• Plannings et historique</Text>
        <Text style={listItemStyle}>• Demandes de congés et soldes</Text>
        <Text style={listItemStyle}>• Notes personnelles et incidents</Text>
        <Text style={listItemStyle}>• Notifications et préférences</Text>
        <Text style={listItemStyle}>• Avatar et fichiers associés</Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Message de clôture */}
      <Text style={infoTextStyle}>
        Nous sommes désolés de vous voir partir. Si vous avez des questions
        concernant la suppression de vos données, vous pouvez nous contacter à{' '}
        <a href="mailto:contact@smartplanning.fr" style={linkStyle}>
          contact@smartplanning.fr
        </a>
      </Text>

      <Text style={infoTextStyle}>
        Merci d&apos;avoir utilisé SmartPlanning. Nous espérons vous revoir un jour.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Signature */}
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

const detailsBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const detailTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.text.secondary,
  margin: 0,
  lineHeight: typography.lineHeight.relaxed,
}

const listItemStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: `${spacing.xs} 0 0 ${spacing.md}`,
  lineHeight: typography.lineHeight.relaxed,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
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

export default AccountDeletedEmail
