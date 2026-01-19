/**
 * Template d'email de notification de contact pour l'admin
 *
 * @ticket SP-288
 * @description Email envoyé au Super Admin pour notifier un nouveau message de contact
 */

import { Text, Hr, Section, Link } from '@react-email/components'
import * as React from 'react'

import {
  Layout,
  Button,
  colors,
  typography,
  spacing,
  presetStyles,
} from '../components'

export interface ContactNotificationEmailProps {
  /** Nom de l'expéditeur */
  name: string
  /** Email de l'expéditeur */
  email: string
  /** Sujet du message */
  subject: string
  /** Contenu du message */
  message: string
  /** Date de soumission */
  submittedAt: Date
}

/**
 * Email de notification envoyé à l'admin lors d'un nouveau contact
 *
 * Contenu :
 * - Alerte nouveau message
 * - Informations de l'expéditeur
 * - Contenu complet du message
 * - Bouton pour répondre directement
 */
export function ContactNotificationEmail({
  name,
  email,
  subject,
  message,
  submittedAt,
}: ContactNotificationEmailProps) {
  const previewText = `Nouveau message de ${name} : ${subject}`

  // Formater la date en français
  const formattedDate = submittedAt.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Layout preview={previewText}>
      {/* Badge alerte */}
      <Section style={alertBadgeStyle}>
        <Text style={alertTextStyle}>📬 Nouveau message de contact</Text>
      </Section>

      {/* Titre principal */}
      <Text style={presetStyles.heading1}>Message de {name}</Text>

      {/* Informations expéditeur */}
      <Section style={infoBoxStyle}>
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td style={infoLabelCellStyle}>Expéditeur</td>
              <td style={infoValueCellStyle}>{name}</td>
            </tr>
            <tr>
              <td style={infoLabelCellStyle}>Email</td>
              <td style={infoValueCellStyle}>
                <Link href={`mailto:${email}`} style={emailLinkStyle}>
                  {email}
                </Link>
              </td>
            </tr>
            <tr>
              <td style={infoLabelCellStyle}>Date</td>
              <td style={infoValueCellStyle}>{formattedDate}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Sujet du message */}
      <Text style={subjectLabelStyle}>Sujet :</Text>
      <Text style={subjectValueStyle}>{subject}</Text>

      <Hr style={{ ...presetStyles.divider, margin: `${spacing.md} 0` }} />

      {/* Contenu du message */}
      <Text style={messageLabelStyle}>Message :</Text>
      <Section style={messageBoxStyle}>
        <Text style={messageContentStyle}>{message}</Text>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Actions */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Répondre directement à ce message :
      </Text>

      <Section style={ctaContainerStyle}>
        <Button
          href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}
          variant="primary"
          size="lg"
        >
          Répondre à {name}
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Note de rappel */}
      <Text style={reminderStyle}>
        💡 Rappel : L&apos;engagement de réponse est de 24 à 48 heures ouvrées.
      </Text>

      <Text style={signatureStyle}>
        Notification automatique - SmartPlanning
      </Text>
    </Layout>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const alertBadgeStyle: React.CSSProperties = {
  backgroundColor: colors.info.light,
  borderRadius: '8px',
  padding: `${spacing.sm} ${spacing.md}`,
  marginBottom: spacing.lg,
  textAlign: 'center',
}

const alertTextStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.info.dark,
  margin: 0,
}

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderRadius: '8px',
  padding: spacing.md,
  marginBottom: spacing.md,
}

const infoLabelCellStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.muted,
  padding: `${spacing.xs} 0`,
  width: '100px',
  verticalAlign: 'top',
}

const infoValueCellStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  padding: `${spacing.xs} 0`,
  verticalAlign: 'top',
}

const emailLinkStyle: React.CSSProperties = {
  color: colors.primary,
  textDecoration: 'underline',
  fontWeight: typography.fontWeight.semibold,
}

const subjectLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.muted,
  margin: 0,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const subjectValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.bold,
  color: colors.text.primary,
  margin: `${spacing.xs} 0 0 0`,
}

const messageLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.muted,
  margin: `0 0 ${spacing.sm} 0`,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const messageBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderLeft: `4px solid ${colors.primary}`,
  borderRadius: '0 8px 8px 0',
  padding: spacing.lg,
}

const messageContentStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  color: colors.text.secondary,
  margin: 0,
  lineHeight: typography.lineHeight.relaxed,
  whiteSpace: 'pre-wrap' as const,
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const reminderStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  backgroundColor: colors.warning.light,
  borderRadius: '8px',
  padding: spacing.md,
  margin: `0 0 ${spacing.md} 0`,
}

const signatureStyle: React.CSSProperties = {
  fontSize: typography.fontSize.xs,
  color: colors.text.muted,
  textAlign: 'center',
  fontStyle: 'italic',
  margin: 0,
}

export default ContactNotificationEmail
