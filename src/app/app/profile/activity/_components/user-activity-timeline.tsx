'use client'

/**
 * Timeline verticale de l'activité utilisateur
 *
 * Affichage personnel distinct de la DataTable admin.
 * Chaque entrée : badge action, description lisible, date relative + absolue.
 *
 * @ticket SP-463
 */

import type { AuditLogEntry } from '@/types/audit'
import {
  AuditActionBadge,
  ENTITY_TYPE_LABELS,
} from '@/app/app/admin/logs/_components/audit-action-badge'

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatte une date en temps relatif français
 */
function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diffMs = now - new Date(date).getTime()
  const diffSec = Math.round(diffMs / 1000)

  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

  if (diffSec < 60) return rtf.format(-diffSec, 'second')
  if (diffSec < 3600) return rtf.format(-Math.round(diffSec / 60), 'minute')
  if (diffSec < 86400) return rtf.format(-Math.round(diffSec / 3600), 'hour')
  if (diffSec < 604800) return rtf.format(-Math.round(diffSec / 86400), 'day')
  if (diffSec < 2592000)
    return rtf.format(-Math.round(diffSec / 604800), 'week')
  return rtf.format(-Math.round(diffSec / 2592000), 'month')
}

/**
 * Formatte une date en format court français
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

/**
 * Génère une description lisible en français
 */
function getDescription(entry: AuditLogEntry): string {
  const entityLabel = ENTITY_TYPE_LABELS[entry.entityType] ?? entry.entityType

  switch (entry.action) {
    case 'LOGIN':
      return 'Connexion à votre compte'
    case 'LOGOUT':
      return 'Déconnexion de votre compte'
    case 'PASSWORD_CHANGE':
      return 'Mot de passe modifié'
    case 'CREATE':
      return `${entityLabel} créé(e)`
    case 'UPDATE':
      return `${entityLabel} modifié(e)`
    case 'DELETE':
      return `${entityLabel} supprimé(e)`
    case 'STATUS_CHANGE':
      return `Changement de statut : ${entityLabel}`
    case 'EXPORT':
      return `Export de données : ${entityLabel}`
    case 'IMPERSONATE':
      return 'Impersonation de compte'
    default:
      return `Action sur ${entityLabel}`
  }
}

/**
 * Couleur de la ligne de timeline selon l'action
 */
function getTimelineDotColor(action: string): string {
  switch (action) {
    case 'CREATE':
      return 'bg-emerald-500'
    case 'UPDATE':
      return 'bg-blue-500'
    case 'DELETE':
      return 'bg-red-500'
    case 'STATUS_CHANGE':
      return 'bg-orange-500'
    case 'LOGIN':
    case 'LOGOUT':
      return 'bg-gray-400'
    case 'EXPORT':
      return 'bg-purple-500'
    case 'PASSWORD_CHANGE':
      return 'bg-indigo-500'
    default:
      return 'bg-gray-400'
  }
}

// ============================================================================
// COMPOSANTS
// ============================================================================

interface UserActivityTimelineProps {
  logs: AuditLogEntry[]
}

export function UserActivityTimeline({ logs }: UserActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Aucune activité récente.
        </p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Ligne verticale de timeline */}
      <div className="absolute bottom-2 left-[11px] top-2 w-px bg-border" />

      {logs.map((entry) => (
        <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Point de timeline */}
          <div className="relative z-10 mt-1.5 flex-shrink-0">
            <div
              className={`h-[9px] w-[9px] rounded-full ring-4 ring-background ${getTimelineDotColor(entry.action)}`}
            />
          </div>

          {/* Contenu */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <AuditActionBadge action={entry.action} />
              <span className="text-sm">{getDescription(entry)}</span>
            </div>

            {/* Détails optionnels */}
            {entry.details && Object.keys(entry.details).length > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatDetails(entry.details)}
              </p>
            )}

            {/* Date */}
            <p className="text-xs text-muted-foreground">
              <time
                dateTime={new Date(entry.createdAt).toISOString()}
                title={formatDate(entry.createdAt)}
              >
                {formatRelativeTime(entry.createdAt)}
              </time>
              <span className="mx-1">·</span>
              <span>{formatDate(entry.createdAt)}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Formatte les détails en texte lisible
 */
function formatDetails(details: Record<string, unknown>): string {
  const parts: string[] = []

  if (typeof details.method === 'string') {
    parts.push(`via ${details.method}`)
  }
  if (typeof details.name === 'string') {
    parts.push(details.name)
  }
  if (typeof details.field === 'string') {
    parts.push(`champ : ${details.field}`)
  }
  if (typeof details.from === 'string' && typeof details.to === 'string') {
    parts.push(`${details.from} → ${details.to}`)
  }

  return parts.length > 0 ? parts.join(' · ') : ''
}
