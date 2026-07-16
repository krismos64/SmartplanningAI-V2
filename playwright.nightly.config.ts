/**
 * Configuration Playwright pour les tests nightly
 *
 * Exécute TOUS les tests E2E une fois par nuit sur main.
 * Permet de détecter les régressions sans bloquer les PR.
 *
 * Stratégie :
 * - Desktop : Chromium, TOUS les tests (~213 tests, 19 specs)
 * - Mobile : les 5 projets devices (iPhone SE, iPhone 14 Pro, Pixel 7,
 *   iPad Mini, iPad Pro 11") ont été retirés en juillet 2026 : les specs
 *   *mobile*.spec.ts ont été supprimées lors de la rationalisation de
 *   mars 2026, les projets tournaient donc à vide. Récupérables dans
 *   l'historique git si des specs mobile sont réintroduites.
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
      // Garde-fou : si des specs *mobile* réapparaissent, elles ne doivent
      // pas tourner en viewport desktop par accident
      testIgnore: /.*mobile.*\.spec\.ts/,
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
