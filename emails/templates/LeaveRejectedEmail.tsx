/**
 * Template d'email de congé refusé
 *
 * @ticket SP-300
 * @description Email envoyé à l'employé quand sa demande de congé est refusée
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

export interface LeaveRejectedEmailProps {
  /** Prénom de l'employé */
  firstName: string
  /** Type de congé (déjà traduit en français) */
  leaveType: string
  /** Date de début formatée (ex: "15 janvier 2026") */
  startDate: string
  /** Date de fin formatée (ex: "20 janvier 2026") */
  endDate: string
  /** Motif du refus */
  rejectionReason: string
  /** URL du tableau de bord des congés */
  dashboardUrl: string
}

/**
 * Email de notification de refus de congé
 *
 * Contenu :
 * - Message empathique
 * - Détails du congé refusé (type, dates)
 * - Motif du refus
 * - Invitation à contacter le manager
 * - Bouton CTA vers le tableau de bord
 */
export function LeaveRejectedEmail({
  firstName,
  leaveType,
  startDate,
  endDate,
  rejectionReason,
  dashboardUrl,
}: LeaveRejectedEmailProps) {
  const previewText = `${firstName}, votre demande de congé n'a pas été approuvée.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message empathique */}
      <Text style={presetStyles.paragraph}>
        Nous sommes désolés, votre demande de congé n&apos;a pas été approuvée.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Détails du congé */}
      <Text style={headingStyle}>Détails de votre demande :</Text>

      <Section style={detailsBoxStyle}>
        <Text style={detailLabelStyle}>Type de congé :</Text>
        <Text style={detailValueStyle}>{leaveType}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>Du :</Text>
        <Text style={detailValueStyle}>{startDate}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>Au :</Text>
        <Text style={detailValueStyle}>{endDate}</Text>
      </Section>

      {/* Motif du refus */}
      <Text style={headingStyle}>Motif du refus :</Text>

      <Section style={reasonBoxStyle}>
        <Text style={reasonTextStyle}>{rejectionReason}</Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Invitation à contacter le manager */}
      <Text style={infoTextStyle}>
        N&apos;hésitez pas à contacter votre manager pour plus
        d&apos;informations ou pour discuter d&apos;alternatives possibles.
      </Text>

      {/* Call to action */}
      <Section style={ctaContainerStyle}>
        <Button href={dashboardUrl} variant="primary" size="lg">
          Voir mes congés
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

const detailLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const detailValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.secondary,
  margin: `${spacing.xs} 0 0 0`,
}

const reasonBoxStyle: React.CSSProperties = {
  backgroundColor: colors.warning.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeft: `4px solid ${colors.status.warning}`,
}

const reasonTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.warning.dark,
  margin: 0,
  lineHeight: typography.lineHeight.relaxed,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.text.secondary,
  textAlign: 'center',
  margin: `0 0 ${spacing.md} 0`,
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

export default LeaveRejectedEmail
