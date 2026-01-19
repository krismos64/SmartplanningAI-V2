/**
 * Tests unitaires pour le template ContactNotificationEmail
 *
 * @ticket SP-301
 * @description Tests du rendu HTML et des props du template de notification admin
 */

import { render } from '@react-email/components'
import { describe, it, expect } from 'vitest'

import { ContactNotificationEmail } from '../../../emails/templates/ContactNotificationEmail'

describe('ContactNotificationEmail', () => {
  const defaultProps = {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    subject: "Demande d'information",
    message: 'Bonjour, je souhaite en savoir plus sur vos services.',
    submittedAt: new Date('2026-01-19T14:30:00Z'),
  }

  // ==========================================================================
  // Rendu HTML
  // ==========================================================================

  describe('Rendu HTML', () => {
    it('devrait générer un HTML valide', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('<!DOCTYPE html')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('devrait contenir le badge alerte nouveau message', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('Nouveau message')
      expect(html).toContain('contact')
    })

    it('devrait contenir le nom de l\'expéditeur dans le titre', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('Message de')
      expect(html).toContain('Jean Dupont')
    })

    it('devrait afficher les informations de l\'expéditeur', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('Jean Dupont')
      expect(html).toContain('jean@example.com')
    })

    it('devrait afficher la date de soumission en français', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      // La date devrait être formatée en français
      expect(html).toContain('janvier')
      expect(html).toContain('2026')
    })

    it('devrait afficher le sujet du message', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('Demande')
      expect(html).toContain('information')
    })

    it('devrait afficher le contenu du message', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('Bonjour, je souhaite en savoir plus')
    })

    it('devrait contenir le bouton pour répondre', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('Répondre')
      expect(html).toContain('Jean Dupont')
    })

    it('devrait contenir le lien mailto pour répondre directement', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('mailto:jean@example.com')
    })

    it('devrait contenir le rappel de délai de réponse', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('24')
      expect(html).toContain('48')
      expect(html).toContain('heures')
    })

    it('devrait contenir le texte de preview personnalisé', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('Nouveau message')
      expect(html).toContain('Jean Dupont')
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

      const html = await render(ContactNotificationEmail(customProps))

      expect(html).toContain('Marie Martin')
    })

    it('devrait gérer un email différent', async () => {
      const customProps = {
        ...defaultProps,
        email: 'marie.martin@entreprise.fr',
      }

      const html = await render(ContactNotificationEmail(customProps))

      expect(html).toContain('marie.martin@entreprise.fr')
      expect(html).toContain('mailto:marie.martin@entreprise.fr')
    })

    it('devrait gérer un sujet différent', async () => {
      const customProps = {
        ...defaultProps,
        subject: 'Partenariat commercial',
      }

      const html = await render(ContactNotificationEmail(customProps))

      expect(html).toContain('Partenariat commercial')
    })

    it('devrait gérer un message différent', async () => {
      const customProps = {
        ...defaultProps,
        message: 'Nous recherchons un partenaire pour notre projet.',
      }

      const html = await render(ContactNotificationEmail(customProps))

      expect(html).toContain('recherchons un partenaire')
    })

    it('devrait gérer une date différente', async () => {
      const customProps = {
        ...defaultProps,
        submittedAt: new Date('2026-12-25T10:00:00Z'),
      }

      const html = await render(ContactNotificationEmail(customProps))

      expect(html).toContain('décembre')
      expect(html).toContain('2026')
    })

    it('devrait gérer un message long avec plusieurs lignes', async () => {
      const customProps = {
        ...defaultProps,
        message:
          'Introduction du message.\n\nCorps du message avec détails.\n\nConclusion et remerciements.',
      }

      const html = await render(ContactNotificationEmail(customProps))

      expect(html).toContain('Introduction du message')
      expect(html).toContain('Corps du message')
      expect(html).toContain('Conclusion')
    })

    it('devrait gérer des caractères spéciaux dans le sujet', async () => {
      const customProps = {
        ...defaultProps,
        subject: "Demande d'info & devis [URGENT]",
      }

      const html = await render(ContactNotificationEmail(customProps))

      expect(html).toContain('Demande')
      expect(html).toContain('devis')
    })
  })

  // ==========================================================================
  // Structure et accessibilité
  // ==========================================================================

  describe('Structure et accessibilité', () => {
    it('devrait avoir l\'attribut lang="fr"', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('lang="fr"')
    })

    it('devrait contenir le logo SmartPlanning', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('alt="SmartPlanning"')
    })

    it('devrait contenir la signature automatique', async () => {
      const html = await render(ContactNotificationEmail(defaultProps))

      expect(html).toContain('Notification automatique')
      expect(html).toContain('SmartPlanning')
    })
  })

  // ==========================================================================
  // Rendu texte brut
  // ==========================================================================

  describe('Rendu texte brut', () => {
    it('devrait pouvoir générer une version texte', async () => {
      const text = await render(ContactNotificationEmail(defaultProps), {
        plainText: true,
      })

      expect(text).toContain('Jean Dupont')
      expect(text).toContain('jean@example.com')
      expect(text).toContain('Demande')
      expect(text).toContain('information')
      expect(text).toContain('Bonjour, je souhaite')
    })
  })
})
