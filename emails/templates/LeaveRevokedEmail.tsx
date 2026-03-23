/**
 * Template d'email de révocation de congé
 *
 * @description Email envoyé lorsqu'un congé approuvé est révoqué par le manager
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

export interface LeaveRevokedEmailProps {
  /** Prénom de l'employé */
  firstName: string
  /** Type de congé (déjà traduit en français) */
  leaveType: string
  /** Date de début formatée (ex: "15 janvier 2026") */
  startDate: string
  /** Date de fin formatée (ex: "20 janvier 2026") */
  endDate: string
  /** Motif de la révocation */
  revokeReason: string
  /** URL du tableau de bord des congés */
  dashboardUrl: string
}

/**
 * Email de notification de révocation de congé
 *
 * Contenu :
 * - Information de la révocation
 * - Détails du congé dans une box warning
 * - Motif de la révocation
 * - Bouton CTA vers le tableau de bord congés
 */
export function LeaveRevokedEmail({
  firstName,
  leaveType,
  startDate,
  endDate,
  revokeReason,
  dashboardUrl,
}: LeaveRevokedEmailProps) {
  const previewText = `${firstName}, votre congé du ${startDate} au ${endDate} a été révoqué.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message d'information */}
      <Text style={presetStyles.paragraph}>
        Nous vous informons que votre congé précédemment approuvé a été révoqué
        par votre manager.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Détails du congé - warning box */}
      <Text style={headingStyle}>Détails du congé révoqué :</Text>

      <Section style={warningBoxStyle}>
        <Text style={detailLabelStyle}>Type de congé :</Text>
        <Text style={detailValueStyle}>{leaveType}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>Du :</Text>
        <Text style={detailValueStyle}>{startDate}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>Au :</Text>
        <Text style={detailValueStyle}>{endDate}</Text>
      </Section>

      {/* Motif de la révocation */}
      <Text style={headingStyle}>Motif de la révocation :</Text>

      <Section style={reasonBoxStyle}>
        <Text style={reasonTextStyle}>{revokeReason}</Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Invitation à contacter le manager */}
      <Text style={infoTextStyle}>
        Si vous avez des questions, n&apos;hésitez pas à contacter votre manager
        pour en discuter.
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

const warningBoxStyle: React.CSSProperties = {
  backgroundColor: colors.warning.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeft: `4px solid ${colors.status.warning}`,
}

const detailLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.warning.dark,
  margin: 0,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const detailValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  color: colors.warning.dark,
  margin: `${spacing.xs} 0 0 0`,
}

const reasonBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeft: `4px solid ${colors.border.medium}`,
}

const reasonTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.text.secondary,
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

export default LeaveRevokedEmail
