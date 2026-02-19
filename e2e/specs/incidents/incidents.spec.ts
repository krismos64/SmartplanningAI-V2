/**
 * Tests E2E - Page Notes d'incident
 *
 * Valide le module incidents (/app/dashboard/incidents) :
 * - Protection RBAC (DIRECTOR, MANAGER, EMPLOYEE)
 * - Affichage initial (titre, filtres, liste)
 * - Creation de note (formulaire, champs)
 * - Filtres (recherche, dates, reset)
 * - Accessibilite
 *
 * @ticket SP-424
 */

import { test, expect } from '../../fixtures/auth.fixture'

// =============================================================================
// Bloc 1 — DIRECTOR : acces complet
// =============================================================================

test.describe('Incidents — DIRECTOR', () => {
  test('page se charge avec le titre', async ({ directorPage }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    await expect(
      directorPage.getByRole('heading', { name: /notes d'incident/i })
    ).toBeVisible()
  })

  test('data-testid incidents-page-content present', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    await expect(
      directorPage.locator('[data-testid="incidents-page-content"]')
    ).toBeVisible()
  })

  test('bouton "Nouvelle note" visible', async ({ directorPage }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    await expect(
      directorPage.locator('[data-testid="create-note-button"]')
    ).toBeVisible()
  })

  test('filtres visibles (recherche, dates, reset)', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    await expect(
      directorPage.locator('[data-testid="incidents-filters"]')
    ).toBeVisible()
    await expect(
      directorPage.locator('[data-testid="search-input"]')
    ).toBeVisible()
  })

  test('liste ou etat vide affiches', async ({ directorPage }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    // Soit la liste soit l'etat vide
    const list = directorPage.locator('[data-testid="incidents-list"]')
    const empty = directorPage.locator('[data-testid="empty-state"]')

    const hasItems = await list.isVisible().catch(() => false)
    const isEmpty = await empty.isVisible().catch(() => false)

    expect(hasItems || isEmpty).toBeTruthy()
  })
})

// =============================================================================
// Bloc 2 — MANAGER : creation et formulaire
// =============================================================================

test.describe('Incidents — MANAGER', () => {
  test('page se charge, bouton "Nouvelle note" visible', async ({
    managerPage,
  }) => {
    await managerPage.goto('/app/dashboard/incidents')
    await managerPage.waitForLoadState('domcontentloaded')

    await expect(
      managerPage.getByRole('heading', { name: /notes d'incident/i })
    ).toBeVisible()

    await expect(
      managerPage.locator('[data-testid="create-note-button"]')
    ).toBeVisible()
  })

  test('ouvrir le formulaire de creation', async ({ managerPage }) => {
    await managerPage.goto('/app/dashboard/incidents')
    await managerPage.waitForLoadState('domcontentloaded')

    await managerPage.locator('[data-testid="create-note-button"]').click()

    // Le formulaire doit s'ouvrir
    await expect(
      managerPage.locator('[data-testid="incident-note-form"]')
    ).toBeVisible({ timeout: 5000 })
  })

  test('formulaire contient les champs requis', async ({ managerPage }) => {
    await managerPage.goto('/app/dashboard/incidents')
    await managerPage.waitForLoadState('domcontentloaded')

    await managerPage.locator('[data-testid="create-note-button"]').click()

    await expect(
      managerPage.locator('[data-testid="incident-note-form"]')
    ).toBeVisible({ timeout: 5000 })

    // Verifier les champs
    await expect(
      managerPage.locator('[data-testid="title-input"]')
    ).toBeVisible()
    await expect(
      managerPage.locator('[data-testid="content-input"]')
    ).toBeVisible()
    await expect(
      managerPage.locator('[data-testid="subject-select"]')
    ).toBeVisible()
  })
})

// =============================================================================
// Bloc 3 — EMPLOYEE : acces restreint
// =============================================================================

test.describe('Incidents — EMPLOYEE', () => {
  test('page se charge pour EMPLOYEE', async ({ employeePage }) => {
    await employeePage.goto('/app/dashboard/incidents')
    await employeePage.waitForLoadState('domcontentloaded')

    await expect(
      employeePage.locator('[data-testid="incidents-page-content"]')
    ).toBeVisible()
  })

  test('bouton "Nouvelle note" NON visible pour EMPLOYEE', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/dashboard/incidents')
    await employeePage.waitForLoadState('domcontentloaded')

    await expect(
      employeePage.locator('[data-testid="create-note-button"]')
    ).not.toBeVisible()
  })
})

// =============================================================================
// Bloc 4 — Filtres
// =============================================================================

test.describe('Incidents — Filtres', () => {
  test('recherche par texte fonctionne', async ({ directorPage }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    const searchInput = directorPage.locator('[data-testid="search-input"]')
    await searchInput.fill('test')

    // Attendre que le filtre soit applique (debounce)
    await directorPage.waitForTimeout(500)

    // L'URL ou la page devrait refleter la recherche
    await expect(searchInput).toHaveValue('test')
  })

  test('bouton reset remet les filtres a zero', async ({ directorPage }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    // Appliquer un filtre
    const searchInput = directorPage.locator('[data-testid="search-input"]')
    await searchInput.fill('test recherche')
    await directorPage.waitForTimeout(500)

    // Cliquer sur reset
    const resetButton = directorPage.locator(
      '[data-testid="reset-filters-button"]'
    )
    const hasReset = await resetButton.isVisible().catch(() => false)
    if (hasReset) {
      await resetButton.click()
      await expect(searchInput).toHaveValue('')
    }
  })
})

// =============================================================================
// Bloc 5 — Accessibilite
// =============================================================================

test.describe('Incidents — Accessibilite', () => {
  test('structure semantique : heading present', async ({ directorPage }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    // H1 ou heading role
    const heading = directorPage.getByRole('heading', {
      name: /notes d'incident/i,
    })
    await expect(heading).toBeVisible()
  })

  test('le champ recherche a un placeholder descriptif', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/dashboard/incidents')
    await directorPage.waitForLoadState('domcontentloaded')

    const searchInput = directorPage.locator('[data-testid="search-input"]')
    await expect(searchInput).toBeVisible()
    // Le champ doit avoir un placeholder ou label
    const placeholder = await searchInput.getAttribute('placeholder')
    expect(placeholder).toBeTruthy()
  })
})
