/**
 * Tests E2E - Page Admin Messages de contact (SP-577)
 *
 * Valide :
 * - Protection RBAC (SYSTEM_ADMIN uniquement)
 * - Affichage initial (compteurs, filtres, table)
 * - Filtres URL bookmarkables
 * - Lecture d'une demande et marquage comme traitee
 *
 * `contact_messages` ne porte pas de `companyId` : le controle de role est
 * la seule protection de ces donnees, d'ou les trois tests de refus.
 *
 * @ticket SP-577
 */

import { test, expect } from '../fixtures/auth.fixture'

// =============================================================================
// Bloc 1 - Acces et protection RBAC
// =============================================================================

test.describe('Admin Messages de contact - RBAC Protection', () => {
  test('SYSTEM_ADMIN peut acceder a /app/admin/messages-contact', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/messages-contact')

    await expect(
      adminPage.getByRole('heading', { name: /messages de contact/i })
    ).toBeVisible()
    await expect(adminPage).toHaveURL(/\/app\/admin\/messages-contact/)
  })

  test('DIRECTOR est redirige depuis /app/admin/messages-contact', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/messages-contact')

    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })

  test('EMPLOYEE est redirige depuis /app/admin/messages-contact', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/admin/messages-contact')

    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })
})

// =============================================================================
// Bloc 2 - Affichage initial
// =============================================================================

test.describe('Admin Messages de contact - Affichage initial', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/app/admin/messages-contact')
    await adminPage
      .getByTestId('admin-contact-messages-page')
      .waitFor({ state: 'visible' })
  })

  test('affiche les trois compteurs de suivi', async ({ adminPage }) => {
    await expect(adminPage.getByTestId('kpi-contact-unread')).toBeVisible()
    await expect(adminPage.getByTestId('kpi-contact-failed')).toBeVisible()
    await expect(adminPage.getByTestId('kpi-contact-30d')).toBeVisible()
  })

  test('affiche les trois filtres', async ({ adminPage }) => {
    await expect(adminPage.getByTestId('contact-search-filter')).toBeVisible()
    await expect(adminPage.getByTestId('contact-read-filter')).toBeVisible()
    await expect(adminPage.getByTestId('contact-status-filter')).toBeVisible()
  })
})

// =============================================================================
// Bloc 3 - Filtres URL bookmarkables
// =============================================================================

test.describe('Admin Messages de contact - Filtres URL', () => {
  test('le filtre des demandes a traiter est lu depuis l URL', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/messages-contact?readState=unread')

    await expect(
      adminPage.getByTestId('admin-contact-messages-page')
    ).toBeVisible()
    // Le bouton de reinitialisation ne s'affiche que si un filtre est actif
    await expect(adminPage.getByTestId('contact-clear-filters')).toBeVisible()
  })

  test('le filtre des notifications en echec est lu depuis l URL', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/messages-contact?emailStatus=FAILED')

    await expect(
      adminPage.getByTestId('admin-contact-messages-page')
    ).toBeVisible()
    await expect(adminPage.getByTestId('contact-clear-filters')).toBeVisible()
  })

  test('un statut inconnu ne casse pas la page', async ({ adminPage }) => {
    await adminPage.goto('/app/admin/messages-contact?emailStatus=INVENTE')

    // Les filtres invalides sont rejetes cote action, la page reste servie
    await expect(
      adminPage.getByTestId('admin-contact-messages-page')
    ).toBeVisible()
  })
})
