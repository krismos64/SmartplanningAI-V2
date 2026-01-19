/**
 * Rate Limiter simple en mémoire
 *
 * @ticket SP-288
 * @description Limite le nombre de requêtes par IP sur une fenêtre de temps
 *
 * ✅ Source : Context7 - Next.js API Routes Rate Limiting Best Practices
 *
 * ATTENTION : Ce rate limiter utilise la mémoire du processus Node.js.
 * En production avec plusieurs instances, préférer Redis ou Upstash.
 * Pour un formulaire de contact, cette implémentation est suffisante.
 */

import type { RateLimitConfig, RateLimitResult } from '@/types/contact'

/**
 * Structure pour stocker les données de rate limiting par IP
 */
interface RateLimitEntry {
  /** Nombre de requêtes effectuées */
  count: number
  /** Timestamp de début de la fenêtre */
  windowStart: number
}

/**
 * Cache en mémoire pour le rate limiting
 * Map<identifiant, RateLimitEntry>
 */
const rateLimitCache = new Map<string, RateLimitEntry>()

/**
 * Configuration par défaut du rate limiter
 * 5 requêtes par minute
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
}

/**
 * Nettoie les entrées expirées du cache
 * Appelé périodiquement pour éviter les fuites mémoire
 */
function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitCache.entries()) {
    if (now - entry.windowStart > windowMs) {
      rateLimitCache.delete(key)
    }
  }
}

/**
 * Vérifie et met à jour le rate limit pour un identifiant donné
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
 * const result = checkRateLimit(ip)
 *
 * if (!result.allowed) {
 *   return Response.json(
 *     { error: 'Trop de requêtes. Réessayez plus tard.' },
 *     { status: 429 }
 *   )
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult {
  const now = Date.now()
  const { maxRequests, windowMs } = config

  // Nettoyer les entrées expirées toutes les 100 vérifications
  if (rateLimitCache.size > 0 && Math.random() < 0.01) {
    cleanupExpiredEntries(windowMs)
  }

  // Récupérer ou créer l'entrée pour cet identifiant
  let entry = rateLimitCache.get(identifier)

  // Si pas d'entrée ou fenêtre expirée, créer une nouvelle entrée
  if (!entry || now - entry.windowStart > windowMs) {
    entry = {
      count: 1,
      windowStart: now,
    }
    rateLimitCache.set(identifier, entry)

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    }
  }

  // Incrémenter le compteur
  entry.count++
  rateLimitCache.set(identifier, entry)

  // Vérifier si la limite est dépassée
  const allowed = entry.count <= maxRequests
  const remaining = Math.max(0, maxRequests - entry.count)
  const resetAt = entry.windowStart + windowMs

  return {
    allowed,
    remaining,
    resetAt,
  }
}

/**
 * Extrait l'adresse IP d'une requête Next.js
 *
 * @param request - Objet Request de l'API route
 * @returns Adresse IP ou 'unknown'
 */
export function getClientIp(request: Request): string {
  // En production derrière un proxy (Nginx, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
    // La première est l'IP du client original
    const firstIp = forwardedFor.split(',')[0]
    return firstIp ? firstIp.trim() : 'unknown'
  }

  // Header alternatif
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // Fallback
  return 'unknown'
}

/**
 * Génère les headers HTTP pour le rate limiting
 *
 * @param result - Résultat de la vérification
 * @returns Headers à ajouter à la réponse
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
  }
}

/**
 * Réinitialise le cache du rate limiter
 * Utilisé principalement pour les tests
 */
export function resetRateLimitCache(): void {
  rateLimitCache.clear()
}

/**
 * Récupère la taille actuelle du cache
 * Utilisé pour le monitoring et les tests
 */
export function getRateLimitCacheSize(): number {
  return rateLimitCache.size
}
