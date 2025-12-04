/**
 * Configuration Playwright pour tests E2E
 *
 * Ce fichier configure Playwright pour les tests end-to-end :
 * - 3 navigateurs : Chromium, Firefox, WebKit
 * - webServer : démarre Next.js automatiquement
 * - Traces et screenshots sur échec
 *
 * @see https://playwright.dev/docs/test-configuration
 * @ticket SP-133
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  /**
   * Dossier contenant les tests E2E
   */
  testDir: './e2e/specs',

  /**
   * Exécution parallèle des tests
   */
  fullyParallel: true,

  /**
   * Échoue si test.only() est présent en CI
   */
  forbidOnly: !!process.env.CI,

  /**
   * Retries : 2 en CI, 0 en local
   */
  retries: process.env.CI ? 2 : 0,

  /**
   * Workers : 1 en CI (stabilité), illimité en local
   */
  workers: process.env.CI ? 1 : undefined,

  /**
   * Reporters : HTML + liste console
   */
  reporter: [['html', { open: 'never' }], ['list']],

  /**
   * Configuration globale des tests
   */
  use: {
    /**
     * URL de base pour page.goto('/')
     */
    baseURL: 'http://localhost:3000',

    /**
     * Trace : enregistrée uniquement au premier retry
     */
    trace: 'on-first-retry',

    /**
     * Screenshot : uniquement sur échec
     */
    screenshot: 'only-on-failure',
  },

  /**
   * Projets de test par navigateur
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /**
   * Configuration du serveur web Next.js
   *
   * - Démarre automatiquement avant les tests
   * - Réutilise le serveur existant en local
   * - Timeout de 2 minutes pour le build
   */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
