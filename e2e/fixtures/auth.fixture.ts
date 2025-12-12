/**
 * Fixtures d'authentification par role pour tests E2E
 *
 * Fournit des fixtures Playwright avec authentification pre-configuree
 * pour chaque role utilisateur (Employee, Manager, Director, System Admin).
 *
 * @ticket SP-149
 */

import { test as base, Page, expect } from '@playwright/test'

// =============================================================================
// Types
// =============================================================================

export interface TestUser {
  email: string
  password: string
  role: 'EMPLOYEE' | 'MANAGER' | 'DIRECTOR' | 'SYSTEM_ADMIN'
  expectedDashboard: string
  displayName: string
}

export interface AuthFixtures {
  /** Page authentifiee en tant qu'Employee */
  employeePage: Page
  /** Page authentifiee en tant que Manager */
  managerPage: Page
  /** Page authentifiee en tant que Director */
  directorPage: Page
  /** Page authentifiee en tant que System Admin */
  adminPage: Page
  /** Fonction utilitaire pour login */
  loginAs: (page: Page, user: TestUser) => Promise<void>
}

// =============================================================================
// Configuration des utilisateurs de test
// =============================================================================

export const TEST_USERS: Record<string, TestUser> = {
  EMPLOYEE: {
    email: 'bob.wilson@techcorp.com',
    password: 'Password123!',
    role: 'EMPLOYEE',
    expectedDashboard: '/app/dashboard',
    displayName: 'Bob Wilson',
  },
  MANAGER: {
    email: 'jane.smith@techcorp.com',
    password: 'Password123!',
    role: 'MANAGER',
    expectedDashboard: '/app/manager/dashboard',
    displayName: 'Jane Smith',
  },
  DIRECTOR: {
    email: 'john.doe@techcorp.com',
    password: 'Password123!',
    role: 'DIRECTOR',
    expectedDashboard: '/app/director/dashboard',
    displayName: 'John Doe',
  },
  SYSTEM_ADMIN: {
    email: 'admin@smartplanning.io',
    password: 'Password123!',
    role: 'SYSTEM_ADMIN',
    expectedDashboard: '/dashboard/admin',
    displayName: 'Super Admin',
  },
}

// =============================================================================
// Fonction de login reutilisable
// =============================================================================

/**
 * Authentifie un utilisateur sur la page de login
 *
 * @param page - Instance Playwright Page
 * @param user - Utilisateur a authentifier
 */
export async function loginAs(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login')

  // Remplir le formulaire
  await page.getByPlaceholder('vous@entreprise.com').fill(user.email)
  await page.getByPlaceholder('••••••••').fill(user.password)

  // Soumettre
  await page.getByRole('button', { name: 'Se connecter' }).click()

  // Attendre la confirmation de connexion
  await expect(page.getByText(/Connexion réussie/i)).toBeVisible({
    timeout: 10000,
  })

  // Attendre la redirection vers le dashboard attendu
  await page.waitForURL(`**${user.expectedDashboard}**`, { timeout: 15000 })
}

/**
 * Logout de l'utilisateur courant
 *
 * @param page - Instance Playwright Page
 */
export async function logout(page: Page): Promise<void> {
  // Cliquer sur le menu utilisateur ou bouton deconnexion
  const logoutButton = page.getByRole('button', { name: /deconnexion|logout/i })
  if (await logoutButton.isVisible()) {
    await logoutButton.click()
  } else {
    // Alternative: menu dropdown
    const userMenu = page.getByRole('button', { name: /profil|user|menu/i })
    if (await userMenu.isVisible()) {
      await userMenu.click()
      await page.getByRole('menuitem', { name: /deconnexion|logout/i }).click()
    }
  }

  // Attendre redirection vers login
  await page.waitForURL('**/login**', { timeout: 10000 })
}

// =============================================================================
// Fixture de test avec authentification
// =============================================================================

export const test = base.extend<AuthFixtures>({
  /**
   * Page pre-authentifiee en tant qu'Employee
   */
  employeePage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await loginAs(page, TEST_USERS.EMPLOYEE!)

    await use(page)

    await context.close()
  },

  /**
   * Page pre-authentifiee en tant que Manager
   */
  managerPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await loginAs(page, TEST_USERS.MANAGER!)

    await use(page)

    await context.close()
  },

  /**
   * Page pre-authentifiee en tant que Director
   */
  directorPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await loginAs(page, TEST_USERS.DIRECTOR!)

    await use(page)

    await context.close()
  },

  /**
   * Page pre-authentifiee en tant que System Admin
   */
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await loginAs(page, TEST_USERS.SYSTEM_ADMIN!)

    await use(page)

    await context.close()
  },

  /**
   * Fonction utilitaire de login exposee comme fixture
   */
  loginAs: async ({}, use) => {
    await use(loginAs)
  },
})

export { expect } from '@playwright/test'
