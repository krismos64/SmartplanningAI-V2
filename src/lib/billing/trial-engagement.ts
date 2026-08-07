/**
 * Lecture de l'engagement d'un compte en période d'essai.
 *
 * Ce fichier est volontairement séparé de `admin-trials.ts` : ce dernier porte
 * la directive `'use server'` et ne peut donc exporter que des fonctions async.
 * Un export non-async y provoque un 503 en production, invisible au build.
 *
 * Aucune dépendance à Prisma ni à la session : ces fonctions sont pures et
 * testables sans base.
 *
 * @ticket SP-562
 */

/**
 * État d'engagement dérivé de l'activité réelle du compte.
 *
 * - `never_started` : le compte n'a jamais été configuré ou n'a produit aucun
 *   planning. L'essai ne mesure rien, le problème est l'activation.
 * - `disengaged` : le compte a produit des plannings mais son directeur ne
 *   s'est pas connecté depuis `DISENGAGED_AFTER_DAYS`. C'est le décrochage.
 * - `active` : connexion récente, le produit est encore utilisé.
 */
export type TrialEngagement = 'never_started' | 'disengaged' | 'active'

/** Jours sans connexion du directeur à partir desquels le compte est dit décroché */
export const DISENGAGED_AFTER_DAYS = 7

export const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Nombre de jours pleins écoulés entre `from` et `now`, jamais négatif. */
export function daysSince(from: Date, now: Date): number {
  const elapsed = now.getTime() - from.getTime()
  return Math.max(0, Math.floor(elapsed / MS_PER_DAY))
}

/**
 * Dérive l'état d'engagement d'un compte en essai.
 *
 * Un compte sans employé ni planning n'a jamais démarré, quelle que soit la
 * fraîcheur de sa dernière connexion : se connecter sans rien produire ne
 * constitue pas un usage.
 */
export function deriveEngagement({
  employeeCount,
  scheduleCount,
  daysSinceLastLogin,
}: {
  employeeCount: number
  scheduleCount: number
  daysSinceLastLogin: number | null
}): TrialEngagement {
  if (employeeCount === 0 || scheduleCount === 0) return 'never_started'
  if (daysSinceLastLogin === null) return 'never_started'
  return daysSinceLastLogin >= DISENGAGED_AFTER_DAYS ? 'disengaged' : 'active'
}

/**
 * Croise le temps restant et l'engagement.
 *
 * Un compte actif proche de l'échéance est la meilleure cible commerciale, il
 * reste `critical`. Un compte qui n'a jamais démarré ne devient jamais
 * `critical` : le relancer sur la fin d'essai ne répond pas à son problème,
 * qui est l'activation. Il plafonne à `warning` pour rester visible.
 */
export function deriveUrgency({
  daysRemaining,
  engagement,
}: {
  daysRemaining: number
  engagement: TrialEngagement
}): 'critical' | 'warning' | 'info' {
  if (engagement === 'never_started') {
    return daysRemaining <= 2 ? 'warning' : 'info'
  }
  if (daysRemaining <= 2) return 'critical'
  if (daysRemaining <= 5 || engagement === 'disengaged') return 'warning'
  return 'info'
}

/** Libellés d'affichage de l'engagement, côté admin. */
export const ENGAGEMENT_LABELS: Record<TrialEngagement, string> = {
  never_started: 'Jamais démarré',
  disengaged: 'Décroché',
  active: 'Actif',
}
