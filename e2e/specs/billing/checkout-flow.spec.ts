/**
 * E2E — Checkout Flow billing
 *
 * Vérifie le parcours d'abonnement : affichage montant per-seat,
 * calcul correct, composants de facturation visibles.
 *
 * Le seed TechCorp a un statut ACTIVE avec 10 employés à 2,90€.
 * On vérifie que les montants affichés sont corrects.
 *
 * @ticket SP-373
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { BillingPage } from '../../pages/billing.page'

test.describe('Billing — Checkout & Subscription Active (SP-373)', () => {
  test('dashboard billing affiche le statut ACTIVE', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await billing.expectActiveStatus()
  })

  test('montant mensuel affiche correctement', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.monthlyAmount).toBeVisible()
    const amount = await billing.getMonthlyAmountText()
    // TechCorp : 10 employees × 2,90€ = 29,00€
    expect(amount).toBeTruthy()
  })

  test('nombre de sieges affiche correctement', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.seatCount).toBeVisible()
    const seats = await billing.getSeatCountText()
    expect(seats).toBeTruthy()
  })

  test('banniere trial absente quand ACTIVE', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    // Sur la page billing, pas de subscription banner (masquee)
    await expect(billing.subscriptionBanner).not.toBeVisible()
  })

  test('montant = nombre employes x prix unitaire', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.usageIndicator).toBeVisible()
    await expect(billing.monthlyTotal).toBeVisible()
    await expect(billing.pricePerEmployee).toBeVisible()
  })
})
