/**
 * Subscription Guard — Vérification d'accès par statut d'abonnement
 *
 * Fonction pure qui détermine si un utilisateur peut accéder à l'application
 * en se basant sur les données d'abonnement stockées dans le token JWT.
 *
 * Exécutée en Edge Runtime (middleware) → aucune dépendance Node.js/Prisma.
 *
 * @ticket SP-440
 * @see SP-348 pour l'Epic Stripe complète
 */

import { SUBSCRIPTION_EXEMPT_ROUTES } from '@/types/auth'

// ============================================================================
// Constantes
// ============================================================================

/**
 * Nombre de jours de grâce accordés pour un paiement en retard (PAST_DUE).
 * Passé ce délai, l'accès est bloqué.
 *
 * Exporté pour réutilisation dans SP-441 (bannières progressives).
 *
 * @ticket SP-440
 */
export const PAST_DUE_GRACE_DAYS = 7

/** Millisecondes dans un jour */
const MS_PER_DAY = 86_400_000

// ============================================================================
// Types
// ============================================================================

/**
 * Données d'abonnement extraites du token JWT pour la vérification.
 * Toutes les dates sont en ISO string (le JWT ne supporte pas les objets Date).
 *
 * @ticket SP-440
 */
export interface SubscriptionCheckInput {
  /** Rôle utilisateur (UserRole enum value) */
  role: string
  /** Statut de l'abonnement (SubscriptionStatus enum value ou null) */
  subscriptionStatus: string | null
  /** Date de fin du trial en ISO string */
  trialEndsAt: string | null
  /** Date de fin de période courante en ISO string */
  currentPeriodEnd: string | null
  /** Chemin de la route actuelle */
  pathname: string
}

/**
 * Résultat de la vérification d'accès subscription.
 *
 * @ticket SP-440
 */
export interface SubscriptionAccessResult {
  /** true si l'utilisateur peut accéder à la route */
  allowed: boolean
  /** Motif de blocage (query param ?reason=XXX sur /billing) */
  redirectReason?: string
}

// ============================================================================
// Fonction principale
// ============================================================================

/**
 * Vérifie si un utilisateur peut accéder à l'application en fonction
 * de son statut d'abonnement.
 *
 * Règles de bypass :
 * - SYSTEM_ADMIN : pas d'abonnement, gère le SaaS → toujours autorisé
 * - Routes exemptées (billing, profile, settings) → toujours accessibles
 *
 * Statuts d'abonnement :
 * - ACTIVE → autorisé
 * - TRIAL → autorisé si trialEndsAt dans le futur (ou null)
 * - PAST_DUE → autorisé si < 7 jours de retard, bloqué sinon
 * - CANCELED, EXPIRED, INCOMPLETE → bloqué
 * - null (pas d'abonnement) → bloqué
 *
 * @param input - Données d'abonnement du token JWT + pathname
 * @returns Résultat avec allowed et redirectReason optionnel
 *
 * @ticket SP-440
 */
export function checkSubscriptionAccess(
  input: SubscriptionCheckInput
): SubscriptionAccessResult {
  const { role, subscriptionStatus, trialEndsAt, currentPeriodEnd, pathname } =
    input

  // 1. SYSTEM_ADMIN : pas lié à une company, pas d'abonnement
  if (role === 'SYSTEM_ADMIN') {
    return { allowed: true }
  }

  // 2. Routes exemptées : toujours accessibles (billing, profile, settings)
  const isExempt = SUBSCRIPTION_EXEMPT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  if (isExempt) {
    return { allowed: true }
  }

  // 3. Pas d'abonnement du tout — vérifier le trial Company d'abord
  if (subscriptionStatus === null || subscriptionStatus === undefined) {
    // Nouvel utilisateur en trial : pas encore de Subscription mais trialEndsAt défini
    if (trialEndsAt) {
      const trialEnd = new Date(trialEndsAt).getTime()
      if (trialEnd > Date.now()) {
        return { allowed: true }
      }
      return { allowed: false, redirectReason: 'trial_expired' }
    }
    return { allowed: false, redirectReason: 'no_subscription' }
  }

  // 4. Abonnement ACTIVE
  if (subscriptionStatus === 'ACTIVE') {
    return { allowed: true }
  }

  // 5. Période d'essai (TRIAL)
  if (subscriptionStatus === 'TRIAL') {
    // Pas de date de fin = trial illimité (config manuelle admin)
    if (!trialEndsAt) {
      return { allowed: true }
    }
    const trialEnd = new Date(trialEndsAt).getTime()
    if (trialEnd > Date.now()) {
      return { allowed: true }
    }
    return { allowed: false, redirectReason: 'trial_expired' }
  }

  // 6. Paiement en retard (PAST_DUE) — grâce de 7 jours
  if (subscriptionStatus === 'PAST_DUE') {
    if (!currentPeriodEnd) {
      // Pas de date de référence → on accorde l'accès par sécurité
      return { allowed: true }
    }
    const periodEnd = new Date(currentPeriodEnd).getTime()
    const daysSince = Math.floor((Date.now() - periodEnd) / MS_PER_DAY)
    if (daysSince < PAST_DUE_GRACE_DAYS) {
      return { allowed: true }
    }
    return { allowed: false, redirectReason: 'payment_overdue' }
  }

  // 7. Annulé
  if (subscriptionStatus === 'CANCELED') {
    return { allowed: false, redirectReason: 'subscription_canceled' }
  }

  // 8. Expiré
  if (subscriptionStatus === 'EXPIRED') {
    return { allowed: false, redirectReason: 'subscription_expired' }
  }

  // 9. Paiement incomplet (3D Secure en attente, etc.)
  if (subscriptionStatus === 'INCOMPLETE') {
    return { allowed: false, redirectReason: 'payment_incomplete' }
  }

  // 10. Statut inconnu → bloqué par sécurité
  return { allowed: false, redirectReason: 'unknown_status' }
}
