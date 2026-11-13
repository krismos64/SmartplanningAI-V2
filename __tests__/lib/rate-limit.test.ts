/**
 * Tests unitaires pour le rate limiter
 *
 * @ticket SP-288
 * @description Tests du système de rate limiting (fallback mémoire)
 *
 * Note : dans l'environnement de test, REDIS_URL n'est pas défini,
 * donc getRedisClient() retourne null et le fallback mémoire est utilisé.
 * C'est exactement le comportement attendu : on teste la logique de
 * rate limiting, pas la connexion Redis.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
const { mockGetRedisClient } = vi.hoisted(() => ({
  mockGetRedisClient: vi.fn(),
}))

vi.mock('@/lib/redis', () => ({
  getRedisClient: mockGetRedisClient,
}))

import {
  checkRateLimit,
  releaseRateLimit,
  resetRateLimit,
  getClientIp,
  getRateLimitHeaders,
  resetRateLimitCache,
  getRateLimitCacheSize,
} from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimitCache()
    mockGetRedisClient.mockReturnValue(null)
  })

  // ==========================================================================
  // checkRateLimit
  // ==========================================================================

  describe('checkRateLimit', () => {
    const defaultConfig = {
      maxRequests: 5,
      windowMs: 60000, // 1 minute
    }

    it('devrait autoriser la première requête', async () => {
      const result = await checkRateLimit('test-ip', defaultConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('devrait autoriser les requêtes sous la limite', async () => {
      for (let i = 0; i < 4; i++) {
        await checkRateLimit('test-ip-2', defaultConfig)
      }

      const result = await checkRateLimit('test-ip-2', defaultConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('devrait bloquer les requêtes au-dessus de la limite', async () => {
      for (let i = 0; i < 5; i++) {
        await checkRateLimit('test-ip-3', defaultConfig)
      }

      const result = await checkRateLimit('test-ip-3', defaultConfig)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('devrait traiter chaque IP séparément', async () => {
      for (let i = 0; i < 6; i++) {
        await checkRateLimit('ip-1', defaultConfig)
      }

      const result = await checkRateLimit('ip-2', defaultConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('devrait inclure le timestamp de reset', async () => {
      const before = Date.now()
      const result = await checkRateLimit('test-ip-4', defaultConfig)
      const after = Date.now()

      expect(result.resetAt).toBeGreaterThanOrEqual(
        before + defaultConfig.windowMs
      )
      expect(result.resetAt).toBeLessThanOrEqual(after + defaultConfig.windowMs)
    })

    it('devrait utiliser la configuration par défaut si non fournie', async () => {
      const result = await checkRateLimit('test-ip-5')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('devrait réinitialiser après expiration de la fenêtre', async () => {
      const shortConfig = {
        maxRequests: 2,
        windowMs: 50, // 50ms
      }

      await checkRateLimit('test-ip-6', shortConfig)
      await checkRateLimit('test-ip-6', shortConfig)
      const blocked = await checkRateLimit('test-ip-6', shortConfig)

      expect(blocked.allowed).toBe(false)

      await new Promise((resolve) => setTimeout(resolve, 60))

      const result = await checkRateLimit('test-ip-6', shortConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
    })
  })

  // ==========================================================================
  // getClientIp
  // ==========================================================================

  describe('getClientIp', () => {
    it("devrait extraire l'IP de x-forwarded-for", () => {
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
        resetAt: 1700000000000,
      }

      const headers = getRateLimitHeaders(result)

      expect(headers['X-RateLimit-Remaining']).toBe('3')
      expect(headers['X-RateLimit-Reset']).toBe('1700000000')
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
    it('devrait permettre de réinitialiser le cache', async () => {
      await checkRateLimit('ip-cache-1')
      await checkRateLimit('ip-cache-2')

      expect(getRateLimitCacheSize()).toBe(2)

      resetRateLimitCache()

      expect(getRateLimitCacheSize()).toBe(0)
    })

    it('devrait retourner la taille correcte du cache', async () => {
      expect(getRateLimitCacheSize()).toBe(0)

      await checkRateLimit('ip-size-1')
      expect(getRateLimitCacheSize()).toBe(1)

      await checkRateLimit('ip-size-2')
      expect(getRateLimitCacheSize()).toBe(2)

      await checkRateLimit('ip-size-1')
      expect(getRateLimitCacheSize()).toBe(2)
    })
  })

  // ==========================================================================
  // SP-610 : lecture sans incrément, remise à zéro, fenêtre fixe, IP certifiée
  // ==========================================================================

  describe('releaseRateLimit et resetRateLimit (SP-610)', () => {
    const config = { maxRequests: 2, windowMs: 60000 }

    it('releaseRateLimit rend une unité', async () => {
      await checkRateLimit('release-1', config)
      await checkRateLimit('release-1', config)

      await releaseRateLimit('release-1')

      // Deux consommées, une rendue : la suivante est la deuxième
      const next = await checkRateLimit('release-1', config)
      expect(next.allowed).toBe(true)
      expect(next.remaining).toBe(0)
    })

    it('releaseRateLimit ne descend pas sous zéro', async () => {
      await checkRateLimit('release-2', config)

      await releaseRateLimit('release-2')
      await releaseRateLimit('release-2')

      const next = await checkRateLimit('release-2', config)
      expect(next.remaining).toBe(1)
    })

    it('releaseRateLimit est sans effet sur un identifiant jamais vu', async () => {
      await releaseRateLimit('release-inconnu')

      const next = await checkRateLimit('release-inconnu', config)
      expect(next.remaining).toBe(1)
    })

    it('resetRateLimit efface le compteur', async () => {
      await checkRateLimit('reset-1', config)
      await checkRateLimit('reset-1', config)

      await resetRateLimit('reset-1')

      const next = await checkRateLimit('reset-1', config)
      expect(next.allowed).toBe(true)
      expect(next.remaining).toBe(1)
    })
  })

  describe('fenêtre Redis fixe (SP-610)', () => {
    /**
     * Faux Redis qui compte les écritures de TTL. L'ancien code rejouait
     * EXPIRE à chaque appel : la fin de la fenêtre reculait à chaque
     * tentative. Le TTL ne doit être posé qu'à la création de la clé.
     */
    function createFakeRedis() {
      const counters = new Map<string, number>()
      let ttlWrites = 0
      const evalCalls: string[] = []

      const client = {
        multi() {
          const ops: Array<() => [null, number | string | null]> = []
          const chain = {
            set(key: string, value: number, ...args: Array<string | number>) {
              ops.push(() => {
                if (args.includes('NX') && counters.has(key)) {
                  return [null, null]
                }
                counters.set(key, value)
                ttlWrites++
                return [null, 'OK']
              })
              return chain
            },
            incr(key: string) {
              ops.push(() => {
                const next = (counters.get(key) ?? 0) + 1
                counters.set(key, next)
                return [null, next]
              })
              return chain
            },
            expire() {
              ops.push(() => {
                ttlWrites++
                return [null, 1]
              })
              return chain
            },
            ttl() {
              ops.push(() => [null, 60])
              return chain
            },
            get(key: string) {
              ops.push(() => [null, counters.get(key) ?? null])
              return chain
            },
            exec() {
              return Promise.resolve(ops.map((op) => op()))
            },
          }
          return chain
        },
        del(key: string) {
          counters.delete(key)
          return Promise.resolve(1)
        },
        eval(_script: string, _numKeys: number, key: string) {
          evalCalls.push(key)
          const current = counters.get(key)
          if (current !== undefined && current > 0) {
            counters.set(key, current - 1)
          }
          return Promise.resolve(0)
        },
      }

      return { client, getTtlWrites: () => ttlWrites, evalCalls }
    }

    const config = { maxRequests: 3, windowMs: 60000 }

    it("ne pose le TTL qu'à la première requête de la fenêtre", async () => {
      const { client, getTtlWrites } = createFakeRedis()
      mockGetRedisClient.mockReturnValue(client)

      await checkRateLimit('fenetre-1', config)
      await checkRateLimit('fenetre-1', config)
      await checkRateLimit('fenetre-1', config)

      expect(getTtlWrites()).toBe(1)
    })

    it('compte et refuse au-delà du plafond', async () => {
      const { client } = createFakeRedis()
      mockGetRedisClient.mockReturnValue(client)

      const results = []
      for (let i = 0; i < 4; i++) {
        results.push(await checkRateLimit('fenetre-2', config))
      }

      expect(results.map((r) => r.allowed)).toEqual([true, true, true, false])
      expect(results[0]?.remaining).toBe(2)
    })

    it('resetRateLimit supprime la clé, releaseRateLimit passe par un script', async () => {
      const { client, evalCalls } = createFakeRedis()
      mockGetRedisClient.mockReturnValue(client)

      await checkRateLimit('fenetre-3', config)
      await checkRateLimit('fenetre-3', config)
      await releaseRateLimit('fenetre-3')
      expect(evalCalls).toEqual(['ratelimit:fenetre-3'])

      await resetRateLimit('fenetre-3')
      const next = await checkRateLimit('fenetre-3', config)
      expect(next.remaining).toBe(2)
    })
  })

  describe('getClientIp, IP certifiée par Nginx (SP-610)', () => {
    it('préfère x-real-ip à un x-forwarded-for choisi par le client', () => {
      const request = new Request('https://smartplanning.fr/api/contact', {
        headers: {
          'x-forwarded-for': '1.2.3.4, 203.0.113.7',
          'x-real-ip': '203.0.113.7',
        },
      })

      expect(getClientIp(request)).toBe('203.0.113.7')
    })
  })
})
