/**
 * Configuration Playwright pour tests E2E
 *
 * Ce fichier configure Playwright pour les tests end-to-end :
 * - Navigateurs : Chromium (CI) / Chromium + Firefox + WebKit (local)
 * - Projets mobiles : iPhone SE, iPhone 14 Pro, Pixel 7, iPad Mini, iPad Pro
 * - webServer : démarre Next.js automatiquement
 * - Traces et screenshots sur échec
 * - Timeouts adaptés pour CI
 *
 * @see https://playwright.dev/docs/test-configuration
 * @see Context7 - Playwright mobile emulation with devices and isMobile
 * @ticket SP-133, SP-113, SP-389
 */

import { defineConfig, devices } from '@playwright/test'

// Port paramétrable : `PORT=3001 npx playwright test` si le port 3000 est
// occupé par un autre projet (next dev respecte nativement PORT)
const PORT = process.env.PORT ?? '3000'
const BASE_URL = `http://localhost:${PORT}`

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
   * Retries : 2 partout pour gérer les flaky tests et timeouts intermittents
   */
  retries: 2,

  /**
   * Workers : 1 en CI (stabilité avec DB partagée), 3 en local (évite saturation)
   */
  workers: process.env.CI ? 1 : 3,

  /**
   * Timeout global par test : 60s en CI, 45s en local (pour éviter timeouts intermittents)
   */
  timeout: process.env.CI ? 60_000 : 45_000,

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
    baseURL: BASE_URL,

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
     * Timeouts d'action (click, fill, etc.) : 15s partout
     */
    actionTimeout: 15_000,

    /**
     * Timeout de navigation : 30s partout (6 projets parallèles saturent en local)
     */
    navigationTimeout: 30_000,
  },

  /**
   * ============================================================
   * CONFIGURATION DES NAVIGATEURS
   * ============================================================
   *
   * Desktop :
   * - Chromium uniquement (représente ~65% des utilisateurs)
   *
   * Mobile (SP-389) :
   * - iPhone SE : petit écran (375x667), test contraintes espace
   * - iPhone 14 Pro : écran moderne (393x852), iOS Safari
   * - Pixel 7 : Android référence (412x915), Chrome mobile
   * - iPad Mini : tablette petite (768x1024), mode intermédiaire
   * - iPad Pro 11" : tablette grande (834x1194), layout quasi-desktop
   *
   * @see https://playwright.dev/docs/browsers
   * @see https://playwright.dev/docs/emulation#devices
   * @ticket SP-389
   * ============================================================
   */
  projects: [
    // ==================== DESKTOP ====================
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // Exclure les tests mobile-only sur le projet desktop
      testIgnore: /.*mobile.*\.spec\.ts/,
    },

    // ==================== MOBILE - SMARTPHONES ====================
    // Note: Tous les projets mobiles utilisent Chromium au lieu de WebKit
    // car WebKit a un bug connu qui upgrade http://localhost en https://
    // ce qui cause des erreurs TLS et empêche le login de fonctionner.
    // Les viewports et paramètres touch sont conservés pour l'émulation mobile.
    {
      name: 'mobile-iphone-se',
      use: {
        // Viewport iPhone SE : petit écran 320x568
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: /.*mobile.*\.spec\.ts/,
    },
    {
      name: 'mobile-iphone-14-pro',
      use: {
        // Viewport iPhone 14 Pro : écran moderne 393x852
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: /.*mobile.*\.spec\.ts/,
    },
    {
      name: 'mobile-pixel-7',
      use: {
        ...devices['Pixel 7'],
        // Android référence 412x915, Chrome mobile
      },
      testMatch: /.*mobile.*\.spec\.ts/,
    },

    // ==================== MOBILE - TABLETS ====================
    {
      name: 'tablet-ipad-mini',
      use: {
        // Viewport iPad Mini : 768x1024
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: /.*mobile.*\.spec\.ts/,
    },
    {
      name: 'tablet-ipad-pro-11',
      use: {
        // Viewport iPad Pro 11" : 834x1194
        viewport: { width: 834, height: 1194 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: /.*mobile.*\.spec\.ts/,
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
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Le webServer hérite automatiquement des env vars du process parent
    // donc DATABASE_URL, NEXTAUTH_SECRET, etc. sont disponibles
  },
})
