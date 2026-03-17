/**
 * Tests E2E - Page Admin Audit Logs
 *
 * Valide le parcours complet de consultation des logs d'audit :
 * - Protection RBAC (SYSTEM_ADMIN uniquement)
 * - Affichage initial (titre, table, filtres, pagination)
 * - Filtrage par action, type d'entite, recherche
 * - Pagination (changement taille, navigation)
 * - Modal de detail JSON
 * - URL bookmarkable (filtres persistes dans searchParams)
 *
 * @ticket SP-446
 */

import { test, expect } from '../fixtures/auth.fixture'
import { AuditLogsPage } from '../pages'

// =============================================================================
// Bloc 1 — Acces et protection RBAC
// =============================================================================

test.describe('Audit Logs — RBAC Protection', () => {
  test('SYSTEM_ADMIN peut acceder a /app/admin/journaux', async ({ adminPage }) => {
    await adminPage.goto('/app/admin/journaux')

    await expect(
      adminPage.getByRole('heading', { name: /journal d'audit/i })
    ).toBeVisible()
    await expect(adminPage).toHaveURL(/\/app\/admin\/logs/)
  })

  test('DIRECTOR est redirige depuis /app/admin/journaux', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/journaux')

    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })

  test('MANAGER est redirige depuis /app/admin/journaux', async ({
    managerPage,
  }) => {
    await managerPage.goto('/app/admin/journaux')

    await expect(managerPage).toHaveURL(/\/app\/(manager|dashboard)/)
  })

  test('EMPLOYEE est redirige depuis /app/admin/journaux', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/admin/journaux')

    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })
})

// =============================================================================
// Bloc 2 — Affichage initial de la page
// =============================================================================

test.describe('Audit Logs — Affichage initial', () => {
  let auditPage: AuditLogsPage

  test.beforeEach(async ({ adminPage }) => {
    auditPage = new AuditLogsPage(adminPage)
    await auditPage.goto()
    await auditPage.waitForLoad()
  })

  test('affiche le titre "Journal d\'audit"', async () => {
    await expect(auditPage.pageTitle).toBeVisible()
    await expect(auditPage.pageTitle).toContainText(/journal d'audit/i)
  })

  test('affiche la table avec les colonnes attendues', async () => {
    await expect(auditPage.table).toBeVisible()

    // Verifier les en-tetes
    const headers = auditPage.tableHeaders
    await expect(headers.filter({ hasText: 'Date' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Utilisateur' })).toBeVisible()
    await expect(headers.filter({ hasText: 'Action' })).toBeVisible()
    await expect(headers.filter({ hasText: /entité/i })).toBeVisible()
    await expect(headers.filter({ hasText: 'Entreprise' })).toBeVisible()
  })

  test('affiche la barre de filtres', async () => {
    await expect(auditPage.searchInput).toBeVisible()

    // Selecteurs action et entityType (combobox Shadcn)
    const triggers = auditPage.page.locator('button[role="combobox"]')
    await expect(triggers.first()).toBeVisible()
  })

  test('affiche les boutons Exporter CSV et Actualiser', async () => {
    await expect(auditPage.exportButton).toBeVisible()
    await expect(auditPage.refreshButton).toBeVisible()
  })

  test('affiche le compteur total d\'entrees', async () => {
    await expect(auditPage.totalCount).toBeVisible()
  })

  test('affiche la pagination', async () => {
    await expect(auditPage.prevPageButton).toBeVisible()
    await expect(auditPage.nextPageButton).toBeVisible()
    await expect(auditPage.pageInfo).toBeVisible()
  })
})

// =============================================================================
// Bloc 3 — Filtrage par action
// =============================================================================

test.describe('Audit Logs — Filtrage par action', () => {
  let auditPage: AuditLogsPage

  test.beforeEach(async ({ adminPage }) => {
    auditPage = new AuditLogsPage(adminPage)
    await auditPage.goto()
    await auditPage.waitForLoad()
  })

  test('filtrer par action met a jour l\'URL', async () => {
    await auditPage.filterByAction('Suppression')

    const url = new URL(auditPage.page.url())
    expect(url.searchParams.get('action')).toBe('DELETE')
  })

  test('filtrer par action Connexion met a jour l\'URL', async () => {
    await auditPage.filterByAction('Connexion')

    const url = new URL(auditPage.page.url())
    expect(url.searchParams.get('action')).toBe('LOGIN')
  })

  test('reinitialiser les filtres supprime les parametres URL', async () => {
    // Appliquer un filtre d'abord
    await auditPage.filterByAction('Suppression')
    await expect(auditPage.resetButton).toBeVisible()

    // Reinitialiser
    await auditPage.resetFilters()

    const url = new URL(auditPage.page.url())
    expect(url.searchParams.has('action')).toBe(false)
  })
})

// =============================================================================
// Bloc 4 — Filtrage par entite
// =============================================================================

test.describe('Audit Logs — Filtrage par entite', () => {
  let auditPage: AuditLogsPage

  test.beforeEach(async ({ adminPage }) => {
    auditPage = new AuditLogsPage(adminPage)
    await auditPage.goto()
    await auditPage.waitForLoad()
  })

  test('filtrer par entityType met a jour l\'URL', async () => {
    await auditPage.filterByEntityType('Employé')

    const url = new URL(auditPage.page.url())
    expect(url.searchParams.get('entityType')).toBe('EMPLOYEE')
  })

  test('combiner action et entityType dans l\'URL', async () => {
    await auditPage.filterByAction('Suppression')
    await auditPage.filterByEntityType('Employé')

    const url = new URL(auditPage.page.url())
    expect(url.searchParams.get('action')).toBe('DELETE')
    expect(url.searchParams.get('entityType')).toBe('EMPLOYEE')
  })
})

// =============================================================================
// Bloc 5 — Recherche
// =============================================================================

test.describe('Audit Logs — Recherche', () => {
  let auditPage: AuditLogsPage

  test.beforeEach(async ({ adminPage }) => {
    auditPage = new AuditLogsPage(adminPage)
    await auditPage.goto()
    await auditPage.waitForLoad()
  })

  test('rechercher par email met a jour l\'URL', async () => {
    await auditPage.search('admin@smartplanning')

    const url = new URL(auditPage.page.url())
    expect(url.searchParams.get('search')).toBe('admin@smartplanning')
  })

  test('l\'URL contient le parametre search apres saisie', async () => {
    await auditPage.search('john')

    await expect(auditPage.page).toHaveURL(/search=john/)
  })
})

// =============================================================================
// Bloc 6 — Pagination
// =============================================================================

test.describe('Audit Logs — Pagination', () => {
  let auditPage: AuditLogsPage

  test.beforeEach(async ({ adminPage }) => {
    auditPage = new AuditLogsPage(adminPage)
    await auditPage.goto()
    await auditPage.waitForLoad()
  })

  test('changer pageSize a 50 met a jour l\'URL', async () => {
    await auditPage.changePageSize('50')

    const url = new URL(auditPage.page.url())
    expect(url.searchParams.get('pageSize')).toBe('50')
  })

  test('le navigateur de pagination est visible', async () => {
    await expect(auditPage.pageInfo).toBeVisible()
    await expect(auditPage.prevPageButton).toBeVisible()
    await expect(auditPage.nextPageButton).toBeVisible()
  })

  test('page 1 a le bouton precedent desactive', async () => {
    await expect(auditPage.prevPageButton).toBeDisabled()
  })
})

// =============================================================================
// Bloc 7 — Detail JSON (modal)
// =============================================================================

test.describe('Audit Logs — Detail modal', () => {
  let auditPage: AuditLogsPage

  test.beforeEach(async ({ adminPage }) => {
    auditPage = new AuditLogsPage(adminPage)
    await auditPage.goto()
    await auditPage.waitForLoad()
  })

  test('ouvrir le modal de detail affiche le titre', async () => {
    // Verifier qu'il y a au moins un bouton "Voir les details"
    const detailButton = auditPage.page.getByRole('button', { name: /voir les détails/i }).first()
    const hasDetail = await detailButton.isVisible().catch(() => false)
    if (!hasDetail) {
      test.skip()
      return
    }

    await auditPage.openDetailForFirstRow()
    await expect(auditPage.detailDialogTitle).toBeVisible()
    await expect(auditPage.detailDialogTitle).toContainText(
      /détail du log/i
    )
  })

  test('le modal affiche les informations du log', async () => {
    const detailButton = auditPage.page.getByRole('button', { name: /voir les détails/i }).first()
    const hasDetail = await detailButton.isVisible().catch(() => false)
    if (!hasDetail) {
      test.skip()
      return
    }

    await auditPage.openDetailForFirstRow()

    // Verifier que le dialog contient des infos structurees
    const dialog = auditPage.page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('text=/Date|Utilisateur|Action/i').first()).toBeVisible()
  })

  test('fermer le modal fonctionne', async () => {
    const detailButton = auditPage.page.getByRole('button', { name: /voir les détails/i }).first()
    const hasDetail = await detailButton.isVisible().catch(() => false)
    if (!hasDetail) {
      test.skip()
      return
    }

    await auditPage.openDetailForFirstRow()
    await expect(auditPage.detailDialogTitle).toBeVisible()

    await auditPage.closeDetailModal()
    await expect(auditPage.detailDialogTitle).not.toBeVisible()
  })
})

// =============================================================================
// Bloc 8 — URL bookmarkable
// =============================================================================

test.describe('Audit Logs — URL bookmarkable', () => {
  test('charger /app/admin/journaux?action=DELETE applique le filtre', async ({
    adminPage,
  }) => {
    const auditPage = new AuditLogsPage(adminPage)
    await auditPage.gotoWithParams('action=DELETE')
    await auditPage.waitForLoad()

    // L'URL doit contenir le filtre
    await expect(adminPage).toHaveURL(/action=DELETE/)

    // Le select action doit afficher le filtre actif
    const firstTrigger = adminPage.locator('button[role="combobox"]').first()
    await expect(firstTrigger).toContainText(/suppression/i)
  })

  test('charger /app/admin/journaux?entityType=TEAM applique le filtre', async ({
    adminPage,
  }) => {
    const auditPage = new AuditLogsPage(adminPage)
    await auditPage.gotoWithParams('entityType=TEAM')
    await auditPage.waitForLoad()

    await expect(adminPage).toHaveURL(/entityType=TEAM/)
  })

  test('les filtres sont persistes dans l\'URL apres selection', async ({
    adminPage,
  }) => {
    const auditPage = new AuditLogsPage(adminPage)
    await auditPage.goto()
    await auditPage.waitForLoad()

    await auditPage.filterByAction('Création')

    // L'URL doit contenir action=CREATE
    const url = new URL(adminPage.url())
    expect(url.searchParams.get('action')).toBe('CREATE')

    // Recharger la page
    await adminPage.reload()
    await auditPage.waitForLoad()

    // Le filtre doit toujours etre actif
    const reloadedUrl = new URL(adminPage.url())
    expect(reloadedUrl.searchParams.get('action')).toBe('CREATE')
  })
})
