/**
 * Tests E2E pour la page Apparence (Préférences d'affichage)
 *
 * @ticket SP-276 - Préférences Affichage (Thème, Date, Heure)
 */

import { test, expect } from '../../fixtures/auth.fixture'

import { AppearancePage } from '../../pages/appearance.page'
import { SettingsPage } from '../../pages/settings.page'

test.describe('Appearance Page', () => {
  // ==========================================================================
  // Navigation
  // ==========================================================================
  test.describe('Navigation', () => {
    test('accède à la page via le hub paramètres', async ({ employeePage }) => {
      const appearancePage = new AppearancePage(employeePage)

      // Aller sur le hub paramètres
      await employeePage.goto('/app/settings')
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.waitForPageLoad()

      // Cliquer sur la section Apparence
      await employeePage
        .locator('a[href="/app/settings/appearance"]')
        .click()

      // Vérifier la navigation
      await expect(employeePage).toHaveURL('/app/settings/appearance')
      await appearancePage.waitForPageLoad()
    })

    test('affiche le header et le bouton retour', async ({ employeePage }) => {
      const appearancePage = new AppearancePage(employeePage)

      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.expectHeaderDisplayed()
      await expect(appearancePage.backButton).toBeVisible()
    })

    test('retourne au hub paramètres via le bouton retour', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)

      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.goBack()
      await expect(employeePage).toHaveURL('/app/settings')
    })
  })

  // ==========================================================================
  // Theme Selection
  // ==========================================================================
  test.describe('Theme Selection', () => {
    test('affiche les 3 options de thème', async ({ employeePage }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await expect(appearancePage.themeOptionSystem).toBeVisible()
      await expect(appearancePage.themeOptionLight).toBeVisible()
      await expect(appearancePage.themeOptionDark).toBeVisible()
    })

    test('sélectionne le thème clair', async ({ employeePage }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.selectTheme('light')
      await appearancePage.expectThemeSelected('light')
      await appearancePage.expectDocumentTheme('light')
    })

    test('sélectionne le thème sombre', async ({ employeePage }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.selectTheme('dark')
      await appearancePage.expectThemeSelected('dark')
      await appearancePage.expectDocumentTheme('dark')
    })

    test('sélectionne le thème système', async ({ employeePage }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.selectTheme('system')
      await appearancePage.expectThemeSelected('system')
    })
  })

  // ==========================================================================
  // Date Format Selection
  // ==========================================================================
  test.describe('Date Format Selection', () => {
    test('affiche le sélecteur de format de date', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await expect(appearancePage.dateFormatSelect).toBeVisible()
    })

    test('sélectionne le format FR (DD/MM/YYYY)', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.selectDateFormat('DD/MM/YYYY')
      await appearancePage.expectDateFormatSelected('DD/MM/YYYY')
      // Vérifier la prévisualisation
      await appearancePage.expectPreviewDateFormat(/^\d{2}\/\d{2}\/\d{4}$/)
    })

    test('sélectionne le format US (MM/DD/YYYY)', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.selectDateFormat('MM/DD/YYYY')
      await appearancePage.expectDateFormatSelected('MM/DD/YYYY')
    })

    test('sélectionne le format ISO (YYYY-MM-DD)', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

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
    test("affiche le sélecteur de format d'heure", async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await expect(appearancePage.timeFormatSelect).toBeVisible()
    })

    test('sélectionne le format 24h', async ({ employeePage }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.selectTimeFormat('24h')
      await appearancePage.expectTimeFormatSelected('24h')
    })

    test('sélectionne le format 12h', async ({ employeePage }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.selectTimeFormat('12h')
      await appearancePage.expectTimeFormatSelected('12h')
    })
  })

  // ==========================================================================
  // Preview
  // ==========================================================================
  test.describe('Preview Section', () => {
    test('affiche la section de prévisualisation', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await expect(appearancePage.preferencesPreview).toBeVisible()
    })

    test('affiche les valeurs de prévisualisation', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      await appearancePage.expectPreviewUpdated()
    })

    test('met à jour la prévisualisation lors du changement de format', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

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
    test('conserve les préférences après refresh', async ({
      employeePage,
    }) => {
      const appearancePage = new AppearancePage(employeePage)
      await appearancePage.goto()
      await appearancePage.waitForPageLoad()

      // Sélectionner des préférences spécifiques
      await appearancePage.selectTheme('dark')
      await appearancePage.selectDateFormat('YYYY-MM-DD')
      await appearancePage.selectTimeFormat('12h')

      // Attendre que la sauvegarde soit effectuée
      await employeePage.waitForTimeout(500)

      // Rafraîchir la page
      await employeePage.reload()
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
  test('affiche toutes les sections', async ({ employeePage }) => {
    const appearancePage = new AppearancePage(employeePage)
    await appearancePage.goto()
    await appearancePage.waitForPageLoad()

    await appearancePage.expectAllSectionsVisible()
  })
})
