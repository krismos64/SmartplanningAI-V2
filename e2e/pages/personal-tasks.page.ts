/**
 * Page Object pour les tests E2E de la page Notes perso
 *
 * @ticket SP-421
 * @description Encapsule les interactions avec /app/dashboard/tasks et le widget
 */

import { Page, Locator, expect } from '@playwright/test'

export interface CreateNoteData {
  title: string
  description?: string
  dueDate?: Date
}

export class PersonalTasksPage {
  readonly page: Page

  // Locators - Page principale
  readonly pageContent: Locator
  readonly pageTitle: Locator
  readonly privacyBadge: Locator
  readonly createButton: Locator
  readonly emptyState: Locator
  readonly emptyStateCreateButton: Locator
  readonly taskList: Locator

  // Locators - Formulaire
  readonly taskForm: Locator
  readonly titleInput: Locator
  readonly descriptionInput: Locator
  readonly dueDateInput: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator

  // Locators - Widget dashboard
  readonly widget: Locator
  readonly widgetEmptyState: Locator
  readonly widgetTaskList: Locator
  readonly widgetAddLink: Locator
  readonly widgetViewAllLink: Locator
  readonly widgetManageLink: Locator

  constructor(page: Page) {
    this.page = page

    // Page principale
    this.pageContent = page.getByTestId('tasks-page-content')
    this.pageTitle = page.getByRole('heading', { name: /notes perso/i })
    this.privacyBadge = page.getByTestId('privacy-badge')
    this.createButton = page.getByTestId('create-task-button')
    this.emptyState = page.getByTestId('empty-state')
    this.emptyStateCreateButton = page.getByTestId('empty-state-create-button')
    this.taskList = page.getByTestId('task-list')

    // Formulaire
    this.taskForm = page.getByTestId('task-form')
    this.titleInput = page.getByTestId('task-title-input')
    this.descriptionInput = page.getByTestId('task-description-input')
    this.dueDateInput = page.getByTestId('task-duedate-input')
    this.submitButton = page.getByTestId('task-submit-button')
    this.cancelButton = page.getByRole('button', { name: /annuler/i })

    // Widget
    this.widget = page.getByTestId('tasks-widget')
    this.widgetEmptyState = page.getByTestId('widget-empty-state')
    this.widgetTaskList = page.getByTestId('widget-task-list')
    this.widgetAddLink = page.getByTestId('widget-add-task-link')
    this.widgetViewAllLink = page.getByTestId('widget-view-all-link')
    this.widgetManageLink = page.getByTestId('widget-manage-link')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  async goto() {
    await this.page.goto('/app/dashboard/tasks')
    await this.page.waitForLoadState('networkidle')
  }

  async gotoEmployeeDashboard() {
    await this.page.goto('/app/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async gotoManagerDashboard() {
    await this.page.goto('/app/manager/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async gotoDirectorDashboard() {
    await this.page.goto('/app/director/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async gotoAdminDashboard() {
    await this.page.goto('/app/admin/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateViaSidebar() {
    // Cliquer sur le lien Notes perso dans la sidebar
    await this.page.getByRole('link', { name: /notes perso/i }).click()
    await this.page.waitForURL(/\/app\/dashboard\/tasks/)
  }

  // ==========================================================================
  // Création de note
  // ==========================================================================

  async openCreateModal() {
    await this.createButton.click()
    await expect(this.taskForm).toBeVisible()
  }

  async openCreateModalFromEmptyState() {
    await this.emptyStateCreateButton.click()
    await expect(this.taskForm).toBeVisible()
  }

  async fillTitle(title: string) {
    await this.titleInput.fill(title)
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description)
  }

  async selectDueDate(date: Date) {
    await this.dueDateInput.click()

    // Formater la date pour le calendrier
    const day = date.getDate().toString()

    // Cliquer sur le jour dans le calendrier
    await this.page
      .getByRole('gridcell', { name: new RegExp(`^${day}$`) })
      .first()
      .click()
  }

  async submitForm() {
    await this.submitButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async cancelForm() {
    await this.cancelButton.click()
  }

  async createNote(data: CreateNoteData) {
    await this.openCreateModal()
    await this.fillTitle(data.title)

    if (data.description) {
      await this.fillDescription(data.description)
    }

    if (data.dueDate) {
      await this.selectDueDate(data.dueDate)
    }

    await this.submitForm()
  }

  // ==========================================================================
  // Actions sur les notes
  // ==========================================================================

  getTaskCard(id: string): Locator {
    return this.page.getByTestId(`task-card-${id}`)
  }

  getTaskCardByTitle(title: string): Locator {
    return this.page.locator(`[data-testid^="task-card-"]`).filter({
      has: this.page.getByText(title, { exact: false }),
    })
  }

  async toggleTask(id: string) {
    const checkbox = this.page.getByTestId(`checkbox-${id}`)
    await checkbox.click()
  }

  async toggleTaskByTitle(title: string) {
    const card = this.getTaskCardByTitle(title)
    const checkbox = card.locator('[data-testid^="checkbox-"]')
    await checkbox.click()
  }

  async editTask(id: string) {
    const editButton = this.page.getByTestId(`edit-button-${id}`)
    await editButton.click()
    await expect(this.taskForm).toBeVisible()
  }

  async editTaskByTitle(title: string) {
    const card = this.getTaskCardByTitle(title)
    const editButton = card.locator('[data-testid^="edit-button-"]')
    await editButton.click()
    await expect(this.taskForm).toBeVisible()
  }

  async deleteTask(id: string) {
    const deleteButton = this.page.getByTestId(`delete-button-${id}`)
    await deleteButton.click()
  }

  async deleteTaskByTitle(title: string) {
    const card = this.getTaskCardByTitle(title)
    const deleteButton = card.locator('[data-testid^="delete-button-"]')
    await deleteButton.click()
  }

  // ==========================================================================
  // Widget actions
  // ==========================================================================

  async toggleWidgetTask(id: string) {
    const checkbox = this.page.getByTestId(`widget-checkbox-${id}`)
    await checkbox.click()
  }

  async clickWidgetAddLink() {
    await this.widgetAddLink.click()
    await this.page.waitForURL(/\/app\/dashboard\/tasks/)
  }

  async clickWidgetViewAllLink() {
    await this.widgetViewAllLink.click()
    await this.page.waitForURL(/\/app\/dashboard\/tasks/)
  }

  // ==========================================================================
  // Compteurs
  // ==========================================================================

  async getTasksCount(): Promise<number> {
    const cards = this.page.locator('[data-testid^="task-card-"]')
    return await cards.count()
  }

  async getWidgetTasksCount(): Promise<number> {
    const items = this.page.locator('[data-testid^="widget-task-"]')
    return await items.count()
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  async expectToastSuccess(message?: string) {
    const toast = this.page.locator('[data-sonner-toast]').first()
    await expect(toast).toBeVisible({ timeout: 10000 })
    if (message) {
      await expect(toast).toContainText(message)
    }
  }

  async expectToastError(message?: string) {
    const toast = this.page.locator('[data-sonner-toast][data-type="error"]')
    await expect(toast).toBeVisible({ timeout: 10000 })
    if (message) {
      await expect(toast).toContainText(message)
    }
  }

  async expectValidationError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible()
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible()
  }

  async expectNoEmptyState() {
    await expect(this.emptyState).not.toBeVisible()
  }

  async expectTaskVisible(title: string) {
    await expect(this.page.getByText(title)).toBeVisible()
  }

  async expectTaskNotVisible(title: string) {
    await expect(this.page.getByText(title)).not.toBeVisible()
  }

  async expectTaskCompleted(title: string) {
    const card = this.getTaskCardByTitle(title)
    const titleElement = card.locator('[data-testid^="task-title-"]')
    await expect(titleElement).toHaveClass(/line-through/)
  }
}
