/**
 * Tests E2E - Création de demandes de congés
 *
 * @ticket SP-416
 * @description Vérifie le parcours de création de demande (EMPLOYEE)
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { LeavesPage } from '../../pages/leaves.page'
import { addWeeks, addDays } from 'date-fns'

test.describe('Leaves - Création demande (EMPLOYEE)', () => {
  test('ouvre le formulaire de création @employee', async ({
    employeePage,
  }) => {
    const leavesPage = new LeavesPage(employeePage)
    await leavesPage.goto()

    await leavesPage.openCreateModal()

    await expect(leavesPage.leaveForm).toBeVisible()
    await expect(leavesPage.typeSelect).toBeVisible()
    await expect(leavesPage.datePicker).toBeVisible()
  })

  test('sélectionne un type de congé @employee', async ({ employeePage }) => {
    const leavesPage = new LeavesPage(employeePage)
    await leavesPage.goto()
    await leavesPage.openCreateModal()

    await leavesPage.selectLeaveType('RTT')

    // Vérifier que le type est sélectionné
    await expect(leavesPage.typeSelect).toContainText('RTT')
  })

  test('affiche le bouton créer demande pour un employé @employee', async ({
    employeePage,
  }) => {
    const leavesPage = new LeavesPage(employeePage)
    await leavesPage.goto()

    await expect(leavesPage.createButton).toBeVisible()
    await expect(leavesPage.createButton).toBeEnabled()
  })

  test('ferme le formulaire en cliquant annuler @employee', async ({
    employeePage,
  }) => {
    const leavesPage = new LeavesPage(employeePage)
    await leavesPage.goto()
    await leavesPage.openCreateModal()

    // Cliquer sur annuler
    await employeePage.getByRole('button', { name: /annuler/i }).click()

    // Le formulaire doit être fermé
    await expect(leavesPage.leaveForm).not.toBeVisible()
  })
})
