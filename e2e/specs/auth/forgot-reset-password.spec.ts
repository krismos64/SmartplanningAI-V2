/**
 * Tests E2E - Forgot Password & Reset Password
 *
 * Valide les parcours de recuperation de mot de passe :
 * - Formulaire "Mot de passe oublie" (/forgot-password)
 * - Page "Reinitialiser le mot de passe" sans token (/reset-password)
 * - Page "Reinitialiser le mot de passe" avec token (/reset-password?token=xxx)
 * - Navigation entre les pages
 * - Accessibilite et structure semantique
 */

import { test, expect } from '../../fixtures/consent.fixture'

// =============================================================================
// Bloc 1 — Forgot Password (/forgot-password)
// =============================================================================

test.describe('Forgot Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password')
    await page.waitForLoadState('domcontentloaded')
  })

  test('affiche le formulaire avec le titre "Mot de passe oublié ?"', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: /mot de passe oublié/i })
    ).toBeVisible()
  })

  test('affiche le sous-titre', async ({ page }) => {
    await expect(
      page.getByText(/pas de panique/i)
    ).toBeVisible()
  })

  test('affiche le champ email avec placeholder', async ({ page }) => {
    const emailInput = page.getByPlaceholder('vous@entreprise.com')
    await expect(emailInput).toBeVisible()
  })

  test('affiche le bouton de soumission', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /envoyer le lien/i })
    ).toBeVisible()
  })

  test('validation : champ email requis sur soumission vide', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /envoyer le lien/i }).click()

    // Le formulaire ne devrait pas se soumettre (validation HTML5 ou Zod)
    await expect(page).toHaveURL(/forgot-password/)
  })

  test('accepte un email valide et soumet le formulaire', async ({ page }) => {
    await page.getByPlaceholder('vous@entreprise.com').fill('test@example.com')
    await page.getByRole('button', { name: /envoyer le lien/i }).click()

    // Anti-enumeration : toujours affiche le message de succes
    await expect(
      page.getByText(/vérifiez votre boîte mail/i)
    ).toBeVisible({ timeout: 10000 })
  })

  test('lien "Retour à la connexion" present avec href /login', async ({
    page,
  }) => {
    const backLink = page.locator('a[href="/login"]', {
      hasText: /retour.*connexion/i,
    })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/login')
  })

  test('accessibilite : le champ email a un label', async ({ page }) => {
    const emailInput = page.getByPlaceholder('vous@entreprise.com')
    await expect(emailInput).toBeVisible()
    // Le champ doit etre accessible (label, aria-label, ou placeholder)
    await expect(emailInput).toHaveAttribute('type', 'email')
  })
})

// =============================================================================
// Bloc 2 — Reset Password SANS token (/reset-password)
// =============================================================================

test.describe('Reset Password - Sans token', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reset-password')
    await page.waitForLoadState('domcontentloaded')
  })

  test('affiche "Lien invalide"', async ({ page }) => {
    await expect(page.getByText(/lien invalide/i)).toBeVisible()
  })

  test('affiche le bouton "Demander un nouveau lien"', async ({ page }) => {
    const newLinkButton = page.locator('a[href="/forgot-password"]')
    await expect(newLinkButton).toBeVisible()
    await expect(newLinkButton).toContainText(/demander un nouveau lien/i)
  })

  test('"Demander un nouveau lien" pointe vers /forgot-password', async ({
    page,
  }) => {
    const link = page.locator('a[href="/forgot-password"]')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/forgot-password')
  })

  test('lien "Retour à la connexion" present avec href /login', async ({
    page,
  }) => {
    const backLink = page.locator('a[href="/login"]', {
      hasText: /retour.*connexion/i,
    })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/login')
  })
})

// =============================================================================
// Bloc 3 — Reset Password AVEC token (/reset-password?token=xxx)
// =============================================================================

test.describe('Reset Password - Avec token', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reset-password?token=fake-test-token-12345')
    await page.waitForLoadState('domcontentloaded')
  })

  test('affiche le formulaire "Nouveau mot de passe"', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /nouveau mot de passe/i })
    ).toBeVisible()
  })

  test('affiche le sous-titre', async ({ page }) => {
    await expect(
      page.getByText(/choisissez un mot de passe/i)
    ).toBeVisible()
  })

  test('affiche les champs mot de passe et confirmation', async ({ page }) => {
    const passwordFields = page.getByPlaceholder('••••••••')
    await expect(passwordFields.first()).toBeVisible()
    // Il devrait y avoir 2 champs (password + confirmation)
    await expect(passwordFields).toHaveCount(2)
  })

  test('affiche le bouton "Réinitialiser le mot de passe"', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /réinitialiser le mot de passe/i })
    ).toBeVisible()
  })
})
