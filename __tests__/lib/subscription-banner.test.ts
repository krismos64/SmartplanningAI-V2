/**
 * Tests unitaires pour src/lib/subscription-banner.ts
 *
 * Teste la fonction pure getSubscriptionBannerConfig qui détermine
 * la configuration de la bannière d'avertissement abonnement.
 *
 * Couvre la matrice complète :
 * - Bypass : SYSTEM_ADMIN, ACTIVE, statuts bloqués par SP-440
 * - TRIAL : paliers info (7-14j), warning (4-6j), urgent (1-3j)
 * - PAST_DUE : période de grâce < 7 jours
 * - Cas limites : trialEndsAt null, 0 jours, currentPeriodEnd null
 *
 * @ticket SP-441
 */

import { describe, it, expect } from 'vitest'
import {
  getSubscriptionBannerConfig,
  TRIAL_BANNER_THRESHOLDS,
  type SubscriptionBannerInput,
  type SubscriptionBannerConfig,
} from '@/lib/subscription-banner'

// ============================================================================
// Helpers
// ============================================================================

/** Crée un input de base avec des valeurs par défaut sensibles */
function makeInput(
  overrides: Partial<SubscriptionBannerInput> = {}
): SubscriptionBannerInput {
  return {
    role: 'DIRECTOR',
    subscriptionStatus: 'ACTIVE',
    trialEndsAt: null,
    currentPeriodEnd: null,
    ...overrides,
  }
}

/** Génère une date ISO dans le futur (jours) */
function futureDate(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

/** Génère une date ISO dans le passé (jours) */
function pastDate(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

// ============================================================================
// CONSTANTES
// ============================================================================

describe('TRIAL_BANNER_THRESHOLDS', () => {
  it('devrait avoir les seuils attendus', () => {
    expect(TRIAL_BANNER_THRESHOLDS.INFO).toBe(14)
    expect(TRIAL_BANNER_THRESHOLDS.WARNING).toBe(6)
    expect(TRIAL_BANNER_THRESHOLDS.URGENT).toBe(3)
  })
})

// ============================================================================
// getSubscriptionBannerConfig
// ============================================================================

describe('getSubscriptionBannerConfig', () => {
  // --------------------------------------------------------------------------
  // Bypass (pas de bannière)
  // --------------------------------------------------------------------------

  describe('Bypass : pas de bannière', () => {
    it('ne montre pas de bannière pour SYSTEM_ADMIN', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ role: 'SYSTEM_ADMIN', subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(5) })
      )
      expect(result).toEqual<SubscriptionBannerConfig>({ show: false })
    })

    it('ne montre pas de bannière pour ACTIVE', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'ACTIVE' })
      )
      expect(result).toEqual<SubscriptionBannerConfig>({ show: false })
    })

    it('ne montre pas de bannière quand subscriptionStatus est null', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: null })
      )
      expect(result).toEqual<SubscriptionBannerConfig>({ show: false })
    })

    it('ne montre pas de bannière pour CANCELED (géré par SP-440)', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'CANCELED' })
      )
      expect(result).toEqual<SubscriptionBannerConfig>({ show: false })
    })

    it('ne montre pas de bannière pour EXPIRED', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'EXPIRED' })
      )
      expect(result).toEqual<SubscriptionBannerConfig>({ show: false })
    })

    it('ne montre pas de bannière pour INCOMPLETE', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'INCOMPLETE' })
      )
      expect(result).toEqual<SubscriptionBannerConfig>({ show: false })
    })

    it('ne montre pas de bannière pour un statut inconnu', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'UNKNOWN' })
      )
      expect(result).toEqual<SubscriptionBannerConfig>({ show: false })
    })
  })

  // --------------------------------------------------------------------------
  // TRIAL — palier info (7-14 jours)
  // --------------------------------------------------------------------------

  describe('TRIAL — palier info (7-14 jours)', () => {
    it('affiche info quand 14 jours restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(14) })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('info')
    })

    it('affiche info quand 7 jours restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(7) })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('info')
    })

    it('ne montre pas de bannière quand 15 jours restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(15) })
      )
      expect(result.show).toBe(false)
    })

    it('config.dismissable est true pour info', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(10) })
      )
      expect(result.dismissable).toBe(true)
    })

    it('config.ctaLabel est "Voir les offres"', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(10) })
      )
      expect(result.ctaLabel).toBe('Voir les offres')
    })

    it('config.type est "trial"', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(10) })
      )
      expect(result.type).toBe('trial')
    })

    it('config.ctaHref pointe vers billing', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(10) })
      )
      expect(result.ctaHref).toBe('/app/dashboard/billing')
    })

    it('config.daysRemaining est correct', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(10) })
      )
      expect(result.daysRemaining).toBe(10)
    })

    it('message contient le nombre de jours', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(10) })
      )
      expect(result.message).toContain('10')
      expect(result.message).toContain('jours restants')
    })
  })

  // --------------------------------------------------------------------------
  // TRIAL — palier warning (4-6 jours)
  // --------------------------------------------------------------------------

  describe('TRIAL — palier warning (4-6 jours)', () => {
    it('affiche warning quand 6 jours restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(6) })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('warning')
    })

    it('affiche warning quand 4 jours restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(4) })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('warning')
    })

    it('config.dismissable est true pour warning', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(5) })
      )
      expect(result.dismissable).toBe(true)
    })

    it('config.ctaLabel est "S\'abonner"', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(5) })
      )
      expect(result.ctaLabel).toBe("S'abonner")
    })

    it('message contient "Abonnez-vous"', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(5) })
      )
      expect(result.message).toContain('Abonnez-vous')
    })
  })

  // --------------------------------------------------------------------------
  // TRIAL — palier urgent (1-3 jours)
  // --------------------------------------------------------------------------

  describe('TRIAL — palier urgent (1-3 jours)', () => {
    it('affiche urgent quand 3 jours restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(3) })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('urgent')
    })

    it('affiche urgent quand 1 jour restant', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(1) })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('urgent')
    })

    it('config.dismissable est false pour urgent', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(2) })
      )
      expect(result.dismissable).toBe(false)
    })

    it('message singulier quand 1 jour restant', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(1) })
      )
      expect(result.message).toContain('1 jour')
      expect(result.message).not.toContain('1 jours')
    })

    it('message pluriel quand 2 jours restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(2) })
      )
      expect(result.message).toContain('2 jours')
    })

    it('config.ctaLabel est "S\'abonner maintenant"', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(2) })
      )
      expect(result.ctaLabel).toBe("S'abonner maintenant")
    })
  })

  // --------------------------------------------------------------------------
  // TRIAL — cas limites
  // --------------------------------------------------------------------------

  describe('TRIAL — cas limites', () => {
    it('ne montre pas de bannière quand trial expiré (0 jours)', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: pastDate(1) })
      )
      expect(result.show).toBe(false)
    })

    it('ne montre pas de bannière quand trialEndsAt est null (trial illimité)', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: null })
      )
      expect(result.show).toBe(false)
    })

    it('ne montre pas de bannière quand 20 jours restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(20) })
      )
      expect(result.show).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // PAST_DUE — période de grâce
  // --------------------------------------------------------------------------

  describe('PAST_DUE — période de grâce', () => {
    it('affiche warning quand PAST_DUE depuis 1 jour', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(1) })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('warning')
    })

    it('affiche warning quand PAST_DUE depuis 6 jours', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(6) })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('warning')
    })

    it('ne montre pas de bannière quand PAST_DUE depuis 7 jours (bloqué SP-440)', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(7) })
      )
      expect(result.show).toBe(false)
    })

    it('ne montre pas de bannière quand PAST_DUE depuis 30 jours', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(30) })
      )
      expect(result.show).toBe(false)
    })

    it('config.dismissable est false pour PAST_DUE', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(3) })
      )
      expect(result.dismissable).toBe(false)
    })

    it('config.type est "payment"', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(3) })
      )
      expect(result.type).toBe('payment')
    })

    it('config.ctaLabel est "Mettre à jour"', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(3) })
      )
      expect(result.ctaLabel).toBe('Mettre à jour')
    })

    it('config.daysRemaining indique les jours de grâce restants', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(3) })
      )
      expect(result.daysRemaining).toBe(4) // 7 - 3 = 4
    })

    it('affiche bannière PAST_DUE générique quand currentPeriodEnd est null', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: null })
      )
      expect(result.show).toBe(true)
      expect(result.tier).toBe('warning')
      expect(result.type).toBe('payment')
      expect(result.daysRemaining).toBeUndefined()
    })

    it('message contient "Paiement en retard"', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ subscriptionStatus: 'PAST_DUE', currentPeriodEnd: pastDate(2) })
      )
      expect(result.message).toContain('Paiement en retard')
    })
  })

  // --------------------------------------------------------------------------
  // Différents rôles
  // --------------------------------------------------------------------------

  describe('Différents rôles', () => {
    it('affiche bannière pour DIRECTOR avec TRIAL', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ role: 'DIRECTOR', subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(5) })
      )
      expect(result.show).toBe(true)
    })

    it('affiche bannière pour MANAGER avec TRIAL', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ role: 'MANAGER', subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(5) })
      )
      expect(result.show).toBe(true)
    })

    it('affiche bannière pour EMPLOYEE avec TRIAL', () => {
      const result = getSubscriptionBannerConfig(
        makeInput({ role: 'EMPLOYEE', subscriptionStatus: 'TRIAL', trialEndsAt: futureDate(5) })
      )
      expect(result.show).toBe(true)
    })
  })
})
