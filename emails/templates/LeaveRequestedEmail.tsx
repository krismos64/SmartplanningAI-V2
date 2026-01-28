/**
 * Template d'email de nouvelle demande de congé
 *
 * @ticket SP-415
 * @description Email envoyé au manager quand un employé crée une demande de congé
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

export interface LeaveRequestedEmailProps {
  /** Prénom du manager */
  managerName: string
  /** Nom complet de l'employé */
  employeeName: string
  /** Type de congé (déjà traduit en français) */
  leaveType: string
  /** Date de début formatée (ex: "15 janvier 2026") */
  startDate: string
  /** Date de fin formatée (ex: "20 janvier 2026") */
  endDate: string
  /** Nombre de jours */
  totalDays: number
  /** Motif de la demande (optionnel) */
  reason?: string
  /** URL de la demande à valider */
  requestUrl: string
}

/**
 * Email de notification de nouvelle demande de congé
 *
 * Contenu :
 * - Message d'alerte pour le manager
 * - Détails de la demande (employé, type, dates, durée, motif)
 * - Bouton CTA vers la demande
 */
export function LeaveRequestedEmail({
  managerName,
  employeeName,
  leaveType,
  startDate,
  endDate,
  totalDays,
  reason,
  requestUrl,
}: LeaveRequestedEmailProps) {
  const previewText = `Nouvelle demande de congé de ${employeeName} à valider`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {managerName},</Text>

      {/* Message d'alerte */}
      <Text style={presetStyles.paragraph}>
        <strong style={alertTextStyle}>{employeeName}</strong> a soumis une
        nouvelle demande de congé qui nécessite votre validation.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Détails de la demande */}
      <Text style={headingStyle}>Détails de la demande :</Text>

      <Section style={detailsBoxStyle}>
        <Text style={detailLabelStyle}>Employé :</Text>
        <Text style={detailValueStyle}>{employeeName}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>
          Type de congé :
        </Text>
        <Text style={detailValueStyle}>{leaveType}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>Du :</Text>
        <Text style={detailValueStyle}>{startDate}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>Au :</Text>
        <Text style={detailValueStyle}>{endDate}</Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>
          Durée :
        </Text>
        <Text style={detailValueStyle}>
          {totalDays} jour{totalDays > 1 ? 's' : ''}
        </Text>

        {reason && (
          <>
            <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>
              Motif :
            </Text>
            <Text style={detailValueStyle}>{reason}</Text>
          </>
        )}
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Vous pouvez approuver ou refuser cette demande depuis votre espace
        manager.
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href={requestUrl} variant="primary" size="lg">
          Voir la demande
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

const alertTextStyle: React.CSSProperties = {
  color: colors.primary,
}

const detailsBoxStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeft: `4px solid ${colors.primary}`,
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
  color: colors.info.dark,
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

export default LeaveRequestedEmail
