/**
 * Tests E2E pour l'export des données utilisateur
 *
 * Vérifie le fonctionnement de la page d'export RGPD Article 20
 * et le téléchargement des données.
 *
 * @ticket SP-278
 */

import { test, expect, TEST_USERS } from '../../fixtures/auth.fixture'
import { ProfilePage } from '../../pages/profile.page'

test.describe('Export Data', () => {
  test.describe('Navigation', () => {
    test('should navigate to export page from profile actions', async ({
      employeePage,
    }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.clickExportData()
      await expect(employeePage).toHaveURL(/\/app\/profile\/export/)
    })

    test('should display back to profile link', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      const backLink = employeePage.getByTestId('back-to-profile')
      await expect(backLink).toBeVisible()
      await expect(backLink).toHaveAttribute('href', '/app/profile')
    })

    test('should navigate back to profile when clicking back link', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      await employeePage.getByTestId('back-to-profile').click()
      await expect(employeePage).toHaveURL(/\/app\/profile$/)
    })
  })

  test.describe('Page Content', () => {
    test('should display page title', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      await expect(
        employeePage.getByRole('heading', { name: 'Exporter mes données' })
      ).toBeVisible()
    })

    test('should display RGPD Article 20 reference', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      await expect(employeePage.getByText(/RGPD.*Article 20/)).toBeVisible()
    })

    test('should display RGPD alert with portability information', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      await expect(
        employeePage.getByText('Droit à la portabilité')
      ).toBeVisible()
    })

    test('should display export data card', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      await expect(
        employeePage.getByTestId('export-data-card')
      ).toBeVisible()
    })

    test('should display list of included data types', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      // Vérifier les éléments de la liste des données incluses
      await expect(
        employeePage.getByText('Informations de votre compte')
      ).toBeVisible()
      await expect(
        employeePage.getByText('Profil employé et compétences')
      ).toBeVisible()
      await expect(
        employeePage.getByText('Historique des plannings')
      ).toBeVisible()
      await expect(
        employeePage.getByText('Demandes de congés et soldes')
      ).toBeVisible()
      await expect(
        employeePage.getByText('Disponibilités déclarées')
      ).toBeVisible()
      await expect(employeePage.getByText('Notes personnelles')).toBeVisible()
      await expect(employeePage.getByText('Notifications reçues')).toBeVisible()
      await expect(
        employeePage.getByText("Notes d'incident rédigées")
      ).toBeVisible()
    })

    test('should display security note about excluded data', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      await expect(
        employeePage.getByText(/mots de passe.*tokens.*jamais inclus/)
      ).toBeVisible()
    })
  })

  test.describe('Export Button', () => {
    test('should display export button', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      await expect(
        employeePage.getByTestId('export-data-button')
      ).toBeVisible()
    })

    test('should have correct button text', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      await expect(
        employeePage.getByTestId('export-data-button')
      ).toHaveText(/Exporter mes données/)
    })

    test('should not be disabled initially', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      await expect(
        employeePage.getByTestId('export-data-button')
      ).not.toBeDisabled()
    })
  })

  test.describe('Download', () => {
    test('should trigger download when clicking export button', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      // Attendre le téléchargement
      const downloadPromise = employeePage.waitForEvent('download')
      await employeePage.getByTestId('export-data-button').click()
      const download = await downloadPromise

      // Vérifier le nom du fichier
      expect(download.suggestedFilename()).toMatch(
        /^smartplanning-export-.*\.json$/
      )
    })

    test('should download valid JSON file', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      const downloadPromise = employeePage.waitForEvent('download')
      await employeePage.getByTestId('export-data-button').click()
      const download = await downloadPromise

      // Lire et parser le contenu
      const stream = await download.createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer)
      }
      const content = Buffer.concat(chunks).toString('utf-8')

      // Vérifier que c'est un JSON valide
      expect(() => JSON.parse(content)).not.toThrow()
    })

    test('should include export info in downloaded file', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      const downloadPromise = employeePage.waitForEvent('download')
      await employeePage.getByTestId('export-data-button').click()
      const download = await downloadPromise

      const stream = await download.createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer)
      }
      const content = Buffer.concat(chunks).toString('utf-8')
      const data = JSON.parse(content)

      expect(data.exportInfo).toBeDefined()
      expect(data.exportInfo.format).toBe(
        'RGPD Article 20 - Portabilité des données'
      )
      expect(data.exportInfo.version).toBe('1.0')
    })

    test('should include account data in downloaded file', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      const downloadPromise = employeePage.waitForEvent('download')
      await employeePage.getByTestId('export-data-button').click()
      const download = await downloadPromise

      const stream = await download.createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer)
      }
      const content = Buffer.concat(chunks).toString('utf-8')
      const data = JSON.parse(content)

      expect(data.account).toBeDefined()
      expect(data.account.email).toBe(TEST_USERS.EMPLOYEE!.email)
    })

    test('should not include password in downloaded file', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      const downloadPromise = employeePage.waitForEvent('download')
      await employeePage.getByTestId('export-data-button').click()
      const download = await downloadPromise

      const stream = await download.createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer)
      }
      const content = Buffer.concat(chunks).toString('utf-8')
      const data = JSON.parse(content)

      expect(data.account.password).toBeUndefined()
    })
  })

  test.describe('Role Access', () => {
    test('should be accessible by Employee', async ({ employeePage }) => {
      await employeePage.goto('/app/profile/export')

      await expect(
        employeePage.getByTestId('export-data-button')
      ).toBeVisible()
    })

    test('should be accessible by Manager', async ({ managerPage }) => {
      await managerPage.goto('/app/profile/export')

      await expect(
        managerPage.getByTestId('export-data-button')
      ).toBeVisible()
    })

    test('should be accessible by Director', async ({ directorPage }) => {
      await directorPage.goto('/app/profile/export')

      await expect(
        directorPage.getByTestId('export-data-button')
      ).toBeVisible()
    })

    test('should be accessible by System Admin', async ({ adminPage }) => {
      await adminPage.goto('/app/profile/export')

      await expect(adminPage.getByTestId('export-data-button')).toBeVisible()
    })
  })

  test.describe('Export Content Verification', () => {
    test('should include all expected top-level keys', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      const downloadPromise = employeePage.waitForEvent('download')
      await employeePage.getByTestId('export-data-button').click()
      const download = await downloadPromise

      const stream = await download.createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer)
      }
      const content = Buffer.concat(chunks).toString('utf-8')
      const data = JSON.parse(content)

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
    })

    test('should include profile data for employee user', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      const downloadPromise = employeePage.waitForEvent('download')
      await employeePage.getByTestId('export-data-button').click()
      const download = await downloadPromise

      const stream = await download.createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer)
      }
      const content = Buffer.concat(chunks).toString('utf-8')
      const data = JSON.parse(content)

      expect(data.profile).not.toBeNull()
      expect(data.profile.firstName).toBeDefined()
      expect(data.profile.lastName).toBeDefined()
    })

    test('should have arrays for collection data types', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/profile/export')

      const downloadPromise = employeePage.waitForEvent('download')
      await employeePage.getByTestId('export-data-button').click()
      const download = await downloadPromise

      const stream = await download.createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer)
      }
      const content = Buffer.concat(chunks).toString('utf-8')
      const data = JSON.parse(content)

      expect(Array.isArray(data.schedules)).toBe(true)
      expect(Array.isArray(data.leaveRequests)).toBe(true)
      expect(Array.isArray(data.leaveBalances)).toBe(true)
      expect(Array.isArray(data.availabilities)).toBe(true)
      expect(Array.isArray(data.personalTasks)).toBe(true)
      expect(Array.isArray(data.notifications)).toBe(true)
      expect(Array.isArray(data.incidentNotesAuthored)).toBe(true)
    })
  })
})
