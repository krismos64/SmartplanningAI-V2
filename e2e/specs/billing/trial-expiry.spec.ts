/**
 * E2E — Trial Expiry billing
 *
 * Vérifie le comportement quand le trial expire :
 * alerte "Essai terminé", hero de conversion, query params guard.
 *
 * Utilise les query params ?reason= pour simuler les redirections
 * du subscription guard (SP-440).
 *
 * @ticket SP-373
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { BillingPage } from '../../pages/billing.page'

test.describe('Billing — Trial Expiry (SP-373)', () => {
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
})
