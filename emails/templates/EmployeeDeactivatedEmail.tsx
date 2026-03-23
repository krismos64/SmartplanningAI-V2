/**
 * Template d'email de désactivation de compte employé
 *
 * @description Email envoyé lorsqu'un compte employé est désactivé
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

export interface EmployeeDeactivatedEmailProps {
  /** Prénom de l'employé */
  firstName: string
  /** Nom de l'entreprise */
  companyName: string
}

/**
 * Email de notification de désactivation de compte employé
 *
 * Contenu :
 * - Information de la désactivation
 * - Ton professionnel sans reproche
 * - Invitation à contacter le manager
 */
export function EmployeeDeactivatedEmail({
  firstName,
  companyName,
}: EmployeeDeactivatedEmailProps) {
  const previewText = `${firstName}, votre accès SmartPlanning chez ${companyName} a été désactivé.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      {/* Message d'information */}
      <Text style={presetStyles.paragraph}>
        Nous vous informons que votre compte SmartPlanning au sein de{' '}
        <strong>{companyName}</strong> a été désactivé.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Détails */}
      <Section style={infoBoxStyle}>
        <Text style={infoTitleStyle}>Ce que cela signifie</Text>
        <Text style={infoTextStyle}>
          Vous n&apos;avez plus accès à votre espace SmartPlanning, y compris
          vos plannings, demandes de congés et notifications.
        </Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Contact */}
      <Text style={contactTextStyle}>
        Si vous avez des questions concernant cette désactivation, nous vous
        invitons à contacter votre manager ou le responsable RH de votre
        entreprise.
      </Text>

      <Text style={contactTextStyle}>
        Vous pouvez également nous écrire à{' '}
        <a href="mailto:contact@smartplanning.fr" style={linkStyle}>
          contact@smartplanning.fr
        </a>
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

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const infoTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.sm} 0`,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.text.secondary,
  margin: 0,
  lineHeight: typography.lineHeight.relaxed,
}

const contactTextStyle: React.CSSProperties = {
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

export default EmployeeDeactivatedEmail
