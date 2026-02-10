/**
 * Template email : Paiement confirmé
 *
 * @ticket SP-369
 * @description Email envoyé après paiement réussi (webhook invoice.paid)
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

export interface PaymentConfirmedEmailProps {
  firstName: string
  companyName: string
  amount: string
  employeeCount: number
  invoiceUrl?: string
  nextBillingDate?: string
}

export function PaymentConfirmedEmail({
  firstName,
  companyName,
  amount,
  employeeCount,
  invoiceUrl,
  nextBillingDate,
}: PaymentConfirmedEmailProps) {
  return (
    <Layout preview={`Paiement confirmé pour ${companyName} — ${amount}`}>
      <Text style={presetStyles.heading1}>
        Paiement confirmé
      </Text>

      <Text style={presetStyles.paragraph}>
        Bonjour {firstName},
      </Text>

      <Text style={presetStyles.paragraph}>
        Nous confirmons la réception de votre paiement pour l&apos;abonnement
        SmartPlanning de <strong>{companyName}</strong>.
      </Text>

      <Section style={receiptBoxStyle}>
        <Text style={receiptTitleStyle}>Détail du paiement</Text>
        <Row style={receiptRowStyle}>
          <Column style={receiptLabelCol}>
            <Text style={receiptLabelStyle}>Employés</Text>
          </Column>
          <Column style={receiptValueCol}>
            <Text style={receiptValueStyle}>{employeeCount}</Text>
          </Column>
        </Row>
        <Row style={receiptRowStyle}>
          <Column style={receiptLabelCol}>
            <Text style={receiptLabelStyle}>Tarif unitaire</Text>
          </Column>
          <Column style={receiptValueCol}>
            <Text style={receiptValueStyle}>2,90 € par employé et par mois</Text>
          </Column>
        </Row>
        <Hr style={receiptDividerStyle} />
        <Row style={receiptRowStyle}>
          <Column style={receiptLabelCol}>
            <Text style={receiptTotalLabelStyle}>Montant payé</Text>
          </Column>
          <Column style={receiptValueCol}>
            <Text style={receiptTotalStyle}>{amount}</Text>
          </Column>
        </Row>
      </Section>

      {nextBillingDate && (
        <Text style={nextBillingStyle}>
          Prochaine échéance : <strong>{nextBillingDate}</strong>
        </Text>
      )}

      {invoiceUrl && (
        <Section style={ctaStyle}>
          <Button href={invoiceUrl} variant="primary" size="md">
            Voir la facture
          </Button>
        </Section>
      )}

      <Hr style={presetStyles.divider} />

      <Text style={supportStyle}>
        Une question sur votre facture ? Contactez-nous à{' '}
        <a href="mailto:contact@smartplanning.fr" style={{ color: colors.primary }}>
          contact@smartplanning.fr
        </a>
      </Text>

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

const receiptBoxStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const receiptTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.info.dark,
  margin: `0 0 ${spacing.md} 0`,
}

const receiptRowStyle: React.CSSProperties = {
  marginBottom: spacing.sm,
}

const receiptLabelCol: React.CSSProperties = {
  width: '45%',
  verticalAlign: 'top',
}

const receiptValueCol: React.CSSProperties = {
  width: '55%',
  verticalAlign: 'top',
}

const receiptLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: 0,
}

const receiptValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
}

const receiptDividerStyle: React.CSSProperties = {
  borderTop: `1px solid ${colors.border.light}`,
  margin: `${spacing.sm} 0`,
}

const receiptTotalLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
}

const receiptTotalStyle: React.CSSProperties = {
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.bold,
  color: colors.success.dark,
  margin: 0,
}

const nextBillingStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  margin: `0 0 ${spacing.md} 0`,
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

export default PaymentConfirmedEmail
