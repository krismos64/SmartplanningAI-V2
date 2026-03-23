/**
 * Template email — Notification admin : nouvelle inscription
 *
 * Envoyé à contact@smartplanning.fr quand une nouvelle entreprise
 * s'inscrit sur la plateforme, pour que l'admin soit informé en temps réel.
 *
 * @ticket SP-480
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

export interface NewRegistrationEmailProps {
  companyName: string
  directorName: string
  directorEmail: string
  phone: string | null
  registeredAt: string
  adminUrl: string
}

export function NewRegistrationEmail({
  companyName,
  directorName,
  directorEmail,
  phone,
  registeredAt,
  adminUrl,
}: NewRegistrationEmailProps) {
  const previewText = `Nouvelle inscription : ${companyName}`

  return (
    <Layout preview={previewText}>
      <Text style={presetStyles.heading1}>Nouvelle inscription</Text>

      <Text style={presetStyles.paragraph}>
        Une nouvelle entreprise vient de s&apos;inscrire sur SmartPlanning.
      </Text>

      <Hr style={presetStyles.divider} />

      <Section style={infoBoxStyle}>
        <Text style={infoTitleStyle}>Entreprise</Text>

        <Row style={infoRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Nom</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{companyName}</Text>
          </Column>
        </Row>

        <Row style={infoRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Dirigeant</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{directorName}</Text>
          </Column>
        </Row>

        <Row style={infoRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Email</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{directorEmail}</Text>
          </Column>
        </Row>

        {phone && (
          <Row style={infoRowStyle}>
            <Column style={labelColumnStyle}>
              <Text style={labelStyle}>Telephone</Text>
            </Column>
            <Column>
              <Text style={valueStyle}>{phone}</Text>
            </Column>
          </Row>
        )}

        <Row style={infoRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Date</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{registeredAt}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={presetStyles.divider} />

      <Section style={ctaContainerStyle}>
        <Button href={adminUrl} variant="primary" size="lg">
          Voir dans l&apos;administration
        </Button>
      </Section>

      <Text style={footerStyle}>
        Cet email est envoyé automatiquement à chaque nouvelle inscription.
      </Text>
    </Layout>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const infoTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: '#0c4a6e',
  margin: `0 0 ${spacing.md} 0`,
}

const infoRowStyle: React.CSSProperties = {
  marginBottom: spacing.sm,
}

const labelColumnStyle: React.CSSProperties = {
  width: '120px',
  verticalAlign: 'top',
}

const labelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.secondary,
  margin: 0,
}

const valueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.primary,
  margin: 0,
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const footerStyle: React.CSSProperties = {
  fontSize: typography.fontSize.xs,
  color: colors.text.secondary,
  textAlign: 'center',
  margin: `${spacing.md} 0 0 0`,
}

export default NewRegistrationEmail
