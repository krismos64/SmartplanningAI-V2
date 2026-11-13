/**
 * Rate Limiter avec Redis (fallback mémoire)
 *
 * @ticket SP-288
 * @description Limite le nombre de requêtes par IP sur une fenêtre de temps.
 *
 * Stratégie :
 * - Si Redis est disponible, utilise SET NX EX + INCR atomique : la fenêtre
 *   s'ouvre à la première requête et ne se prolonge pas (SP-610).
 *   Avantage : fonctionne même avec plusieurs instances de l'application
 *   derrière un load balancer (les compteurs sont partagés).
 * - Si Redis est indisponible, fallback sur une Map JavaScript en mémoire.
 *   Le rate limiting fonctionne toujours, mais uniquement par instance.
 *
 * Commandes Redis utilisées :
 * - MULTI/EXEC : transaction atomique (pas d'état incohérent entre les commandes)
 * - SET clé 0 EX fenêtre NX : crée la clé avec son TTL si elle n'existe pas, ne touche à rien sinon
 * - INCR : incrémente le compteur de requêtes
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
    // Transaction atomique. SET ... NX ne pose le TTL qu'à la création de la
    // clé. L'ancien EXPIRE, rejoué à chaque appel, repoussait la fin de la
    // fenêtre à chaque tentative (SP-610) : un appelant régulier restait
    // bloqué indéfiniment, et resetAt annonçait une échéance qui reculait.
    const results = await redis
      .multi()
      .set(key, 0, 'EX', windowSeconds, 'NX')
      .incr(key)
      .ttl(key)
      .exec()

    if (!results) return null

    const count = results[1]?.[1] as number
    const ttl = results[2]?.[1] as number

    const resetAt =
      ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + config.windowMs

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
 * Rend une unité au compteur d'un identifiant (SP-610).
 *
 * Sert aux limites qui réservent avant de vérifier, comme la connexion :
 * la tentative est comptée d'abord (checkRateLimit), puis rendue si elle
 * réussit. Compter après coup laisserait passer une rafale de tentatives
 * simultanées, toutes lues sous le plafond avant qu'aucune ne soit comptée.
 *
 * Sans effet si le compteur n'existe pas : un DECR nu créerait une clé
 * négative et sans expiration.
 */
export async function releaseRateLimit(identifier: string): Promise<void> {
  const entry = rateLimitCache.get(identifier)
  if (entry) {
    entry.count = Math.max(0, entry.count - 1)
  }

  const redis = getRedisClient()
  if (!redis) return
  try {
    await redis.eval(
      "if redis.call('exists', KEYS[1]) == 1 and tonumber(redis.call('get', KEYS[1])) > 0 then return redis.call('decr', KEYS[1]) end return 0",
      1,
      `ratelimit:${identifier}`
    )
  } catch {
    // Le compteur expirera de lui-même
  }
}

/**
 * Efface le compteur d'un identifiant (SP-610), par exemple après une
 * connexion réussie.
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  rateLimitCache.delete(identifier)
  const redis = getRedisClient()
  if (!redis) return
  try {
    await redis.del(`ratelimit:${identifier}`)
  } catch {
    // Le compteur expirera de lui-même
  }
}

/**
 * Extrait l'adresse IP d'une requête Next.js
 *
 * `x-real-ip` d'abord : Nginx l'écrit lui-même depuis `$remote_addr`, le
 * client ne peut pas le choisir. `x-forwarded-for` est complété par Nginx
 * (`$proxy_add_x_forwarded_for`), sa première valeur est donc celle que le
 * client a envoyée : s'y fier permettait de changer de quota à chaque
 * requête (SP-610).
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]
    return firstIp ? firstIp.trim() : 'unknown'
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
