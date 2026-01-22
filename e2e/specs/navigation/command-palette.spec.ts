/**
 * Tests E2E - Command Palette & Navigation
 *
 * @ticket SP-264 - Phase 4 - Tests E2E
 * @see Context7 - Playwright Page Object Model with fixtures
 *
 * Tests couvrant :
 * - Ouverture/fermeture via raccourci ⌘K / Ctrl+K
 * - Recherche et navigation
 * - Changement de thème
 * - Affichage des pages récentes
 * - Accessibilité
 */

import { test, expect } from '../../fixtures/auth.fixture'

/**
 * Helper pour le raccourci d'ouverture de la Command Palette
 * - Mac: Cmd+K (Meta+k)
 * - Windows/Linux: Ctrl+K (Control+k)
 * - Playwright Chromium: utilise Control+k par défaut
 */
const OPEN_COMMAND_PALETTE_KEY = 'Control+k'

test.describe('Command Palette', () => {
  // =========================================================================
  // TESTS D'OUVERTURE / FERMETURE
  // =========================================================================

  test.describe('Opening and closing', () => {
    test('should open command palette with Cmd+K (Mac) / Ctrl+K', async ({
      directorPage,
    }) => {
      // Ouvrir avec le raccourci clavier
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)

      // Vérifier que la palette est ouverte via le placeholder de l'input
      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )

      await expect(input).toBeVisible({ timeout: 5000 })
    })

    test('should close command palette with Escape', async ({
      directorPage,
    }) => {
      // Ouvrir la palette
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Fermer avec Escape
      await directorPage.keyboard.press('Escape')

      // Vérifier que la palette est fermée
      await expect(input).not.toBeVisible()
    })

    test('should close command palette when clicking overlay', async ({
      directorPage,
    }) => {
      // Ouvrir la palette
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Cliquer sur l'overlay (zone sombre)
      await directorPage.locator('.bg-black\\/50').click()

      // Vérifier que la palette est fermée
      await expect(input).not.toBeVisible()
    })
  })

  // =========================================================================
  // TESTS DE RECHERCHE
  // =========================================================================

  test.describe('Search', () => {
    test('should filter items when typing', async ({ directorPage }) => {
      // Ouvrir la palette
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Taper "collabor" pour filtrer
      await input.fill('collabor')

      // Vérifier que l'item "Collaborateurs" est visible
      await expect(
        directorPage.getByRole('option', { name: /collaborateurs/i })
      ).toBeVisible()
    })

    test('should show "Aucun résultat" for no matches', async ({
      directorPage,
    }) => {
      // Ouvrir la palette
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Taper quelque chose qui n'existe pas
      await input.fill('xyznonexistent123')

      // Vérifier le message "Aucun résultat"
      await expect(
        directorPage.getByText('Aucun résultat trouvé.')
      ).toBeVisible()
    })
  })

  // =========================================================================
  // TESTS DE NAVIGATION
  // =========================================================================

  test.describe('Navigation', () => {
    test('should navigate to Employees page via command palette', async ({
      directorPage,
    }) => {
      // Ouvrir la palette
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Chercher "Collaborateurs"
      await input.fill('collabor')

      // Cliquer sur l'item
      await directorPage
        .getByRole('option', { name: /collaborateurs/i })
        .click()

      // Vérifier la navigation
      await expect(directorPage).toHaveURL(/\/app\/dashboard\/employees/)
    })

    test('should navigate using keyboard (arrow keys + Enter)', async ({
      directorPage,
    }) => {
      // Ouvrir la palette
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Utiliser les flèches pour naviguer et Enter pour sélectionner
      await directorPage.keyboard.press('ArrowDown')
      await directorPage.keyboard.press('Enter')

      // Vérifier qu'on a navigué quelque part (la palette devrait être fermée)
      await expect(input).not.toBeVisible()
    })
  })

  // =========================================================================
  // TESTS THÈME
  // =========================================================================

  test.describe('Theme', () => {
    test('should change to dark theme via command palette', async ({
      directorPage,
    }) => {
      // Ouvrir la palette
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Chercher "sombre"
      await input.fill('sombre')

      // Cliquer sur l'item
      await directorPage.getByRole('option', { name: /mode sombre/i }).click()

      // Vérifier que le thème dark est appliqué
      await expect(directorPage.locator('html')).toHaveClass(/dark/)
    })

    test('should change to light theme via command palette', async ({
      directorPage,
    }) => {
      // D'abord passer en dark
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)
      let input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })
      await input.fill('sombre')
      await directorPage.getByRole('option', { name: /mode sombre/i }).click()

      // Maintenant passer en light
      await directorPage.keyboard.press(OPEN_COMMAND_PALETTE_KEY)
      input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })
      await input.fill('clair')
      await directorPage.getByRole('option', { name: /mode clair/i }).click()

      // Vérifier que le thème light est appliqué (pas de classe dark)
      await expect(directorPage.locator('html')).not.toHaveClass(/dark/)
    })
  })
})
