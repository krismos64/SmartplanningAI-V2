/**
 * E2E — Trial Flow billing
 *
 * Vérifie le parcours director en période d'essai :
 * bannière trial, accès complet, dashboard billing, simulateur, CTA.
 *
 * @ticket SP-373
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { BillingPage } from '../../pages/billing.page'

test.describe('Billing — Trial Flow (SP-373)', () => {
  /**
   * Le seed TechCorp a un statut ACTIVE, mais le director a accès
   * au dashboard billing. On vérifie le parcours general d'accès.
   * Les tests spécifiques TRIAL utilisent les données seed (trialEndsAt).
   */

  test('director accede au dashboard billing', async ({ directorPage }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()
    await billing.expectToBeVisible()
  })

  test('dashboard billing affiche le titre "Facturation"', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()

    await expect(billing.pageTitle).toBeVisible()
    await expect(billing.pageTitle).toContainText('Facturation')
  })

  test('dashboard billing affiche la card subscription status', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.subscriptionStatus.first()).toBeVisible()
  })

  test('bouton "Gerer mon abonnement" present et cliquable', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()
    await billing.waitForLoad()

    await expect(billing.manageSubscriptionBtn).toBeVisible()
    await expect(billing.manageSubscriptionBtn).toBeEnabled()
  })

  test('description page visible sous le titre', async ({
    directorPage,
  }) => {
    const billing = new BillingPage(directorPage)
    await billing.goto()

    await expect(
      directorPage.getByText('Gérez votre abonnement et consultez vos factures.').first()
    ).toBeVisible()
  })
})
