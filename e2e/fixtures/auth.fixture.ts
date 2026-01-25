/**
 * Fixtures d'authentification par role pour tests E2E
 *
 * Fournit des fixtures Playwright avec authentification pre-configuree
 * pour chaque role utilisateur (Employee, Manager, Director, System Admin).
 *
 * @ticket SP-149
 */

import { test as base, Page, expect } from '@playwright/test'
import { setConsentCookie } from './consent.fixture'

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
    expectedDashboard: '/app/admin/dashboard',
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

  // Attendre la redirection vers un dashboard (pattern permissif)
  // Note: Le login peut rediriger vers /app/dashboard d'abord, puis le middleware
  // redirige vers le dashboard spécifique au rôle. On accepte les deux.
  await page.waitForURL(/\/app\/(dashboard|director|manager|admin|employee)/, {
    timeout: 30000,
  })

  // Si on n'est pas encore sur le bon dashboard, attendre la redirection finale
  if (!page.url().includes(user.expectedDashboard)) {
    await page.waitForURL(`**${user.expectedDashboard}**`, { timeout: 15000 })
  }
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
   * Note: Le cookie de consentement est pre-configure pour eviter la banniere
   * Note: Utilise context qui hérite des paramètres du projet (viewport, hasTouch, etc.)
   * @ticket SP-389 - Mobile E2E support via project device settings
   */
  employeePage: async ({ context }, use) => {
    await setConsentCookie(context)
    const page = await context.newPage()

    await loginAs(page, TEST_USERS.EMPLOYEE!)

    await use(page)
  },

  /**
   * Page pre-authentifiee en tant que Manager
   * Note: Le cookie de consentement est pre-configure pour eviter la banniere
   * Note: Utilise context qui hérite des paramètres du projet (viewport, hasTouch, etc.)
   * @ticket SP-389 - Mobile E2E support via project device settings
   */
  managerPage: async ({ context }, use) => {
    await setConsentCookie(context)
    const page = await context.newPage()

    await loginAs(page, TEST_USERS.MANAGER!)

    await use(page)
  },

  /**
   * Page pre-authentifiee en tant que Director
   * Note: Le cookie de consentement est pre-configure pour eviter la banniere
   * Note: Utilise context qui hérite des paramètres du projet (viewport, hasTouch, etc.)
   * @ticket SP-389 - Mobile E2E support via project device settings
   */
  directorPage: async ({ context }, use) => {
    await setConsentCookie(context)
    const page = await context.newPage()

    await loginAs(page, TEST_USERS.DIRECTOR!)

    await use(page)
  },

  /**
   * Page pre-authentifiee en tant que System Admin
   * Note: Le cookie de consentement est pre-configure pour eviter la banniere
   * Note: Utilise context qui hérite des paramètres du projet (viewport, hasTouch, etc.)
   * @ticket SP-389 - Mobile E2E support via project device settings
   */
  adminPage: async ({ context }, use) => {
    await setConsentCookie(context)
    const page = await context.newPage()

    await loginAs(page, TEST_USERS.SYSTEM_ADMIN!)

    await use(page)
  },

  /**
   * Fonction utilitaire de login exposee comme fixture
   */
  loginAs: async ({}, use) => {
    await use(loginAs)
  },
})

export { expect } from '@playwright/test'
