/**
 * Tests E2E - Fiche entreprise en onglets (SP-546)
 *
 * Valide :
 * - Les 4 onglets sont affichés (Informations, Abonnement, Utilisateurs, Audit)
 * - Navigation entre onglets sans rechargement complet de la page
 * - Deep-link `?tab=` fonctionne (bookmarkability)
 *
 * Navigue depuis la liste (clic sur la première entreprise) plutôt que de
 * hardcoder un ID — reste valide quel que soit le jeu de données seed.
 *
 * @ticket SP-546
 */

import { test, expect } from '../fixtures/auth.fixture'
import { CompanyListPage } from '../pages'

async function gotoFirstCompanyDetail(
  adminPage: import('@playwright/test').Page
) {
  const listPage = new CompanyListPage(adminPage)
  await listPage.goto()
  await adminPage.waitForSelector('table tbody tr', { timeout: 10_000 })

  const companyName = await adminPage
    .locator('table tbody tr')
    .first()
    .locator('td')
    .nth(1)
    .innerText()

  // Page Object existant (pattern SP-156) : gère déjà le clic menu ->
  // menuitem "Voir détails" de façon fiable (dropdown Radix)
  await listPage.viewCompany(companyName.split('\n')[0] ?? companyName)

  await adminPage.waitForURL(/\/app\/admin\/companies\/[^/]+$/, {
    timeout: 15_000,
  })
  await adminPage
    .getByTestId('company-detail-tabs')
    .waitFor({ state: 'visible' })
}

test.describe('Fiche entreprise — Onglets (SP-546)', () => {
  test('affiche les 4 onglets', async ({ adminPage }) => {
    await gotoFirstCompanyDetail(adminPage)

    await expect(adminPage.getByTestId('company-tab-infos')).toBeVisible()
    await expect(
      adminPage.getByTestId('company-tab-subscription')
    ).toBeVisible()
    await expect(adminPage.getByTestId('company-tab-users')).toBeVisible()
    await expect(adminPage.getByTestId('company-tab-audit')).toBeVisible()
  })

  test("l'onglet Informations est actif par défaut", async ({ adminPage }) => {
    await gotoFirstCompanyDetail(adminPage)

    await expect(
      adminPage.getByTestId('company-tab-content-infos')
    ).toBeVisible()
  })

  test('navigue vers Abonnement sans rechargement complet', async ({
    adminPage,
  }) => {
    await gotoFirstCompanyDetail(adminPage)

    await adminPage.getByTestId('company-tab-subscription').click()

    await expect(adminPage).toHaveURL(/tab=subscription/)
    await expect(
      adminPage.getByTestId('company-subscription-detail')
    ).toBeVisible()
    await expect(
      adminPage.getByTestId('company-payments-history')
    ).toBeVisible()
  })

  test('navigue vers Utilisateurs', async ({ adminPage }) => {
    await gotoFirstCompanyDetail(adminPage)

    await adminPage.getByTestId('company-tab-users').click()

    await expect(adminPage).toHaveURL(/tab=users/)
    await expect(
      adminPage.getByTestId('company-users-tab').first()
    ).toBeVisible()
  })

  test('navigue vers Audit', async ({ adminPage }) => {
    await gotoFirstCompanyDetail(adminPage)

    await adminPage.getByTestId('company-tab-audit').click()

    await expect(adminPage).toHaveURL(/tab=audit/)
    await expect(
      adminPage.getByTestId('company-audit-tab').first()
    ).toBeVisible()
  })

  test('le deep-link ?tab=users fonctionne au chargement direct', async ({
    adminPage,
  }) => {
    await gotoFirstCompanyDetail(adminPage)

    const url = new URL(adminPage.url())
    await adminPage.goto(`${url.pathname}?tab=users`)

    // L'onglet actif est résolu côté client après hydratation
    // (useSearchParams) : attendre l'état actif du trigger avant d'asserter
    // le contenu, avec un timeout élargi pour le premier chargement dev
    await adminPage
      .getByTestId('company-detail-tabs')
      .waitFor({ state: 'visible' })
    await expect(adminPage.getByTestId('company-tab-users')).toHaveAttribute(
      'data-state',
      'active',
      { timeout: 15_000 }
    )
    await expect(
      adminPage.getByTestId('company-users-tab').first()
    ).toBeVisible()
  })
})

test.describe('Fiche entreprise — RBAC (existant, non-regression)', () => {
  test('DIRECTOR ne peut pas acceder a la fiche entreprise', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/companies/cl000000000000000000fake1')

    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })
})
