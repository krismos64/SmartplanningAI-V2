'use client'

/**
 * Badge coloré pour les actions d'audit
 *
 * @ticket SP-445
 */

import type { AuditAction } from '@prisma/client'
import { Badge } from '@/components/ui/badge'

/**
 * Mapping action → variant Badge + label français
 */
const ACTION_CONFIG: Record<AuditAction, { label: string; className: string }> =
  {
    CREATE: {
      label: 'Création',
      className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25',
    },
    UPDATE: {
      label: 'Modification',
      className: 'bg-blue-500/15 text-blue-700 border-blue-500/25',
    },
    DELETE: {
      label: 'Suppression',
      className: 'bg-red-500/15 text-red-700 border-red-500/25',
    },
    STATUS_CHANGE: {
      label: 'Changement statut',
      className: 'bg-orange-500/15 text-orange-700 border-orange-500/25',
    },
    LOGIN: {
      label: 'Connexion',
      className: 'bg-gray-500/15 text-gray-700 border-gray-500/25',
    },
    LOGOUT: {
      label: 'Déconnexion',
      className: 'bg-gray-500/15 text-gray-700 border-gray-500/25',
    },
    EXPORT: {
      label: 'Export',
      className: 'bg-purple-500/15 text-purple-700 border-purple-500/25',
    },
    IMPERSONATE: {
      label: 'Impersonation',
      className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/25',
    },
    PASSWORD_CHANGE: {
      label: 'Mot de passe',
      className: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/25',
    },
  }

interface AuditActionBadgeProps {
  action: AuditAction
}

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  const config = ACTION_CONFIG[action]

  return (
    <Badge variant="outline" size="sm" className={config.className}>
      {config.label}
    </Badge>
  )
}

/**
 * Labels français pour les types d'entités
 */
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  COMPANY: 'Entreprise',
  EMPLOYEE: 'Employé',
  TEAM: 'Équipe',
  SCHEDULE: 'Planning',
  LEAVE: 'Congé',
  SUBSCRIPTION: 'Abonnement',
  USER: 'Utilisateur',
  SETTINGS: 'Paramètres',
  INCIDENT_NOTE: 'Incident',
  AVAILABILITY: 'Disponibilité',
}
