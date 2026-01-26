/**
 * Template d'email de bienvenue SmartPlanning
 *
 * @ticket SP-297
 * @description Email envoyé automatiquement après l'inscription d'un nouvel utilisateur
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

export interface WelcomeEmailProps {
  /** Prénom de l'utilisateur */
  firstName: string
  /** Adresse email de l'utilisateur */
  email: string
  /** URL de connexion à l'application */
  loginUrl: string
}

/**
 * Email de bienvenue envoyé après inscription
 *
 * Contenu :
 * - Message de bienvenue personnalisé
 * - Présentation des fonctionnalités clés
 * - Bouton CTA vers l'espace personnel
 */
export function WelcomeEmail({
  firstName,
  email,
  loginUrl,
}: WelcomeEmailProps) {
  const previewText = `Bienvenue ${firstName} ! Votre compte SmartPlanning est prêt.`

  return (
    <Layout preview={previewText}>
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>
        Bienvenue sur SmartPlanning, {firstName} !
      </Text>

      {/* Message d'introduction */}
      <Text style={presetStyles.paragraph}>
        Votre compte a été créé avec succès. Vous faites maintenant partie de la
        communauté SmartPlanning et pouvez accéder à tous nos outils de gestion
        intelligente des équipes.
      </Text>

      <Text style={presetStyles.paragraph}>
        Votre adresse email de connexion : <strong>{email}</strong>
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Section fonctionnalités */}
      <Text style={headingStyle}>
        Ce que vous pouvez faire avec SmartPlanning :
      </Text>

      <Section style={featuresContainerStyle}>
        {/* Fonctionnalité 1 */}
        <Row style={featureRowStyle}>
          <Column style={featureIconColumnStyle}>
            <Text style={featureIconStyle}>📅</Text>
          </Column>
          <Column style={featureTextColumnStyle}>
            <Text style={featureTitleStyle}>Planification intelligente</Text>
            <Text style={featureDescStyle}>
              Organisez les plannings de vos équipes en quelques clics avec
              notre interface intuitive.
            </Text>
          </Column>
        </Row>

        {/* Fonctionnalité 2 */}
        <Row style={featureRowStyle}>
          <Column style={featureIconColumnStyle}>
            <Text style={featureIconStyle}>👥</Text>
          </Column>
          <Column style={featureTextColumnStyle}>
            <Text style={featureTitleStyle}>Gestion des équipes</Text>
            <Text style={featureDescStyle}>
              Créez et gérez vos équipes, assignez des rôles et suivez les
              disponibilités en temps réel.
            </Text>
          </Column>
        </Row>

        {/* Fonctionnalité 3 */}
        <Row style={featureRowStyle}>
          <Column style={featureIconColumnStyle}>
            <Text style={featureIconStyle}>📊</Text>
          </Column>
          <Column style={featureTextColumnStyle}>
            <Text style={featureTitleStyle}>Tableaux de bord</Text>
            <Text style={featureDescStyle}>
              Visualisez les statistiques et indicateurs clés pour optimiser la
              gestion de vos ressources.
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Prêt à commencer ? Connectez-vous dès maintenant pour explorer votre
        espace.
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href={loginUrl} variant="primary" size="lg">
          Accéder à mon espace
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Message de support */}
      <Text style={supportTextStyle}>
        Une question ? Notre équipe est là pour vous aider. Répondez simplement
        à cet email ou contactez-nous à{' '}
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

const headingStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.md} 0`,
}

const featuresContainerStyle: React.CSSProperties = {
  marginBottom: spacing.lg,
}

const featureRowStyle: React.CSSProperties = {
  marginBottom: spacing.md,
}

const featureIconColumnStyle: React.CSSProperties = {
  width: '48px',
  verticalAlign: 'top',
}

const featureTextColumnStyle: React.CSSProperties = {
  verticalAlign: 'top',
  paddingLeft: spacing.sm,
}

const featureIconStyle: React.CSSProperties = {
  fontSize: '28px',
  lineHeight: '1',
  margin: 0,
}

const featureTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.xs} 0`,
}

const featureDescStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: 0,
  lineHeight: typography.lineHeight.normal,
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
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

export default WelcomeEmail
