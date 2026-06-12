/**
 * Page Object - Impersonation (mode support SYSTEM_ADMIN)
 *
 * Encapsule les selecteurs et actions pour le mode impersonation.
 * Accessible uniquement aux SYSTEM_ADMIN.
 *
 * Note: L'impersonation utilise l'API directe via page.evaluate() car:
 * 1. Le dropdown Radix portale en dehors du DOM stable
 * 2. Le session.update() NextAuth doit se terminer avant la navigation
 * 3. Evite les ERR_TOO_MANY_REDIRECTS causes par router.push() concurrent
 *
 * @ticket SP-456
 */

import { Page, Locator, expect, Cookie } from '@playwright/test'

export class ImpersonationPage {
  readonly page: Page

  /**
   * Snapshot des cookies de la session admin (JWT SYSTEM_ADMIN propre),
   * capture AVANT le demarrage de l'impersonation — donc avant que
   * session.update() ne mute le token NextAuth (isImpersonating=true,
   * id/companyId = entreprise cible). Reinjecte dans stopImpersonation()
   * pour restaurer un JWT admin sain. Voir le commentaire de stopImpersonation.
   */
  private adminSessionCookies: Cookie[] = []

  // ==========================================================================
  // Locators
  // ==========================================================================

  /** Banniere orange mode support */
  readonly banner: Locator

  /** Texte de la banniere */
  readonly bannerText: Locator

  /** Bouton quitter le mode support */
  readonly quitButton: Locator

  /** Titre page Entreprises */
  readonly companiesTitle: Locator

  /** Indicateur de chargement */
  readonly loadingIndicator: Locator

  constructor(page: Page) {
    this.page = page

    // Banniere impersonation
    this.banner = page.getByTestId('impersonation-banner')
    this.bannerText = page.getByTestId('impersonation-banner-text')
    this.quitButton = page.getByTestId('quit-impersonation-button')

    // Page Companies
    this.companiesTitle = page.getByRole('heading', { name: /entreprises/i })
    this.loadingIndicator = page.locator('text=Chargement...').first()
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Demarre l'impersonation via l'API directe + navigation manuelle.
   *
   * Utilise page.evaluate() pour appeler /api/admin/impersonate car :
   * 1. Le dropdown Radix portale en dehors du DOM stable (detached elements)
   * 2. Le session.update() NextAuth doit se terminer avant la navigation
   * 3. Evite les race conditions entre router.push() et le middleware
   *
   * Le companyId est recupere via le DOM (data attribute) ou en cliquant
   * sur le dropdown et en interceptant le lien de detail.
   */
  async startImpersonation(companyName: string): Promise<void> {
    // Capturer les cookies de la session admin AVANT toute mutation.
    // A ce stade le JWT NextAuth est un SYSTEM_ADMIN propre (isImpersonating
    // absent). L'appel POST /api/admin/impersonate declenche un session.update()
    // qui reecrit ce token (id/companyId = entreprise cible, isImpersonating=true).
    // On garde donc un snapshot sain pour le restaurer dans stopImpersonation().
    this.adminSessionCookies = await this.page.context().cookies()

    // Naviguer vers la liste des entreprises
    await this.page.goto('/app/admin/companies', {
      waitUntil: 'domcontentloaded',
    })
    await expect(this.companiesTitle).toBeVisible({ timeout: 15000 })
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 })

    // Attendre que la table contienne des lignes de donnees (pas "Chargement...")
    const tableRows = this.page.locator('table tbody tr')
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 })

    // Trouver la ligne de TechCorp — attendre qu'elle soit visible et stable
    const row = this.page.locator('table tbody tr', { hasText: companyName })
    await expect(row).toBeVisible({ timeout: 10000 })

    // Petit delai pour laisser React finir ses re-renders
    // (useEffect + fetchData dans CompaniesDataTable provoque un second render)
    await this.page.waitForTimeout(500)

    // Cliquer sur le bouton "Menu actions" de la ligne cible
    const actionsButton = row.getByRole('button', {
      name: /menu actions/i,
    })
    await actionsButton.click({ timeout: 10000 })

    // Attendre que le menu Radix s'ouvre (portale au body)
    const impersonateItem = this.page.getByRole('menuitem', {
      name: /voir espace client/i,
    })
    await expect(impersonateItem).toBeVisible({ timeout: 5000 })

    // Intercepter la reponse API et cliquer en parallele
    const [apiResponse] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.url().includes('/api/admin/impersonate') &&
          resp.request().method() === 'POST',
        { timeout: 15000 }
      ),
      impersonateItem.click(),
    ])

    const status = apiResponse.status()
    if (status !== 200) {
      const body = await apiResponse.text()
      throw new Error(`Impersonation API returned ${status}: ${body}`)
    }

    // Attendre que la page se stabilise sur un dashboard
    await this.page.waitForURL(/\/app\/(dashboard|director|manager|employee)/, {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    })

    // Reload pour forcer le Server Component layout.tsx a lire le cookie
    // sp-impersonation (fallback SP-456 quand updateSession echoue)
    await this.page.reload({ waitUntil: 'domcontentloaded' })
  }

  /**
   * Arrete l'impersonation et restaure la session SYSTEM_ADMIN d'origine.
   *
   * Point cle (cause racine du fail nightly deterministe depuis le 10 juin) :
   * il ne suffit PAS de supprimer le cookie sp-impersonation. Le demarrage de
   * l'impersonation a aussi mute le JWT NextAuth via session.update() :
   * `token.isImpersonating = true`, `token.id`/`token.companyId` pointent vers
   * l'entreprise cible (cf. auth.config.ts, branche `if (token.isImpersonating
   * && token.impersonatedCompanyId)`). Tant que ce JWT est en place, le layout
   * affiche la banniere "Mode support" et le middleware redirige /app/admin/*
   * vers le dashboard tenant — d'ou le `companiesTitle` jamais visible.
   *
   * On restaure donc le snapshot des cookies admin capture dans
   * startImpersonation() (JWT SYSTEM_ADMIN propre), ce qui ecrase a la fois le
   * JWT impersonne ET supprime le cookie sp-impersonation en une seule passe.
   * Pas de re-login UI : evite le POST credentials NextAuth (~1.3 min sur le
   * serveur dev lent du CI), ancienne source de flaky.
   */
  async stopImpersonation(): Promise<void> {
    // 1. Appeler l'API DELETE (supprime le cookie impersonation cote serveur +
    // audit log). Le cookie sp-impersonation est retire, mais le JWT NextAuth
    // reste impersonne — on le corrige a l'etape 2.
    const deleteResp = await this.page.request.delete('/api/admin/impersonate')
    if (!deleteResp.ok()) {
      throw new Error(`DELETE impersonation failed: ${deleteResp.status()}`)
    }

    // 2. Restaurer le snapshot admin : on remplace integralement le cookie jar
    // par les cookies SYSTEM_ADMIN sains captures avant le demarrage. Cela
    // reinstalle le JWT non-impersonne et garantit l'absence du cookie
    // sp-impersonation (le snapshot a ete pris quand il n'existait pas).
    if (this.adminSessionCookies.length === 0) {
      throw new Error(
        'stopImpersonation: snapshot des cookies admin vide — ' +
          'startImpersonation() doit etre appelee avant stopImpersonation()'
      )
    }
    await this.page.context().clearCookies()
    await this.page.context().addCookies(this.adminSessionCookies)

    // 3. Retourner sur la liste des entreprises (session admin restauree).
    await this.page.goto('/app/admin/companies', {
      waitUntil: 'domcontentloaded',
    })
    await expect(this.companiesTitle).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  /**
   * Verifie que la banniere orange est visible avec le nom de l'entreprise
   */
  async expectBannerVisible(companyName: string): Promise<void> {
    await expect(this.banner).toBeVisible({ timeout: 10000 })
    await expect(this.bannerText).toContainText(companyName)
    await expect(this.quitButton).toBeVisible()
  }

  /**
   * Verifie que la banniere n'est pas dans le DOM
   */
  async expectBannerHidden(): Promise<void> {
    await expect(this.banner).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Verifie que les boutons de mutation sont desactives
   */
  async expectMutationButtonsDisabled(): Promise<void> {
    const newCompanyButton = this.page.getByRole('button', {
      name: /nouvelle entreprise/i,
    })
    if (await newCompanyButton.isVisible()) {
      await expect(newCompanyButton).toBeDisabled()
    }
  }

  /**
   * Verifie que l'URL est un dashboard (lecture seule)
   */
  async expectRedirectedToReadOnly(): Promise<void> {
    await expect(this.page).toHaveURL(
      /\/app\/(dashboard|director|manager|employee)/
    )
  }
}
