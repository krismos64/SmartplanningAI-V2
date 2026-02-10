/**
 * E2E — Subscription Management billing
 *
 * Vérifie la gestion d'abonnement : détails visibles, calcul per-seat,
 * portail Stripe, historique paiements, usage indicator.
 *
 * @ticket SP-373
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { BillingPage } from '../../pages/billing.page'

test.describe('Billing — Subscription Management (SP-373)', () => {
  test('details abonnement visibles (statut, montant, periode)', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.monthlyAmount).toBeVisible()
    await expect(billing.seatCount).toBeVisible()
    await expect(billing.billingPeriod).toBeVisible()
  })

  test('usage indicator affiche employes et pourcentage', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.usageIndicator).toBeVisible()
    await expect(billing.employeeCount).toBeVisible()
    await expect(billing.usagePercent).toBeVisible()
  })

  test('prix unitaire et total mensuel affiches dans usage', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.pricePerEmployee).toBeVisible()
    await expect(billing.monthlyTotal).toBeVisible()
  })

  test('info prorata visible', async ({ directorPage }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

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
    // TechCorp a au moins 1 paiement dans le seed
    const paymentRows = directorPage.locator('[data-testid^="payment-row-"]')
    await expect(paymentRows.first()).toBeVisible()
  })
})
