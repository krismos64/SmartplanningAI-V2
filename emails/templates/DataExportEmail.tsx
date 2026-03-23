/**
 * Template d'email d'export de données RGPD
 *
 * @description Email envoyé après un export de données personnelles (RGPD Article 20)
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

export interface DataExportEmailProps {
  /** Prénom de l'utilisateur */
  firstName: string
  /** Date de l'export formatée (ex: "23 mars 2026 à 14h35") */
  exportedAt: string
  /** URL du tableau de bord */
  dashboardUrl: string
}

/**
 * Email de confirmation d'export de données RGPD
 *
 * Contenu :
 * - Confirmation de l'export
 * - Référence RGPD Article 20
 * - Avertissement sécurité sur le fichier
 * - Bouton CTA vers le tableau de bord
 */
export function DataExportEmail({
  firstName,
  exportedAt,
  dashboardUrl,
}: DataExportEmailProps) {
  const previewText = `${firstName}, votre export de données SmartPlanning est prêt.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message de confirmation */}
      <Text style={presetStyles.paragraph}>
        Conformément au <strong>droit à la portabilité (RGPD, Article 20)</strong>,
        votre export de données personnelles a été généré avec succès.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Info box */}
      <Section style={infoBoxStyle}>
        <Text style={infoTitleStyle}>Détails de l&apos;export</Text>
        <Text style={infoTextStyle}>
          <strong>Date de l&apos;export :</strong> {exportedAt}
        </Text>
        <Text style={{ ...infoTextStyle, marginTop: spacing.sm }}>
          Le fichier contient l&apos;ensemble de vos données personnelles :
          informations de profil, plannings, demandes de congés, notes et
          préférences.
        </Text>
      </Section>

      {/* Avertissement sécurité */}
      <Section style={warningBoxStyle}>
        <Text style={warningTitleStyle}>🔒 Sécurité</Text>
        <Text style={warningTextStyle}>
          Le fichier contient des données sensibles, conservez-le en lieu sûr.
          Ne partagez pas ce fichier avec des tiers non autorisés.
        </Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Retrouvez votre export dans votre espace personnel.
      </Text>

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

export default DataExportEmail
