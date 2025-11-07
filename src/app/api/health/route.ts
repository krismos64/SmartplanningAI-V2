/**
 * API Route Health Check - Endpoint monitoring base de données
 *
 * ✅ Source : Context7 SP-105 - Next.js 15 API Routes + Prisma Monitoring
 *
 * OBJECTIF (CDA) :
 * Exposer un endpoint HTTP pour monitorer l'état de la base de données.
 * Utilisé par :
 * - Services de monitoring externe (Pingdom, UptimeRobot, Datadog)
 * - Load balancers (vérification santé des instances)
 * - Dashboards internes de monitoring
 * - Scripts d'alerte automatiques
 *
 * ENDPOINT : GET /api/health
 *
 * RÉPONSES :
 * - 200 OK : Base de données healthy
 * - 503 Service Unavailable : Base de données unhealthy
 * - 500 Internal Server Error : Erreur du health check lui-même
 *
 * UTILISATION :
 * ```bash
 * # Health check complet (JSON)
 * curl http://localhost:3000/api/health
 *
 * # Health check rapide (boolean)
 * curl http://localhost:3000/api/health?quick=true
 *
 * # Format texte lisible
 * curl http://localhost:3000/api/health?format=text
 * ```
 *
 * RÉFÉRENCE CDA :
 * - Next.js 15 App Router API Routes
 * - Server Components pattern
 * - RESTful API best practices
 * - HTTP status codes standards
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  checkDatabaseHealth,
  quickHealthCheck,
  formatHealthCheckResult,
  type HealthCheckResult,
} from '@/lib/db-health'

/**
 * Configuration du runtime
 *
 * 'nodejs' : Runtime Node.js standard (recommandé pour DB queries)
 * 'edge' : Runtime Edge (plus rapide mais limité, pas de DB directe)
 *
 * Pour Prisma, on utilise TOUJOURS 'nodejs' car :
 * - Besoin d'accès TCP direct à PostgreSQL
 * - Driver adapters nécessaires pour edge (complexité++)
 *
 * ✅ Source Context7 : Next.js Runtime Configuration
 */
export const runtime = 'nodejs'

/**
 * Configuration du cache
 *
 * no-cache : Force une vérification à chaque requête
 * IMPORTANT : Le health check DOIT refléter l'état actuel
 *
 * ✅ Source Context7 : Next.js Data Fetching & Caching
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/health
 *
 * Retourne l'état de santé de la base de données
 *
 * QUERY PARAMETERS :
 * - quick (boolean) : Si true, effectue un check rapide (connexion uniquement)
 * - format (string) : 'json' (défaut) ou 'text' pour format lisible
 *
 * RÉPONSES :
 *
 * 200 OK - Database healthy :
 * ```json
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-11-07T10:30:00.000Z",
 *   "checks": { ... },
 *   "metrics": { "latency": 45 }
 * }
 * ```
 *
 * 503 Service Unavailable - Database unhealthy :
 * ```json
 * {
 *   "status": "unhealthy",
 *   "timestamp": "2025-11-07T10:30:00.000Z",
 *   "error": "Database connection failed",
 *   "checks": { ... }
 * }
 * ```
 *
 * ✅ Source Context7 : Next.js API Routes Best Practices
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Parser les query parameters
    const searchParams = request.nextUrl.searchParams
    const isQuickCheck = searchParams.get('quick') === 'true'
    const format = searchParams.get('format') || 'json'

    // ═══════════════════════════════════════════════════════════
    // MODE 1 : QUICK CHECK (connexion uniquement)
    // ═══════════════════════════════════════════════════════════
    if (isQuickCheck) {
      const isHealthy = await quickHealthCheck()

      const quickResult = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        quick: true,
      }

      return NextResponse.json(quickResult, {
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      })
    }

    // ═══════════════════════════════════════════════════════════
    // MODE 2 : HEALTH CHECK COMPLET
    // ═══════════════════════════════════════════════════════════
    const healthResult: HealthCheckResult = await checkDatabaseHealth()

    // Déterminer le status HTTP selon l'état
    const httpStatus = getHttpStatus(healthResult.status)

    // ═══════════════════════════════════════════════════════════
    // FORMAT : TEXT (pour logs, emails, Slack)
    // ═══════════════════════════════════════════════════════════
    if (format === 'text') {
      const textOutput = formatHealthCheckResult(healthResult)

      return new NextResponse(textOutput, {
        status: httpStatus,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    }

    // ═══════════════════════════════════════════════════════════
    // FORMAT : JSON (défaut, pour monitoring externe)
    // ═══════════════════════════════════════════════════════════
    return NextResponse.json(healthResult, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
        // Headers utiles pour monitoring
        'X-Health-Status': healthResult.status,
        'X-Response-Time': `${healthResult.metrics.latency}ms`,
      },
    })
  } catch (error) {
    // Erreur critique du health check lui-même
    console.error('❌ Erreur critique health check:', error)

    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error
          ? error.message
          : 'Erreur inconnue lors du health check',
      checks: {
        connection: {
          status: 'fail',
          message: 'Health check a échoué',
        },
      },
    }

    return NextResponse.json(errorResponse, {
      status: 500, // Internal Server Error
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    })
  }
}

/**
 * Détermine le code HTTP approprié selon le statut
 *
 * CODES UTILISÉS :
 * - 200 OK : healthy (tout va bien ✅)
 * - 503 Service Unavailable : unhealthy (DB inaccessible ❌)
 * - 200 OK : degraded (warnings mais fonctionnel ⚠️)
 *
 * Note : On retourne 200 pour 'degraded' car le service est
 * techniquement utilisable. Les load balancers ne doivent pas
 * retirer l'instance du pool.
 *
 * @param status - Statut du health check
 * @returns number - Code HTTP
 */
function getHttpStatus(
  status: 'healthy' | 'degraded' | 'unhealthy'
): number {
  switch (status) {
    case 'healthy':
      return 200
    case 'degraded':
      return 200 // Service dégradé mais utilisable
    case 'unhealthy':
      return 503 // Service Unavailable
    default:
      return 500
  }
}

/**
 * OPTIONS /api/health
 *
 * Support pour CORS preflight requests
 * Permet aux dashboards externes d'appeler l'endpoint
 *
 * ✅ Source Context7 : CORS Best Practices
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204, // No Content
    headers: {
      'Access-Control-Allow-Origin': '*', // À restreindre en production
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24h
    },
  })
}

/**
 * HEAD /api/health
 *
 * Variante légère du GET qui ne retourne que les headers
 * Utile pour :
 * - Monitoring très haute fréquence
 * - Économie de bandwidth
 * - Checks load balancer optimisés
 *
 * ✅ Source Context7 : RESTful API Best Practices
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    const isHealthy = await quickHealthCheck()

    return new NextResponse(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': isHealthy ? 'healthy' : 'unhealthy',
      },
    })
  } catch {
    return new NextResponse(null, {
      status: 500,
      headers: {
        'X-Health-Status': 'unhealthy',
      },
    })
  }
}
