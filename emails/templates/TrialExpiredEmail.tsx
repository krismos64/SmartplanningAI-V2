/**
 * Template email : Essai gratuit expiré
 *
 * @ticket SP-369
 * @description Email envoyé quand la période d'essai est terminée
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

export interface TrialExpiredEmailProps {
  firstName: string
  companyName: string
  employeeCount: number
  estimatedMonthlyPrice: string
  subscribeUrl: string
}

export function TrialExpiredEmail({
  firstName,
  companyName,
  employeeCount,
  estimatedMonthlyPrice,
  subscribeUrl,
}: TrialExpiredEmailProps) {
  return (
    <Layout preview={`Votre essai gratuit SmartPlanning est terminé — ${companyName}`} showUnsubscribe>
      <Text style={presetStyles.heading1}>
        Votre essai gratuit est terminé
      </Text>

      <Text style={presetStyles.paragraph}>
        Bonjour {firstName},
      </Text>

      <Text style={presetStyles.paragraph}>
        La période d&apos;essai gratuit de <strong>{companyName}</strong> sur
        SmartPlanning est arrivée à son terme. Votre accès aux fonctionnalités
        de planification et de gestion d&apos;équipe est désormais limité.
      </Text>

      <Section style={reassureBoxStyle}>
        <Text style={reassureTitleStyle}>Vos données sont conservées</Text>
        <Text style={reassureTextStyle}>
          Toutes vos données (plannings, équipes, congés) sont préservées.
          Activez votre abonnement à tout moment pour retrouver un accès complet.
        </Text>
      </Section>

      <Section style={priceBoxStyle}>
        <Text style={priceTitleStyle}>Reprenez là où vous en étiez</Text>
        <Row style={priceRowStyle}>
          <Column style={priceLabelCol}>
            <Text style={priceLabelStyle}>Employés</Text>
          </Column>
          <Column style={priceValueCol}>
            <Text style={priceValueStyle}>{employeeCount}</Text>
          </Column>
        </Row>
        <Row style={priceRowStyle}>
          <Column style={priceLabelCol}>
            <Text style={priceLabelStyle}>Tarif</Text>
          </Column>
          <Column style={priceValueCol}>
            <Text style={priceValueStyle}>2,90 € par employé et par mois</Text>
          </Column>
        </Row>
        <Row style={priceRowStyle}>
          <Column style={priceLabelCol}>
            <Text style={priceLabelStyle}>Montant estimé</Text>
          </Column>
          <Column style={priceValueCol}>
            <Text style={priceHighlightStyle}>{estimatedMonthlyPrice}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={ctaStyle}>
        <Button href={subscribeUrl} variant="primary" size="lg">
          Activer mon abonnement
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

const reassureBoxStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const reassureTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.info.dark,
  margin: `0 0 ${spacing.sm} 0`,
}

const reassureTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.info.dark,
  margin: 0,
  lineHeight: typography.lineHeight.normal,
}

const priceBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const priceTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.md} 0`,
}

const priceRowStyle: React.CSSProperties = {
  marginBottom: spacing.sm,
}

const priceLabelCol: React.CSSProperties = {
  width: '50%',
  verticalAlign: 'top',
}

const priceValueCol: React.CSSProperties = {
  width: '50%',
  verticalAlign: 'top',
}

const priceLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: 0,
}

const priceValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
}

const priceHighlightStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.bold,
  color: colors.primary,
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

export default TrialExpiredEmail
