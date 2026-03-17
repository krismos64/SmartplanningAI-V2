/**
 * Tests unitaires pour src/lib/subscription-guard.ts
 *
 * Teste la fonction pure checkSubscriptionAccess qui détermine si un
 * utilisateur peut accéder à l'application en fonction de son statut
 * d'abonnement (données JWT).
 *
 * Couvre la matrice complète des statuts :
 * - Bypass : SYSTEM_ADMIN, routes exemptées
 * - ACTIVE, TRIAL (valide/expiré), PAST_DUE (grâce/dépassé)
 * - CANCELED, EXPIRED, INCOMPLETE, null, inconnu
 *
 * @ticket SP-440
 */

import { describe, it, expect } from 'vitest'
import {
  checkSubscriptionAccess,
  PAST_DUE_GRACE_DAYS,
  type SubscriptionCheckInput,
  type SubscriptionAccessResult,
} from '@/lib/subscription-guard'

// ============================================================================
// Helpers
// ============================================================================

/** Crée un input de base avec des valeurs par défaut sensibles */
function makeInput(
  overrides: Partial<SubscriptionCheckInput> = {}
): SubscriptionCheckInput {
  return {
    role: 'DIRECTOR',
    subscriptionStatus: 'ACTIVE',
    trialEndsAt: null,
    currentPeriodEnd: null,
    pathname: '/app/tableau-de-bord',
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
// CONSTANTE PAST_DUE_GRACE_DAYS
// ============================================================================

describe('PAST_DUE_GRACE_DAYS', () => {
  it('devrait valoir 7 jours', () => {
    expect(PAST_DUE_GRACE_DAYS).toBe(7)
  })
})

// ============================================================================
// checkSubscriptionAccess
// ============================================================================

describe('checkSubscriptionAccess', () => {
  // --------------------------------------------------------------------------
  // Bypass rules
  // --------------------------------------------------------------------------

  describe('Bypass : SYSTEM_ADMIN', () => {
    it('devrait autoriser SYSTEM_ADMIN quel que soit le statut subscription', () => {
      const result = checkSubscriptionAccess(
        makeInput({ role: 'SYSTEM_ADMIN', subscriptionStatus: null })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait autoriser SYSTEM_ADMIN même avec un statut EXPIRED', () => {
      const result = checkSubscriptionAccess(
        makeInput({ role: 'SYSTEM_ADMIN', subscriptionStatus: 'EXPIRED' })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })
  })

  describe('Bypass : routes exemptées', () => {
    it('devrait autoriser /app/dashboard/billing même si bloqué', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: null,
          pathname: '/app/tableau-de-bord/facturation',
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait autoriser /app/profile même si bloqué', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'EXPIRED',
          pathname: '/app/profil',
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait autoriser /app/profile/edit (sous-route) même si bloqué', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'CANCELED',
          pathname: '/app/profil/edit',
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait autoriser /app/settings même si bloqué', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'CANCELED',
          pathname: '/app/parametres',
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait autoriser /app/settings/appearance (sous-route) même si bloqué', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'CANCELED',
          pathname: '/app/parametres/apparence',
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })
  })

  // --------------------------------------------------------------------------
  // Statut ACTIVE
  // --------------------------------------------------------------------------

  describe('Statut ACTIVE', () => {
    it('devrait autoriser un abonnement ACTIVE', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'ACTIVE' })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })
  })

  // --------------------------------------------------------------------------
  // Statut TRIAL
  // --------------------------------------------------------------------------

  describe('Statut TRIAL', () => {
    it('devrait autoriser si trial valide (trialEndsAt dans le futur)', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'TRIAL',
          trialEndsAt: futureDate(10),
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait autoriser si trialEndsAt est null (trial illimité admin)', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'TRIAL',
          trialEndsAt: null,
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait bloquer si trial expiré (trialEndsAt dans le passé)', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'TRIAL',
          trialEndsAt: pastDate(1),
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({
        allowed: false,
        redirectReason: 'trial_expired',
      })
    })

    it('devrait retourner reason=trial_expired pour un trial expiré', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'TRIAL',
          trialEndsAt: pastDate(30),
        })
      )
      expect(result.redirectReason).toBe('trial_expired')
    })
  })

  // --------------------------------------------------------------------------
  // Statut PAST_DUE
  // --------------------------------------------------------------------------

  describe('Statut PAST_DUE', () => {
    it('devrait autoriser si PAST_DUE depuis moins de 7 jours', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'PAST_DUE',
          currentPeriodEnd: pastDate(3),
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait autoriser si PAST_DUE depuis exactement 6 jours', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'PAST_DUE',
          currentPeriodEnd: pastDate(6),
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait bloquer si PAST_DUE depuis 7 jours ou plus', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'PAST_DUE',
          currentPeriodEnd: pastDate(7),
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({
        allowed: false,
        redirectReason: 'payment_overdue',
      })
    })

    it('devrait bloquer si PAST_DUE depuis 30 jours', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'PAST_DUE',
          currentPeriodEnd: pastDate(30),
        })
      )
      expect(result.redirectReason).toBe('payment_overdue')
    })

    it('devrait autoriser si PAST_DUE sans currentPeriodEnd (sécurité)', () => {
      const result = checkSubscriptionAccess(
        makeInput({
          subscriptionStatus: 'PAST_DUE',
          currentPeriodEnd: null,
        })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })
  })

  // --------------------------------------------------------------------------
  // Statut CANCELED
  // --------------------------------------------------------------------------

  describe('Statut CANCELED', () => {
    it('devrait bloquer un abonnement CANCELED', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'CANCELED' })
      )
      expect(result.allowed).toBe(false)
    })

    it('devrait retourner reason=subscription_canceled', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'CANCELED' })
      )
      expect(result.redirectReason).toBe('subscription_canceled')
    })
  })

  // --------------------------------------------------------------------------
  // Statut EXPIRED
  // --------------------------------------------------------------------------

  describe('Statut EXPIRED', () => {
    it('devrait bloquer un abonnement EXPIRED', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'EXPIRED' })
      )
      expect(result.allowed).toBe(false)
    })

    it('devrait retourner reason=subscription_expired', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'EXPIRED' })
      )
      expect(result.redirectReason).toBe('subscription_expired')
    })
  })

  // --------------------------------------------------------------------------
  // Statut INCOMPLETE
  // --------------------------------------------------------------------------

  describe('Statut INCOMPLETE', () => {
    it('devrait bloquer un abonnement INCOMPLETE', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'INCOMPLETE' })
      )
      expect(result.allowed).toBe(false)
    })

    it('devrait retourner reason=payment_incomplete', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'INCOMPLETE' })
      )
      expect(result.redirectReason).toBe('payment_incomplete')
    })
  })

  // --------------------------------------------------------------------------
  // Pas d'abonnement (null)
  // --------------------------------------------------------------------------

  describe('Pas d\u2019abonnement (null)', () => {
    it('devrait autoriser si subscriptionStatus est null mais trialEndsAt dans le futur', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: null, trialEndsAt: futureDate(15) })
      )
      expect(result).toEqual<SubscriptionAccessResult>({ allowed: true })
    })

    it('devrait bloquer avec trial_expired si subscriptionStatus est null et trialEndsAt dans le passé', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: null, trialEndsAt: pastDate(1) })
      )
      expect(result).toEqual<SubscriptionAccessResult>({
        allowed: false,
        redirectReason: 'trial_expired',
      })
    })

    it('devrait bloquer avec no_subscription si subscriptionStatus et trialEndsAt sont null', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: null, trialEndsAt: null })
      )
      expect(result).toEqual<SubscriptionAccessResult>({
        allowed: false,
        redirectReason: 'no_subscription',
      })
    })
  })

  // --------------------------------------------------------------------------
  // Statut inconnu
  // --------------------------------------------------------------------------

  describe('Statut inconnu', () => {
    it('devrait bloquer un statut non reconnu', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'UNKNOWN_STATUS' })
      )
      expect(result.allowed).toBe(false)
    })

    it('devrait retourner reason=unknown_status', () => {
      const result = checkSubscriptionAccess(
        makeInput({ subscriptionStatus: 'SOMETHING_WEIRD' })
      )
      expect(result.redirectReason).toBe('unknown_status')
    })
  })

  // --------------------------------------------------------------------------
  // Rôles non-SYSTEM_ADMIN
  // --------------------------------------------------------------------------

  describe('Différents rôles', () => {
    it('devrait appliquer le guard pour DIRECTOR', () => {
      const result = checkSubscriptionAccess(
        makeInput({ role: 'DIRECTOR', subscriptionStatus: 'EXPIRED' })
      )
      expect(result.allowed).toBe(false)
    })

    it('devrait appliquer le guard pour MANAGER', () => {
      const result = checkSubscriptionAccess(
        makeInput({ role: 'MANAGER', subscriptionStatus: 'EXPIRED' })
      )
      expect(result.allowed).toBe(false)
    })

    it('devrait appliquer le guard pour EMPLOYEE', () => {
      const result = checkSubscriptionAccess(
        makeInput({ role: 'EMPLOYEE', subscriptionStatus: 'EXPIRED' })
      )
      expect(result.allowed).toBe(false)
    })
  })
})
