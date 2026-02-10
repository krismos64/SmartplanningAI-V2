/**
 * Page Object — Page Tarifs publique
 *
 * Encapsule les selecteurs et actions pour la page /tarifs.
 * Utilise le pattern Page Object Model pour des tests maintenables.
 *
 * @ticket SP-373
 */

import { Page, Locator, expect } from '@playwright/test'

export class PricingPage {
  readonly page: Page

  // ==========================================================================
  // Locators — Hero
  // ==========================================================================

  /** Titre principal */
  readonly heroTitle: Locator

  /** Description hero avec prix */
  readonly heroDescription: Locator

  // ==========================================================================
  // Locators — Simulateur
  // ==========================================================================

  /** Titre section simulateur */
  readonly simulatorTitle: Locator

  /** Slider nombre employes */
  readonly employeeSlider: Locator

  /** Message grandes equipes (> 50) */
  readonly largeTeamMessage: Locator

  // ==========================================================================
  // Locators — Features
  // ==========================================================================

  /** Titre section features */
  readonly featuresTitle: Locator

  /** Liste des fonctionnalites incluses */
  readonly featuresList: Locator

  // ==========================================================================
  // Locators — FAQ
  // ==========================================================================

  /** Titre section FAQ */
  readonly faqTitle: Locator

  // ==========================================================================
  // Locators — CTA
  // ==========================================================================

  /** Bouton CTA "Demarrer l'essai gratuit" */
  readonly ctaRegister: Locator

  constructor(page: Page) {
    this.page = page

    // Hero
    this.heroTitle = page.locator('#pricing-hero-title')
    this.heroDescription = page.getByTestId('pricing-hero-description')

    // Simulateur
    this.simulatorTitle = page.locator('#simulator-title')
    this.employeeSlider = page.locator('input[type="range"]')
    this.largeTeamMessage = page.getByTestId('large-team-message')

    // Features
    this.featuresTitle = page.locator('#features-title')
    this.featuresList = page.locator(
      '[aria-label="Fonctionnalites incluses"]'
    )

    // FAQ
    this.faqTitle = page.locator('#faq-title')

    // CTA
    this.ctaRegister = page.getByTestId('cta-register')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  async goto(): Promise<void> {
    await this.page.goto('/tarifs')
  }

  async waitForLoad(): Promise<void> {
    await expect(this.heroTitle).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Getters
  // ==========================================================================

  async getDisplayedPrice(): Promise<string | null> {
    const priceEl = this.page.locator(
      '[aria-live="polite"] span.font-extrabold'
    )
    if (await priceEl.isVisible().catch(() => false)) {
      return priceEl.textContent()
    }
    return null
  }

  async getEmployeeCount(): Promise<string | null> {
    const countEl = this.page.locator(
      '[aria-live="polite"] span.font-medium'
    )
    if (await countEl.isVisible().catch(() => false)) {
      return countEl.textContent()
    }
    return null
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  async setEmployeeCount(count: number): Promise<void> {
    await this.employeeSlider.fill(String(count))
  }

  async clickStartTrial(): Promise<void> {
    await this.ctaRegister.click()
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  async expectToBeVisible(): Promise<void> {
    await expect(this.heroTitle).toBeVisible()
    await expect(this.heroDescription).toBeVisible()
  }

  async expectSimulatorVisible(): Promise<void> {
    await expect(this.simulatorTitle).toBeVisible()
    await expect(this.employeeSlider).toBeVisible()
  }

  async expectFeaturesVisible(): Promise<void> {
    await expect(this.featuresTitle).toBeVisible()
    await expect(this.featuresList).toBeVisible()
  }

  async expectFaqVisible(): Promise<void> {
    await expect(this.faqTitle).toBeVisible()
  }

  async expectCtaVisible(): Promise<void> {
    await expect(this.ctaRegister).toBeVisible()
  }

  async expectPriceContains(text: string): Promise<void> {
    await expect(this.heroDescription).toContainText(text)
  }

  async expectLargeTeamMessage(): Promise<void> {
    await expect(this.largeTeamMessage).toBeVisible()
  }

  async expectNoLargeTeamMessage(): Promise<void> {
    await expect(this.largeTeamMessage).not.toBeVisible()
  }
}
