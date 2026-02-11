/**
 * Tests E2E pour la page Préférences Notifications
 *
 * @ticket SP-275 - Préférences Notifications
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { NotificationsPreferencesPage } from '../../pages/notifications-preferences.page'
import { SettingsPage } from '../../pages/settings.page'

test.describe('Notifications Preferences Page', () => {
  // ==========================================================================
  // Navigation
  // ==========================================================================
  test.describe('Navigation', () => {
    test('accède à la page via le hub paramètres', async ({ employeePage }) => {
      const settingsPage = new SettingsPage(employeePage)
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      // Aller sur le hub paramètres
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      // Cliquer sur la section Notifications
      await employeePage
        .locator('a[href="/app/settings/notifications"]')
        .click()

      // Vérifier la navigation
      await expect(employeePage).toHaveURL('/app/settings/notifications')
      await notificationsPage.waitForPageLoad()
    })

    test('affiche le header et le bouton retour', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      await notificationsPage.expectHeaderDisplayed()
      await expect(notificationsPage.backButton).toBeVisible()
    })

    test('retourne au hub paramètres via le bouton retour', async ({
      employeePage,
    }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      await notificationsPage.goBack()
      await expect(employeePage).toHaveURL('/app/settings')
    })
  })

  // ==========================================================================
  // Categories Display
  // ==========================================================================
  test.describe('Categories Display', () => {
    test('affiche les 4 catégories', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      await notificationsPage.expectAllCategoriesVisible()
    })

    test('affiche les switches email et in-app pour chaque catégorie', async ({
      employeePage,
    }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      const categories = ['planning', 'leaves', 'tasks', 'system'] as const

      for (const category of categories) {
        await expect(notificationsPage.getEmailSwitch(category)).toBeVisible()
        await expect(notificationsPage.getInAppSwitch(category)).toBeVisible()
      }
    })

    test('affiche le bouton de réinitialisation', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      await expect(notificationsPage.resetButton).toBeVisible()
    })
  })

  // ==========================================================================
  // Default State
  // ==========================================================================
  test.describe('Default State', () => {
    test('toutes les préférences sont activées par défaut', async ({
      employeePage,
    }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      // Reset d'abord pour s'assurer de l'état par défaut
      await notificationsPage.reset()

      // Attendre le toast puis vérifier
      await notificationsPage.expectToastReset()

      await notificationsPage.expectAllPreferencesEnabled()
    })
  })

  // ==========================================================================
  // Toggle Preferences
  // ==========================================================================
  test.describe('Toggle Preferences', () => {
    test('toggle email pour planning', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      // Reset pour avoir un état propre
      await notificationsPage.reset()
      await notificationsPage.expectToastReset()

      await notificationsPage.expectEmailEnabled('planning', true)
      await notificationsPage.toggleEmail('planning')
      await notificationsPage.expectEmailEnabled('planning', false)
      await notificationsPage.expectToastSuccess()
    })

    test('toggle in-app pour leaves', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      // Reset pour avoir un état propre
      await notificationsPage.reset()
      await notificationsPage.expectToastReset()

      await notificationsPage.expectInAppEnabled('leaves', true)
      await notificationsPage.toggleInApp('leaves')
      await notificationsPage.expectInAppEnabled('leaves', false)
      await notificationsPage.expectToastSuccess()
    })

    test('toggle email pour tasks', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      // Reset pour avoir un état propre
      await notificationsPage.reset()
      await notificationsPage.expectToastReset()

      await notificationsPage.toggleEmail('tasks')
      await notificationsPage.expectEmailEnabled('tasks', false)
      await notificationsPage.expectToastSuccess()
    })

    test('toggle in-app pour system', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      // Reset pour avoir un état propre
      await notificationsPage.reset()
      await notificationsPage.expectToastReset()

      await notificationsPage.toggleInApp('system')
      await notificationsPage.expectInAppEnabled('system', false)
      await notificationsPage.expectToastSuccess()
    })
  })

  // ==========================================================================
  // Persistence
  // ==========================================================================
  test.describe('Persistence', () => {
    test('conserve les préférences après refresh', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      // Reset d'abord
      await notificationsPage.reset()
      await notificationsPage.expectToastReset()

      // Toggle quelques préférences
      await notificationsPage.toggleEmail('planning')
      await notificationsPage.expectToastSuccess()

      await notificationsPage.toggleInApp('leaves')
      await notificationsPage.expectToastSuccess()

      // Attendre que la sauvegarde soit effectuée
      await employeePage.waitForTimeout(500)

      // Rafraîchir la page
      await employeePage.reload()
      await notificationsPage.waitForPageLoad()

      // Vérifier que les préférences sont conservées
      await notificationsPage.expectEmailEnabled('planning', false)
      await notificationsPage.expectInAppEnabled('leaves', false)

      // Les autres doivent être toujours activées
      await notificationsPage.expectEmailEnabled('tasks', true)
      await notificationsPage.expectInAppEnabled('system', true)
    })
  })

  // ==========================================================================
  // Reset
  // ==========================================================================
  test.describe('Reset', () => {
    test('réinitialise toutes les préférences', async ({ employeePage }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      // Reset d'abord pour partir d'un état connu (tout activé)
      await notificationsPage.reset()
      await notificationsPage.expectToastReset()

      // Attendre la stabilisation
      await employeePage.waitForTimeout(500)

      // Vérifier l'état initial après reset
      await notificationsPage.expectAllPreferencesEnabled()

      // Toggle quelques préférences off
      await notificationsPage.toggleEmail('planning')
      await notificationsPage.expectToastSuccess()

      await notificationsPage.toggleInApp('leaves')
      await notificationsPage.expectToastSuccess()

      await notificationsPage.toggleEmail('tasks')
      await notificationsPage.expectToastSuccess()

      // Vérifier qu'elles sont désactivées
      await notificationsPage.expectEmailEnabled('planning', false)
      await notificationsPage.expectInAppEnabled('leaves', false)
      await notificationsPage.expectEmailEnabled('tasks', false)

      // Reset
      await notificationsPage.reset()
      await notificationsPage.expectToastReset()

      // Toutes doivent être réactivées
      await notificationsPage.expectAllPreferencesEnabled()
    })
  })

  // ==========================================================================
  // Accessibility
  // ==========================================================================
  test.describe('Accessibility', () => {
    test('switches ont des aria-labels accessibles', async ({
      employeePage,
    }) => {
      const notificationsPage = new NotificationsPreferencesPage(employeePage)

      await notificationsPage.goto()
      await notificationsPage.waitForPageLoad()

      const emailSwitch = notificationsPage.getEmailSwitch('planning')
      await expect(emailSwitch).toHaveAttribute('aria-label', /email/i)

      const inAppSwitch = notificationsPage.getInAppSwitch('planning')
      await expect(inAppSwitch).toHaveAttribute('aria-label', /in-app/i)
    })
  })
})
