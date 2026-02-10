/**
 * Template email : Mise à jour du nombre d'employés
 *
 * @ticket SP-369
 * @description Email envoyé après changement de quantité de sièges
 */

import { Text, Hr, Section, Row, Column } from '@react-email/components'
import * as React from 'react'

import {
  Layout,
  colors,
  typography,
  spacing,
  presetStyles,
} from '../components'

export interface QuantityUpdatedEmailProps {
  firstName: string
  companyName: string
  oldQuantity: number
  newQuantity: number
  newMonthlyAmount: string
}

export function QuantityUpdatedEmail({
  firstName,
  companyName,
  oldQuantity,
  newQuantity,
  newMonthlyAmount,
}: QuantityUpdatedEmailProps) {
  const isIncrease = newQuantity > oldQuantity

  return (
    <Layout preview={`Mise à jour de votre abonnement — ${companyName}`}>
      <Text style={presetStyles.heading1}>
        Abonnement mis à jour
      </Text>

      <Text style={presetStyles.paragraph}>
        Bonjour {firstName},
      </Text>

      <Text style={presetStyles.paragraph}>
        Le nombre d&apos;employés de votre abonnement SmartPlanning pour{' '}
        <strong>{companyName}</strong> a été mis à jour.
      </Text>

      <Section style={changeBoxStyle}>
        <Text style={changeTitleStyle}>Détail de la modification</Text>
        <Row style={changeRowStyle}>
          <Column style={changeLabelCol}>
            <Text style={changeLabelStyle}>Avant</Text>
          </Column>
          <Column style={changeValueCol}>
            <Text style={changeOldValueStyle}>
              {oldQuantity} employé{oldQuantity > 1 ? 's' : ''}
            </Text>
          </Column>
        </Row>
        <Row style={changeRowStyle}>
          <Column style={changeLabelCol}>
            <Text style={changeLabelStyle}>Maintenant</Text>
          </Column>
          <Column style={changeValueCol}>
            <Text style={changeNewValueStyle}>
              {isIncrease ? '↑' : '↓'} {newQuantity} employé
              {newQuantity > 1 ? 's' : ''}
            </Text>
          </Column>
        </Row>
        <Hr style={changeDividerStyle} />
        <Row style={changeRowStyle}>
          <Column style={changeLabelCol}>
            <Text style={changeLabelStyle}>Tarif</Text>
          </Column>
          <Column style={changeValueCol}>
            <Text style={changeValueStyle}>2,90 € par employé et par mois</Text>
          </Column>
        </Row>
        <Row style={changeRowStyle}>
          <Column style={changeLabelCol}>
            <Text style={changeTotalLabelStyle}>Nouveau montant</Text>
          </Column>
          <Column style={changeValueCol}>
            <Text style={changeTotalStyle}>{newMonthlyAmount}</Text>
          </Column>
        </Row>
      </Section>

      <Text style={prorataStyle}>
        {isIncrease
          ? 'Un prorata sera calculé pour le reste de la période en cours.'
          : 'Un crédit au prorata sera appliqué sur votre prochaine facture.'}
      </Text>

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

const changeBoxStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const changeTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.info.dark,
  margin: `0 0 ${spacing.md} 0`,
}

const changeRowStyle: React.CSSProperties = {
  marginBottom: spacing.sm,
}

const changeLabelCol: React.CSSProperties = {
  width: '45%',
  verticalAlign: 'top',
}

const changeValueCol: React.CSSProperties = {
  width: '55%',
  verticalAlign: 'top',
}

const changeLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  margin: 0,
}

const changeOldValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.muted,
  textDecoration: 'line-through',
  margin: 0,
}

const changeNewValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.bold,
  color: colors.text.primary,
  margin: 0,
}

const changeValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
}

const changeDividerStyle: React.CSSProperties = {
  borderTop: `1px solid ${colors.border.light}`,
  margin: `${spacing.sm} 0`,
}

const changeTotalLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
}

const changeTotalStyle: React.CSSProperties = {
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.bold,
  color: colors.primary,
  margin: 0,
}

const prorataStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic',
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

export default QuantityUpdatedEmail
