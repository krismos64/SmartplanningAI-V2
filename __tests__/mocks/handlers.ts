/**
 * MSW Request Handlers - Définition des mocks API
 *
 * Ce fichier centralise tous les handlers MSW pour mocker les API routes
 * du projet SmartPlanning dans les tests.
 *
 * MSW v2 utilise `http` et `HttpResponse` au lieu de `rest` et `res`.
 *
 * @see https://mswjs.io/docs/basics/mocking-responses
 * @ticket SP-131
 */

import { http, HttpResponse } from 'msw'

/**
 * Type pour la réponse health check (simplifié pour les tests)
 */
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  quick?: boolean
  checks?: {
    connection: {
      status: 'pass' | 'fail'
      message?: string
    }
  }
  metrics?: {
    latency: number
  }
}

/**
 * Handlers API pour les tests
 *
 * Ces handlers interceptent les requêtes fetch() pendant les tests
 * et retournent des réponses mockées prévisibles.
 */
export const handlers = [
  /**
   * GET /api/health - Health check endpoint
   *
   * Mock de l'API health check réelle (src/app/api/health/route.ts)
   * Retourne un état "healthy" par défaut pour les tests.
   */
  http.get('/api/health', ({ request }) => {
    const url = new URL(request.url)
    const isQuickCheck = url.searchParams.get('quick') === 'true'

    // Mode quick check
    if (isQuickCheck) {
      const quickResponse: HealthCheckResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        quick: true,
      }
      return HttpResponse.json(quickResponse)
    }

    // Mode complet
    const fullResponse: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        connection: {
          status: 'pass',
          message: 'Database connection successful (mocked)',
        },
      },
      metrics: {
        latency: 5, // Latence mockée très basse
      },
    }

    return HttpResponse.json(fullResponse, {
      headers: {
        'X-Health-Status': 'healthy',
        'X-Response-Time': '5ms',
      },
    })
  }),

  /**
   * Handlers futurs à ajouter ici :
   *
   * - POST /api/auth/login
   * - GET /api/users
   * - POST /api/planning
   * - etc.
   *
   * Les ajouter au fur et à mesure du développement des features.
   */
]
