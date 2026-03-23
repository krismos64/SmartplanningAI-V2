/**
 * Suivi des sessions actives dans Redis
 *
 * Le JWT reste le mécanisme d'authentification principal (stateless),
 * mais Redis garde une trace des sessions actives pour :
 * - Savoir combien d'utilisateurs sont connectés en temps réel
 * - Afficher la liste des sessions actives dans le dashboard admin
 * - Détecter les connexions simultanées suspectes
 *
 * Commandes Redis utilisées :
 * - SET avec EX (TTL) : enregistrer une session avec expiration automatique (24h)
 * - GET : récupérer les métadonnées d'une session
 * - DEL : supprimer une session à la déconnexion
 * - SCAN : lister toutes les sessions actives (sans bloquer Redis)
 *
 * Si Redis est indisponible, toutes les fonctions échouent silencieusement.
 * L'authentification JWT continue de fonctionner normalement sans Redis.
 *
 * ✅ Source : Context7 - ioredis SET/GET/SCAN patterns
 *
 * @ticket SP-480
 */

import { getRedisClient } from '@/lib/redis'

// Préfixe pour les clés de session dans Redis.
// Permet de les distinguer des clés de cache et de rate limiting,
// et de les lister facilement avec SCAN match "session:*".
const SESSION_PREFIX = 'session:'

// Durée de vie d'une session : 24 heures en secondes.
// Après 24h sans activité, la session disparaît automatiquement de Redis.
const SESSION_TTL_SECONDS = 86400

/**
 * Métadonnées stockées pour chaque session active.
 * Ces données sont purement informatives (monitoring et sécurité),
 * elles ne servent pas à l'authentification elle-même (c'est le JWT qui fait ça).
 */
export interface SessionMetadata {
  userId: string
  email: string
  role: string
  companyId: string | null
  loginAt: string // ISO 8601
  lastSeenAt: string // ISO 8601, mis à jour à chaque rafraîchissement JWT
  ip: string
  userAgent: string
}

/**
 * Enregistre une session active dans Redis.
 *
 * Appelé lors de la connexion (callback authorize de NextAuth)
 * et lors du rafraîchissement du JWT (callback jwt de NextAuth).
 *
 * La clé expire automatiquement après 24h grâce au TTL Redis.
 * Si l'utilisateur se reconnecte avant l'expiration, la session
 * est écrasée avec les nouvelles métadonnées et le TTL est remis à 24h.
 */
export async function registerSession(
  userId: string,
  metadata: Omit<SessionMetadata, 'userId'>
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  const key = `${SESSION_PREFIX}${userId}`
  const data: SessionMetadata = { userId, ...metadata }

  try {
    // SET avec EX : stocke la valeur ET définit le TTL en une seule commande atomique
    await redis.set(key, JSON.stringify(data), 'EX', SESSION_TTL_SECONDS)
  } catch {
    // Redis down : on ne fait rien, le JWT fonctionne sans
  }
}

/**
 * Supprime une session de Redis.
 *
 * Appelé lors de la déconnexion (event signOut de NextAuth).
 * La session disparaît immédiatement au lieu d'attendre l'expiration du TTL.
 */
export async function removeSession(userId: string): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    await redis.del(`${SESSION_PREFIX}${userId}`)
  } catch {
    // Redis down : la session expirera naturellement via le TTL
  }
}

/**
 * Récupère les métadonnées d'une session active.
 *
 * Retourne null si la session n'existe pas (utilisateur déconnecté
 * ou session expirée) ou si Redis est indisponible.
 */
export async function getActiveSession(
  userId: string
): Promise<SessionMetadata | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const data = await redis.get(`${SESSION_PREFIX}${userId}`)
    if (!data) return null
    return JSON.parse(data) as SessionMetadata
  } catch {
    return null
  }
}

/**
 * Liste toutes les sessions actives.
 *
 * Utilise SCAN au lieu de KEYS pour ne pas bloquer Redis
 * quand il y a beaucoup de clés. SCAN parcourt les clés
 * par petits lots (100 par itération) de manière non bloquante.
 *
 * Utilisé par le dashboard SYSTEM_ADMIN pour voir qui est connecté.
 */
export async function getActiveSessions(): Promise<SessionMetadata[]> {
  const redis = getRedisClient()
  if (!redis) return []

  const sessions: SessionMetadata[] = []

  try {
    const stream = redis.scanStream({
      match: `${SESSION_PREFIX}*`,
      count: 100,
    })

    for await (const rawKeys of stream) {
      const keys = rawKeys as string[]
      if (keys.length === 0) continue

      // Pipeline : récupère toutes les valeurs en un seul aller-retour réseau
      // au lieu de faire un GET par clé (beaucoup plus rapide)
      const pipeline = redis.pipeline()
      for (const key of keys) {
        pipeline.get(key)
      }
      const results = await pipeline.exec()

      if (results) {
        for (const [err, value] of results) {
          if (!err && typeof value === 'string') {
            try {
              sessions.push(JSON.parse(value) as SessionMetadata)
            } catch {
              // Donnée corrompue, on ignore
            }
          }
        }
      }
    }
  } catch {
    // Redis down : retourne une liste vide
  }

  return sessions
}
