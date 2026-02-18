/**
 * E2E — Billing : Alertes, Annulation & Expiration
 *
 * Consolide cancellation-flow, payment-failure et trial-expiry.
 * Vérifie les alertes de blocage par query param (?reason=),
 * le flow d'annulation et le dialog de confirmation.
 *
 * @ticket SP-373
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { BillingPage } from '../../pages/billing.page'

test.describe('Billing — Alertes & Annulation (SP-373)', () => {
  // ===========================================================================
  // Alertes de blocage par query param
  // ===========================================================================

  test('?reason=payment_overdue affiche alerte destructive "Paiement en retard"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('payment_overdue')

    await expect(billing.blockingAlert).toBeVisible()
    await billing.expectBlockingAlert('Paiement en retard')
    await expect(billing.blockingAlert).toHaveClass(/destructive/)
    await expect(billing.blockingAlert).toContainText(
      'Mettez à jour votre moyen de paiement'
    )
  })

  test('?reason=payment_incomplete affiche alerte "Paiement en attente"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('payment_incomplete')

    await expect(billing.blockingAlert).toBeVisible()
    await billing.expectBlockingAlert('Paiement en attente')
  })

  test('?reason=subscription_canceled affiche alerte avec réabonnement', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('subscription_canceled')

    await expect(billing.blockingAlert).toBeVisible()
    await billing.expectBlockingAlert('Abonnement annulé')
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

  test('?reason=trial_expired affiche alerte "Votre essai gratuit est terminé"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('trial_expired')

    await expect(billing.blockingAlert).toBeVisible()
    await billing.expectBlockingAlert('Votre essai gratuit est terminé')
  })

  test('?reason=no_subscription affiche alerte "Aucun abonnement actif"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('no_subscription')

    await expect(billing.blockingAlert).toBeVisible()
    await billing.expectBlockingAlert('Aucun abonnement actif')
  })

  test('sans reason param, pas d\'alerte de blocage', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await billing.expectNoBlockingAlert()
  })

  // ===========================================================================
  // Flow d'annulation
  // ===========================================================================

  test('bouton "Annuler" présent et ouvre le dialog de confirmation', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.cancelSubscriptionBtn).toBeVisible()
    await expect(billing.cancelSubscriptionBtn).toBeEnabled()

    await billing.clickCancelSubscription()

    await expect(
      directorPage.getByText("Annuler l'abonnement ?")
    ).toBeVisible()
    await expect(billing.confirmCancelBtn).toBeVisible()
    await expect(
      directorPage.getByRole('button', { name: 'Conserver' })
    ).toBeVisible()
  })
})
