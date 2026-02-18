/**
 * E2E — Billing : Subscription & Management
 *
 * Consolide checkout-flow, subscription-management et trial-flow.
 * Vérifie l'accès billing, l'affichage des données d'abonnement,
 * montants per-seat, usage indicator, historique factures.
 *
 * @ticket SP-373
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { BillingPage } from '../../pages/billing.page'

test.describe('Billing — Subscription & Management (SP-373)', () => {
  // ===========================================================================
  // Accès et affichage général
  // ===========================================================================

  test('director accède au dashboard billing avec titre "Facturation"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await billing.expectToBeVisible()
    await expect(billing.pageTitle).toContainText('Facturation')
    await expect(
      directorPage
        .getByText('Gérez votre abonnement et consultez vos factures.')
        .first()
    ).toBeVisible()
  })

  // ===========================================================================
  // Statut et montants (checkout-flow)
  // ===========================================================================

  test('affiche le statut ACTIVE et les montants per-seat', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await billing.expectActiveStatus()
    await expect(billing.monthlyAmount).toBeVisible()
    await expect(billing.seatCount).toBeVisible()

    const amount = await billing.getMonthlyAmountText()
    const seats = await billing.getSeatCountText()
    expect(amount).toBeTruthy()
    expect(seats).toBeTruthy()
  })

  test('bannière trial absente quand ACTIVE', async ({ directorPage }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.subscriptionBanner).not.toBeVisible()
  })

  // ===========================================================================
  // Détails abonnement (subscription-management)
  // ===========================================================================

  test('détails abonnement : statut, montant, période, usage', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.monthlyAmount).toBeVisible()
    await expect(billing.seatCount).toBeVisible()
    await expect(billing.billingPeriod).toBeVisible()
    await expect(billing.usageIndicator).toBeVisible()
    await expect(billing.employeeCount).toBeVisible()
    await expect(billing.usagePercent).toBeVisible()
  })

  test('prix unitaire, total mensuel et info prorata affichés', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.pricePerEmployee).toBeVisible()
    await expect(billing.monthlyTotal).toBeVisible()
    await expect(billing.prorataInfo).toBeVisible()
    await expect(billing.prorataInfo).toContainText('prorata')
  })

  test('historique factures visible avec paiements', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.invoiceHistory).toBeVisible()
    const paymentRows = directorPage.locator('[data-testid^="payment-row-"]')
    await expect(paymentRows.first()).toBeVisible()
  })

  // ===========================================================================
  // Subscription status card et bouton gérer (trial-flow)
  // ===========================================================================

  test('card subscription status et bouton "Gérer" visibles', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.subscriptionStatus.first()).toBeVisible()
    await expect(billing.manageSubscriptionBtn).toBeVisible()
    await expect(billing.manageSubscriptionBtn).toBeEnabled()
  })
})
