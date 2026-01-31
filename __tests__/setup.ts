/**
 * Setup global pour Vitest
 *
 * Ce fichier est exécuté AVANT chaque fichier de test.
 * Il configure :
 * - Les matchers jest-dom pour les assertions DOM
 * - Le cleanup automatique après chaque test
 * - Le serveur MSW pour mocker les API
 * - Les polyfills pour jsdom (ResizeObserver, etc.)
 *
 * @see https://testing-library.com/docs/react-testing-library/setup
 * @see https://mswjs.io/docs/integrations/node
 * @ticket SP-130, SP-131, SP-140
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './mocks/server'

/**
 * Polyfills pour jsdom
 *
 * ResizeObserver n'est pas implémenté dans jsdom,
 * mais est utilisé par les composants Radix UI.
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

/**
 * Mock pour window.matchMedia
 *
 * Utilisé par les hooks d'accessibilité (useReducedMotion)
 * et les composants responsive.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/**
 * MSW Server Lifecycle
 *
 * beforeAll: Démarrer le serveur MSW avant tous les tests
 * - onUnhandledRequest: 'error' → Échoue si une requête n'a pas de handler
 *   Cela force à définir explicitement tous les mocks nécessaires
 *
 * afterEach: Reset les handlers après chaque test
 * - Permet d'utiliser server.use() dans un test sans affecter les autres
 *
 * afterAll: Arrêter le serveur MSW après tous les tests
 * - Libère les ressources et évite les fuites
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

/**
 * Cleanup après chaque test
 *
 * - cleanup(): Démonte les composants React rendus
 * - server.resetHandlers(): Remet les handlers MSW par défaut
 */
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

/**
 * Arrêt du serveur MSW
 */
afterAll(() => {
  server.close()
})
