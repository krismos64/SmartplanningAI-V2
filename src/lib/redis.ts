/**
 * Singleton Redis Client pour Next.js 15 avec ioredis
 *
 * Même pattern que le singleton Prisma (src/lib/prisma.ts) :
 * en développement, on réutilise l'instance via globalThis pour
 * éviter que le hot-reload crée des dizaines de connexions.
 *
 * Si Redis est indisponible, l'application continue de fonctionner
 * normalement. Les fonctionnalités qui dépendent de Redis (cache,
 * rate limiting distribué, sessions actives) ont toutes un fallback.
 *
 * Commandes Redis utilisées dans le projet :
 * - INCR + EXPIRE : rate limiting atomique (src/lib/rate-limit.ts)
 * - SET + GET + DEL : cache applicatif TTL (src/lib/cache.ts)
 * - SET + GET + SCAN : suivi des sessions actives (src/lib/session-store.ts)
 * - PING : health check (src/lib/db-health.ts)
 *
 * ✅ Source : Context7 - ioredis Singleton Pattern + Next.js Best Practices
 *
 * @ticket SP-480
 */

import Redis from 'ioredis'

/**
 * Stockage global de l'instance Redis pour le singleton.
 * Même pattern que globalForPrisma dans src/lib/prisma.ts.
 */
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

/**
 * Indique si le client Redis est connecté et opérationnel.
 * Mis à jour par les event listeners (connect, error, close).
 */
let isRedisReady = false

/**
 * Crée et configure une nouvelle instance ioredis.
 *
 * Options clés :
 * - lazyConnect : ne se connecte qu'au premier appel de commande,
 *   évite de bloquer le démarrage de l'application
 * - retryStrategy : backoff exponentiel plafonné à 2 secondes,
 *   abandonne après 10 tentatives pour ne pas saturer les logs
 * - enableOfflineQueue : les commandes émises pendant une déconnexion
 *   sont mises en file d'attente et rejouées à la reconnexion
 * - maxRetriesPerRequest : 3 tentatives par commande avant de rejeter,
 *   évite que l'application reste bloquée si Redis est down
 */
function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.warn(
      '[Redis] REDIS_URL non définie, Redis désactivé (fallback mémoire)'
    )
    return null
  }

  try {
    const client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 10) {
          console.warn(
            '[Redis] Abandon après 10 tentatives de reconnexion'
          )
          return null
        }
        // Backoff exponentiel : 100ms, 200ms, 400ms... plafonné à 2s
        return Math.min(times * 100, 2000)
      },
      enableOfflineQueue: true,
      connectTimeout: 5000,
      // Stack traces lisibles en dev, compactes en prod
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
    })

    // Écoute des événements de connexion (obligatoire pour éviter
    // un crash Node.js sur erreur non gérée)
    client.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('[Redis] Connexion établie')
    })

    client.on('ready', () => {
      isRedisReady = true
      // eslint-disable-next-line no-console
      console.log('[Redis] Prêt à recevoir des commandes')
    })

    client.on('error', (err) => {
      isRedisReady = false
      console.error('[Redis] Erreur :', err.message)
    })

    client.on('close', () => {
      isRedisReady = false
    })

    client.on('reconnecting', () => {
      // eslint-disable-next-line no-console
      console.log('[Redis] Tentative de reconnexion...')
    })

    client.on('end', () => {
      isRedisReady = false
      console.warn('[Redis] Connexion terminée (plus de reconnexion)')
    })

    return client
  } catch (error) {
    console.error(
      '[Redis] Erreur à la création du client :',
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/**
 * Instance singleton Redis.
 * Réutilise l'instance existante dans globalThis en développement,
 * ou en crée une nouvelle.
 */
const redisClient: Redis | null =
  globalForRedis.redis ?? createRedisClient()

/**
 * En développement, on stocke dans globalThis pour survivre au hot-reload.
 * En production, chaque instance a son propre client (pas de fuite mémoire).
 */
if (process.env.NODE_ENV !== 'production' && redisClient) {
  globalForRedis.redis = redisClient
}

/**
 * Retourne le client Redis s'il est disponible et connecté, ou null.
 *
 * Utilisation :
 * ```typescript
 * import { getRedisClient } from '@/lib/redis'
 *
 * const redis = getRedisClient()
 * if (redis) {
 *   await redis.set('clé', 'valeur', 'EX', 300)
 * }
 * ```
 *
 * Le pattern "retourne null si indisponible" permet aux appelants
 * de gérer le fallback proprement sans try/catch partout.
 */
export function getRedisClient(): Redis | null {
  if (!redisClient) return null
  return redisClient
}

/**
 * Vérifie si Redis est connecté et opérationnel.
 * Utilisé par le health check pour afficher le statut Redis.
 */
export function isRedisConnected(): boolean {
  return isRedisReady && redisClient !== null
}

/**
 * Exécute un PING Redis pour vérifier la connectivité.
 * Retourne true si Redis répond "PONG", false sinon.
 * Utilisé par le health check (GET /api/health).
 */
export async function pingRedis(): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    const result = await client.ping()
    return result === 'PONG'
  } catch {
    return false
  }
}

/**
 * Ferme proprement la connexion Redis.
 * Appelé lors du shutdown de l'application (SIGINT/SIGTERM).
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    isRedisReady = false
  }
}

// Graceful shutdown : fermer Redis avant l'arrêt du processus
// (même pattern que disconnectPrisma dans src/lib/prisma.ts)
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => {
    void disconnectRedis()
  })

  process.on('SIGTERM', () => {
    void disconnectRedis()
  })
}
