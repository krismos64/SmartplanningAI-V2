/**
 * Template email — Notification admin : suppression de compte
 *
 * Envoyé à contact@smartplanning.fr quand un utilisateur supprime
 * son compte, pour que l'admin soit informé en temps réel.
 *
 * @ticket SP-299
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

export interface AccountDeletionAdminEmailProps {
  userName: string
  userEmail: string
  companyName: string | null
  userRole: string
  deletedAt: string
  adminUrl: string
}

export function AccountDeletionAdminEmail({
  userName,
  userEmail,
  companyName,
  userRole,
  deletedAt,
  adminUrl,
}: AccountDeletionAdminEmailProps) {
  const previewText = `Suppression de compte : ${userName} (${companyName || 'Sans entreprise'})`

  return (
    <Layout preview={previewText}>
      <Text style={presetStyles.heading1}>Suppression de compte</Text>

      <Text style={presetStyles.paragraph}>
        Un utilisateur vient de supprimer son compte SmartPlanning.
      </Text>

      <Hr style={presetStyles.divider} />

      <Section style={infoBoxStyle}>
        <Text style={infoTitleStyle}>Compte supprimé</Text>

        <Row style={infoRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Nom</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{userName}</Text>
          </Column>
        </Row>

        <Row style={infoRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Email</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{userEmail}</Text>
          </Column>
        </Row>

        {companyName && (
          <Row style={infoRowStyle}>
            <Column style={labelColumnStyle}>
              <Text style={labelStyle}>Entreprise</Text>
            </Column>
            <Column>
              <Text style={valueStyle}>{companyName}</Text>
            </Column>
          </Row>
        )}

        <Row style={infoRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Rôle</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{userRole}</Text>
          </Column>
        </Row>

        <Row style={infoRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Date</Text>
          </Column>
          <Column>
            <Text style={valueStyle}>{deletedAt}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={presetStyles.divider} />

      <Section style={ctaContainerStyle}>
        <Button href={adminUrl} variant="primary" size="lg">
          Voir les logs d&apos;audit
        </Button>
      </Section>

      <Text style={footerStyle}>
        Cet email est envoyé automatiquement à chaque suppression de compte.
      </Text>
    </Layout>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: spacing.lg,
  marginBottom: spacing.lg,
}

const infoTitleStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: '#991b1b',
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

export default AccountDeletionAdminEmail
