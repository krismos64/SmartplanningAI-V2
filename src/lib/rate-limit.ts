/**
 * Rate Limiter avec Redis (fallback mémoire)
 *
 * @ticket SP-288
 * @description Limite le nombre de requêtes par IP sur une fenêtre de temps.
 *
 * Stratégie :
 * - Si Redis est disponible, utilise INCR + EXPIRE atomique.
 *   Avantage : fonctionne même avec plusieurs instances de l'application
 *   derrière un load balancer (les compteurs sont partagés).
 * - Si Redis est indisponible, fallback sur une Map JavaScript en mémoire.
 *   Le rate limiting fonctionne toujours, mais uniquement par instance.
 *
 * Commandes Redis utilisées :
 * - MULTI/EXEC : transaction atomique (pas d'état incohérent entre INCR et EXPIRE)
 * - INCR : incrémente le compteur de requêtes (crée la clé avec valeur 1 si elle n'existe pas)
 * - EXPIRE : définit le TTL de la clé (la clé disparaît automatiquement après la fenêtre)
 * - TTL : récupère le temps restant avant expiration de la clé
 *
 * ✅ Source : Context7 - ioredis MULTI/EXEC + Next.js Rate Limiting
 */

import type { RateLimitConfig, RateLimitResult } from '@/types/contact'
import { getRedisClient } from '@/lib/redis'

// ============================================================================
// Fallback en mémoire (utilisé si Redis est indisponible)
// ============================================================================

interface RateLimitEntry {
  count: number
  windowStart: number
}

const rateLimitCache = new Map<string, RateLimitEntry>()

function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitCache.entries()) {
    if (now - entry.windowStart > windowMs) {
      rateLimitCache.delete(key)
    }
  }
}

/**
 * Rate limiting en mémoire (fallback quand Redis est down)
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const { maxRequests, windowMs } = config

  if (rateLimitCache.size > 0 && Math.random() < 0.01) {
    cleanupExpiredEntries(windowMs)
  }

  let entry = rateLimitCache.get(identifier)

  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 1, windowStart: now }
    rateLimitCache.set(identifier, entry)
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    }
  }

  entry.count++
  rateLimitCache.set(identifier, entry)

  return {
    allowed: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.windowStart + windowMs,
  }
}

// ============================================================================
// Rate limiting Redis (INCR + EXPIRE atomique)
// ============================================================================

/**
 * Rate limiting via Redis avec transaction MULTI/EXEC.
 *
 * La clé Redis suit le format "ratelimit:{identifier}" et expire
 * automatiquement après la fenêtre de temps. Chaque requête incrémente
 * le compteur de manière atomique (pas de race condition entre deux
 * requêtes simultanées).
 *
 * Retourne null si Redis n'est pas disponible (l'appelant doit
 * utiliser le fallback mémoire).
 */
async function checkRateLimitRedis(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  const redis = getRedisClient()
  if (!redis) return null

  const windowSeconds = Math.ceil(config.windowMs / 1000)
  const key = `ratelimit:${identifier}`

  try {
    // Transaction atomique : INCR et EXPIRE s'exécutent ensemble,
    // sans qu'une autre commande puisse s'intercaler entre les deux.
    const results = await redis
      .multi()
      .incr(key)
      .expire(key, windowSeconds)
      .ttl(key)
      .exec()

    if (!results) return null

    const count = results[0]?.[1] as number
    const ttl = results[2]?.[1] as number

    const resetAt =
      ttl > 0
        ? Date.now() + ttl * 1000
        : Date.now() + config.windowMs

    return {
      allowed: count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt,
    }
  } catch {
    // Redis a planté pendant la commande, on retourne null
    // pour que l'appelant utilise le fallback mémoire
    return null
  }
}

// ============================================================================
// API publique (même interface qu'avant, pas de breaking change)
// ============================================================================

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 1000,
}

/**
 * Vérifie et met à jour le rate limit pour un identifiant donné.
 *
 * Essaie d'abord Redis (compteur partagé entre toutes les instances),
 * puis fallback sur la Map en mémoire si Redis est indisponible.
 *
 * L'interface publique est identique à l'ancienne version :
 * les appelants n'ont pas besoin de changer leur code.
 *
 * @param identifier - Identifiant unique (généralement l'IP ou un hash)
 * @param config - Configuration du rate limiter (optionnel)
 * @returns Résultat de la vérification
 *
 * @example
 * ```typescript
 * import { checkRateLimit } from '@/lib/rate-limit'
 *
 * const ip = request.headers.get('x-forwarded-for') || 'unknown'
 * const result = await checkRateLimit(ip)
 *
 * if (!result.allowed) {
 *   return Response.json(
 *     { error: 'Trop de requêtes. Réessayez plus tard.' },
 *     { status: 429 }
 *   )
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<RateLimitResult> {
  // Tenter Redis en premier
  const redisResult = await checkRateLimitRedis(identifier, config)
  if (redisResult) return redisResult

  // Fallback mémoire si Redis est indisponible
  return checkRateLimitInMemory(identifier, config)
}

/**
 * Extrait l'adresse IP d'une requête Next.js
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]
    return firstIp ? firstIp.trim() : 'unknown'
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

/**
 * Génère les headers HTTP pour le rate limiting
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
  }
}

/**
 * Réinitialise le cache du rate limiter (tests uniquement)
 */
export function resetRateLimitCache(): void {
  rateLimitCache.clear()
}

/**
 * Récupère la taille actuelle du cache mémoire (tests et monitoring)
 */
export function getRateLimitCacheSize(): number {
  return rateLimitCache.size
}
