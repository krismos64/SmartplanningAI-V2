/**
 * Template d'email de mise à jour des soldes de congés
 *
 * @description Email envoyé lorsque les soldes de congés d'un employé sont modifiés
 */

import { Text, Hr, Section, Row, Column } from '@react-email/components'
import * as React from 'react'

import {
  Layout,
  Button,
  colors,
  typography,
  spacing,
  presetStyles,
} from '../components'

export interface LeaveBalanceChangedEmailProps {
  /** Prénom de l'employé */
  firstName: string
  /** Année concernée */
  year: number
  /** Total congés payés */
  paidLeaveTotal: number
  /** Congés payés restants */
  paidLeaveRemaining: number
  /** Total RTT */
  rttTotal: number
  /** RTT restants */
  rttRemaining: number
  /** URL du tableau de bord des congés */
  dashboardUrl: string
}

/**
 * Email de notification de mise à jour des soldes de congés
 *
 * Contenu :
 * - Information de la mise à jour
 * - Tableau récapitulatif des soldes
 * - Bouton CTA vers le tableau de bord congés
 */
export function LeaveBalanceChangedEmail({
  firstName,
  year,
  paidLeaveTotal,
  paidLeaveRemaining,
  rttTotal,
  rttRemaining,
  dashboardUrl,
}: LeaveBalanceChangedEmailProps) {
  const previewText = `${firstName}, vos soldes de congés ${year} ont été mis à jour.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message d'information */}
      <Text style={presetStyles.paragraph}>
        Vos soldes de congés pour l&apos;année <strong>{year}</strong> ont été
        mis à jour.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Tableau des soldes */}
      <Text style={headingStyle}>Vos soldes actuels :</Text>

      <Section style={tableBoxStyle}>
        {/* Header */}
        <Row style={tableHeaderRowStyle}>
          <Column style={tableHeaderCellStyle}>Type</Column>
          <Column style={tableHeaderCellCenterStyle}>Total</Column>
          <Column style={tableHeaderCellCenterStyle}>Restant</Column>
        </Row>

        {/* Congés payés */}
        <Row style={tableRowStyle}>
          <Column style={tableCellStyle}>Congés payés</Column>
          <Column style={tableCellCenterStyle}>{paidLeaveTotal} j</Column>
          <Column style={tableCellHighlightStyle}>{paidLeaveRemaining} j</Column>
        </Row>

        {/* RTT */}
        <Row style={tableRowStyle}>
          <Column style={tableCellStyle}>RTT</Column>
          <Column style={tableCellCenterStyle}>{rttTotal} j</Column>
          <Column style={tableCellHighlightStyle}>{rttRemaining} j</Column>
        </Row>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Retrouvez le détail de vos soldes dans votre espace congés.
      </Text>

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

const tableBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
}

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: `2px solid ${colors.border.light}`,
  marginBottom: spacing.sm,
}

const tableHeaderCellStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  padding: `${spacing.sm} ${spacing.md}`,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const tableHeaderCellCenterStyle: React.CSSProperties = {
  ...tableHeaderCellStyle,
  textAlign: 'center',
}

const tableRowStyle: React.CSSProperties = {
  borderBottom: `1px solid ${colors.border.light}`,
}

const tableCellStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.text.secondary,
  padding: `${spacing.sm} ${spacing.md}`,
  lineHeight: typography.lineHeight.relaxed,
}

const tableCellCenterStyle: React.CSSProperties = {
  ...tableCellStyle,
  textAlign: 'center',
}

const tableCellHighlightStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.primary,
  padding: `${spacing.sm} ${spacing.md}`,
  textAlign: 'center',
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

export default LeaveBalanceChangedEmail
