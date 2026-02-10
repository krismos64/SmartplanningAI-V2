/**
 * Template email : Échec de paiement
 *
 * @ticket SP-369
 * @description Email envoyé après échec de paiement (webhook invoice.payment_failed)
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

export interface PaymentFailedEmailProps {
  firstName: string
  companyName: string
  amount: string
  retryDate?: string
  updatePaymentUrl: string
}

export function PaymentFailedEmail({
  firstName,
  companyName,
  amount,
  retryDate,
  updatePaymentUrl,
}: PaymentFailedEmailProps) {
  return (
    <Layout preview={`Échec de paiement pour ${companyName} — Action requise`}>
      <Text style={presetStyles.heading1}>
        Échec de paiement
      </Text>

      <Text style={presetStyles.paragraph}>
        Bonjour {firstName},
      </Text>

      <Text style={presetStyles.paragraph}>
        Nous n&apos;avons pas pu traiter le paiement de <strong>{amount}</strong>{' '}
        pour l&apos;abonnement SmartPlanning de <strong>{companyName}</strong>.
        Cela peut arriver si votre carte a expiré ou si les fonds sont insuffisants.
      </Text>

      <Section style={warningBoxStyle}>
        <Text style={warningTitleStyle}>Action requise</Text>
        <Text style={warningTextStyle}>
          Veuillez mettre à jour votre moyen de paiement pour éviter toute
          interruption de service. Vous disposez d&apos;un délai de grâce de{' '}
          <strong>7 jours</strong> avant la suspension de votre accès.
        </Text>
        {retryDate && (
          <Text style={warningTextStyle}>
            Une nouvelle tentative de prélèvement sera effectuée le{' '}
            <strong>{retryDate}</strong>.
          </Text>
        )}
      </Section>

      <Section style={ctaStyle}>
        <Button href={updatePaymentUrl} variant="danger" size="lg">
          Mettre à jour mon moyen de paiement
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      <Text style={supportStyle}>
        Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez-nous à{' '}
        <a href="mailto:contact@smartplanning.fr" style={{ color: colors.primary }}>
          contact@smartplanning.fr
        </a>
      </Text>

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

const warningBoxStyle: React.CSSProperties = {
  backgroundColor: colors.warning.light,
  borderLeft: `4px solid ${colors.status.warning}`,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const warningTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.warning.dark,
  margin: `0 0 ${spacing.sm} 0`,
}

const warningTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.warning.dark,
  margin: `0 0 ${spacing.sm} 0`,
  lineHeight: typography.lineHeight.normal,
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

export default PaymentFailedEmail
