/**
 * Utilitaires Prisma - Fonctions helper pour gestion DB
 *
 * ✅ Source : Context7 SP-105 - Prisma Best Practices
 *
 * OBJECTIF (CDA) :
 * Centraliser les fonctions utilitaires pour :
 * - Test de connexion DB
 * - Gestion des erreurs Prisma
 * - Reconnexion automatique
 * - Statistiques du pool de connexions
 * - Helpers de debugging
 *
 * UTILISATION :
 * Import dans les Server Actions, API Routes, ou scripts de maintenance
 *
 * ```typescript
 * import { checkConnection, handlePrismaError } from '@/lib/prisma-utils'
 *
 * try {
 *   const isConnected = await checkConnection()
 *   if (!isConnected) throw new Error('DB non disponible')
 * } catch (error) {
 *   const errorResponse = handlePrismaError(error)
 *   return errorResponse
 * }
 * ```
 */

import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Type pour la réponse d'erreur standardisée
 *
 * Permet de retourner des erreurs formatées de manière cohérente
 * dans toute l'application (API routes, Server Actions)
 */
export type ErrorResponse = {
  success: false
  error: string
  code?: string
  meta?: Record<string, unknown>
}

/**
 * Type pour les statistiques du pool de connexions
 *
 * Retourné par getDatabaseStats() pour monitoring
 */
export type DatabaseStats = {
  timestamp: Date
  isConnected: boolean
  poolSize?: number
  activeConnections?: number
  idleConnections?: number
  waitingRequests?: number
}

/**
 * Vérifie la connexion à la base de données
 *
 * Effectue une query simple ($queryRaw) pour s'assurer que :
 * - La connexion DB est établie
 * - PostgreSQL répond correctement
 * - Pas de problème réseau
 *
 * UTILISATION :
 * - Dans les health checks (API /api/health)
 * - Au démarrage de l'application
 * - Avant des opérations critiques
 *
 * @returns Promise<boolean> - true si connecté, false sinon
 *
 * ✅ Source Context7 : Database Connection Health Check Pattern
 */
export async function checkConnection(): Promise<boolean> {
  try {
    // Query simple pour tester la connexion
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('❌ Erreur de connexion DB:', error)
    return false
  }
}

/**
 * Établit une connexion explicite à la DB
 *
 * Force Prisma à se connecter immédiatement au lieu d'attendre
 * la première query. Utile pour :
 * - Warm-up de connexion au démarrage
 * - Validation de DATABASE_URL
 * - Tests de connectivité
 *
 * @throws Error si la connexion échoue
 *
 * ✅ Source Context7 : Prisma Connection Management
 */
export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect()
    // eslint-disable-next-line no-console
    console.log('✅ Connexion Prisma établie')
  } catch (error) {
    console.error('❌ Échec connexion Prisma:', error)
    throw new Error('Impossible de se connecter à la base de données')
  }
}

/**
 * Déconnecte proprement de la base de données
 *
 * Ferme toutes les connexions actives du pool.
 * À utiliser :
 * - À l'arrêt de l'application (graceful shutdown)
 * - Dans les tests (cleanup)
 * - Lors de changements de configuration DB
 *
 * @throws Error si la déconnexion échoue
 *
 * ✅ Source Context7 : Graceful Shutdown Pattern
 */
export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect()
    // eslint-disable-next-line no-console
    console.log('✅ Prisma déconnecté proprement')
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error)
    throw new Error('Erreur lors de la déconnexion de la base de données')
  }
}

/**
 * Récupère les statistiques du pool de connexions
 *
 * Utilise prisma.$metrics.json() pour obtenir :
 * - Nombre de connexions actives
 * - Connexions idle (en attente)
 * - Requêtes en attente
 * - Pool size configuré
 *
 * UTILISATION :
 * - Monitoring en production
 * - Debugging de performance
 * - Alerting si pool saturé
 *
 * @returns Promise<DatabaseStats>
 *
 * ✅ Source Context7 : Prisma Connection Pool Metrics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  const stats: DatabaseStats = {
    timestamp: new Date(),
    isConnected: await checkConnection(),
  }

  try {
    // Récupérer les métriques du pool (si disponible en dev)
    // Note : $metrics nécessite previewFeatures = ["metrics"] dans schema.prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const prismaWithMetrics = prisma as any

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      prismaWithMetrics.$metrics &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof prismaWithMetrics.$metrics.json === 'function'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const metrics = await prismaWithMetrics.$metrics.json()

      // Parser les métriques pour extraire les infos du pool
      // Note : Structure peut varier selon version Prisma
      if (metrics && typeof metrics === 'object') {
        stats.poolSize = extractPoolMetric(metrics, 'pool_size')
        stats.activeConnections = extractPoolMetric(
          metrics,
          'active_connections'
        )
        stats.idleConnections = extractPoolMetric(metrics, 'idle_connections')
        stats.waitingRequests = extractPoolMetric(metrics, 'waiting_requests')
      }
    }
  } catch (error) {
    console.warn('⚠️ Impossible de récupérer les métriques:', error)
    // On continue même si les métriques ne sont pas dispo
  }

  return stats
}

/**
 * Helper pour extraire une métrique spécifique du JSON
 * (fonction interne)
 */
function extractPoolMetric(
  metrics: unknown,
  metricName: string
): number | undefined {
  // Implémentation simplifiée - à adapter selon structure réelle
  if (metrics && typeof metrics === 'object' && metricName in metrics) {
    const value = (metrics as Record<string, unknown>)[metricName]
    return typeof value === 'number' ? value : undefined
  }
  return undefined
}

/**
 * Gère les erreurs Prisma de manière centralisée
 *
 * Convertit les erreurs Prisma en réponses standardisées pour :
 * - Meilleur debugging
 * - Messages utilisateur clairs
 * - Logging structuré
 * - Codes d'erreur cohérents
 *
 * CODES PRISMA GÉRÉS :
 * - P2002 : Violation contrainte unique (duplicate)
 * - P2025 : Record non trouvé (NotFound)
 * - P2003 : Violation foreign key
 * - P1001 : Connexion DB impossible
 * - P1008 : Timeout opération
 *
 * @param error - L'erreur à gérer (any pour flexibilité)
 * @returns ErrorResponse - Objet erreur standardisé
 *
 * ✅ Source Context7 : Prisma Error Handling Patterns
 */
export function handlePrismaError(error: unknown): ErrorResponse {
  // Erreur Prisma connue (avec code)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Violation contrainte unique
        return {
          success: false,
          error: 'Cette valeur existe déjà',
          code: 'DUPLICATE_VALUE',
          meta: {
            field: error.meta?.target || 'unknown',
            prismaCode: error.code,
          },
        }

      case 'P2025':
        // Record non trouvé
        return {
          success: false,
          error: 'Élément non trouvé',
          code: 'NOT_FOUND',
          meta: {
            prismaCode: error.code,
          },
        }

      case 'P2003':
        // Violation foreign key
        return {
          success: false,
          error: 'Référence invalide ou suppression impossible',
          code: 'FOREIGN_KEY_VIOLATION',
          meta: {
            field: error.meta?.field_name || 'unknown',
            prismaCode: error.code,
          },
        }

      case 'P1001':
        // Connexion impossible
        return {
          success: false,
          error: 'Impossible de se connecter à la base de données',
          code: 'CONNECTION_ERROR',
          meta: {
            prismaCode: error.code,
          },
        }

      case 'P1008':
        // Timeout
        return {
          success: false,
          error: 'Opération trop longue (timeout)',
          code: 'TIMEOUT',
          meta: {
            prismaCode: error.code,
          },
        }

      default:
        // Autre erreur Prisma avec code
        return {
          success: false,
          error: error.message || 'Erreur base de données',
          code: 'PRISMA_ERROR',
          meta: {
            prismaCode: error.code,
          },
        }
    }
  }

  // Erreur Prisma validation
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      success: false,
      error: 'Données invalides',
      code: 'VALIDATION_ERROR',
      meta: {
        message: error.message,
      },
    }
  }

  // Erreur Prisma initialisation
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      success: false,
      error: 'Erreur de configuration Prisma',
      code: 'INITIALIZATION_ERROR',
      meta: {
        errorCode: error.errorCode,
      },
    }
  }

  // Erreur Prisma Rust panic
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      success: false,
      error: 'Erreur interne Prisma (panic)',
      code: 'RUST_PANIC',
    }
  }

  // Erreur JavaScript standard
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR',
    }
  }

  // Erreur inconnue
  return {
    success: false,
    error: 'Une erreur inattendue est survenue',
    code: 'UNEXPECTED_ERROR',
  }
}

/**
 * Formate une erreur pour le logging (format JSON structuré)
 *
 * Utile pour intégration avec services de logging externes
 * (Sentry, Datadog, CloudWatch, etc.)
 *
 * @param error - L'erreur à logger
 * @returns Objet JSON stringifié
 */
export function logPrismaError(error: unknown): string {
  const errorResponse = handlePrismaError(error)

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    source: 'prisma',
    ...errorResponse,
  }

  return JSON.stringify(logEntry, null, 2)
}

/**
 * Teste si Prisma peut effectuer une transaction
 *
 * Utile pour vérifier que la DB supporte les transactions
 * avant d'exécuter des opérations critiques
 *
 * @returns Promise<boolean>
 */
export async function canPerformTransactions(): Promise<boolean> {
  try {
    await prisma.$transaction([prisma.$queryRaw`SELECT 1`])
    return true
  } catch (error) {
    console.error('❌ Transactions non disponibles:', error)
    return false
  }
}
