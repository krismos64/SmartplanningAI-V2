/**
 * Tests unitaires pour le template LeaveRequestedEmail
 *
 * @ticket SP-415
 * @description Tests du rendu HTML et des props du template de nouvelle demande de congé
 */

import { render } from '@react-email/components'
import { describe, it, expect } from 'vitest'

import { LeaveRequestedEmail } from '../../../emails/templates/LeaveRequestedEmail'

describe('LeaveRequestedEmail', () => {
  const defaultProps = {
    managerName: 'Pierre',
    employeeName: 'Marie Dupont',
    leaveType: 'Congés payés',
    startDate: '15 janvier 2026',
    endDate: '20 janvier 2026',
    totalDays: 4,
    reason: 'Vacances familiales',
    requestUrl: 'https://smartplanning.fr/app/dashboard/leaves/leave-123',
  }

  // ==========================================================================
  // Rendu HTML
  // ==========================================================================

  describe('Rendu HTML', () => {
    it('devrait générer un HTML valide', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('<!DOCTYPE html')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('devrait contenir le prénom du manager dans la salutation', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('Bonjour')
      expect(html).toContain('Pierre')
    })

    it('devrait contenir le nom de l\'employé', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('Marie Dupont')
    })

    it('devrait contenir le type de congé', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('Congés payés')
    })

    it('devrait contenir les dates de début et fin', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('15 janvier 2026')
      expect(html).toContain('20 janvier 2026')
    })

    it('devrait contenir le nombre de jours', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      // React inserts comments between elements, so check individual parts
      expect(html).toContain('>4<')
      expect(html).toContain('jour')
    })

    it('devrait contenir le motif de la demande', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('Vacances familiales')
    })

    it('devrait contenir le bouton CTA vers la demande', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('Voir la demande')
      expect(html).toContain(
        'https://smartplanning.fr/app/dashboard/leaves/leave-123'
      )
    })

    it('devrait contenir le texte de preview personnalisé', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('Nouvelle demande de congé')
      expect(html).toContain('Marie Dupont')
    })
  })

  // ==========================================================================
  // Props personnalisées
  // ==========================================================================

  describe('Props personnalisées', () => {
    it('devrait gérer un prénom de manager différent', async () => {
      const customProps = {
        ...defaultProps,
        managerName: 'Sophie',
      }

      const html = await render(LeaveRequestedEmail(customProps))

      expect(html).toContain('Bonjour')
      expect(html).toContain('Sophie')
    })

    it('devrait gérer un type de congé RTT', async () => {
      const customProps = {
        ...defaultProps,
        leaveType: 'RTT',
      }

      const html = await render(LeaveRequestedEmail(customProps))

      expect(html).toContain('RTT')
    })

    it('devrait gérer un seul jour (singulier)', async () => {
      const customProps = {
        ...defaultProps,
        totalDays: 1,
      }

      const html = await render(LeaveRequestedEmail(customProps))

      // React inserts comments between elements, so check both parts
      expect(html).toContain('>1<')
      expect(html).toContain('jour')
      // Check it's singular (no 's' after 'jour')
      expect(html).toMatch(/jour[^s]/)
    })

    it('devrait gérer une demande sans motif', async () => {
      const customProps = {
        ...defaultProps,
        reason: undefined,
      }

      const html = await render(LeaveRequestedEmail(customProps))

      // Le HTML doit être valide même sans motif
      expect(html).toContain('<!DOCTYPE html')
      expect(html).not.toContain('undefined')
    })

    it('devrait gérer des dates différentes', async () => {
      const customProps = {
        ...defaultProps,
        startDate: '1 mars 2026',
        endDate: '5 mars 2026',
      }

      const html = await render(LeaveRequestedEmail(customProps))

      expect(html).toContain('1 mars 2026')
      expect(html).toContain('5 mars 2026')
    })
  })

  // ==========================================================================
  // Structure et accessibilité
  // ==========================================================================

  describe('Structure et accessibilité', () => {
    it('devrait avoir l\'attribut lang="fr"', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('lang="fr"')
    })

    it('devrait contenir le logo SmartPlanning', async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('alt="SmartPlanning"')
    })

    it("devrait contenir la signature de l'équipe", async () => {
      const html = await render(LeaveRequestedEmail(defaultProps))

      expect(html).toContain('SmartPlanning')
    })
  })

  // ==========================================================================
  // Rendu texte brut
  // ==========================================================================

  describe('Rendu texte brut', () => {
    it('devrait pouvoir générer une version texte', async () => {
      const text = await render(LeaveRequestedEmail(defaultProps), {
        plainText: true,
      })

      expect(text).toContain('Pierre')
      expect(text).toContain('Marie Dupont')
      expect(text).toContain('Congés payés')
      expect(text).toContain('15 janvier 2026')
    })
  })
})
