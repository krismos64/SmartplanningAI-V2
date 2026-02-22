/**
 * Template email — Message administrateur SmartPlanning
 *
 * Envoyé par un SYSTEM_ADMIN aux DIRECTOR d'une entreprise
 * depuis la fiche admin /app/admin/companies/[id].
 *
 * @ticket SP-474
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

// ============================================================================
// Types
// ============================================================================

export type AdminContactCategory =
  | 'information'
  | 'facturation'
  | 'technique'
  | 'autre'

export interface AdminContactEmailProps {
  companyName: string
  recipientName: string
  subject: string
  message: string
  category: AdminContactCategory
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_LABELS: Record<AdminContactCategory, string> = {
  information: 'Information',
  facturation: 'Facturation',
  technique: 'Technique',
  autre: 'Autre',
}

const CATEGORY_COLORS: Record<
  AdminContactCategory,
  { bg: string; text: string }
> = {
  information: { bg: colors.info.light, text: colors.info.dark },
  facturation: { bg: colors.warning.light, text: colors.warning.dark },
  technique: { bg: colors.success.light, text: colors.success.dark },
  autre: { bg: colors.background.secondary, text: colors.text.secondary },
}

// ============================================================================
// Component
// ============================================================================

export function AdminContactEmail({
  companyName,
  recipientName,
  subject,
  message,
  category,
}: AdminContactEmailProps) {
  const previewText = `[SmartPlanning] ${subject}`
  const catColors = CATEGORY_COLORS[category]

  return (
    <Layout preview={previewText}>
      {/* Bandeau admin */}
      <Section style={bannerStyle}>
        <Row>
          <Column align="center">
            <Text style={bannerTextStyle}>
              Message de l&apos;administrateur SmartPlanning
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Salutation */}
      <Text style={presetStyles.paragraph}>
        Bonjour {recipientName},
      </Text>

      <Text style={presetStyles.paragraph}>
        Vous recevez ce message en tant que directeur de{' '}
        <strong>{companyName}</strong>.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Badge catégorie */}
      <table role="presentation" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: catColors.bg,
                color: catColors.text,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {CATEGORY_LABELS[category]}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Sujet */}
      <Text style={subjectStyle}>{subject}</Text>

      {/* Corps du message */}
      <Section style={messageBoxStyle}>
        <Text style={messageTextStyle}>{message}</Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Pied de message */}
      <Text style={footerNoteStyle}>
        Ce message vous a été envoyé par l&apos;équipe SmartPlanning. Si vous
        avez des questions, répondez directement à cet email ou contactez-nous à{' '}
        <a href="mailto:contact@smartplanning.fr" style={linkStyle}>
          contact@smartplanning.fr
        </a>
      </Text>

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

// ============================================================================
// Styles
// ============================================================================

const bannerStyle: React.CSSProperties = {
  backgroundColor: colors.primary,
  padding: `${spacing.sm} ${spacing.md}`,
  borderRadius: '6px',
  marginBottom: spacing.lg,
}

const bannerTextStyle: React.CSSProperties = {
  color: colors.text.inverse,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  textAlign: 'center',
  margin: 0,
}

const subjectStyle: React.CSSProperties = {
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.bold,
  color: colors.text.primary,
  margin: `${spacing.md} 0 ${spacing.sm} 0`,
  lineHeight: typography.lineHeight.tight,
}

const messageBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  padding: spacing.lg,
  borderRadius: '6px',
  borderLeft: `3px solid ${colors.primary}`,
  marginBottom: spacing.lg,
}

const messageTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.text.primary,
  lineHeight: typography.lineHeight.relaxed,
  margin: 0,
  whiteSpace: 'pre-wrap',
}

const footerNoteStyle: React.CSSProperties = {
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

export default AdminContactEmail
