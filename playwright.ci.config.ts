/**
 * Configuration Playwright optimisée pour la CI
 *
 * Stratégie : Tests critiques uniquement (~122 tests, 8 specs)
 * - Authentification (login + reset password) & RBAC
 * - CRUD principaux
 * - Workflow congés complet (création + validation)
 *
 * Les tests complets (~213 tests, 19 specs) sont exécutés dans le
 * workflow nightly. ATTENTION : testMatch est une whitelist explicite —
 * un fichier renommé/supprimé ne fait PAS échouer la config, il disparaît
 * silencieusement de la CI. Vérifier cette liste après chaque
 * ajout/suppression de spec (audit juillet 2026 : 6 entrées mortes).
 *
 * @ticket SP-333
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // === DOSSIER DES TESTS ===
  testDir: './e2e/specs',

  // === OPTIMISATIONS CI ===

  // Parallélisation modérée (évite surcharge DB)
  workers: 2,

  // 1 seul retry (au lieu de 2)
  retries: 1,

  // Timeout réduit
  timeout: 45_000,

  // Timeout pour les assertions expect()
  expect: {
    timeout: 10_000,
  },

  // Échoue si test.only() est présent
  forbidOnly: true,

  // Reporter optimisé pour CI
  reporter: [['list'], ['github']],

  // === TESTS CRITIQUES UNIQUEMENT ===

  // Whitelist explicite des tests critiques (fichiers existants uniquement)
  testMatch: [
    // 🔴 CRITIQUE : Auth & Sécurité
    'auth.spec.ts',
    'auth/forgot-reset-password.spec.ts',
    'middleware-rbac.spec.ts',

    // 🟡 IMPORTANT : CRUD
    'crud/employees.spec.ts',
    'crud/teams.spec.ts',
    'crud/companies.spec.ts',

    // 🟡 IMPORTANT : Workflow congés (création + validation manager)
    'leaves/create-request.spec.ts',
    'leaves/review-request.spec.ts',
  ],

  // === CONFIGURATION GLOBALE ===

  use: {
    // URL de base
    baseURL: 'http://localhost:3000',

    // Trace uniquement au premier retry
    trace: 'on-first-retry',

    // Screenshot uniquement sur échec
    screenshot: 'only-on-failure',

    // Pas de vidéo en CI (économie de temps)
    video: 'off',

    // Timeouts d'action
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  // === UN SEUL NAVIGATEUR ===

  projects: [
    {
      name: 'chromium-ci',
      use: {
        ...devices['Desktop Chrome'],
        // Optimisations mémoire en CI
        launchOptions: {
          args: ['--disable-dev-shm-usage'],
        },
      },
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
    // Stdout/stderr pour debug en CI
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
