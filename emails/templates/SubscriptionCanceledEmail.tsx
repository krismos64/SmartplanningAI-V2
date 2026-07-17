/**
 * Template email : Confirmation de résiliation
 *
 * @ticket SP-369
 * @description Email envoyé après annulation d'abonnement (webhook customer.subscription.deleted)
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

export interface SubscriptionCanceledEmailProps {
  firstName: string
  companyName: string
  endDate: string
}

export function SubscriptionCanceledEmail({
  firstName,
  companyName,
  endDate,
}: SubscriptionCanceledEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

  return (
    <Layout preview={`Confirmation de résiliation : ${companyName}`}>
      <Text style={presetStyles.heading1}>
        Résiliation confirmée
      </Text>

      <Text style={presetStyles.paragraph}>
        Bonjour {firstName},
      </Text>

      <Text style={presetStyles.paragraph}>
        Nous confirmons la résiliation de l&apos;abonnement SmartPlanning pour{' '}
        <strong>{companyName}</strong>.
      </Text>

      <Section style={infoBoxStyle}>
        <Text style={infoTitleStyle}>Ce qui se passe maintenant</Text>
        <Text style={infoTextStyle}>
          Votre accès à SmartPlanning reste actif jusqu&apos;au{' '}
          <strong>{endDate}</strong>. Après cette date, vous pourrez toujours
          consulter vos données mais les fonctionnalités de gestion seront limitées.
        </Text>
      </Section>

      <Text style={presetStyles.paragraph}>
        Vos données seront conservées et vous pourrez vous réabonner à tout
        moment pour retrouver un accès complet.
      </Text>

      <Hr style={presetStyles.divider} />

      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Vous avez changé d&apos;avis ?
      </Text>

      <Section style={ctaStyle}>
        <Button
          href={`${baseUrl}/app/dashboard/billing`}
          variant="outline"
          size="md"
        >
          Se réabonner
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      <Text style={supportStyle}>
        Nous aimerions comprendre les raisons de votre départ. N&apos;hésitez pas
        à nous écrire à{' '}
        <a href="mailto:contact@smartplanning.fr" style={{ color: colors.primary }}>
          contact@smartplanning.fr
        </a>
      </Text>

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const infoTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.sm} 0`,
}

const infoTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: 0,
  lineHeight: typography.lineHeight.normal,
}

const ctaStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.md} 0 ${spacing.lg} 0`,
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

export default SubscriptionCanceledEmail
