/**
 * Page Object - Team List (CRUD)
 *
 * Encapsule les selecteurs et actions pour la liste des equipes.
 * Accessible aux SYSTEM_ADMIN, DIRECTOR et MANAGER avec acces differencies.
 *
 * @ticket SP-156
 */

import { Page, Locator, expect } from '@playwright/test'

export class TeamListPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements de la page
  // ==========================================================================

  /** Titre de la page */
  readonly pageTitle: Locator

  /** Sous-titre description */
  readonly description: Locator

  /** Bouton nouvelle equipe */
  readonly newTeamButton: Locator

  /** Conteneur des cartes equipes */
  readonly teamsContainer: Locator

  /** Cartes d'equipe */
  readonly teamCards: Locator

  /** Message aucune equipe */
  readonly emptyMessage: Locator

  /** Indicateur de chargement */
  readonly loadingIndicator: Locator

  constructor(page: Page) {
    this.page = page

    // Header
    this.pageTitle = page.getByRole('heading', { name: /equipes/i })
    this.description = page.locator('text=/gerez vos equipes/i')
    this.newTeamButton = page.getByRole('link', {
      name: /nouvelle equipe|creer.*equipe/i,
    })

    // Contenu
    this.teamsContainer = page.locator('[data-testid="teams-container"]')
    this.teamCards = page.locator('[data-testid="team-card"]')
    this.emptyMessage = page.locator('text=/aucune equipe/i')
    this.loadingIndicator = page.locator('[data-testid="loading"]')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers la liste des equipes
   */
  async goto(): Promise<void> {
    await this.page.goto('/app/director/teams')
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
   * Verifie qu'une equipe est dans la liste
   */
  async expectTeamInList(teamName: string): Promise<void> {
    await expect(this.page.locator(`text=${teamName}`).first()).toBeVisible()
  }

  /**
   * Verifie qu'une equipe n'est PAS dans la liste
   */
  async expectTeamNotInList(teamName: string): Promise<void> {
    await expect(this.page.locator(`text=${teamName}`)).not.toBeVisible()
  }

  /**
   * Verifie l'etat vide
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible()
  }

  /**
   * Verifie que le bouton creation est visible
   */
  async expectCreateButtonVisible(): Promise<void> {
    await expect(this.newTeamButton).toBeVisible()
  }

  /**
   * Verifie que le bouton creation est cache
   */
  async expectCreateButtonHidden(): Promise<void> {
    await expect(this.newTeamButton).not.toBeVisible()
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Clique sur le bouton nouvelle equipe
   */
  async clickNewTeam(): Promise<void> {
    await this.newTeamButton.click()
  }

  /**
   * Voir les details d'une equipe
   */
  async viewTeam(teamName: string): Promise<void> {
    await this.page.locator(`text=${teamName}`).first().click()
  }

  /**
   * Editer une equipe via le menu
   */
  async editTeam(teamName: string): Promise<void> {
    const card = this.page.locator('[data-testid="team-card"]', { hasText: teamName })
    await card.getByRole('button', { name: /actions|menu/i }).click()
    await this.page.getByRole('menuitem', { name: /modifier|editer/i }).click()
  }

  /**
   * Supprimer une equipe
   */
  async deleteTeam(teamName: string): Promise<void> {
    const card = this.page.locator('[data-testid="team-card"]', { hasText: teamName })
    await card.getByRole('button', { name: /actions|menu/i }).click()
    await this.page.getByRole('menuitem', { name: /supprimer/i }).click()
  }

  /**
   * Gerer les membres d'une equipe
   */
  async manageMembers(teamName: string): Promise<void> {
    const card = this.page.locator('[data-testid="team-card"]', { hasText: teamName })
    await card.getByRole('button', { name: /actions|menu/i }).click()
    await this.page.getByRole('menuitem', { name: /membres|gerer/i }).click()
  }

  /**
   * Confirme la suppression
   */
  async confirmDelete(): Promise<void> {
    await this.page.getByRole('button', { name: /supprimer|confirmer/i }).click()
  }

  /**
   * Annule la suppression
   */
  async cancelDelete(): Promise<void> {
    await this.page.getByRole('button', { name: /annuler/i }).click()
  }

  /**
   * Recupere le nombre d'equipes affichees
   */
  async getTeamCount(): Promise<number> {
    return await this.teamCards.count()
  }
}
