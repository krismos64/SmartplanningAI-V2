/**
 * Configuration Playwright pour les tests nightly
 *
 * Exécute TOUS les tests E2E une fois par nuit sur main.
 * Permet de détecter les régressions sans bloquer les PR.
 *
 * Stratégie :
 * - Desktop : Chromium, TOUS les tests sauf mobile
 * - Mobile : 5 devices identiques à la config locale
 *   (iPhone SE, iPhone 14 Pro, Pixel 7, iPad Mini, iPad Pro 11")
 *   Seuls les fichiers *mobile*.spec.ts sont exécutés sur ces devices
 *
 * @ticket SP-333
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // === DOSSIER DES TESTS ===
  testDir: './e2e/specs',

  // === CONFIGURATION NIGHTLY ===

  // Plus de workers pour aller plus vite la nuit
  workers: 3,

  // 2 retries pour maximiser la stabilité
  retries: 2,

  // Timeout standard
  timeout: 60_000,

  // Timeout pour les assertions
  expect: {
    timeout: 15_000,
  },

  // Échoue si test.only() est présent
  forbidOnly: true,

  // Tous les tests
  testMatch: '**/*.spec.ts',

  // Reporter complet
  reporter: [['list'], ['html', { open: 'never' }], ['github']],

  // === CONFIGURATION GLOBALE ===

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },

  // === PROJETS ===
  // Alignés avec playwright.config.ts pour couverture identique

  projects: [
    // ==================== DESKTOP ====================
    {
      name: 'chromium-nightly',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-dev-shm-usage'],
        },
      },
      testIgnore: /.*mobile.*\.spec\.ts/,
    },

    // ==================== MOBILE - SMARTPHONES ====================
    // Note: Tous les projets mobiles utilisent Chromium (pas WebKit)
    // car WebKit sur Linux CI upgrade http://localhost en https://
    {
      name: 'mobile-iphone-se',
      use: {
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
      },
      testMatch: /.*mobile.*\.spec\.ts/,
    },

    // ==================== MOBILE - TABLETS ====================
    {
      name: 'tablet-ipad-mini',
      use: {
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

  // === SERVEUR WEB ===

  webServer: {
    // Mode production : nécessite npm run build au préalable.
    // Les env vars AUTH_URL + AUTH_TRUST_HOST résolvent les redirections.
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
