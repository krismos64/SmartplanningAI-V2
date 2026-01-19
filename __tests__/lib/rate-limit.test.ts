/**
 * Tests unitaires pour le rate limiter
 *
 * @ticket SP-288
 * @description Tests du système de rate limiting en mémoire
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkRateLimit,
  getClientIp,
  getRateLimitHeaders,
  resetRateLimitCache,
  getRateLimitCacheSize,
} from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Réinitialiser le cache entre chaque test
    resetRateLimitCache()
  })

  // ==========================================================================
  // checkRateLimit
  // ==========================================================================

  describe('checkRateLimit', () => {
    const defaultConfig = {
      maxRequests: 5,
      windowMs: 60000, // 1 minute
    }

    it('devrait autoriser la première requête', () => {
      const result = checkRateLimit('test-ip', defaultConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('devrait autoriser les requêtes sous la limite', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit('test-ip-2', defaultConfig)
      }

      const result = checkRateLimit('test-ip-2', defaultConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('devrait bloquer les requêtes au-dessus de la limite', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-ip-3', defaultConfig)
      }

      const result = checkRateLimit('test-ip-3', defaultConfig)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('devrait traiter chaque IP séparément', () => {
      // Épuiser la limite pour IP1
      for (let i = 0; i < 6; i++) {
        checkRateLimit('ip-1', defaultConfig)
      }

      // IP2 devrait toujours être autorisée
      const result = checkRateLimit('ip-2', defaultConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('devrait inclure le timestamp de reset', () => {
      const before = Date.now()
      const result = checkRateLimit('test-ip-4', defaultConfig)
      const after = Date.now()

      expect(result.resetAt).toBeGreaterThanOrEqual(before + defaultConfig.windowMs)
      expect(result.resetAt).toBeLessThanOrEqual(after + defaultConfig.windowMs)
    })

    it('devrait utiliser la configuration par défaut si non fournie', () => {
      const result = checkRateLimit('test-ip-5')

      expect(result.allowed).toBe(true)
      // La config par défaut est 5 requêtes/minute
      expect(result.remaining).toBe(4)
    })

    it('devrait réinitialiser après expiration de la fenêtre', async () => {
      const shortConfig = {
        maxRequests: 2,
        windowMs: 50, // 50ms
      }

      // Épuiser la limite
      checkRateLimit('test-ip-6', shortConfig)
      checkRateLimit('test-ip-6', shortConfig)
      const blocked = checkRateLimit('test-ip-6', shortConfig)

      expect(blocked.allowed).toBe(false)

      // Attendre l'expiration
      await new Promise((resolve) => setTimeout(resolve, 60))

      // Devrait être autorisé à nouveau
      const result = checkRateLimit('test-ip-6', shortConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
    })
  })

  // ==========================================================================
  // getClientIp
  // ==========================================================================

  describe('getClientIp', () => {
    it('devrait extraire l\'IP de x-forwarded-for', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
            return null
          },
        },
      } as unknown as Request

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.1')
    })

    it('devrait utiliser x-real-ip si x-forwarded-for absent', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-real-ip') return '10.0.0.5'
            return null
          },
        },
      } as unknown as Request

      const ip = getClientIp(request)

      expect(ip).toBe('10.0.0.5')
    })

    it('devrait retourner unknown si aucun header', () => {
      const request = {
        headers: {
          get: () => null,
        },
      } as unknown as Request

      const ip = getClientIp(request)

      expect(ip).toBe('unknown')
    })

    it('devrait nettoyer les espaces des IPs', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '  192.168.1.2  '
            return null
          },
        },
      } as unknown as Request

      const ip = getClientIp(request)

      expect(ip).toBe('192.168.1.2')
    })
  })

  // ==========================================================================
  // getRateLimitHeaders
  // ==========================================================================

  describe('getRateLimitHeaders', () => {
    it('devrait générer les headers corrects', () => {
      const result = {
        allowed: true,
        remaining: 3,
        resetAt: 1700000000000, // timestamp en ms
      }

      const headers = getRateLimitHeaders(result)

      expect(headers['X-RateLimit-Remaining']).toBe('3')
      expect(headers['X-RateLimit-Reset']).toBe('1700000000') // en secondes
    })

    it('devrait gérer les valeurs 0', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: 1700000000000,
      }

      const headers = getRateLimitHeaders(result)

      expect(headers['X-RateLimit-Remaining']).toBe('0')
    })
  })

  // ==========================================================================
  // resetRateLimitCache & getRateLimitCacheSize
  // ==========================================================================

  describe('Cache management', () => {
    it('devrait permettre de réinitialiser le cache', () => {
      checkRateLimit('ip-cache-1')
      checkRateLimit('ip-cache-2')

      expect(getRateLimitCacheSize()).toBe(2)

      resetRateLimitCache()

      expect(getRateLimitCacheSize()).toBe(0)
    })

    it('devrait retourner la taille correcte du cache', () => {
      expect(getRateLimitCacheSize()).toBe(0)

      checkRateLimit('ip-size-1')
      expect(getRateLimitCacheSize()).toBe(1)

      checkRateLimit('ip-size-2')
      expect(getRateLimitCacheSize()).toBe(2)

      // Même IP ne devrait pas augmenter la taille
      checkRateLimit('ip-size-1')
      expect(getRateLimitCacheSize()).toBe(2)
    })
  })
})
