/**
 * Subscription Banner — Logique de paliers pour bannières progressives
 *
 * Fonction pure qui détermine si une bannière doit être affichée,
 * avec quel niveau d'urgence, quel message et quel CTA.
 *
 * Gère 2 cas : TRIAL (countdown avant expiration) et PAST_DUE (grâce 7j).
 * Les statuts déjà bloqués (CANCELED, EXPIRED, etc.) sont gérés par SP-440
 * via redirect middleware — aucune bannière nécessaire.
 *
 * @ticket SP-441
 * @see SP-440 pour le guard middleware
 */

import { PAST_DUE_GRACE_DAYS } from '@/lib/subscription-guard'

// ============================================================================
// Types
// ============================================================================

/**
 * Données d'abonnement nécessaires pour déterminer la bannière.
 * Toutes les dates sont en ISO string (proviennent du JWT via session.user).
 *
 * @ticket SP-441
 */
export interface SubscriptionBannerInput {
  /** Rôle utilisateur (UserRole enum value) */
  role: string
  /** Statut de l'abonnement (SubscriptionStatus enum value ou null) */
  subscriptionStatus: string | null
  /** Date de fin du trial en ISO string */
  trialEndsAt: string | null
  /** Date de fin de période courante en ISO string */
  currentPeriodEnd: string | null
}

/** Palier d'urgence de la bannière */
export type BannerTier = 'info' | 'warning' | 'urgent'

/**
 * Configuration de la bannière à afficher.
 *
 * @ticket SP-441
 */
export interface SubscriptionBannerConfig {
  /** Afficher la bannière ou non */
  show: boolean
  /** Palier d'urgence */
  tier?: BannerTier
  /** Message principal */
  message?: string
  /** Libellé du CTA */
  ctaLabel?: string
  /** Lien du CTA */
  ctaHref?: string
  /** Bannière dismissable par l'utilisateur */
  dismissable?: boolean
  /** Jours restants (pour affichage) */
  daysRemaining?: number
  /** Type de bannière : trial ou payment */
  type?: 'trial' | 'payment'
}

// ============================================================================
// Constantes
// ============================================================================

/** Millisecondes dans un jour */
const MS_PER_DAY = 86_400_000

/**
 * Seuils de jours restants pour les paliers trial.
 * Exportés pour réutilisation dans les tests.
 *
 * @ticket SP-441
 */
export const TRIAL_BANNER_THRESHOLDS = {
  /** Au-dessus de cette valeur : pas de bannière */
  INFO: 14,
  /** En dessous de cette valeur (inclus) : warning */
  WARNING: 6,
  /** En dessous de cette valeur (inclus) : urgent */
  URGENT: 3,
} as const

// ============================================================================
// Résultat caché (pas de bannière)
// ============================================================================

const HIDDEN: SubscriptionBannerConfig = { show: false }

// ============================================================================
// Fonction principale
// ============================================================================

/**
 * Détermine la configuration de la bannière d'abonnement à afficher.
 *
 * Règles :
 * - SYSTEM_ADMIN : jamais de bannière
 * - ACTIVE : jamais de bannière
 * - null / CANCELED / EXPIRED / INCOMPLETE : pas de bannière (bloqué par SP-440)
 * - TRIAL : bannière progressive selon les jours restants
 * - PAST_DUE : bannière pendant la période de grâce (< 7 jours)
 *
 * @param input - Données d'abonnement depuis session.user
 * @returns Configuration de la bannière
 *
 * @ticket SP-441
 */
export function getSubscriptionBannerConfig(
  input: SubscriptionBannerInput
): SubscriptionBannerConfig {
  const { role, subscriptionStatus, trialEndsAt, currentPeriodEnd } = input

  // 1. SYSTEM_ADMIN : pas de bannière
  if (role === 'SYSTEM_ADMIN') {
    return HIDDEN
  }

  // 2. ACTIVE : pas de bannière
  if (subscriptionStatus === 'ACTIVE') {
    return HIDDEN
  }

  // 3. Pas d'abonnement ou statuts bloqués par SP-440
  if (
    subscriptionStatus === null ||
    subscriptionStatus === undefined ||
    subscriptionStatus === 'CANCELED' ||
    subscriptionStatus === 'EXPIRED' ||
    subscriptionStatus === 'INCOMPLETE'
  ) {
    return HIDDEN
  }

  const isDirector = role === 'DIRECTOR'

  // 4. TRIAL : bannière progressive
  if (subscriptionStatus === 'TRIAL') {
    return getTrialBannerConfig(trialEndsAt, isDirector)
  }

  // 5. PAST_DUE : bannière pendant la période de grâce
  if (subscriptionStatus === 'PAST_DUE') {
    return getPastDueBannerConfig(currentPeriodEnd, isDirector)
  }

  // 6. Statut inconnu : pas de bannière (bloqué par SP-440)
  return HIDDEN
}

// ============================================================================
// Helpers internes
// ============================================================================

/**
 * Calcule la bannière pour un abonnement TRIAL.
 *
 * @param trialEndsAt - Date de fin du trial en ISO string
 * @returns Configuration de la bannière
 */
function getTrialBannerConfig(
  trialEndsAt: string | null,
  isDirector: boolean
): SubscriptionBannerConfig {
  // Trial illimité (config manuelle admin)
  if (!trialEndsAt) {
    return HIDDEN
  }

  const trialEnd = new Date(trialEndsAt).getTime()
  const daysRemaining = Math.ceil((trialEnd - Date.now()) / MS_PER_DAY)

  // Trial expiré → bloqué par SP-440
  if (daysRemaining <= 0) {
    return HIDDEN
  }

  // Plus de 14 jours restants → pas de bannière
  if (daysRemaining > TRIAL_BANNER_THRESHOLDS.INFO) {
    return HIDDEN
  }

  const suffix = daysRemaining > 1 ? 's' : ''

  // 1-3 jours → urgent (non dismissable)
  if (daysRemaining <= TRIAL_BANNER_THRESHOLDS.URGENT) {
    return {
      show: true,
      tier: 'urgent',
      message: isDirector
        ? `Votre essai expire dans ${daysRemaining} jour${suffix} !`
        : `Essai expirant dans ${daysRemaining} jour${suffix} — Contactez votre directeur pour renouveler`,
      ctaLabel: isDirector ? "S'abonner maintenant" : undefined,
      ctaHref: isDirector ? '/app/dashboard/billing' : undefined,
      dismissable: false,
      daysRemaining,
      type: 'trial',
    }
  }

  // 4-6 jours → warning
  if (daysRemaining <= TRIAL_BANNER_THRESHOLDS.WARNING) {
    return {
      show: true,
      tier: 'warning',
      message: isDirector
        ? `Plus que ${daysRemaining} jours d'essai — Abonnez-vous maintenant`
        : `Plus que ${daysRemaining} jours d'essai — Contactez votre directeur pour renouveler`,
      ctaLabel: isDirector ? "S'abonner" : undefined,
      ctaHref: isDirector ? '/app/dashboard/billing' : undefined,
      dismissable: true,
      daysRemaining,
      type: 'trial',
    }
  }

  // 7-14 jours → info
  return {
    show: true,
    tier: 'info',
    message: isDirector
      ? `Essai gratuit : ${daysRemaining} jours restants`
      : `Essai gratuit : ${daysRemaining} jours restants`,
    ctaLabel: isDirector ? 'Voir les offres' : undefined,
    ctaHref: isDirector ? '/app/dashboard/billing' : undefined,
    dismissable: true,
    daysRemaining,
    type: 'trial',
  }
}

/**
 * Calcule la bannière pour un abonnement PAST_DUE.
 *
 * @param currentPeriodEnd - Date de fin de période en ISO string
 * @returns Configuration de la bannière
 */
function getPastDueBannerConfig(
  currentPeriodEnd: string | null,
  isDirector: boolean
): SubscriptionBannerConfig {
  const message = isDirector
    ? 'Paiement en retard — Mettez à jour votre moyen de paiement'
    : 'Paiement en retard — Contactez votre directeur pour régulariser'

  // Pas de date de référence → bannière générique
  if (!currentPeriodEnd) {
    return {
      show: true,
      tier: 'warning',
      message,
      ctaLabel: isDirector ? 'Mettre à jour' : undefined,
      ctaHref: isDirector ? '/app/dashboard/billing' : undefined,
      dismissable: false,
      type: 'payment',
    }
  }

  const periodEnd = new Date(currentPeriodEnd).getTime()
  const daysSince = Math.floor((Date.now() - periodEnd) / MS_PER_DAY)

  // Au-delà de la période de grâce → bloqué par SP-440
  if (daysSince >= PAST_DUE_GRACE_DAYS) {
    return HIDDEN
  }

  const daysLeft = PAST_DUE_GRACE_DAYS - daysSince

  return {
    show: true,
    tier: 'warning',
    message,
    ctaLabel: isDirector ? 'Mettre à jour' : undefined,
    ctaHref: isDirector ? '/app/dashboard/billing' : undefined,
    dismissable: false,
    daysRemaining: daysLeft,
    type: 'payment',
  }
}
