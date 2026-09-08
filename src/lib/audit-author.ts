/**
 * Affichage de l'auteur d'un log d'audit
 *
 * @description Un audit survit à son auteur depuis SP-580 : la suppression de
 * compte met `userId` à null au lieu de cascader, sans quoi la suppression
 * était le seul événement du produit à ne laisser aucune trace. La relation
 * `user` est donc nulle sur ces lignes, et l'identité se relit dans `details`,
 * où `deleteAccount` la dépose avant de supprimer.
 *
 * Ces trois écrans affichent l'auteur et ont besoin du même repli : la liste
 * des logs, le détail d'un log et l'onglet audit d'une entreprise.
 *
 * @ticket SP-580
 */

import type { AuditLogEntry } from '@/types'

/**
 * Identité affichable de l'auteur d'un log.
 *
 * @property label - Nom, à défaut email, à défaut mention de compte supprimé
 * @property email - Email si connu, sinon null
 * @property isDeleted - Vrai quand le compte auteur n'existe plus
 */
export interface AuditAuthor {
  label: string
  email: string | null
  isDeleted: boolean
}

/**
 * Lit une chaîne dans les `details` d'un log.
 *
 * `details` est un Json Prisma : il peut valoir null, un tableau ou un
 * scalaire, d'où les gardes avant l'accès à la clé.
 */
function readDetailString(
  details: Record<string, unknown> | null,
  key: string
): string | null {
  if (details === null || typeof details !== 'object') return null
  const value = details[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Résout l'auteur d'un log pour l'affichage.
 *
 * Quand le compte existe encore, l'identité vient de la relation. Quand il a
 * été supprimé, elle est reprise dans `details`, et à défaut le log reste
 * affiché avec une mention explicite : une ligne d'audit sans auteur lisible
 * vaut mieux qu'une ligne masquée.
 */
export function resolveAuditAuthor(
  log: Pick<AuditLogEntry, 'user' | 'details'>
): AuditAuthor {
  if (log.user !== null) {
    return {
      label: log.user.name ?? log.user.email,
      email: log.user.email,
      isDeleted: false,
    }
  }

  const email = readDetailString(log.details, 'email')

  return {
    label: email ?? 'Compte supprimé',
    email,
    isDeleted: true,
  }
}
