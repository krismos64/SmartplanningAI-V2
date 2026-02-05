/**
 * Tests E2E pour la page Apparence (Préférences d'affichage)
 *
 * @ticket SP-276 - Préférences Affichage (Thème, Date, Heure)
 */

import { test, expect } from '@playwright/test'

import { AppearancePage } from '../../pages/appearance.page'
import { LoginPage } from '../../pages/login.page'
import { SettingsPage } from '../../pages/settings.page'

test.describe('Appearance Page', () => {
  let loginPage: LoginPage
  let appearancePage: AppearancePage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    appearancePage = new AppearancePage(page)

    // Connexion avec un utilisateur de test
    await loginPage.goto()
    await loginPage.login('employee@demo.com', 'Demo123!')
    await page.waitForURL('/app/dashboard')
  })

  // ==========================================================================
  // Navigation
  // ==========================================================================
  test.describe('Navigation', () => {
    test('accède à la page via le hub paramètres', async ({ page }) => {
      // Aller sur le hub paramètres
      await page.goto('/app/settings')
      const settingsPage = new SettingsPage(page)
      await settingsPage.waitForPageLoad()

      // Cliquer sur la section Apparence
      await page.locator('a[href="/app/settings/appearance"]').click()

      // Vérifier la navigation
      await expect(page).toHaveURL('/app/settings/appearance')
      await appearancePage.waitForPageLoad()
    })

    test('affiche le header et le bouton retour', async () => {
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.expectHeaderDisplayed()
      await expect(appearancePage.backButton).toBeVisible()
    })

    test('retourne au hub paramètres via le bouton retour', async ({
      page,
    }) => {
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.goBack()
      await expect(page).toHaveURL('/app/settings')
    })
  })

  // ==========================================================================
  // Theme Selection
  // ==========================================================================
  test.describe('Theme Selection', () => {
    test.beforeEach(async () => {
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()
    })

    test('affiche les 3 options de thème', async () => {
      await expect(appearancePage.themeOptionSystem).toBeVisible()
      await expect(appearancePage.themeOptionLight).toBeVisible()
      await expect(appearancePage.themeOptionDark).toBeVisible()
    })

    test('sélectionne le thème clair', async () => {
      await appearancePage.selectTheme('light')
      await appearancePage.expectThemeSelected('light')
      await appearancePage.expectDocumentTheme('light')
    })

    test('sélectionne le thème sombre', async () => {
      await appearancePage.selectTheme('dark')
      await appearancePage.expectThemeSelected('dark')
      await appearancePage.expectDocumentTheme('dark')
    })

    test('sélectionne le thème système', async () => {
      await appearancePage.selectTheme('system')
      await appearancePage.expectThemeSelected('system')
    })
  })

  // ==========================================================================
  // Date Format Selection
  // ==========================================================================
  test.describe('Date Format Selection', () => {
    test.beforeEach(async () => {
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()
    })

    test('affiche le sélecteur de format de date', async () => {
      await expect(appearancePage.dateFormatSelect).toBeVisible()
    })

    test('sélectionne le format FR (DD/MM/YYYY)', async () => {
      await appearancePage.selectDateFormat('DD/MM/YYYY')
      await appearancePage.expectDateFormatSelected('DD/MM/YYYY')
      // Vérifier la prévisualisation
      await appearancePage.expectPreviewDateFormat(/^\d{2}\/\d{2}\/\d{4}$/)
    })

    test('sélectionne le format US (MM/DD/YYYY)', async () => {
      await appearancePage.selectDateFormat('MM/DD/YYYY')
      await appearancePage.expectDateFormatSelected('MM/DD/YYYY')
    })

    test('sélectionne le format ISO (YYYY-MM-DD)', async () => {
      await appearancePage.selectDateFormat('YYYY-MM-DD')
      await appearancePage.expectDateFormatSelected('YYYY-MM-DD')
      // Vérifier la prévisualisation
      await appearancePage.expectPreviewDateFormat(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  // ==========================================================================
  // Time Format Selection
  // ==========================================================================
  test.describe('Time Format Selection', () => {
    test.beforeEach(async () => {
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()
    })

    test("affiche le sélecteur de format d'heure", async () => {
      await expect(appearancePage.timeFormatSelect).toBeVisible()
    })

    test('sélectionne le format 24h', async () => {
      await appearancePage.selectTimeFormat('24h')
      await appearancePage.expectTimeFormatSelected('24h')
    })

    test('sélectionne le format 12h', async () => {
      await appearancePage.selectTimeFormat('12h')
      await appearancePage.expectTimeFormatSelected('12h')
    })
  })

  // ==========================================================================
  // Preview
  // ==========================================================================
  test.describe('Preview Section', () => {
    test.beforeEach(async () => {
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()
    })

    test('affiche la section de prévisualisation', async () => {
      await expect(appearancePage.preferencesPreview).toBeVisible()
    })

    test('affiche les valeurs de prévisualisation', async () => {
      await appearancePage.expectPreviewUpdated()
    })

    test('met à jour la prévisualisation lors du changement de format', async () => {
      // Changer le format de date
      await appearancePage.selectDateFormat('YYYY-MM-DD')

      // La prévisualisation doit être au format ISO
      await appearancePage.expectPreviewDateFormat(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  // ==========================================================================
  // Persistence
  // ==========================================================================
  test.describe('Persistence', () => {
    test('conserve les préférences après refresh', async ({ page }) => {
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      // Sélectionner des préférences spécifiques
      await appearancePage.selectTheme('dark')
      await appearancePage.selectDateFormat('YYYY-MM-DD')
      await appearancePage.selectTimeFormat('12h')

      // Attendre que la sauvegarde soit effectuée
      await page.waitForTimeout(500)

      // Rafraîchir la page
      await page.reload()
      await appearancePage.waitForPageLoad()

      // Vérifier que les préférences sont conservées
      await appearancePage.expectThemeSelected('dark')
      await appearancePage.expectDateFormatSelected('YYYY-MM-DD')
      await appearancePage.expectTimeFormatSelected('12h')
    })
  })

  // ==========================================================================
  // All Sections Visible
  // ==========================================================================
  test('affiche toutes les sections', async () => {
    await appearancePage.goto()
    await appearancePage.waitForPageLoad()

    await appearancePage.expectAllSectionsVisible()
  })
})
