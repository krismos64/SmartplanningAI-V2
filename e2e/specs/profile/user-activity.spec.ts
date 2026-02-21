/**
 * Tests E2E - Page Mon activite recente
 *
 * Valide la page d'activite utilisateur (/app/profile/activity) :
 * - Affichage initial (titre, compteur, timeline)
 * - Navigation (bouton retour vers profil)
 * - Filtres par type d'action
 * - Pagination
 * - Responsive
 *
 * @ticket SP-463
 */

import { test, expect } from '../../fixtures/auth.fixture'

// =============================================================================
// Bloc 1 — Affichage initial
// =============================================================================

test.describe('User Activity — Affichage', () => {
  test('page se charge avec le titre', async ({ directorPage }) => {
    await directorPage.goto('/app/profile/activity')
    await directorPage.waitForLoadState('domcontentloaded')

    await expect(
      directorPage.getByRole('heading', { name: /mon activité récente/i })
    ).toBeVisible()
  })

  test('compteur d\'actions visible', async ({ directorPage }) => {
    await directorPage.goto('/app/profile/activity')
    await directorPage.waitForLoadState('domcontentloaded')

    // Le badge compteur "N action(s) enregistrée(s)"
    await expect(
      directorPage.getByText(/action.*enregistrée/i)
    ).toBeVisible()
  })

  test('timeline ou etat vide affiche', async ({ directorPage }) => {
    await directorPage.goto('/app/profile/activity')
    await directorPage.waitForLoadState('domcontentloaded')

    // Soit la timeline avec des entrees, soit "Aucune activite recente"
    const timeline = directorPage.locator('main')
    const hasEntries = await timeline
      .getByText(/connexion|créé|modifié|supprimé|déconnexion|export|changement/i)
      .first()
      .isVisible()
      .catch(() => false)
    const isEmpty = await directorPage
      .getByText(/aucune activité récente/i)
      .isVisible()
      .catch(() => false)

    expect(hasEntries || isEmpty).toBeTruthy()
  })
})

// =============================================================================
// Bloc 2 — Navigation
// =============================================================================

test.describe('User Activity — Navigation', () => {
  test('bouton retour pointe vers /app/profile', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/profile/activity')
    await directorPage.waitForLoadState('domcontentloaded')

    // Le bouton "Retour" est un lien vers /app/profile
    const backButton = directorPage.locator('a[href="/app/profile"]', {
      hasText: /retour/i,
    })
    await expect(backButton).toBeVisible()
    await expect(backButton).toHaveAttribute('href', '/app/profile')
  })
})

// =============================================================================
// Bloc 3 — Filtres
// =============================================================================

test.describe('User Activity — Filtres', () => {
  test('barre de filtres visible', async ({ directorPage }) => {
    await directorPage.goto('/app/profile/activity')
    await directorPage.waitForLoadState('domcontentloaded')

    // Le select de filtre par type d'action
    const filterSelect = directorPage.locator('select, button[role="combobox"]').first()
    await expect(filterSelect).toBeVisible()
  })

  test('filtre par type d\'action via URL', async ({ directorPage }) => {
    await directorPage.goto('/app/profile/activity?action=LOGIN')
    await directorPage.waitForLoadState('domcontentloaded')

    // La page doit se charger avec le filtre applique
    await expect(directorPage).toHaveURL(/action=LOGIN/)
    await expect(
      directorPage.getByRole('heading', { name: /mon activité récente/i })
    ).toBeVisible()
  })
})

// =============================================================================
// Bloc 4 — Pagination
// =============================================================================

test.describe('User Activity — Pagination', () => {
  test('pagination visible ou masquee selon le nombre d\'entrees', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/profile/activity')
    await directorPage.waitForLoadState('domcontentloaded')

    // La pagination est soit visible (> 20 entrees) soit absente
    // On verifie juste que la page charge correctement
    await expect(
      directorPage.getByRole('heading', { name: /mon activité récente/i })
    ).toBeVisible()

    // Si pagination visible, verifier les boutons
    const prevButton = directorPage.getByRole('button', {
      name: /précédent/i,
    })
    const hasPagination = await prevButton.isVisible().catch(() => false)
    if (hasPagination) {
      await expect(prevButton).toBeVisible()
      await expect(
        directorPage.getByRole('button', { name: /suivant/i })
      ).toBeVisible()
    }
  })
})

// =============================================================================
// Bloc 5 — Responsive
// =============================================================================

test.describe('User Activity — Responsive', () => {
  test('titre visible en mobile', async ({ directorPage }) => {
    await directorPage.setViewportSize({ width: 375, height: 667 })
    await directorPage.goto('/app/profile/activity')
    await directorPage.waitForLoadState('domcontentloaded')

    await expect(
      directorPage.getByRole('heading', { name: /mon activité récente/i })
    ).toBeVisible()
  })
})
