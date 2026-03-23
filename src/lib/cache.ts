/**
 * Cache applicatif générique avec Redis
 *
 * Fournit un système de cache simple avec TTL (Time To Live) pour
 * éviter de recalculer des données coûteuses à chaque requête.
 *
 * Par exemple, les statistiques du dashboard directeur font des jointures
 * lourdes sur plusieurs tables. En les cachant 5 minutes dans Redis,
 * on réduit la charge sur PostgreSQL et on accélère l'affichage.
 *
 * Convention de nommage des clés :
 * - "dashboard:director:{companyId}" (stats directeur, TTL 300s)
 * - "dashboard:manager:{companyId}:{managerId}" (stats manager, TTL 300s)
 * - "dashboard:employee:{companyId}:{employeeId}" (stats employé, TTL 300s)
 * - "employees:list:{companyId}:{page}:{pageSize}" (listing, TTL 120s)
 * - "leaves:list:{companyId}:{status}:{page}" (congés, TTL 60s)
 *
 * Le companyId est TOUJOURS inclus dans la clé pour garantir
 * l'isolation multi-tenant (un tenant ne voit jamais le cache d'un autre).
 *
 * Commandes Redis utilisées :
 * - SET + EX : stocker une valeur avec expiration automatique
 * - GET : récupérer une valeur cachée
 * - SCAN + DEL : invalider les clés par pattern (ex: "dashboard:*:companyXYZ*")
 *
 * Si Redis est indisponible, toutes les fonctions échouent silencieusement
 * et les données sont recalculées normalement depuis PostgreSQL.
 *
 * ✅ Source : Context7 - ioredis caching patterns + SCAN best practices
 *
 * @ticket SP-480
 */

import { getRedisClient } from '@/lib/redis'

// Préfixe global pour distinguer les clés de cache des autres usages Redis
const CACHE_PREFIX = 'cache:'

/**
 * Stocke une valeur dans le cache Redis avec un TTL en secondes.
 *
 * La valeur est sérialisée en JSON avant stockage.
 * Si Redis est down, la fonction ne fait rien (pas de crash).
 */
export async function setCacheValue(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    await redis.set(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(value),
      'EX',
      ttlSeconds
    )
  } catch {
    // Redis down : on ne cache pas, les données seront recalculées
  }
}

/**
 * Récupère une valeur depuis le cache Redis.
 *
 * Retourne null si la clé n'existe pas (cache miss),
 * si le TTL est expiré, ou si Redis est indisponible.
 */
export async function getCacheValue<T>(key: string): Promise<T | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const data = await redis.get(`${CACHE_PREFIX}${key}`)
    if (!data) return null
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

/**
 * Invalide (supprime) toutes les clés correspondant à un pattern.
 *
 * Utilise SCAN au lieu de KEYS pour ne pas bloquer Redis.
 * Les clés sont supprimées par lots via pipeline pour la performance.
 *
 * Exemple : invalidateCache("dashboard:*:companyABC*") supprime
 * toutes les entrées de cache des dashboards de l'entreprise ABC.
 *
 * @param pattern - Pattern glob Redis (ex: "dashboard:*:companyXYZ*")
 * @returns Nombre de clés supprimées
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const redis = getRedisClient()
  if (!redis) return 0

  let deleted = 0

  try {
    const stream = redis.scanStream({
      match: `${CACHE_PREFIX}${pattern}`,
      count: 100,
    })

    for await (const rawKeys of stream) {
      const keys = rawKeys as string[]
      if (keys.length === 0) continue

      const pipeline = redis.pipeline()
      for (const key of keys) {
        pipeline.del(key)
      }
      const results = await pipeline.exec()
      if (results) {
        deleted += results.length
      }
    }
  } catch {
    // Redis down : l'invalidation est impossible, les clés expireront via TTL
  }

  return deleted
}

/**
 * Wrapper "cache-aside" : vérifie le cache avant d'exécuter une fonction.
 *
 * C'est la fonction la plus utilisée dans le projet. Le pattern est :
 * 1. Chercher dans Redis si le résultat est déjà en cache
 * 2. Si oui (cache hit), retourner le résultat sans toucher à PostgreSQL
 * 3. Si non (cache miss), exécuter la fonction, stocker le résultat dans Redis,
 *    puis retourner le résultat
 *
 * Si Redis est indisponible, la fonction est exécutée normalement à chaque fois,
 * comme si le cache n'existait pas.
 *
 * @param key - Clé de cache (doit inclure le companyId pour le multi-tenant)
 * @param ttlSeconds - Durée de vie en secondes
 * @param fn - Fonction async qui récupère les données (appel Prisma, etc.)
 * @returns Le résultat (du cache ou fraîchement calculé)
 *
 * @example
 * ```typescript
 * const stats = await withCache(
 *   `dashboard:director:${companyId}`,
 *   300, // 5 minutes
 *   () => getDirectorStats({ userId, companyId })
 * )
 * ```
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  // Tenter de lire depuis le cache
  const cached = await getCacheValue<T>(key)
  if (cached !== null) return cached

  // Cache miss : exécuter la fonction
  const result = await fn()

  // Stocker le résultat dans le cache (fire-and-forget)
  setCacheValue(key, result, ttlSeconds).catch(() => {
    // Silencieux si Redis est down
  })

  return result
}

// ============================================================================
// Helpers d'invalidation par domaine métier
// ============================================================================
// Ces fonctions simplifient l'invalidation du cache dans les Server Actions.
// Quand un employé est créé/modifié/supprimé, on invalide les dashboards
// et les listes qui pourraient contenir des données obsolètes.

/**
 * Invalide le cache des dashboards pour une entreprise.
 * À appeler après toute modification qui impacte les statistiques
 * (création/modification/suppression d'employé, congé validé, etc.)
 */
export async function invalidateDashboardCache(
  companyId: string
): Promise<void> {
  await invalidateCache(`dashboard:*${companyId}*`)
}

/**
 * Invalide le cache des listes d'employés pour une entreprise.
 * À appeler après création/modification/suppression d'un employé.
 */
export async function invalidateEmployeesCache(
  companyId: string
): Promise<void> {
  await invalidateCache(`employees:*${companyId}*`)
}

/**
 * Invalide le cache des listes de congés pour une entreprise.
 * À appeler après création/validation/refus/annulation d'un congé.
 */
export async function invalidateLeavesCache(companyId: string): Promise<void> {
  await invalidateCache(`leaves:*${companyId}*`)
}
