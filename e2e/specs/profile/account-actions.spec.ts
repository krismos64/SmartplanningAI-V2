/**
 * Tests E2E consolidés — Actions compte (Export RGPD + Suppression)
 *
 * Fusionne export-data.spec.ts et delete-account.spec.ts.
 * Vérifie les fonctionnalités RGPD Article 17 (suppression) et
 * Article 20 (portabilité/export).
 *
 * @ticket SP-277, SP-278
 */

import { test, expect, TEST_USERS } from '../../fixtures/auth.fixture'
import { DeleteAccountPage } from '../../pages/delete-account.page'
import { ProfilePage } from '../../pages/profile.page'

// =============================================================================
// Export de données (RGPD Article 20)
// =============================================================================

test.describe('Export Data — RGPD Article 20', () => {
  test('navigation vers la page export depuis le profil', async ({
    employeePage,
  }) => {
    const profilePage = new ProfilePage(employeePage)
    await profilePage.goto()
    await profilePage.waitForPageLoad()

    await profilePage.clickExportData()
    await expect(employeePage).toHaveURL(/\/app\/profile\/export/, {
      timeout: 30000,
    })
  })

  test('affiche le contenu RGPD et la liste des données incluses', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/profile/export')

    await expect(
      employeePage.getByRole('heading', { name: 'Exporter mes données' })
    ).toBeVisible()
    await expect(
      employeePage.getByRole('heading', { name: /RGPD.*Article 20/ })
    ).toBeVisible()
    await expect(employeePage.getByTestId('export-data-card')).toBeVisible()
    await expect(
      employeePage.getByText('Informations de votre compte')
    ).toBeVisible()
    await expect(
      employeePage.getByText('Historique des plannings')
    ).toBeVisible()
    await expect(
      employeePage.getByText(/mots de passe.*tokens.*jamais inclus/)
    ).toBeVisible()
  })

  test('télécharge un JSON valide avec toutes les clés attendues', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/profile/export')

    const downloadPromise = employeePage.waitForEvent('download')
    await employeePage.getByTestId('export-data-button').click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(
      /^smartplanning-export-.*\.json$/
    )

    const stream = await download.createReadStream()
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer)
    }
    const content = Buffer.concat(chunks).toString('utf-8')
    const data = JSON.parse(content)

    // Vérifier les clés top-level
    const expectedKeys = [
      'exportInfo',
      'account',
      'profile',
      'schedules',
      'leaveRequests',
      'leaveBalances',
      'availabilities',
      'personalTasks',
      'notifications',
      'incidentNotesAuthored',
    ]
    for (const key of expectedKeys) {
      expect(data).toHaveProperty(key)
    }

    // Vérifier les infos export
    expect(data.exportInfo.format).toBe(
      'RGPD Article 20 - Portabilité des données'
    )
    expect(data.account.email).toBe(TEST_USERS.EMPLOYEE!.email)
    expect(data.account.password).toBeUndefined()

    // Vérifier que les collections sont des arrays
    expect(Array.isArray(data.schedules)).toBe(true)
    expect(Array.isArray(data.leaveRequests)).toBe(true)
    expect(Array.isArray(data.personalTasks)).toBe(true)
  })

  test('retour vers le profil via le lien back', async ({ employeePage }) => {
    await employeePage.goto('/app/profile/export')
    await employeePage.getByTestId('back-to-profile').click()
    await expect(employeePage).toHaveURL(/\/app\/profile$/)
  })
})

// =============================================================================
// Suppression de compte (RGPD Article 17)
// =============================================================================

test.describe('Delete Account — RGPD Article 17', () => {
  test('affiche le formulaire avec contenu RGPD', async ({ employeePage }) => {
    const deletePage = new DeleteAccountPage(employeePage)
    await deletePage.goto()
    await deletePage.waitForPageLoad()

    await expect(deletePage.pageTitle).toBeVisible()
    await expect(deletePage.confirmEmailInput).toBeVisible()
    await expect(deletePage.passwordInput).toBeVisible()
    await expect(deletePage.confirmDeletionCheckbox).toBeVisible()
    await expect(deletePage.rgpdAlertTitle).toBeVisible()
    await deletePage.expectDataListVisible()
    await expect(
      employeePage.locator('[role="alert"]').getByText(/Article 17/)
    ).toBeVisible()
  })

  test('redirige vers login si non authentifié', async ({ page }) => {
    await page.goto('/app/profile/delete')
    await expect(page).toHaveURL(/\/login/)
  })

  test('navigation retour vers le profil', async ({ employeePage }) => {
    const deletePage = new DeleteAccountPage(employeePage)
    await deletePage.goto()
    await deletePage.waitForPageLoad()

    await deletePage.goBackToProfile()
    await expect(employeePage).toHaveURL(/\/app\/profile$/)
  })

  test('toggle visibilité mot de passe', async ({ employeePage }) => {
    const deletePage = new DeleteAccountPage(employeePage)
    await deletePage.goto()
    await deletePage.waitForPageLoad()

    await deletePage.expectPasswordHidden()
    await deletePage.togglePasswordVisibility()
    await deletePage.expectPasswordVisible()
    await deletePage.togglePasswordVisibility()
    await deletePage.expectPasswordHidden()
  })

  test('bouton supprimer désactivé sans checkbox, activé avec formulaire complet', async ({
    employeePage,
  }) => {
    const deletePage = new DeleteAccountPage(employeePage)
    await deletePage.goto()
    await deletePage.waitForPageLoad()

    await deletePage.expectDeleteButtonDisabled()

    await deletePage.fillEmail('test@example.com')
    await deletePage.fillPassword('Password123!')
    await deletePage.expectDeleteButtonDisabled()

    await deletePage.checkConfirmDeletion()
    await deletePage.expectDeleteButtonEnabled()
  })

  test('validation : email invalide, email incorrect, mot de passe incorrect', async ({
    employeePage,
  }) => {
    const deletePage = new DeleteAccountPage(employeePage)
    await deletePage.goto()
    await deletePage.waitForPageLoad()

    // Email invalide
    await deletePage.fillEmail('invalid-email')
    await deletePage.fillPassword('Password123!')
    await deletePage.checkConfirmDeletion()
    await deletePage.deleteButton.click()
    await deletePage.expectEmailError('Format email invalide')

    // Email incorrect (ne correspond pas)
    await deletePage.fillEmail('wrong@email.com')
    await deletePage.deleteButton.click()
    await deletePage.expectEmailError('ne correspond pas')
  })

  test('erreur mot de passe incorrect', async ({ employeePage }) => {
    const deletePage = new DeleteAccountPage(employeePage)
    await deletePage.goto()
    await deletePage.waitForPageLoad()

    await deletePage.fillEmail('bob.wilson@techcorp.com')
    await deletePage.fillPassword('WrongPassword123!')
    await deletePage.checkConfirmDeletion()
    await deletePage.deleteButton.click()

    await deletePage.expectPasswordError('Mot de passe incorrect')
  })
})
