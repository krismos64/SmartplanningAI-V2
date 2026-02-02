/**
 * Configuration Playwright pour les tests nightly
 *
 * Exécute TOUS les tests E2E une fois par nuit sur main.
 * Permet de détecter les régressions sans bloquer les PR.
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

  // Tous les tests sauf exclusions
  testMatch: '**/*.spec.ts',

  // Exclure les tests mobiles (testés sur 1 seul device)
  testIgnore: ['**/mobile/**/*.spec.ts'],

  // Reporter complet
  reporter: [['list'], ['html', { open: 'never' }], ['github']],

  // === CONFIGURATION GLOBALE ===

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // === PROJETS ===

  projects: [
    // Desktop Chromium - tous les tests sauf mobile
    {
      name: 'chromium-nightly',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/mobile/**/*.spec.ts'],
    },
    // Mobile - 1 seul device pour les tests mobile
    {
      name: 'mobile-nightly',
      use: { ...devices['iPhone 14'] },
      testMatch: '**/mobile/**/*.spec.ts',
    },
  ],

  // === SERVEUR WEB ===

  webServer: {
    // NOTE: On utilise 'npm run dev' car 'npm run start' en CI cause des
    // problèmes de redirections infinies (ERR_TOO_MANY_REDIRECTS).
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
