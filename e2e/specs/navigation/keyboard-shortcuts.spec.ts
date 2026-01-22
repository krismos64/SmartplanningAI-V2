/**
 * Tests E2E - Keyboard Shortcuts & Modal
 *
 * @ticket SP-264 - Phase 4 - Tests E2E
 * @see Context7 - Playwright keyboard shortcuts testing
 *
 * Tests couvrant :
 * - Raccourcis de navigation (G+H, G+E, G+P, etc.)
 * - Modal des raccourcis clavier (?)
 * - Accessibilité de la modal
 */

import { test, expect } from '../../fixtures/auth.fixture'

test.describe('Keyboard Shortcuts', () => {
  // =========================================================================
  // TESTS RACCOURCIS DE NAVIGATION
  // =========================================================================

  test.describe('Navigation shortcuts', () => {
    test('should navigate to dashboard with G then H', async ({
      directorPage,
    }) => {
      // D'abord aller sur une autre page
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      // Utiliser le raccourci G puis H
      await directorPage.keyboard.press('g')
      await directorPage.keyboard.press('h')

      // Vérifier la navigation vers le dashboard
      await expect(directorPage).toHaveURL(/\/app\/dashboard$/, {
        timeout: 5000,
      })
    })

    test('should navigate to employees with G then E', async ({
      directorPage,
    }) => {
      // Commencer sur le dashboard
      await directorPage.waitForLoadState('networkidle')

      // Utiliser le raccourci G puis E
      await directorPage.keyboard.press('g')
      await directorPage.keyboard.press('e')

      // Vérifier la navigation vers les employés
      await expect(directorPage).toHaveURL(/\/app\/dashboard\/employees/, {
        timeout: 5000,
      })
    })

    test('should navigate to schedules with G then P', async ({
      directorPage,
    }) => {
      // Utiliser le raccourci G puis P
      await directorPage.keyboard.press('g')
      await directorPage.keyboard.press('p')

      // Vérifier la navigation vers les plannings
      await expect(directorPage).toHaveURL(/\/schedules/, {
        timeout: 5000,
      })
    })

    test('should navigate to teams with G then T (Director only)', async ({
      directorPage,
    }) => {
      // Utiliser le raccourci G puis T
      await directorPage.keyboard.press('g')
      await directorPage.keyboard.press('t')

      // Vérifier la navigation vers les équipes
      await expect(directorPage).toHaveURL(/\/app\/director\/teams/, {
        timeout: 5000,
      })
    })

    test('should navigate to leaves with G then C', async ({
      directorPage,
    }) => {
      // Utiliser le raccourci G puis C
      await directorPage.keyboard.press('g')
      await directorPage.keyboard.press('c')

      // Vérifier la navigation vers les congés
      await expect(directorPage).toHaveURL(/\/leaves/, {
        timeout: 5000,
      })
    })
  })

  // =========================================================================
  // TESTS MODAL RACCOURCIS CLAVIER
  // =========================================================================

  test.describe('Shortcuts modal', () => {
    test('should open shortcuts modal with ?', async ({ directorPage }) => {
      // Appuyer sur ?
      await directorPage.keyboard.press('Shift+/')

      // Vérifier que la modal est ouverte
      await expect(
        directorPage.getByTestId('keyboard-shortcuts-modal')
      ).toBeVisible({ timeout: 5000 })
    })

    test('should display all shortcut categories', async ({ directorPage }) => {
      // Ouvrir la modal
      await directorPage.keyboard.press('Shift+/')

      await expect(
        directorPage.getByTestId('keyboard-shortcuts-modal')
      ).toBeVisible({ timeout: 5000 })

      // Vérifier les catégories
      await expect(directorPage.getByText('Navigation')).toBeVisible()
      await expect(directorPage.getByText('Actions')).toBeVisible()
      await expect(directorPage.getByText('Aide')).toBeVisible()
    })

    test('should close shortcuts modal with Escape', async ({
      directorPage,
    }) => {
      // Ouvrir la modal
      await directorPage.keyboard.press('Shift+/')

      const modal = directorPage.getByTestId('keyboard-shortcuts-modal')
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Fermer avec Escape
      await directorPage.keyboard.press('Escape')

      // Vérifier que la modal est fermée
      await expect(modal).not.toBeVisible()
    })

    test('should close shortcuts modal with close button', async ({
      directorPage,
    }) => {
      // Ouvrir la modal
      await directorPage.keyboard.press('Shift+/')

      const modal = directorPage.getByTestId('keyboard-shortcuts-modal')
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Cliquer sur le bouton Fermer
      await directorPage.getByRole('button', { name: 'Fermer' }).click()

      // Vérifier que la modal est fermée
      await expect(modal).not.toBeVisible()
    })

    test('should display platform-specific keys', async ({ directorPage }) => {
      // Ouvrir la modal
      await directorPage.keyboard.press('Shift+/')

      await expect(
        directorPage.getByTestId('keyboard-shortcuts-modal')
      ).toBeVisible({ timeout: 5000 })

      // Vérifier qu'il y a des kbd elements (touches)
      const kbdElements = directorPage.locator('kbd')
      await expect(kbdElements.first()).toBeVisible()
    })
  })

  // =========================================================================
  // TESTS D'ACCESSIBILITÉ
  // =========================================================================

  test.describe('Accessibility', () => {
    test('shortcuts modal should have proper ARIA attributes', async ({
      directorPage,
    }) => {
      // Ouvrir la modal
      await directorPage.keyboard.press('Shift+/')

      const modal = directorPage.getByTestId('keyboard-shortcuts-modal')
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Vérifier les attributs ARIA
      await expect(modal).toHaveAttribute('role', 'dialog')
      await expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    test('shortcuts modal should trap focus', async ({ directorPage }) => {
      // Ouvrir la modal
      await directorPage.keyboard.press('Shift+/')

      const modal = directorPage.getByTestId('keyboard-shortcuts-modal')
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Tabber plusieurs fois et vérifier que le focus reste dans la modal
      await directorPage.keyboard.press('Tab')
      await directorPage.keyboard.press('Tab')
      await directorPage.keyboard.press('Tab')

      // Le focus devrait rester dans la modal
      const focusedElement = await directorPage.evaluate(() => {
        const el = document.activeElement
        return el?.closest('[data-testid="keyboard-shortcuts-modal"]') !== null
      })

      expect(focusedElement).toBe(true)
    })

    test('keyboard navigation should not interfere with input fields', async ({
      directorPage,
    }) => {
      // Ouvrir la command palette
      await directorPage.keyboard.press('Meta+k')

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Taper "gh" dans l'input - ça ne devrait pas déclencher la navigation
      await input.fill('gh')

      // L'input devrait contenir "gh" et on ne devrait pas avoir navigué
      await expect(input).toHaveValue('gh')

      // La command palette devrait toujours être ouverte
      await expect(input).toBeVisible()
    })
  })
})
