/**
 * Tests E2E - Page Admin Users (SP-543)
 *
 * Valide :
 * - Protection RBAC (SYSTEM_ADMIN uniquement)
 * - Affichage : filtres rôle/entreprise/vérification, colonne Vérifié
 * - Filtrage par statut de vérification
 *
 * Note : le renvoi d'email de vérification n'est pas déclenché en E2E
 * (envoi SMTP réel) — couvert par les tests unitaires.
 *
 * @ticket SP-543
 */

import { test, expect } from '../fixtures/auth.fixture'

// =============================================================================
// Bloc 1 — Acces et protection RBAC
// =============================================================================

test.describe('Admin Users — RBAC Protection', () => {
  test('SYSTEM_ADMIN peut acceder a /app/admin/users', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/users')

    await expect(
      adminPage.getByRole('heading', { name: /utilisateurs/i })
    ).toBeVisible()
    await expect(adminPage).toHaveURL(/\/app\/admin\/users/)
  })

  test('DIRECTOR est redirige depuis /app/admin/users', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/users')

    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })

  test('EMPLOYEE est redirige depuis /app/admin/users', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/admin/users')

    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })
})

// =============================================================================
// Bloc 2 — Affichage et filtres (SP-543)
// =============================================================================

test.describe('Admin Users — Filtres et colonne verification', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/app/admin/users')
    await adminPage.getByTestId('users-search').waitFor({ state: 'visible' })
  })

  test('affiche les 3 filtres : role, entreprise, verification', async ({
    adminPage,
  }) => {
    await expect(adminPage.getByTestId('users-role-filter')).toBeVisible()
    await expect(adminPage.getByTestId('users-company-filter')).toBeVisible()
    await expect(adminPage.getByTestId('users-verified-filter')).toBeVisible()
  })

  test('affiche la colonne Verifie dans la table', async ({ adminPage }) => {
    await expect(
      adminPage.getByRole('columnheader', { name: /vérifié/i })
    ).toBeVisible()
  })

  test('filtre par email non verifie sans erreur', async ({ adminPage }) => {
    await adminPage.getByTestId('users-verified-filter').click()
    await adminPage.getByRole('option', { name: /email non vérifié/i }).click()

    // La table reste rendue (vide ou non) apres application du filtre
    await expect(adminPage.getByTestId('users-search')).toBeVisible()
    await expect(
      adminPage.getByRole('columnheader', { name: /vérifié/i })
    ).toBeVisible()
  })

  test('le filtre entreprise liste les entreprises', async ({ adminPage }) => {
    await adminPage.getByTestId('users-company-filter').click()

    // Au minimum l'option "Toutes les entreprises" est presente
    await expect(
      adminPage.getByRole('option', { name: /toutes les entreprises/i })
    ).toBeVisible()
  })
})
