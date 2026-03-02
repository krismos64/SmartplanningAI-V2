/**
 * Template d'email d'invitation employe/manager/directeur SmartPlanning
 *
 * @description Email envoye lors de la creation d'un employe avec email
 * pour lui permettre d'activer son compte et choisir son mot de passe.
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

export interface InvitationEmailProps {
  /** Prenom de l'invite */
  firstName: string
  /** Adresse email de l'invite */
  email: string
  /** URL d'activation avec token */
  activationUrl: string
  /** Nom de l'entreprise */
  companyName: string
  /** Role attribue (Employe, Manager, Directeur) */
  roleName: string
  /** Duree de validite du lien (ex: "48 heures") */
  expiresIn: string
}

/**
 * Email d'invitation a rejoindre SmartPlanning
 */
export function InvitationEmail({
  firstName,
  email,
  activationUrl,
  companyName,
  roleName,
  expiresIn,
}: InvitationEmailProps) {
  const previewText = `${firstName}, activez votre compte SmartPlanning`

  const benefits: Record<string, string[]> = {
    Employé: [
      'Consultez vos plannings en temps réel',
      'Gérez vos demandes de congés',
      'Recevez les notifications importantes',
    ],
    Manager: [
      'Gérez les plannings de votre équipe',
      'Approuvez les demandes de congés',
      'Suivez les indicateurs de votre équipe',
    ],
    Directeur: [
      'Administrez toute votre entreprise',
      'Gérez les équipes et les employés',
      'Accédez aux statistiques et rapports complets',
    ],
  }

  const roleBenefits = benefits[roleName] || benefits['Employé']

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Bienvenue dans l&apos;équipe !</Text>

      {/* Message d'introduction */}
      <Text style={presetStyles.paragraph}>Bonjour {firstName},</Text>

      <Text style={presetStyles.paragraph}>
        Vous avez été ajouté en tant que <strong>{roleName}</strong> sur
        SmartPlanning par <strong>{companyName}</strong>.
      </Text>

      <Text style={presetStyles.paragraph}>
        Pour accéder à votre espace, activez votre compte en choisissant un mot
        de passe. Votre adresse email de connexion sera <strong>{email}</strong>
        .
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Duree de validite */}
      <Section style={infoContainerStyle}>
        <Text style={infoIconStyle}>🔑</Text>
        <Text style={infoTextStyle}>
          Ce lien d&apos;activation est valable pendant{' '}
          <strong>{expiresIn}</strong>. Passé ce délai, vous pourrez demander un
          nouveau lien.
        </Text>
      </Section>

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Cliquez sur le bouton ci-dessous pour activer votre compte :
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href={activationUrl} variant="primary" size="lg">
          Activer mon compte
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Avantages selon le role */}
      <Section style={benefitsContainerStyle}>
        <Text style={benefitsTitleStyle}>
          En tant que {roleName}, vous pourrez :
        </Text>
        {roleBenefits!.map((benefit, index) => (
          <Text key={index} style={benefitsTextStyle}>
            • {benefit}
          </Text>
        ))}
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Note de securite */}
      <Section style={securityNoteContainerStyle}>
        <Text style={securityNoteTitleStyle}>Note de sécurité</Text>
        <Text style={securityNoteTextStyle}>
          Si vous n&apos;attendiez pas cette invitation, vous pouvez ignorer cet
          email en toute sécurité.
        </Text>
        <Text style={securityNoteTextStyle}>
          Ne partagez jamais ce lien avec quelqu&apos;un d&apos;autre.
        </Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Message de support */}
      <Text style={supportTextStyle}>
        Une question ? Contactez-nous à{' '}
        <a href="mailto:contact@smartplanning.fr" style={linkStyle}>
          contact@smartplanning.fr
        </a>
      </Text>

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const infoContainerStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
  textAlign: 'center',
}

const infoIconStyle: React.CSSProperties = {
  fontSize: '24px',
  lineHeight: '1',
  margin: `0 0 ${spacing.xs} 0`,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.info.dark,
  margin: 0,
  lineHeight: typography.lineHeight.normal,
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const benefitsContainerStyle: React.CSSProperties = {
  backgroundColor: colors.success.light,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
}

const benefitsTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.success.dark,
  margin: `0 0 ${spacing.sm} 0`,
}

const benefitsTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.success.dark,
  margin: `0 0 ${spacing.xs} 0`,
  lineHeight: typography.lineHeight.normal,
}

const securityNoteContainerStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.lg,
}

const securityNoteTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.sm} 0`,
}

const securityNoteTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: `0 0 ${spacing.xs} 0`,
  lineHeight: typography.lineHeight.normal,
}

const supportTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
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

export default InvitationEmail
