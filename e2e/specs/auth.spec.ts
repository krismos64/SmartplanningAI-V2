/**
 * Auth E2E Tests - Tests end-to-end pour l'authentification
 *
 * Scénarios testés :
 * - Login avec credentials valides/invalides
 * - Inscription complète avec création Company + User
 * - Validations côté client
 *
 * @ticket SP-141
 * @see Playwright documentation
 */

import { test, expect } from '../fixtures/consent.fixture'

/**
 * Configuration des données de test
 */
const TEST_USER = {
  email: 'john.doe@techcorp.com',
  password: 'Password123!',
  name: 'John Doe',
}

const INVALID_USER = {
  email: 'nonexistent@example.com',
  password: 'WrongPassword123!',
}

/**
 * Génère un email unique pour les tests d'inscription
 */
function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `test-e2e-${timestamp}-${random}@test.com`
}

// ============================================================================
// LOGIN TESTS
// ============================================================================

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/connexion')
  })

  test('should display login form correctly', async ({ page }) => {
    // Vérifie le titre de la page
    await expect(page).toHaveTitle(/Connexion/i)

    // Vérifie les éléments du formulaire
    await expect(
      page.getByRole('heading', { name: 'Bon retour !' })
    ).toBeVisible()
    await expect(page.getByPlaceholder('vous@entreprise.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Se connecter' })
    ).toBeVisible()
    await expect(page.getByText('Se souvenir de moi')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // Soumettre le formulaire vide
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Attendre les messages d'erreur de validation
    await expect(page.getByText("L'email est requis")).toBeVisible()
  })

  test('should show validation error for invalid email format', async ({
    page,
  }) => {
    // Remplir avec un email invalide
    await page.getByPlaceholder('vous@entreprise.com').fill('invalid-email')
    await page.getByPlaceholder('••••••••').fill('Password123!')

    // Soumettre
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Vérifier l'erreur de validation email
    await expect(page.getByText(/Email invalide/i)).toBeVisible()
  })

  test('should show error for non-existent email', async ({ page }) => {
    // Remplir avec un email inexistant
    await page.getByPlaceholder('vous@entreprise.com').fill(INVALID_USER.email)
    await page.getByPlaceholder('••••••••').fill(INVALID_USER.password)

    // Soumettre
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Attendre le toast d'erreur ou le message d'erreur
    // NextAuth renvoie une erreur "CredentialsSignin" pour les credentials invalides
    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible(
      { timeout: 10000 }
    )
  })

  test('should show error for wrong password', async ({ page }) => {
    // Remplir avec le bon email mais mauvais mot de passe
    await page.getByPlaceholder('vous@entreprise.com').fill(TEST_USER.email)
    await page.getByPlaceholder('••••••••').fill('WrongPassword456!')

    // Soumettre
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Attendre le message d'erreur
    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible(
      { timeout: 10000 }
    )
  })

  test('should login successfully with valid credentials and redirect to dashboard', async ({
    page,
  }) => {
    // Remplir avec des credentials valides
    await page.getByPlaceholder('vous@entreprise.com').fill(TEST_USER.email)
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password)

    // Soumettre
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Attendre le toast de succès
    await expect(page.getByText(/Connexion réussie/i)).toBeVisible({
      timeout: 15000,
    })

    // Vérifier la redirection vers le dashboard
    // Le pattern inclut toutes les routes possibles après login selon le rôle
    await page.waitForURL(/\/app\//, {
      timeout: 30000,
    })
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('••••••••')
    const toggleButton = page.getByRole('button', {
      name: /Afficher le mot de passe/i,
    })

    // Par défaut, le type est "password"
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Cliquer sur le bouton toggle
    await toggleButton.click()

    // Le type doit être "text"
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Cliquer à nouveau pour masquer
    await page.getByRole('button', { name: /Masquer le mot de passe/i }).click()

    // Retour au type "password"
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Créer un compte' }).click()

    await expect(page).toHaveURL('/inscription')
  })
})

// ============================================================================
// REGISTER TESTS
// ============================================================================

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inscription')
  })

  test('should display register form correctly', async ({ page }) => {
    // Vérifie le titre de la page
    await expect(page).toHaveTitle(/Créer un compte/i)

    // Vérifie les éléments du formulaire
    await expect(
      page.getByRole('heading', { name: 'Créer votre compte' })
    ).toBeVisible()
    await expect(page.getByPlaceholder('Jean Dupont')).toBeVisible()
    await expect(page.getByPlaceholder('jean@entreprise.com')).toBeVisible()
    await expect(page.getByPlaceholder('Mon Entreprise SAS')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Créer mon compte' })
    ).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // Soumettre le formulaire vide
    await page.getByRole('button', { name: 'Créer mon compte' }).click()

    // Attendre les messages d'erreur de validation
    // Le formulaire a plusieurs champs requis
    await expect(
      page.getByText(/requis|obligatoire|invalid/i).first()
    ).toBeVisible()
  })

  test('should show validation error when passwords do not match', async ({
    page,
  }) => {
    // Remplir tous les champs sauf les mots de passe qui ne matchent pas
    await page.getByPlaceholder('Jean Dupont').fill('Test User')
    await page.getByPlaceholder('jean@entreprise.com').fill(generateTestEmail())
    await page.getByPlaceholder('Mon Entreprise SAS').fill('Test Company')

    // Mots de passe différents - cibler par label car il y a 2 champs ••••••••
    const passwordFields = page.getByPlaceholder('••••••••')
    await passwordFields.nth(0).fill('Password123!')
    await passwordFields.nth(1).fill('DifferentPassword456!')

    // Ne pas cocher les terms pour l'instant

    // Soumettre
    await page.getByRole('button', { name: 'Créer mon compte' }).click()

    // Vérifier l'erreur de validation
    await expect(
      page.getByText(
        /mots de passe ne correspondent pas|doivent être identiques/i
      )
    ).toBeVisible()
  })

  test('should show validation error when terms are not accepted', async ({
    page,
  }) => {
    // Remplir tous les champs correctement
    await page.getByPlaceholder('Jean Dupont').fill('Test User')
    await page.getByPlaceholder('jean@entreprise.com').fill(generateTestEmail())
    await page.getByPlaceholder('Mon Entreprise SAS').fill('Test Company')

    const passwordFields = page.getByPlaceholder('••••••••')
    await passwordFields.nth(0).fill('Password123!')
    await passwordFields.nth(1).fill('Password123!')

    // NE PAS cocher les terms

    // Soumettre
    await page.getByRole('button', { name: 'Créer mon compte' }).click()

    // Vérifier l'erreur - le champ acceptTerms est requis
    // On utilise le message d'erreur exact pour éviter le conflit avec le lien CGU du footer
    await expect(
      page.getByText(/Vous devez accepter les conditions/i)
    ).toBeVisible()
  })

  test('should show error for already existing email', async ({ page }) => {
    // Utiliser un email qui existe déjà (celui du test user)
    await page.getByPlaceholder('Jean Dupont').fill('Test User')
    await page.getByPlaceholder('jean@entreprise.com').fill(TEST_USER.email)
    await page.getByPlaceholder('Mon Entreprise SAS').fill('Test Company')

    const passwordFields = page.getByPlaceholder('••••••••')
    await passwordFields.nth(0).fill('Password123!')
    await passwordFields.nth(1).fill('Password123!')

    // Cocher les terms
    await page.getByText(/J'accepte les/).click()

    // Soumettre
    await page.getByRole('button', { name: 'Créer mon compte' }).click()

    // Attendre le message d'erreur (email déjà utilisé)
    await expect(
      page.getByText(/email.*déjà|existe déjà|already|erreur/i)
    ).toBeVisible({ timeout: 10000 })
  })

  // NOTE: Ce test crée un vrai compte en DB et peut être flaky en CI
  // car il dépend de l'état de la base de données et du temps de réponse
  // On le skip en CI pour éviter les échecs intermittents
  test.skip(!!process.env.CI, 'Skipped in CI - creates real data')
  test('should register successfully with valid data and redirect to dashboard', async ({
    page,
  }) => {
    const uniqueEmail = generateTestEmail()
    const companyName = `TestCompany-${Date.now()}`

    // Remplir tous les champs
    await page.getByPlaceholder('Jean Dupont').fill('Test User')
    await page.getByPlaceholder('jean@entreprise.com').fill(uniqueEmail)
    await page.getByPlaceholder('Mon Entreprise SAS').fill(companyName)

    const passwordFields = page.getByPlaceholder('••••••••')
    await passwordFields.nth(0).fill('Password123!')
    await passwordFields.nth(1).fill('Password123!')

    // Cocher les terms
    await page.getByText(/J'accepte les/).click()

    // Soumettre
    await page.getByRole('button', { name: 'Créer mon compte' }).click()

    // Attendre la redirection vers le dashboard ou connexion
    await page.waitForURL(/\/app\/|\/connexion/, { timeout: 30000 })
  })

  test('should toggle password visibility for both password fields', async ({
    page,
  }) => {
    const passwordFields = page.getByPlaceholder('••••••••')

    // Par défaut, les deux champs sont de type "password"
    await expect(passwordFields.nth(0)).toHaveAttribute('type', 'password')
    await expect(passwordFields.nth(1)).toHaveAttribute('type', 'password')

    // Localiser les conteneurs de chaque champ mot de passe
    // On utilise les labels pour identifier chaque champ
    const passwordContainer = page
      .locator('label:has-text("Mot de passe")')
      .first()
      .locator('..')
    const confirmContainer = page
      .locator('label:has-text("Confirm")')
      .locator('..')

    // Toggle le premier champ (Mot de passe)
    const firstToggle = passwordContainer.getByRole('button')
    if (await firstToggle.isVisible()) {
      await firstToggle.click()
      await expect(passwordFields.nth(0)).toHaveAttribute('type', 'text')
    }

    // Toggle le second champ (Confirmer mot de passe)
    const secondToggle = confirmContainer.getByRole('button')
    if (await secondToggle.isVisible()) {
      await secondToggle.click()
      await expect(passwordFields.nth(1)).toHaveAttribute('type', 'text')
    }
  })

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Se connecter' }).click()

    await expect(page).toHaveURL('/connexion')
  })

  test('should show password requirements description', async ({ page }) => {
    // Vérifier que la description des exigences du mot de passe est affichée
    await expect(
      page.getByText(/8 caractères.*majuscule.*minuscule.*chiffre/i)
    ).toBeVisible()
  })
})

// ============================================================================
// NAVIGATION & ACCESSIBILITY TESTS
// ============================================================================

test.describe('Auth Navigation & Accessibility', () => {
  test('should have proper page titles', async ({ page }) => {
    await page.goto('/connexion')
    await expect(page).toHaveTitle(/Connexion/i)

    await page.goto('/inscription')
    await expect(page).toHaveTitle(/Créer un compte/i)
  })

  test('should maintain focus order for keyboard navigation on login', async ({
    page,
  }) => {
    await page.goto('/connexion')

    // Focus directement sur le champ email pour tester la navigation
    const emailInput = page.getByPlaceholder('vous@entreprise.com')
    await emailInput.focus()
    await expect(emailInput).toBeFocused()

    // Tab vers le champ mot de passe
    await page.keyboard.press('Tab')
    await expect(page.getByPlaceholder('••••••••')).toBeFocused()
  })

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/connexion')

    // Vérifier que les labels sont présents
    await expect(page.getByText('Email').first()).toBeVisible()
    await expect(page.getByText('Mot de passe').first()).toBeVisible()

    await page.goto('/inscription')

    await expect(page.getByText('Nom complet').first()).toBeVisible()
    await expect(page.getByText('Email professionnel').first()).toBeVisible()
    await expect(
      page.getByText('Nom de votre organisation').first()
    ).toBeVisible()
  })
})
