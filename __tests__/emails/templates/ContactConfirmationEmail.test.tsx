/**
 * Tests unitaires pour le template ContactConfirmationEmail
 *
 * @ticket SP-301
 * @description Tests du rendu HTML et des props du template de confirmation de contact
 */

import { render } from '@react-email/components'
import { describe, it, expect } from 'vitest'

import { ContactConfirmationEmail } from '../../../emails/templates/ContactConfirmationEmail'

describe('ContactConfirmationEmail', () => {
  const defaultProps = {
    name: 'Jean Dupont',
    subject: "Demande d'information",
    message: 'Bonjour, je souhaite en savoir plus sur vos services.',
  }

  // ==========================================================================
  // Rendu HTML
  // ==========================================================================

  describe('Rendu HTML', () => {
    it('devrait générer un HTML valide', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('<!DOCTYPE html')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('devrait contenir le nom dans le titre', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('Merci')
      expect(html).toContain('Jean Dupont')
    })

    it('devrait contenir le message de confirmation', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('bien reçu')
      expect(html).toContain('votre message')
    })

    it('devrait mentionner le délai de réponse', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('24')
      expect(html).toContain('48')
      expect(html).toContain('heures')
    })

    it('devrait contenir le récapitulatif du sujet', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('Demande')
      expect(html).toContain('information')
    })

    it('devrait contenir le récapitulatif du message', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('Bonjour, je souhaite en savoir plus')
    })

    it('devrait contenir le bouton CTA vers le site', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('Visiter notre site')
      expect(html).toContain('https://smartplanning.fr')
    })

    it('devrait contenir le texte de preview personnalisé', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('Merci')
      expect(html).toContain('Jean Dupont')
    })

    it('devrait contenir le lien email de contact', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('contact@smartplanning.fr')
    })

    it("devrait contenir la signature de l'équipe", async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('SmartPlanning')
    })
  })

  // ==========================================================================
  // Props personnalisées
  // ==========================================================================

  describe('Props personnalisées', () => {
    it('devrait gérer un nom différent', async () => {
      const customProps = {
        ...defaultProps,
        name: 'Marie Martin',
      }

      const html = await render(ContactConfirmationEmail(customProps))

      expect(html).toContain('Marie Martin')
    })

    it('devrait gérer un sujet différent', async () => {
      const customProps = {
        ...defaultProps,
        subject: 'Question sur les tarifs',
      }

      const html = await render(ContactConfirmationEmail(customProps))

      expect(html).toContain('Question sur les tarifs')
    })

    it('devrait gérer un message différent', async () => {
      const customProps = {
        ...defaultProps,
        message: 'Je voudrais un devis personnalisé pour mon entreprise.',
      }

      const html = await render(ContactConfirmationEmail(customProps))

      expect(html).toContain('devis personnalisé')
    })

    it('devrait gérer un message long avec plusieurs lignes', async () => {
      const customProps = {
        ...defaultProps,
        message:
          'Premier paragraphe.\n\nDeuxième paragraphe.\n\nTroisième paragraphe avec plus de détails.',
      }

      const html = await render(ContactConfirmationEmail(customProps))

      expect(html).toContain('Premier paragraphe')
      expect(html).toContain('Deuxième paragraphe')
      expect(html).toContain('Troisième paragraphe')
    })

    it('devrait gérer des caractères spéciaux dans le nom', async () => {
      const customProps = {
        ...defaultProps,
        name: 'François Müller-André',
      }

      const html = await render(ContactConfirmationEmail(customProps))

      expect(html).toContain('François')
    })
  })

  // ==========================================================================
  // Structure et accessibilité
  // ==========================================================================

  describe('Structure et accessibilité', () => {
    it('devrait avoir l\'attribut lang="fr"', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('lang="fr"')
    })

    it('devrait contenir le logo SmartPlanning', async () => {
      const html = await render(ContactConfirmationEmail(defaultProps))

      expect(html).toContain('alt="SmartPlanning"')
    })
  })

  // ==========================================================================
  // Rendu texte brut
  // ==========================================================================

  describe('Rendu texte brut', () => {
    it('devrait pouvoir générer une version texte', async () => {
      const text = await render(ContactConfirmationEmail(defaultProps), {
        plainText: true,
      })

      expect(text).toContain('Jean Dupont')
      expect(text).toContain('Demande')
      expect(text).toContain('information')
      expect(text).toContain('Bonjour, je souhaite')
    })
  })
})
