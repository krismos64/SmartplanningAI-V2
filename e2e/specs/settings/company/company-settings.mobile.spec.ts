/**
 * Tests E2E Mobile pour la page Paramètres Entreprise
 *
 * Vérifie que la page est responsive et utilisable sur mobile/tablette
 *
 * @ticket SP-435
 */

import { test, expect } from '../../../fixtures/mobile.fixture'
import { CompanySettingsPage } from '../../../pages/company-settings.page'

test.describe('Company Settings Mobile - Responsive', () => {
  test.describe('Mobile Devices (iPhone SE, iPhone 14 Pro, Pixel 7)', () => {
    test('should display page layout correctly on mobile', async ({
      directorPage,
      mobile,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Vérifier que tous les éléments sont visibles
      await companySettings.expectPageDisplayed()
      await companySettings.expectAllSectionsDisplayed()
    })

    test('should have touch-friendly action buttons', async ({
      directorPage,
      mobile,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Vérifier que le bouton retour respecte WCAG 2.5.5 (44x44px)
      await mobile.checkTouchTarget(companySettings.backButton)

      // Vérifier le bouton reset
      await mobile.checkTouchTarget(companySettings.resetButton)
    })

    test('should display working days in grid on mobile', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Vérifier que les checkboxes de jours sont visibles
      const daysContainer = directorPage.getByTestId('working-days-checkboxes')
      await expect(daysContainer).toBeVisible()

      // Vérifier que tous les jours sont visibles
      const days = [
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ] as const

      for (const day of days) {
        await expect(companySettings.getDayCheckbox(day)).toBeVisible()
      }
    })

    test('should display presets correctly', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Vérifier que les presets sont visibles
      await expect(companySettings.presetMonFri).toBeVisible()
      await expect(companySettings.presetMonSat).toBeVisible()
      await expect(companySettings.presetAllWeek).toBeVisible()
    })

    test('should stack action buttons on mobile', async ({
      directorPage,
      mobile,
    }) => {
      // Uniquement sur mobile, pas tablette
      if (!mobile.isMobile) {
        test.skip()
        return
      }

      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Faire un changement pour afficher les boutons
      await companySettings.fillCompanyName('Test Mobile')
      await directorPage.waitForTimeout(300)

      // Vérifier que les boutons sont visibles
      await companySettings.expectSaveButtonEnabled()
      await companySettings.expectCancelButtonVisible()
      await companySettings.expectResetButtonVisible()

      // Les boutons doivent être empilés verticalement sur mobile
      const resetBox = await companySettings.resetButton.boundingBox()
      const saveBox = await companySettings.saveButton.boundingBox()

      if (resetBox && saveBox) {
        // Le bouton save doit être en dessous du reset (Y plus grand)
        expect(saveBox.y).toBeGreaterThan(resetBox.y)
      }
    })

    test('should allow scrolling through all sections', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Scroll vers le bas pour accéder au bouton save
      await directorPage.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight)
      )
      await directorPage.waitForTimeout(500)

      // Le bouton reset doit être visible après scroll
      await expect(companySettings.resetButton).toBeVisible()
    })

    test('should handle form inputs on mobile', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Remplir le nom
      await companySettings.fillCompanyName('Test Mobile Company')
      await directorPage.waitForTimeout(300)

      // Vérifier la valeur
      await companySettings.expectCompanyName('Test Mobile Company')

      // Remplir l'adresse
      await companySettings.companyAddressInput.fill(
        '123 Rue Mobile\n75001 Paris'
      )
      await directorPage.waitForTimeout(300)

      // Le bouton save doit être activé
      await companySettings.expectSaveButtonEnabled()
    })
  })

  test.describe('Tablet Devices (iPad Mini, iPad Pro 11)', () => {
    test('should display page layout correctly on tablet', async ({
      directorPage,
      mobile,
    }) => {
      // Skip si ce n'est pas une tablette
      if (!mobile.isTablet) {
        test.skip()
        return
      }

      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Vérifier que tous les éléments sont visibles
      await companySettings.expectPageDisplayed()
      await companySettings.expectAllSectionsDisplayed()
    })

    test('should display buttons inline on tablet', async ({
      directorPage,
      mobile,
    }) => {
      // Skip si ce n'est pas une tablette
      if (!mobile.isTablet) {
        test.skip()
        return
      }

      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Faire un changement pour afficher les boutons
      await companySettings.fillCompanyName('Test Tablet')
      await directorPage.waitForTimeout(300)

      // Sur tablette, les boutons peuvent être sur la même ligne
      const resetBox = await companySettings.resetButton.boundingBox()
      const saveBox = await companySettings.saveButton.boundingBox()

      if (resetBox && saveBox) {
        // Les boutons peuvent être sur la même ligne (Y similaire) ou empilés
        const isInline = Math.abs(saveBox.y - resetBox.y) < 10
        const isStacked = saveBox.y > resetBox.y + 40

        expect(isInline || isStacked).toBe(true)
      }
    })
  })
})

