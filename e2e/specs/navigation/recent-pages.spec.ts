/**
 * Tests E2E - Recent Pages (localStorage)
 *
 * @ticket SP-264 - Phase 4 - Tests E2E
 * @see Context7 - Playwright localStorage management
 *
 * Tests couvrant :
 * - Stockage des pages visitées
 * - Affichage dans Command Palette
 * - Déduplication
 * - Limite de 5 pages
 * - Persistance entre sessions
 */

import { test, expect } from '../../fixtures/auth.fixture'

// TODO: Réactiver quand les routes /schedules, /leaves, /tasks, /stats seront implémentées
test.describe.skip('Recent Pages', () => {
  // =========================================================================
  // SETUP : Nettoyer localStorage avant chaque test
  // =========================================================================

  test.beforeEach(async ({ directorPage }) => {
    // Nettoyer localStorage des pages récentes
    await directorPage.evaluate(() => {
      localStorage.removeItem('smartplanning:recent-pages')
    })
  })

  // =========================================================================
  // TESTS DE STOCKAGE
  // =========================================================================

  test.describe('Storage', () => {
    test('should store visited page in localStorage', async ({
      directorPage,
    }) => {
      // Naviguer vers une page
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      // Vérifier que la page est stockée dans localStorage
      const storedPages = await directorPage.evaluate(() => {
        const data = localStorage.getItem('smartplanning:recent-pages')
        return data ? JSON.parse(data) : []
      })

      expect(storedPages).toHaveLength(1)
      expect(storedPages[0].path).toBe('/app/dashboard/employees')
      expect(storedPages[0].title).toBe('Collaborateurs')
    })

    test('should store multiple visited pages', async ({ directorPage }) => {
      // Naviguer vers plusieurs pages
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      await directorPage.goto('/app/director/teams')
      await directorPage.waitForLoadState('networkidle')

      await directorPage.goto('/schedules')
      await directorPage.waitForLoadState('networkidle')

      // Vérifier le stockage
      const storedPages = await directorPage.evaluate(() => {
        const data = localStorage.getItem('smartplanning:recent-pages')
        return data ? JSON.parse(data) : []
      })

      expect(storedPages.length).toBeGreaterThanOrEqual(3)
      // La plus récente en premier
      expect(storedPages[0].path).toBe('/schedules')
    })
  })

  // =========================================================================
  // TESTS DE DÉDUPLICATION
  // =========================================================================

  test.describe('Deduplication', () => {
    test('should move revisited page to top', async ({ directorPage }) => {
      // Visiter trois pages
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      await directorPage.goto('/schedules')
      await directorPage.waitForLoadState('networkidle')

      // Revisiter la première page
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      // Vérifier l'ordre
      const storedPages = await directorPage.evaluate(() => {
        const data = localStorage.getItem('smartplanning:recent-pages')
        return data ? JSON.parse(data) : []
      })

      expect(storedPages[0].path).toBe('/app/dashboard/employees')
      // Pas de doublons
      const employeePaths = storedPages.filter(
        (p: { path: string }) => p.path === '/app/dashboard/employees'
      )
      expect(employeePaths).toHaveLength(1)
    })
  })

  // =========================================================================
  // TESTS DE LIMITE
  // =========================================================================

  test.describe('Limit', () => {
    test('should limit to 5 pages maximum', async ({ directorPage }) => {
      // Naviguer vers 7 pages différentes
      const routes = [
        '/app/dashboard',
        '/app/dashboard/employees',
        '/app/director/teams',
        '/schedules',
        '/leaves',
        '/tasks',
        '/stats',
      ]

      for (const route of routes) {
        await directorPage.goto(route)
        await directorPage.waitForLoadState('networkidle')
        // Petite pause pour s'assurer que le tracking est fait
        await directorPage.waitForTimeout(100)
      }

      // Vérifier la limite
      const storedPages = await directorPage.evaluate(() => {
        const data = localStorage.getItem('smartplanning:recent-pages')
        return data ? JSON.parse(data) : []
      })

      expect(storedPages).toHaveLength(5)
      // La plus récente doit être en premier
      expect(storedPages[0].path).toBe('/stats')
    })
  })

  // =========================================================================
  // TESTS D'AFFICHAGE DANS COMMAND PALETTE
  // =========================================================================

  test.describe('Display in Command Palette', () => {
    test('should show recent pages in command palette', async ({
      directorPage,
    }) => {
      // Naviguer vers quelques pages d'abord
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      await directorPage.goto('/schedules')
      await directorPage.waitForLoadState('networkidle')

      // Ouvrir la command palette
      await directorPage.keyboard.press('Meta+k')

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Vérifier que le groupe "Pages récentes" est visible
      await expect(
        directorPage.getByText('Pages récentes', { exact: false })
      ).toBeVisible()
    })

    test('should navigate to recent page when clicked', async ({
      directorPage,
    }) => {
      // D'abord visiter une page
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      // Aller sur une autre page
      await directorPage.goto('/app/dashboard')
      await directorPage.waitForLoadState('networkidle')

      // Ouvrir la command palette
      await directorPage.keyboard.press('Meta+k')

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Chercher dans les pages récentes
      await input.fill('collabor')

      // Cliquer sur la page récente
      const recentItem = directorPage.getByRole('option', {
        name: /collaborateurs/i,
      })
      await recentItem.click()

      // Vérifier la navigation
      await expect(directorPage).toHaveURL(/\/app\/dashboard\/employees/)
    })

    test('should show relative time for recent pages', async ({
      directorPage,
    }) => {
      // Visiter une page
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      // Ouvrir la command palette
      await directorPage.keyboard.press('Meta+k')

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible({ timeout: 5000 })

      // Vérifier qu'un temps relatif est affiché (ex: "À l'instant")
      await expect(directorPage.getByText(/À l'instant|Il y a/i)).toBeVisible()
    })
  })

  // =========================================================================
  // TESTS DE PERSISTANCE
  // =========================================================================

  test.describe('Persistence', () => {
    test('should persist recent pages after page reload', async ({
      directorPage,
    }) => {
      // Visiter une page
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('networkidle')

      // Recharger la page
      await directorPage.reload()
      await directorPage.waitForLoadState('networkidle')

      // Vérifier que les pages sont toujours stockées
      const storedPages = await directorPage.evaluate(() => {
        const data = localStorage.getItem('smartplanning:recent-pages')
        return data ? JSON.parse(data) : []
      })

      expect(storedPages.length).toBeGreaterThanOrEqual(1)
    })
  })
})
