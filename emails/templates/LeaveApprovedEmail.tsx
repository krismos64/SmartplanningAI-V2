/**
 * Template d'email de congé approuvé
 *
 * @ticket SP-300
 * @description Email envoyé à l'employé quand sa demande de congé est approuvée
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

export interface LeaveApprovedEmailProps {
  /** Prénom de l'employé */
  firstName: string
  /** Type de congé (déjà traduit en français) */
  leaveType: string
  /** Date de début formatée (ex: "15 janvier 2026") */
  startDate: string
  /** Date de fin formatée (ex: "20 janvier 2026") */
  endDate: string
  /** URL du tableau de bord des congés */
  dashboardUrl: string
}

/**
 * Email de notification d'approbation de congé
 *
 * Contenu :
 * - Message de félicitations
 * - Détails du congé approuvé (type, dates)
 * - Bouton CTA vers le tableau de bord
 */
export function LeaveApprovedEmail({
  firstName,
  leaveType,
  startDate,
  endDate,
  dashboardUrl,
}: LeaveApprovedEmailProps) {
  const previewText = `Bonne nouvelle ${firstName} ! Votre demande de congé a été approuvée.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message de félicitations */}
      <Text style={presetStyles.paragraph}>
        <strong style={successTextStyle}>Bonne nouvelle !</strong> Votre demande
        de congé a été approuvée.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Détails du congé */}
      <Text style={headingStyle}>Détails de votre congé :</Text>

      <Section style={detailsBoxStyle}>
        <Text style={detailLabelStyle}>Type de congé :</Text>
        <Text style={detailValueStyle}>{leaveType}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>Du :</Text>
        <Text style={detailValueStyle}>{startDate}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>Au :</Text>
        <Text style={detailValueStyle}>{endDate}</Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Consultez vos congés à tout moment dans votre espace personnel.
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href={dashboardUrl} variant="success" size="lg">
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

const successTextStyle: React.CSSProperties = {
  color: colors.status.success,
}

const detailsBoxStyle: React.CSSProperties = {
  backgroundColor: colors.success.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeft: `4px solid ${colors.status.success}`,
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
  color: colors.success.dark,
  margin: `${spacing.xs} 0 0 0`,
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

export default LeaveApprovedEmail
