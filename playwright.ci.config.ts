/**
 * Configuration Playwright optimisée pour la CI
 *
 * Stratégie : Tests critiques uniquement (~180 tests)
 * - Smoke tests
 * - Authentification & RBAC
 * - CRUD principaux
 * - Fonctionnalités métier critiques
 *
 * Les tests complets sont exécutés dans le workflow nightly.
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

  // Whitelist explicite des tests critiques
  testMatch: [
    // 🔴 CRITIQUE : Smoke & Auth
    'smoke.spec.ts',
    'auth.spec.ts',
    'middleware-rbac.spec.ts',
    'forbidden.spec.ts',

    // 🔴 CRITIQUE : Protection dashboards
    'dashboard/rbac-protection.spec.ts',

    // 🟡 IMPORTANT : CRUD
    'crud/employees.spec.ts',
    'crud/teams.spec.ts',
    'crud/companies.spec.ts',

    // 🟡 IMPORTANT : Métier
    'schedules/schedules.spec.ts',
    'leaves/navigation.spec.ts',
    'leaves/create-request.spec.ts',

    // 🟡 IMPORTANT : Profil (tests stables uniquement)
    'profile/profile-display.spec.ts',
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
