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

  test('?reason=trial_expired affiche le hero de conversion', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('trial_expired')

    await billing.expectConversionHero()
    await expect(billing.conversionHero).toContainText(
      'Votre essai gratuit est terminé'
    )
  })

  test('hero conversion contient le prix par employe', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('trial_expired')

    await billing.expectConversionHero()
    // Le hero affiche le prix formaté (2,90 €/employé/mois)
    await expect(billing.conversionHero).toContainText('/employé/mois')
  })

  test('CTA "Choisir mon abonnement" present dans le hero', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('trial_expired')

    await billing.expectConversionHero()
    const ctaLink = billing.conversionHero.getByRole('link', {
      name: /Choisir mon abonnement/i,
    })
    await expect(ctaLink).toBeVisible()
    await expect(ctaLink).toHaveAttribute('href', '#subscription-section')
  })

  test('?reason=no_subscription affiche hero "Activez votre abonnement"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.gotoWithReason('no_subscription')

    await billing.expectConversionHero()
    await expect(billing.conversionHero).toContainText(
      'Activez votre abonnement SmartPlanning'
    )
  })
})
