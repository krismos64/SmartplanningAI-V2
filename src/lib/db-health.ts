/**
 * Database Health Check - Vérification état base de données
 *
 * ✅ Source : Context7 SP-105 - Prisma Monitoring Best Practices
 *
 * OBJECTIF (CDA) :
 * Health check complet de la base de données pour :
 * - Monitoring production (uptime, alertes)
 * - Debugging problèmes de connexion
 * - Métriques de performance
 * - Intégration avec services externes (Pingdom, UptimeRobot)
 *
 * UTILISATION :
 * ```typescript
 * import { checkDatabaseHealth } from '@/lib/db-health'
 *
 * const health = await checkDatabaseHealth()
 *
 * if (health.status === 'unhealthy') {
 *   // Envoyer alerte
 *   // Logger l'erreur
 *   // Activer mode dégradé
 * }
 * ```
 *
 * INTÉGRATION :
 * - API Route : GET /api/health
 * - Monitoring externe : webhook vers /api/health
 * - Scripts cron : vérification périodique
 */

import { checkConnection, getDatabaseStats } from './prisma-utils'
import { prisma } from './prisma'

/**
 * Statut global du health check
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

/**
 * Résultat complet du health check
 *
 * Contient toutes les informations nécessaires pour :
 * - Afficher un dashboard de santé
 * - Déclencher des alertes
 * - Logger les métriques
 * - Débugger les problèmes
 */
export type HealthCheckResult = {
  status: HealthStatus
  timestamp: Date
  checks: {
    connection: HealthCheck
    latency: HealthCheck
    migrations: HealthCheck
    poolSize: HealthCheck
  }
  metrics: {
    latency: number
    activeConnections?: number
    idleConnections?: number
    uptime?: number
  }
  error?: string
}

/**
 * Résultat d'un check individuel
 */
type HealthCheck = {
  status: 'pass' | 'warn' | 'fail'
  message: string
  value?: number | string | boolean
}

/**
 * Seuils de performance configurables
 *
 * Permet d'adapter les alertes selon l'environnement :
 * - Dev : seuils plus souples
 * - Prod : seuils stricts pour garantir SLA
 */
const THRESHOLDS = {
  latencyWarning: 100, // ms - warning si > 100ms
  latencyCritical: 500, // ms - critical si > 500ms
  poolUsageWarning: 0.8, // 80% du pool = warning
  poolUsageCritical: 0.95, // 95% du pool = critical
}

/**
 * Effectue un health check complet de la base de données
 *
 * VÉRIFICATIONS :
 * 1. Connexion - La DB est-elle accessible ?
 * 2. Latence - Temps de réponse acceptable ?
 * 3. Migrations - Schema à jour ?
 * 4. Pool Size - Connexions disponibles ?
 *
 * STATUTS RETOURNÉS :
 * - 'healthy' : Tout fonctionne parfaitement (✅)
 * - 'degraded' : Warnings mais fonctionnel (⚠️)
 * - 'unhealthy' : Erreurs critiques, DB non utilisable (❌)
 *
 * @returns Promise<HealthCheckResult>
 *
 * ✅ Source Context7 : Database Health Check Pattern
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now()

  // Initialiser le résultat avec valeurs par défaut
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date(),
    checks: {
      connection: {
        status: 'fail',
        message: 'Non testé',
      },
      latency: {
        status: 'fail',
        message: 'Non testé',
      },
      migrations: {
        status: 'pass',
        message: 'Non applicable en runtime',
      },
      poolSize: {
        status: 'pass',
        message: 'Informations non disponibles',
      },
    },
    metrics: {
      latency: 0,
    },
  }

  try {
    // ═══════════════════════════════════════════════════════════
    // CHECK 1 : CONNEXION
    // ═══════════════════════════════════════════════════════════
    const isConnected = await checkConnection()
    const latency = Date.now() - startTime

    result.checks.connection = {
      status: isConnected ? 'pass' : 'fail',
      message: isConnected
        ? 'Connexion établie'
        : 'Impossible de se connecter à la base de données',
      value: isConnected,
    }

    if (!isConnected) {
      result.status = 'unhealthy'
      result.error = 'Database connection failed'
      return result
    }

    // ═══════════════════════════════════════════════════════════
    // CHECK 2 : LATENCE
    // ═══════════════════════════════════════════════════════════
    result.metrics.latency = latency

    if (latency > THRESHOLDS.latencyCritical) {
      result.checks.latency = {
        status: 'fail',
        message: `Latence critique (${latency}ms > ${THRESHOLDS.latencyCritical}ms)`,
        value: latency,
      }
      result.status = 'unhealthy'
    } else if (latency > THRESHOLDS.latencyWarning) {
      result.checks.latency = {
        status: 'warn',
        message: `Latence élevée (${latency}ms > ${THRESHOLDS.latencyWarning}ms)`,
        value: latency,
      }
      if (result.status === 'healthy') {
        result.status = 'degraded'
      }
    } else {
      result.checks.latency = {
        status: 'pass',
        message: `Latence OK (${latency}ms)`,
        value: latency,
      }
    }

    // ═══════════════════════════════════════════════════════════
    // CHECK 3 : MIGRATIONS
    // ═══════════════════════════════════════════════════════════
    // En runtime, on ne peut pas vérifier l'état des migrations
    // sans interroger la table _prisma_migrations directement.
    // Cela nécessiterait un accès direct à la DB.
    // On laisse en 'pass' pour indiquer que c'est géré en CI/CD.

    try {
      // Vérification basique : est-ce qu'on peut requêter une table ?
      await prisma.user.count()
      result.checks.migrations = {
        status: 'pass',
        message: 'Schéma DB accessible',
      }
    } catch {
      result.checks.migrations = {
        status: 'fail',
        message: "Impossible d'accéder au schéma (migrations manquantes ?)",
      }
      result.status = 'unhealthy'
    }

    // ═══════════════════════════════════════════════════════════
    // CHECK 4 : POOL SIZE
    // ═══════════════════════════════════════════════════════════
    try {
      const stats = await getDatabaseStats()

      result.metrics.activeConnections = stats.activeConnections
      result.metrics.idleConnections = stats.idleConnections

      if (stats.poolSize && stats.activeConnections !== undefined) {
        const poolUsage = stats.activeConnections / stats.poolSize

        if (poolUsage > THRESHOLDS.poolUsageCritical) {
          result.checks.poolSize = {
            status: 'fail',
            message: `Pool saturé (${Math.round(poolUsage * 100)}%)`,
            value: `${stats.activeConnections}/${stats.poolSize}`,
          }
          result.status = 'unhealthy'
        } else if (poolUsage > THRESHOLDS.poolUsageWarning) {
          result.checks.poolSize = {
            status: 'warn',
            message: `Pool usage élevé (${Math.round(poolUsage * 100)}%)`,
            value: `${stats.activeConnections}/${stats.poolSize}`,
          }
          if (result.status === 'healthy') {
            result.status = 'degraded'
          }
        } else {
          result.checks.poolSize = {
            status: 'pass',
            message: `Pool disponible (${Math.round(poolUsage * 100)}%)`,
            value: `${stats.activeConnections}/${stats.poolSize}`,
          }
        }
      } else {
        result.checks.poolSize = {
          status: 'pass',
          message: 'Métriques pool non disponibles',
        }
      }
    } catch {
      // Les métriques ne sont pas critiques, on continue
      result.checks.poolSize = {
        status: 'pass',
        message: 'Métriques non disponibles (normal en prod)',
      }
    }
  } catch (error) {
    // Erreur globale du health check
    result.status = 'unhealthy'
    result.error =
      error instanceof Error
        ? error.message
        : 'Erreur inconnue lors du health check'

    result.checks.connection = {
      status: 'fail',
      message: 'Erreur lors de la vérification',
    }
  }

  return result
}

/**
 * Version simplifiée du health check pour endpoints rapides
 *
 * Effectue uniquement un test de connexion basique.
 * Utile pour :
 * - Load balancers (besoin de réponse < 1s)
 * - Monitoring haute fréquence (toutes les 10s)
 * - Health checks Kubernetes
 *
 * @returns Promise<boolean> - true si healthy, false sinon
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    return await checkConnection()
  } catch {
    return false
  }
}

/**
 * Formate le résultat du health check en texte lisible
 *
 * Utile pour :
 * - Logs serveur
 * - Emails d'alerte
 * - Messages Slack/Teams
 *
 * @param result - Résultat du health check
 * @returns string - Texte formaté
 */
export function formatHealthCheckResult(result: HealthCheckResult): string {
  const statusEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌',
  }

  const checkEmoji = {
    pass: '✅',
    warn: '⚠️',
    fail: '❌',
  }

  let output = `\n${statusEmoji[result.status]} Database Health: ${result.status.toUpperCase()}\n`
  output += `Timestamp: ${result.timestamp.toISOString()}\n`
  output += `Latency: ${result.metrics.latency}ms\n\n`

  output += 'Checks:\n'
  Object.entries(result.checks).forEach(([name, check]) => {
    output += `  ${checkEmoji[check.status]} ${name}: ${check.message}\n`
  })

  if (result.error) {
    output += `\n❌ Error: ${result.error}\n`
  }

  return output
}
