/**
 * MSW Server Configuration - Serveur pour environnement Node.js
 *
 * Ce fichier configure le serveur MSW pour intercepter les requêtes
 * HTTP dans l'environnement Node.js (Vitest).
 *
 * IMPORTANT: Ne pas utiliser pour le browser. Pour les tests browser,
 * utiliser `setupWorker` depuis 'msw/browser'.
 *
 * @see https://mswjs.io/docs/api/setup-server
 * @ticket SP-131
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * Serveur MSW pour Node.js
 *
 * Ce serveur :
 * - Intercepte toutes les requêtes fetch/http
 * - Applique les handlers définis
 * - Permet le reset entre les tests
 *
 * Lifecycle géré dans __tests__/setup.ts :
 * - beforeAll: server.listen()
 * - afterEach: server.resetHandlers()
 * - afterAll: server.close()
 */
export const server = setupServer(...handlers)
