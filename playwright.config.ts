/**
 * Configuration Playwright pour tests E2E
 *
 * Ce fichier configure Playwright pour les tests end-to-end :
 * - Navigateurs : Chromium (CI) / Chromium + Firefox + WebKit (local)
 * - webServer : démarre Next.js automatiquement
 * - Traces et screenshots sur échec
 * - Timeouts adaptés pour CI
 *
 * @see https://playwright.dev/docs/test-configuration
 * @ticket SP-133, SP-113
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  /**
   * Dossier contenant les tests E2E
   */
  testDir: './e2e/specs',

  /**
   * Exécution parallèle des tests
   * Désactivé en CI pour plus de stabilité avec la base de données partagée
   */
  fullyParallel: !process.env.CI,

  /**
   * Échoue si test.only() est présent en CI
   */
  forbidOnly: !!process.env.CI,

  /**
   * Retries : 2 en CI pour gérer les flaky tests, 0 en local
   */
  retries: process.env.CI ? 2 : 0,

  /**
   * Workers : 1 en CI (stabilité avec DB partagée), auto en local
   */
  workers: process.env.CI ? 1 : undefined,

  /**
   * Timeout global par test : 60s en CI, 30s en local
   */
  timeout: process.env.CI ? 60_000 : 30_000,

  /**
   * Timeout pour les assertions expect() : 15s en CI, 5s en local
   */
  expect: {
    timeout: process.env.CI ? 15_000 : 5_000,
  },

  /**
   * Reporters : HTML + liste console
   * En CI, ajoute aussi le reporter blob pour les artifacts
   */
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['list'], ['blob']]
    : [['html', { open: 'never' }], ['list']],

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

    /**
     * Video : enregistré sur premier retry en CI pour debug
     */
    video: process.env.CI ? 'on-first-retry' : 'off',

    /**
     * Timeouts d'action (click, fill, etc.) : 15s en CI, 10s en local
     */
    actionTimeout: process.env.CI ? 15_000 : 10_000,

    /**
     * Timeout de navigation : 30s en CI, 15s en local
     */
    navigationTimeout: process.env.CI ? 30_000 : 15_000,
  },

  /**
   * ============================================================
   * CONFIGURATION DES NAVIGATEURS
   * ============================================================
   *
   * Chromium uniquement (CI et local) :
   * - Représente ~65% des utilisateurs (Chrome + Edge)
   * - Firefox et WebKit supprimés car instables et peu utiles pour ce projet
   * - Temps de tests réduit significativement
   *
   * @see https://playwright.dev/docs/browsers
   * ============================================================
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /**
   * Configuration du serveur web Next.js
   *
   * - Démarre automatiquement avant les tests
   * - Réutilise le serveur existant en local
   * - Timeout de 2 minutes pour le build
   * - En CI, hérite des variables d'environnement (DATABASE_URL, etc.)
   */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Le webServer hérite automatiquement des env vars du process parent
    // donc DATABASE_URL, NEXTAUTH_SECRET, etc. sont disponibles
  },
})
