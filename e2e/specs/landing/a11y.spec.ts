/**
 * E2E accessibilité — landing page
 *
 * Vérifie via axe-core l'absence de violations WCAG 2.1 AA sur la landing,
 * en mode clair ET en mode sombre. Cible le périmètre du refactor de
 * discipline chromatique (token primary unique).
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

test.describe('Landing — accessibilité axe-core', () => {
  test('aucune violation WCAG AA en mode clair', async ({ page }) => {
    // Forcer le thème clair AVANT le chargement : next-themes lit cette clé
    // au boot et applique `light`. Retirer `.dark` après coup ne suffit pas,
    // car le provider (defaultTheme="dark") la réapplique à l'hydration.
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'light')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Garde-fou : vérifier qu'on est bien en mode clair avant l'audit.
    await page.waitForFunction(
      () => !document.documentElement.classList.contains('dark')
    )

    const results = await new AxeBuilder({ page })
      .withTags(A11Y_TAGS)
      // Exclusions hors périmètre de ce sprint (composants partagés
      // non touchés par le refactor de discipline chromatique).
      .exclude('iframe[src*="youtube"]')
      .exclude('[data-testid="cookie-accept-all"]')
      .exclude('button[aria-label="Accepter tous les cookies"]')
      .analyze()

    expect(
      results.violations,
      `Violations en mode clair :\n${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([])
  })

  test('aucune violation WCAG AA en mode sombre', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() =>
      document.documentElement.classList.contains('dark')
    )

    const results = await new AxeBuilder({ page })
      .withTags(A11Y_TAGS)
      .exclude('iframe[src*="youtube"]')
      .exclude('[data-testid="cookie-accept-all"]')
      .exclude('button[aria-label="Accepter tous les cookies"]')
      .analyze()

    expect(
      results.violations,
      `Violations en mode sombre :\n${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([])
  })

  /**
   * La page /contact porte le seul formulaire du site public. Labels,
   * messages d'erreur relies par `aria-describedby` et contraste des champs
   * sont exactement ce qu'un audit statique attrape, et ce qu'une reprise
   * visuelle casse le plus facilement.
   *
   * Un seul mode ici : les pages publiques n'ont plus de variante sombre
   * depuis SP-573, le theme de l'application ne les atteint pas.
   *
   * @see SP-574
   */
  test('aucune violation WCAG AA sur la page contact', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    // Le formulaire s'anime au montage : attendre qu'il soit visible, sinon
    // axe auditerait un arbre encore a `opacity: 0`.
    await page.getByLabel(/nom complet/i).waitFor({ state: 'visible' })

    const results = await new AxeBuilder({ page })
      .withTags(A11Y_TAGS)
      .exclude('[data-testid="cookie-accept-all"]')
      .exclude('button[aria-label="Accepter tous les cookies"]')
      .analyze()

    expect(
      results.violations,
      `Violations sur /contact :\n${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([])
  })

  /**
   * `/login` et `/register` sont la derniere etape avant conversion et
   * portent des formulaires. Elles ont ete reprises a l'identite publique
   * en SP-574, apres avoir garde l'habillage d'avant la refonte.
   *
   * Un seul mode : elles portent desormais `.public-scope`, le theme de
   * l'application ne les atteint plus.
   *
   * @see SP-574
   */
  for (const { path, label, field } of [
    { path: '/login', label: 'connexion', field: /^email$/i },
    { path: '/register', label: 'inscription', field: /nom complet/i },
  ]) {
    test(`aucune violation WCAG AA sur la page ${label}`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.getByLabel(field).first().waitFor({ state: 'visible' })

      const results = await new AxeBuilder({ page })
        .withTags(A11Y_TAGS)
        .exclude('[data-testid="cookie-accept-all"]')
        .exclude('button[aria-label="Accepter tous les cookies"]')
        .analyze()

      expect(
        results.violations,
        `Violations sur ${path} :\n${JSON.stringify(results.violations, null, 2)}`
      ).toEqual([])
    })
  }

  /**
   * Pages reprises pendant le balayage de SP-574, qui n'avaient aucun audit :
   * `/tarifs` porte le simulateur et la carte de prix, `/cgu` l'ossature
   * commune des cinq pages legales.
   *
   * Le simulateur etait le defaut le plus visible du balayage, un prix en
   * degrade cyan-bleu sur la page qui porte l'argument commercial.
   *
   * @see SP-574
   */
  for (const { path, label } of [
    { path: '/tarifs', label: 'tarifs' },
    { path: '/cgu', label: 'legale' },
  ]) {
    test(`aucune violation WCAG AA sur la page ${label}`, async ({ page }) => {
      /*
        `prefers-reduced-motion` avant le chargement : les cartes du
        simulateur apparaissent en fondu, et axe mesurait le contraste
        pendant la transition. Le bleu #2563ff y etait lu #5e8bfc, ce qui
        faisait echouer un texte blanc pourtant a 4,88:1 une fois l'animation
        terminee.

        Le reglage n'affaiblit pas l'audit : il coupe les fondus, donc axe
        mesure l'etat final que le visiteur voit, et couvre en plus le
        parcours des personnes qui reduisent les animations.
      */
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      /*
        Attendre que les fondus d'apparition soient termines avant de
        mesurer. `reducedMotion` ne suffit pas : les pages legales animent
        leur contenu avec Framer Motion, qui anime en JavaScript sans
        consulter le media. Le conteneur `.legal-content` reste donc a
        `opacity: 0` un court instant apres `networkidle`.

        Axe y mesurait un bleu nuit #0f1b2d rendu comme #757980 par
        l'opacite du parent, soit 3,88:1 au lieu du contraste reel. Le spec
        rougissait en suite complete, ou la machine est plus chargee et
        l'animation plus lente, et passait isolement. Un audit qui echoue
        au hasard ne vaut rien : c'est le spec qui mesurait trop tot, pas
        la page qui etait fautive.

        L'attente cible `.legal-content` et non tous les elements de la
        page : une condition globale expire sur les elements laisses
        volontairement transparents.
      */
      await page.waitForFunction(
        () => {
          const animated = document.querySelector('.legal-content')
          // Les pages sans conteneur anime n'ont rien a attendre.
          if (!animated) return true
          return Number(getComputedStyle(animated).opacity) > 0.99
        },
        undefined,
        { timeout: 10000 }
      )

      const results = await new AxeBuilder({ page })
        .withTags(A11Y_TAGS)
        .exclude('[data-testid="cookie-accept-all"]')
        .exclude('button[aria-label="Accepter tous les cookies"]')
        .analyze()

      expect(
        results.violations,
        `Violations sur ${path} :\n${JSON.stringify(results.violations, null, 2)}`
      ).toEqual([])
    })
  }
})
