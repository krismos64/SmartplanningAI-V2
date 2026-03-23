/**
 * Template d'email d'ajout à une équipe
 *
 * @description Email envoyé lorsqu'un employé est ajouté à une nouvelle équipe
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

export interface TeamMemberAddedEmailProps {
  /** Prénom de l'employé */
  firstName: string
  /** Nom de l'équipe */
  teamName: string
  /** Nom du manager (peut être null) */
  managerName: string | null
  /** URL du tableau de bord */
  dashboardUrl: string
}

/**
 * Email de bienvenue dans une nouvelle équipe
 *
 * Contenu :
 * - Message de bienvenue dans l'équipe
 * - Nom de l'équipe et du manager
 * - Bouton CTA vers le tableau de bord
 */
export function TeamMemberAddedEmail({
  firstName,
  teamName,
  managerName,
  dashboardUrl,
}: TeamMemberAddedEmailProps) {
  const previewText = `${firstName}, vous avez rejoint l'équipe ${teamName} !`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message de bienvenue */}
      <Text style={presetStyles.paragraph}>
        Bonne nouvelle ! Vous avez été ajouté(e) à une nouvelle équipe sur
        SmartPlanning.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Détails de l'équipe */}
      <Section style={teamBoxStyle}>
        <Text style={teamTitleStyle}>Votre nouvelle équipe</Text>

        <Text style={detailLabelStyle}>Équipe :</Text>
        <Text style={detailValueStyle}>{teamName}</Text>

        {managerName && (
          <>
            <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>
              Manager :
            </Text>
            <Text style={detailValueStyle}>{managerName}</Text>
          </>
        )}
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Retrouvez votre équipe et votre planning dans votre espace.
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

const teamBoxStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeft: `4px solid ${colors.status.info}`,
}

const teamTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.info.dark,
  margin: `0 0 ${spacing.md} 0`,
}

const detailLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.info.dark,
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

export default TeamMemberAddedEmail
