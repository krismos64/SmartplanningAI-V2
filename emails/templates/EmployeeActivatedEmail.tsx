/**
 * Template d'email d'activation de compte employé
 *
 * @description Email envoyé après l'activation du compte par un employé invité
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

export interface EmployeeActivatedEmailProps {
  /** Prénom de l'employé */
  firstName: string
  /** Nom de l'entreprise */
  companyName: string
  /** URL du tableau de bord */
  dashboardUrl: string
}

/**
 * Email de bienvenue après activation du compte employé
 *
 * Contenu :
 * - Message de bienvenue dans l'entreprise
 * - Présentation des fonctionnalités accessibles
 * - Bouton CTA vers l'espace personnel
 */
export function EmployeeActivatedEmail({
  firstName,
  companyName,
  dashboardUrl,
}: EmployeeActivatedEmailProps) {
  const previewText = `${firstName}, bienvenue chez ${companyName} sur SmartPlanning !`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>
        Bienvenue {firstName} !
      </Text>

      {/* Message de bienvenue */}
      <Text style={presetStyles.paragraph}>
        Votre compte a été activé avec succès. Vous faites désormais partie de
        l&apos;équipe <strong>{companyName}</strong> sur SmartPlanning.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Ce que l'employé peut faire */}
      <Text style={headingStyle}>
        Vous pouvez dès maintenant :
      </Text>

      <Section style={featuresBoxStyle}>
        <Text style={featureItemStyle}>📅 Consulter votre planning</Text>
        <Text style={featureItemStyle}>🏖️ Soumettre des demandes de congés</Text>
        <Text style={featureItemStyle}>📋 Gérer vos notes personnelles</Text>
        <Text style={featureItemStyle}>🔔 Recevoir des notifications en temps réel</Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Connectez-vous pour découvrir votre espace.
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

const headingStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.md} 0`,
}

const featuresBoxStyle: React.CSSProperties = {
  backgroundColor: colors.success.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const featureItemStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.success.dark,
  margin: `0 0 ${spacing.sm} 0`,
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

export default EmployeeActivatedEmail
