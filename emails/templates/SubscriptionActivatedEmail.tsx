/**
 * Template email : Abonnement activé
 *
 * @ticket SP-369
 * @description Email envoyé après activation de l'abonnement (webhook checkout.session.completed)
 */

import { Text, Hr, Section, Row, Column, Link } from '@react-email/components'
import * as React from 'react'

import {
  Layout,
  Button,
  colors,
  typography,
  spacing,
  presetStyles,
} from '../components'

export interface SubscriptionActivatedEmailProps {
  firstName: string
  companyName: string
  employeeCount: number
  monthlyAmount: string
  invoiceUrl?: string
  dashboardUrl: string
}

export function SubscriptionActivatedEmail({
  firstName,
  companyName,
  employeeCount,
  monthlyAmount,
  invoiceUrl,
  dashboardUrl,
}: SubscriptionActivatedEmailProps) {
  return (
    <Layout preview={`Votre abonnement SmartPlanning pour ${companyName} est activé !`}>
      <Text style={presetStyles.heading1}>
        Votre abonnement est activé !
      </Text>

      <Text style={presetStyles.paragraph}>
        Bonjour {firstName},
      </Text>

      <Text style={presetStyles.paragraph}>
        Excellente nouvelle ! L&apos;abonnement SmartPlanning de{' '}
        <strong>{companyName}</strong> est désormais actif. Vous avez un accès
        complet à toutes les fonctionnalités de la plateforme.
      </Text>

      <Section style={recapBoxStyle}>
        <Text style={recapTitleStyle}>Récapitulatif de votre abonnement</Text>
        <Row style={recapRowStyle}>
          <Column style={recapLabelStyle}>
            <Text style={recapLabelTextStyle}>Employés</Text>
          </Column>
          <Column style={recapValueStyle}>
            <Text style={recapValueTextStyle}>{employeeCount}</Text>
          </Column>
        </Row>
        <Row style={recapRowStyle}>
          <Column style={recapLabelStyle}>
            <Text style={recapLabelTextStyle}>Tarif</Text>
          </Column>
          <Column style={recapValueStyle}>
            <Text style={recapValueTextStyle}>2,90 € par employé et par mois</Text>
          </Column>
        </Row>
        <Row style={recapRowStyle}>
          <Column style={recapLabelStyle}>
            <Text style={recapLabelTextStyle}>Montant mensuel</Text>
          </Column>
          <Column style={recapValueStyle}>
            <Text style={recapValueHighlightStyle}>{monthlyAmount}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={presetStyles.divider} />

      <Section style={ctaStyle}>
        <Button href={dashboardUrl} variant="primary" size="lg">
          Accéder au dashboard
        </Button>
      </Section>

      {invoiceUrl && (
        <Text style={invoiceLinkStyle}>
          <Link href={invoiceUrl} style={{ color: colors.primary }}>
            Voir ma facture
          </Link>
        </Text>
      )}

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

const recapBoxStyle: React.CSSProperties = {
  backgroundColor: colors.success.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const recapTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.success.dark,
  margin: `0 0 ${spacing.md} 0`,
}

const recapRowStyle: React.CSSProperties = {
  marginBottom: spacing.sm,
}

const recapLabelStyle: React.CSSProperties = {
  width: '45%',
  verticalAlign: 'top',
}

const recapLabelTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: 0,
}

const recapValueStyle: React.CSSProperties = {
  width: '55%',
  verticalAlign: 'top',
}

const recapValueTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
}

const recapValueHighlightStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.bold,
  color: colors.success.dark,
  margin: 0,
}

const ctaStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const invoiceLinkStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  textAlign: 'center',
  margin: `0 0 ${spacing.md} 0`,
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

export default SubscriptionActivatedEmail
