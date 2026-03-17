/**
 * Page Object - Team Members (CRUD)
 *
 * Encapsule les selecteurs et actions pour la gestion des membres d'equipe.
 *
 * @ticket SP-156
 */

import { Page, Locator, expect } from '@playwright/test'

export class TeamMembersPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements de la page
  // ==========================================================================

  /** Titre de la page */
  readonly pageTitle: Locator

  /** Nom de l'equipe */
  readonly teamName: Locator

  /** Bouton ajouter membre */
  readonly addMemberButton: Locator

  /** Liste des membres actuels */
  readonly membersList: Locator

  /** Items membres */
  readonly memberItems: Locator

  /** Liste des employes disponibles */
  readonly availableEmployeesList: Locator

  /** Message aucun membre */
  readonly emptyMessage: Locator

  /** Bouton retour */
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page

    // Header
    this.pageTitle = page.getByRole('heading', {
      name: /membres.*equipe|gestion.*membres/i,
    })
    this.teamName = page.locator('[data-testid="team-name"]')
    this.addMemberButton = page.getByRole('button', {
      name: /ajouter.*membre/i,
    })
    this.backButton = page.getByRole('link', { name: /retour/i })

    // Contenu
    this.membersList = page.locator('[data-testid="members-list"]')
    this.memberItems = page.locator('[data-testid="member-item"]')
    this.availableEmployeesList = page.locator(
      '[data-testid="available-employees"]'
    )
    this.emptyMessage = page.locator('text=/aucun membre|[eé]quipe vide/i')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers la page de gestion des membres
   */
  async goto(teamId: string): Promise<void> {
    await this.page.goto(`/app/directeur/equipes/${teamId}/members`)
  }

  /**
   * Attend que la page soit chargee
   */
  async waitForLoad(): Promise<void> {
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  /**
   * Verifie que la page est affichee
   */
  async expectToBeVisible(): Promise<void> {
    await expect(this.pageTitle).toBeVisible()
  }

  /**
   * Verifie qu'un membre est dans la liste
   */
  async expectMemberInList(memberName: string): Promise<void> {
    await expect(this.page.locator(`text=${memberName}`).first()).toBeVisible()
  }

  /**
   * Verifie qu'un membre n'est PAS dans la liste
   */
  async expectMemberNotInList(memberName: string): Promise<void> {
    await expect(this.page.locator(`text=${memberName}`)).not.toBeVisible()
  }

  /**
   * Verifie l'etat vide
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible()
  }

  /**
   * Verifie le nombre de membres
   */
  async expectMemberCount(count: number): Promise<void> {
    await expect(this.memberItems).toHaveCount(count)
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Ouvre le dialogue d'ajout de membre
   */
  async clickAddMember(): Promise<void> {
    await this.addMemberButton.click()
  }

  /**
   * Selectionne un employe a ajouter
   */
  async selectEmployeeToAdd(employeeName: string): Promise<void> {
    await this.page
      .locator(
        '[data-testid="available-employees"] [data-testid="employee-item"]',
        {
          hasText: employeeName,
        }
      )
      .click()
  }

  /**
   * Confirme l'ajout du membre
   */
  async confirmAddMember(): Promise<void> {
    await this.page.getByRole('button', { name: /ajouter|confirmer/i }).click()
  }

  /**
   * Retire un membre de l'equipe
   */
  async removeMember(memberName: string): Promise<void> {
    const memberItem = this.page.locator('[data-testid="member-item"]', {
      hasText: memberName,
    })
    await memberItem.getByRole('button', { name: /retirer|supprimer/i }).click()
  }

  /**
   * Confirme le retrait du membre
   */
  async confirmRemoveMember(): Promise<void> {
    await this.page.getByRole('button', { name: /retirer|confirmer/i }).click()
  }

  /**
   * Annule le retrait
   */
  async cancelRemoveMember(): Promise<void> {
    await this.page.getByRole('button', { name: /annuler/i }).click()
  }

  /**
   * Retourne a la liste des equipes
   */
  async goBack(): Promise<void> {
    await this.backButton.click()
  }

  /**
   * Recupere le nombre de membres
   */
  async getMemberCount(): Promise<number> {
    return await this.memberItems.count()
  }
}
