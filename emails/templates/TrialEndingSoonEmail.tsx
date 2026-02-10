/**
 * Template email : Fin de période d'essai imminente
 *
 * @ticket SP-369
 * @description Email avec urgence progressive selon daysRemaining (J-14, J-7, J-3, J-1)
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

export interface TrialEndingSoonEmailProps {
  firstName: string
  companyName: string
  daysRemaining: number
  employeeCount: number
  estimatedMonthlyPrice: string
  subscribeUrl: string
}

/**
 * Retourne l'objet email selon le nombre de jours restants
 */
export function getTrialSubject(daysRemaining: number): string {
  if (daysRemaining <= 1) return 'Dernier jour d\u2019essai gratuit !'
  if (daysRemaining <= 3) return `Plus que ${daysRemaining} jours d\u2019essai gratuit`
  if (daysRemaining <= 7) return `Plus que ${daysRemaining} jours d\u2019essai gratuit`
  return `Plus que ${daysRemaining} jours d\u2019essai gratuit`
}

export function TrialEndingSoonEmail({
  firstName,
  companyName,
  daysRemaining,
  employeeCount,
  estimatedMonthlyPrice,
  subscribeUrl,
}: TrialEndingSoonEmailProps) {
  const isUrgent = daysRemaining <= 3
  const isLastDay = daysRemaining <= 1

  return (
    <Layout preview={getTrialSubject(daysRemaining)}>
      <Text style={presetStyles.heading1}>
        {isLastDay
          ? 'Dernier jour d\u2019essai !'
          : `Plus que ${daysRemaining} jours d\u2019essai`}
      </Text>

      <Text style={presetStyles.paragraph}>
        Bonjour {firstName},
      </Text>

      <Text style={presetStyles.paragraph}>
        {isLastDay
          ? `Votre essai gratuit SmartPlanning pour ${companyName} se termine aujourd\u2019hui. Abonnez-vous maintenant pour ne perdre aucune donnée.`
          : isUrgent
            ? `L\u2019essai gratuit de ${companyName} se termine dans ${daysRemaining} jours. Il est temps de passer à l\u2019action pour conserver votre accès.`
            : `L\u2019essai gratuit de ${companyName} se termine dans ${daysRemaining} jours. Profitez de ce temps pour découvrir toutes les fonctionnalités.`}
      </Text>

      <Section style={isUrgent ? urgentBoxStyle : infoBoxStyle}>
        <Text style={isUrgent ? urgentTitleStyle : infoTitleStyle}>
          {isLastDay ? 'Abonnez-vous maintenant' : 'Votre estimation'}
        </Text>
        <Row style={estimateRowStyle}>
          <Column style={estimateLabelCol}>
            <Text style={estimateLabelStyle}>Employés actuels</Text>
          </Column>
          <Column style={estimateValueCol}>
            <Text style={estimateValueStyle}>{employeeCount}</Text>
          </Column>
        </Row>
        <Row style={estimateRowStyle}>
          <Column style={estimateLabelCol}>
            <Text style={estimateLabelStyle}>Tarif</Text>
          </Column>
          <Column style={estimateValueCol}>
            <Text style={estimateValueStyle}>2,90 € par employé et par mois</Text>
          </Column>
        </Row>
        <Row style={estimateRowStyle}>
          <Column style={estimateLabelCol}>
            <Text style={estimateLabelStyle}>Montant estimé</Text>
          </Column>
          <Column style={estimateValueCol}>
            <Text style={estimateHighlightStyle}>{estimatedMonthlyPrice}</Text>
          </Column>
        </Row>
      </Section>

      {!isUrgent && (
        <>
          <Text style={featuresHeadingStyle}>
            Ce que vous utilisez déjà :
          </Text>
          <Section style={featuresStyle}>
            <Row style={featureRowStyle}>
              <Column style={featureIconCol}>
                <Text style={featureIconStyle}>📅</Text>
              </Column>
              <Column>
                <Text style={featureTextStyle}>Plannings drag &amp; drop</Text>
              </Column>
            </Row>
            <Row style={featureRowStyle}>
              <Column style={featureIconCol}>
                <Text style={featureIconStyle}>🏖️</Text>
              </Column>
              <Column>
                <Text style={featureTextStyle}>Gestion des congés</Text>
              </Column>
            </Row>
            <Row style={featureRowStyle}>
              <Column style={featureIconCol}>
                <Text style={featureIconStyle}>📊</Text>
              </Column>
              <Column>
                <Text style={featureTextStyle}>Tableaux de bord par rôle</Text>
              </Column>
            </Row>
          </Section>
        </>
      )}

      <Section style={ctaStyle}>
        <Button
          href={subscribeUrl}
          variant={isUrgent ? 'danger' : 'primary'}
          size="lg"
        >
          {isLastDay
            ? 'Activer mon abonnement maintenant'
            : 'S\u2019abonner maintenant'}
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      <Text style={supportStyle}>
        Une question ? Contactez-nous à{' '}
        <a href="mailto:contact@smartplanning.fr" style={{ color: colors.primary }}>
          contact@smartplanning.fr
        </a>
      </Text>

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const urgentBoxStyle: React.CSSProperties = {
  backgroundColor: colors.warning.light,
  borderLeft: `4px solid ${colors.status.warning}`,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const infoTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.info.dark,
  margin: `0 0 ${spacing.md} 0`,
}

const urgentTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.warning.dark,
  margin: `0 0 ${spacing.md} 0`,
}

const estimateRowStyle: React.CSSProperties = {
  marginBottom: spacing.sm,
}

const estimateLabelCol: React.CSSProperties = {
  width: '50%',
  verticalAlign: 'top',
}

const estimateValueCol: React.CSSProperties = {
  width: '50%',
  verticalAlign: 'top',
}

const estimateLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: 0,
}

const estimateValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
}

const estimateHighlightStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.bold,
  color: colors.primary,
  margin: 0,
}

const featuresHeadingStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.sm} 0`,
}

const featuresStyle: React.CSSProperties = {
  marginBottom: spacing.lg,
}

const featureRowStyle: React.CSSProperties = {
  marginBottom: spacing.xs,
}

const featureIconCol: React.CSSProperties = {
  width: '32px',
  verticalAlign: 'middle',
}

const featureIconStyle: React.CSSProperties = {
  fontSize: '18px',
  margin: 0,
}

const featureTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: 0,
}

const ctaStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const supportStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  margin: `0 0 ${spacing.md} 0`,
}

const signatureStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic',
  margin: 0,
}

export default TrialEndingSoonEmail
