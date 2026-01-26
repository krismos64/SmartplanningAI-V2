/**
 * Tests unitaires pour le template WelcomeEmail
 *
 * @ticket SP-297
 * @description Tests du rendu HTML et des props du template de bienvenue
 */

import { render } from '@react-email/components'
import { describe, it, expect } from 'vitest'

import { WelcomeEmail } from '../../../emails/templates/WelcomeEmail'

describe('WelcomeEmail', () => {
  const defaultProps = {
    firstName: 'Christophe',
    email: 'christophe@test.com',
    loginUrl: 'https://smartplanning.fr/connexion',
  }

  // ==========================================================================
  // Rendu HTML
  // ==========================================================================

  describe('Rendu HTML', () => {
    it('devrait générer un HTML valide', async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('<!DOCTYPE html')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('devrait contenir le prénom dans le titre', async () => {
      const html = await render(WelcomeEmail(defaultProps))

      // Le HTML peut encoder différemment, on vérifie les parties essentielles
      expect(html).toContain('Bienvenue sur SmartPlanning')
      expect(html).toContain('Christophe')
    })

    it("devrait contenir l'adresse email", async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('christophe@test.com')
    })

    it("devrait contenir le bouton CTA avec l'URL de connexion", async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('Accéder à mon espace')
      expect(html).toContain('https://smartplanning.fr/connexion')
    })

    it('devrait contenir les fonctionnalités présentées', async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('Planification intelligente')
      expect(html).toContain('Gestion des équipes')
      expect(html).toContain('Tableaux de bord')
    })

    it('devrait contenir le texte de preview', async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('Bienvenue Christophe')
      expect(html).toContain('Votre compte SmartPlanning est prêt')
    })
  })

  // ==========================================================================
  // Props personnalisées
  // ==========================================================================

  describe('Props personnalisées', () => {
    it('devrait gérer un prénom différent', async () => {
      const customProps = {
        ...defaultProps,
        firstName: 'Marie',
      }

      const html = await render(WelcomeEmail(customProps))

      expect(html).toContain('Bienvenue sur SmartPlanning')
      expect(html).toContain('Marie')
    })

    it('devrait gérer une URL de connexion différente', async () => {
      const customProps = {
        ...defaultProps,
        loginUrl: 'https://app.smartplanning.fr/login',
      }

      const html = await render(WelcomeEmail(customProps))

      expect(html).toContain('https://app.smartplanning.fr/login')
    })

    it('devrait gérer un email différent', async () => {
      const customProps = {
        ...defaultProps,
        email: 'autre@email.com',
      }

      const html = await render(WelcomeEmail(customProps))

      expect(html).toContain('autre@email.com')
    })
  })

  // ==========================================================================
  // Structure et accessibilité
  // ==========================================================================

  describe('Structure et accessibilité', () => {
    it('devrait avoir l\'attribut lang="fr"', async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('lang="fr"')
    })

    it('devrait contenir le logo SmartPlanning', async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('alt="SmartPlanning"')
    })

    it('devrait contenir les liens du footer', async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('CGU')
      expect(html).toContain('Confidentialité')
      expect(html).toContain('Contact')
    })

    it("devrait contenir l'email de contact", async () => {
      const html = await render(WelcomeEmail(defaultProps))

      expect(html).toContain('contact@smartplanning.fr')
    })
  })

  // ==========================================================================
  // Rendu texte brut
  // ==========================================================================

  describe('Rendu texte brut', () => {
    it('devrait pouvoir générer une version texte', async () => {
      const text = await render(WelcomeEmail(defaultProps), {
        plainText: true,
      })

      expect(text).toContain('Bienvenue')
      expect(text).toContain('Christophe')
      expect(text).toContain('SmartPlanning')
    })
  })
})
