/**
 * Page Object — Dashboard Billing
 *
 * Encapsule les selecteurs et actions pour la page facturation.
 * Utilise le pattern Page Object Model pour des tests maintenables.
 *
 * @ticket SP-373
 */

import { Page, Locator, expect } from '@playwright/test'

export class BillingPage {
  readonly page: Page

  // ==========================================================================
  // Locators — Page principale
  // ==========================================================================

  /** Conteneur billing-page-content */
  readonly content: Locator

  /** Titre principal "Facturation" */
  readonly pageTitle: Locator

  // ==========================================================================
  // Locators — Subscription Status
  // ==========================================================================

  /** Card statut abonnement */
  readonly subscriptionStatus: Locator

  /** Alerte trial countdown */
  readonly trialAlert: Locator

  /** Alerte annulation programmee */
  readonly cancelAlert: Locator

  /** Montant mensuel */
  readonly monthlyAmount: Locator

  /** Nombre de sieges */
  readonly seatCount: Locator

  /** Periode de facturation */
  readonly billingPeriod: Locator

  /** Date d'annulation */
  readonly canceledAt: Locator

  /** Bouton "Gerer mon abonnement" */
  readonly manageSubscriptionBtn: Locator

  /** Bouton "Annuler" */
  readonly cancelSubscriptionBtn: Locator

  /** Bouton confirmation annulation dans le dialog */
  readonly confirmCancelBtn: Locator

  // ==========================================================================
  // Locators — Blocking Alert (SP-440)
  // ==========================================================================

  /** Alerte de blocage subscription guard */
  readonly blockingAlert: Locator

  /** Erreur action (portail, annulation) */
  readonly billingError: Locator

  // ==========================================================================
  // Locators — Usage Indicator
  // ==========================================================================

  /** Card utilisation */
  readonly usageIndicator: Locator

  /** Nombre d'employes */
  readonly employeeCount: Locator

  /** Pourcentage utilisation */
  readonly usagePercent: Locator

  /** Prix par employe */
  readonly pricePerEmployee: Locator

  /** Total mensuel */
  readonly monthlyTotal: Locator

  /** Info prorata */
  readonly prorataInfo: Locator

  // ==========================================================================
  // Locators — Invoice History
  // ==========================================================================

  /** Card historique factures */
  readonly invoiceHistory: Locator

  /** Etat vide (aucune facture) */
  readonly invoiceEmptyState: Locator

  /** Bouton "Voir tout l'historique" */
  readonly viewAllInvoicesBtn: Locator

  // ==========================================================================
  // Locators — Subscription Banner (SP-441)
  // ==========================================================================

  /** Banniere globale abonnement */
  readonly subscriptionBanner: Locator

  /** CTA de la banniere */
  readonly bannerCta: Locator

  /** Bouton dismiss banniere */
  readonly bannerDismiss: Locator

  constructor(page: Page) {
    this.page = page

    // Page principale
    this.content = page.getByTestId('billing-page-content')
    this.pageTitle = page.getByRole('heading', { level: 1, name: 'Facturation' })

    // Subscription Status
    this.subscriptionStatus = page.getByTestId('subscription-status')
    this.trialAlert = page.getByTestId('trial-alert')
    this.cancelAlert = page.getByTestId('cancel-alert')
    this.monthlyAmount = page.getByTestId('monthly-amount')
    this.seatCount = page.getByTestId('seat-count')
    this.billingPeriod = page.getByTestId('billing-period')
    this.canceledAt = page.getByTestId('canceled-at')
    this.manageSubscriptionBtn = page.getByTestId('manage-subscription-btn')
    this.cancelSubscriptionBtn = page.getByTestId('cancel-subscription-btn')
    this.confirmCancelBtn = page.getByTestId('confirm-cancel-btn')

    // Blocking Alert (SP-440)
    this.blockingAlert = page.getByTestId('subscription-blocking-alert')
    this.billingError = page.getByTestId('billing-error')

    // Usage Indicator
    this.usageIndicator = page.getByTestId('usage-indicator')
    this.employeeCount = page.getByTestId('employee-count')
    this.usagePercent = page.getByTestId('usage-percent')
    this.pricePerEmployee = page.getByTestId('price-per-employee')
    this.monthlyTotal = page.getByTestId('monthly-total')
    this.prorataInfo = page.getByTestId('prorata-info')

    // Invoice History
    this.invoiceHistory = page.getByTestId('invoice-history')
    this.invoiceEmptyState = page.getByTestId('invoice-empty-state')
    this.viewAllInvoicesBtn = page.getByTestId('view-all-invoices-btn')

    // Subscription Banner (SP-441)
    this.subscriptionBanner = page.getByTestId('subscription-banner')
    this.bannerCta = page.getByTestId('subscription-banner-cta')
    this.bannerDismiss = page.getByTestId('subscription-banner-dismiss')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  async goto(): Promise<void> {
    await this.page.goto('/app/dashboard/billing')
  }

  async gotoWithReason(reason: string): Promise<void> {
    await this.page.goto(`/app/dashboard/billing?reason=${reason}`)
  }

  async waitForLoad(): Promise<void> {
    // Use .first() to avoid strict mode violation when DashboardLayout Suspense causes brief DOM duplication
    // Also handle empty-state variant (subscription-empty-state testid)
    await expect(
      this.subscriptionStatus.first().or(this.page.getByTestId('subscription-empty-state').first())
    ).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Getters
  // ==========================================================================

  async getSubscriptionStatusText(): Promise<string | null> {
    const badge = this.subscriptionStatus.locator('[class*="badge"]').first()
    if (await badge.isVisible().catch(() => false)) {
      return badge.textContent()
    }
    return null
  }

  async getMonthlyAmountText(): Promise<string | null> {
    if (await this.monthlyAmount.isVisible().catch(() => false)) {
      return this.monthlyAmount.textContent()
    }
    return null
  }

  async getSeatCountText(): Promise<string | null> {
    if (await this.seatCount.isVisible().catch(() => false)) {
      return this.seatCount.textContent()
    }
    return null
  }

  async getBlockingAlertTitle(): Promise<string | null> {
    if (await this.blockingAlert.isVisible().catch(() => false)) {
      const heading = this.blockingAlert.locator('h3')
      return heading.textContent()
    }
    return null
  }

  async getBannerText(): Promise<string | null> {
    if (await this.subscriptionBanner.isVisible().catch(() => false)) {
      return this.subscriptionBanner.locator('p').textContent()
    }
    return null
  }

  async getBannerTier(): Promise<string | null> {
    if (await this.subscriptionBanner.isVisible().catch(() => false)) {
      return this.subscriptionBanner.getAttribute('data-tier')
    }
    return null
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  async clickManageSubscription(): Promise<void> {
    await this.manageSubscriptionBtn.click()
  }

  async clickCancelSubscription(): Promise<void> {
    await this.cancelSubscriptionBtn.click()
  }

  async clickConfirmCancel(): Promise<void> {
    await this.confirmCancelBtn.click()
  }

  async clickBannerCta(): Promise<void> {
    await this.bannerCta.click()
  }

  async dismissBanner(): Promise<void> {
    await this.bannerDismiss.click()
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  async expectToBeVisible(): Promise<void> {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.subscriptionStatus).toBeVisible()
  }

  async expectTrialStatus(): Promise<void> {
    await expect(
      this.subscriptionStatus.locator('text=Essai gratuit')
    ).toBeVisible()
  }

  async expectActiveStatus(): Promise<void> {
    await expect(
      this.subscriptionStatus.locator('text=Actif')
    ).toBeVisible()
  }

  async expectPastDueStatus(): Promise<void> {
    await expect(
      this.subscriptionStatus.locator('text=Paiement en retard')
    ).toBeVisible()
  }

  async expectCanceledStatus(): Promise<void> {
    await expect(
      this.subscriptionStatus.locator('text=Annulé')
    ).toBeVisible()
  }

  async expectEmptyState(): Promise<void> {
    await expect(
      this.subscriptionStatus.locator('text=Aucun abonnement')
    ).toBeVisible()
  }

  async expectBlockingAlert(title: string): Promise<void> {
    await expect(this.blockingAlert).toBeVisible()
    await expect(this.blockingAlert.locator('h3')).toContainText(title)
  }

  async expectNoBlockingAlert(): Promise<void> {
    await expect(this.blockingAlert).not.toBeVisible()
  }

  async expectUsageVisible(): Promise<void> {
    await expect(this.usageIndicator).toBeVisible()
    await expect(this.employeeCount).toBeVisible()
  }

  async expectInvoiceHistoryVisible(): Promise<void> {
    await expect(this.invoiceHistory).toBeVisible()
  }

  async expectInvoiceEmptyState(): Promise<void> {
    await expect(this.invoiceEmptyState).toBeVisible()
  }
}
