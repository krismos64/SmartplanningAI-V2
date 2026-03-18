/**
 * Template d'email de notification de planning
 *
 * @description Email envoyé à l'employé quand son planning est créé/modifié/supprimé
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

export interface ScheduleNotificationEmailProps {
  /** Prénom de l'employé */
  firstName: string
  /** Type d'action (created, updated, deleted) */
  action: 'created' | 'updated' | 'deleted'
  /** Nombre de créneaux concernés */
  count: number
  /** Date de début formatée (ex: "18 mars 2026") */
  startDate: string
  /** Date de fin formatée (ex: "22 mars 2026") — si différente de startDate */
  endDate?: string
  /** Type de planning (ex: "Travail", "Réunion") */
  scheduleType: string
  /** Horaires (ex: "09:00 - 17:00") */
  timeRange?: string
  /** URL du planning */
  dashboardUrl: string
}

const actionConfig = {
  created: {
    title: 'Nouveau planning',
    emoji: 'Bonne nouvelle !',
    verb: 'a été ajouté',
    verbPlural: 'ont été ajoutés',
    boxStyle: 'info' as const,
    buttonLabel: 'Voir mon planning',
    buttonVariant: 'primary' as const,
  },
  updated: {
    title: 'Planning modifié',
    emoji: 'Information',
    verb: 'a été modifié',
    verbPlural: 'ont été modifiés',
    boxStyle: 'warning' as const,
    buttonLabel: 'Voir les modifications',
    buttonVariant: 'primary' as const,
  },
  deleted: {
    title: 'Planning supprimé',
    emoji: 'Attention',
    verb: 'a été supprimé',
    verbPlural: 'ont été supprimés',
    boxStyle: 'error' as const,
    buttonLabel: 'Voir mon planning',
    buttonVariant: 'primary' as const,
  },
}

const boxStyles: Record<string, { bg: string; border: string; text: string }> =
  {
    info: {
      bg: colors.info.light,
      border: colors.primary,
      text: colors.info.dark,
    },
    warning: {
      bg: colors.warning.light,
      border: colors.status.warning,
      text: colors.warning.dark,
    },
    error: {
      bg: '#fef2f2',
      border: colors.status.error,
      text: '#991b1b',
    },
  }

export function ScheduleNotificationEmail({
  firstName,
  action,
  count,
  startDate,
  endDate,
  scheduleType,
  timeRange,
  dashboardUrl,
}: ScheduleNotificationEmailProps) {
  const config = actionConfig[action]
  const style = boxStyles[config.boxStyle] ?? boxStyles.info!
  const isPlural = count > 1

  const previewText = isPlural
    ? `${count} créneaux ${config.verbPlural} dans votre planning`
    : `Un créneau ${config.verb} dans votre planning`

  const dateDisplay =
    endDate && endDate !== startDate
      ? `du ${startDate} au ${endDate}`
      : `le ${startDate}`

  return (
    <Layout preview={previewText}>
      <Text style={presetStyles.heading1}>Bonjour {firstName},</Text>

      <Text style={presetStyles.paragraph}>
        <strong style={{ color: style.border }}>{config.emoji} !</strong>{' '}
        {isPlural
          ? `${count} créneaux ${config.verbPlural} dans votre planning.`
          : `Un créneau ${config.verb} dans votre planning.`}
      </Text>

      <Hr style={presetStyles.divider} />

      <Text style={headingStyle}>Détails :</Text>

      <Section
        style={{
          backgroundColor: style.bg,
          borderRadius: '8px',
          padding: spacing.lg,
          marginBottom: spacing.lg,
          borderLeft: `4px solid ${style.border}`,
        }}
      >
        <Text style={detailLabelStyle}>Type :</Text>
        <Text style={{ ...detailValueStyle, color: style.text }}>
          {scheduleType}
        </Text>

        <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>
          {isPlural ? 'Période :' : 'Date :'}
        </Text>
        <Text style={{ ...detailValueStyle, color: style.text }}>
          {dateDisplay}
        </Text>

        {isPlural && (
          <>
            <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>
              Nombre de créneaux :
            </Text>
            <Text style={{ ...detailValueStyle, color: style.text }}>
              {count} créneau{count > 1 ? 'x' : ''}
            </Text>
          </>
        )}

        {timeRange && (
          <>
            <Text style={{ ...detailLabelStyle, marginTop: spacing.md }}>
              Horaires :
            </Text>
            <Text style={{ ...detailValueStyle, color: style.text }}>
              {timeRange}
            </Text>
          </>
        )}
      </Section>

      <Hr style={presetStyles.divider} />

      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Consultez votre planning à tout moment depuis votre espace.
      </Text>

      <Section style={ctaContainerStyle}>
        <Button href={dashboardUrl} variant={config.buttonVariant} size="lg">
          {config.buttonLabel}
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      <Text style={signatureStyle}>L&apos;équipe SmartPlanning</Text>
    </Layout>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const headingStyle: React.CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: `0 0 ${spacing.md} 0`,
}

const detailLabelStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  margin: 0,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const detailValueStyle: React.CSSProperties = {
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  margin: `${spacing.xs} 0 0 0`,
}

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: `${spacing.lg} 0`,
}

const signatureStyle: React.CSSProperties = {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic',
  margin: 0,
}

export default ScheduleNotificationEmail
