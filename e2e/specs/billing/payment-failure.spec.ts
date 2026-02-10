/**
 * E2E — Payment Failure billing
 *
 * Vérifie le comportement quand le paiement échoue (PAST_DUE) :
 * alertes de blocage, query param ?reason=payment_overdue,
 * restrictions d'accès via le guard middleware.
 *
 * Utilise les query params ?reason= pour simuler les redirections
 * du subscription guard sans modifier la base de données.
 *
 * @ticket SP-373
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { BillingPage } from '../../pages/billing.page'

test.describe('Billing — Payment Failure (SP-373)', () => {
  test('?reason=payment_overdue affiche alerte "Paiement en retard"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('payment_overdue')

    await expect(billing.blockingAlert).toBeVisible()
    await billing.expectBlockingAlert('Paiement en retard')
  })

  test('alerte payment_overdue a le style destructive (rouge)', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('payment_overdue')

    await expect(billing.blockingAlert).toBeVisible()
    // Le variant destructive utilise border-destructive
    await expect(billing.blockingAlert).toHaveClass(/destructive/)
  })

  test('message payment_overdue mentionne la mise a jour du moyen de paiement', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('payment_overdue')

    await expect(billing.blockingAlert).toBeVisible()
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

  test('sans reason param, pas d\'alerte de blocage', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await billing.expectNoBlockingAlert()
  })
})
