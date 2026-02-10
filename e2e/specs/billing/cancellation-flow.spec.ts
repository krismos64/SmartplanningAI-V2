/**
 * E2E — Cancellation Flow billing
 *
 * Vérifie le parcours d'annulation : alertes, query params,
 * bouton annuler, dialog de confirmation.
 *
 * @ticket SP-373
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { BillingPage } from '../../pages/billing.page'

test.describe('Billing — Cancellation Flow (SP-373)', () => {
  test('?reason=subscription_canceled affiche alerte "Abonnement annulé"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('subscription_canceled')

    await expect(billing.blockingAlert).toBeVisible()
    await billing.expectBlockingAlert('Abonnement annulé')
  })

  test('alerte subscription_canceled mentionne le réabonnement', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('subscription_canceled')

    await expect(billing.blockingAlert).toContainText('Réabonnez-vous')
  })

  test('?reason=subscription_expired affiche alerte "Abonnement expiré"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('subscription_expired')

    await expect(billing.blockingAlert).toBeVisible()
    await billing.expectBlockingAlert('Abonnement expiré')
  })

  test('bouton "Annuler" present quand abonnement actif', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.cancelSubscriptionBtn).toBeVisible()
    await expect(billing.cancelSubscriptionBtn).toBeEnabled()
  })

  test('clic sur "Annuler" ouvre le dialog de confirmation', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await billing.clickCancelSubscription()

    // Le dialog de confirmation doit apparaitre
    await expect(
      directorPage.getByText("Annuler l'abonnement ?")
    ).toBeVisible()
    await expect(billing.confirmCancelBtn).toBeVisible()
    await expect(
      directorPage.getByRole('button', { name: 'Conserver' })
    ).toBeVisible()
  })
})
