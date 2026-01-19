/**
 * Tests unitaires pour le template LeaveRejectedEmail
 *
 * @ticket SP-300
 * @description Tests du rendu HTML et des props du template de congé refusé
 */

import { render } from '@react-email/components'
import { describe, it, expect } from 'vitest'

import { LeaveRejectedEmail } from '../../../emails/templates/LeaveRejectedEmail'

describe('LeaveRejectedEmail', () => {
  const defaultProps = {
    firstName: 'Paul',
    leaveType: 'RTT',
    startDate: '10 février 2026',
    endDate: '12 février 2026',
    rejectionReason: 'Période de forte activité, équipe incomplète.',
    dashboardUrl: 'https://smartplanning.fr/dashboard/conges',
  }

  // ==========================================================================
  // Rendu HTML
  // ==========================================================================

  describe('Rendu HTML', () => {
    it('devrait générer un HTML valide', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('<!DOCTYPE html')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('devrait contenir le prénom dans la salutation', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('Bonjour')
      expect(html).toContain('Paul')
    })

    it('devrait contenir le message empathique de refus', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('désolés')
      expect(html).toContain('approuvée')
    })

    it('devrait contenir le type de congé', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('RTT')
    })

    it('devrait contenir les dates de début et fin', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('10 février 2026')
      expect(html).toContain('12 février 2026')
    })

    it('devrait contenir le motif du refus', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('Période de forte activité')
      expect(html).toContain('équipe incomplète')
    })

    it('devrait contenir l\'invitation à contacter le manager', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('contacter votre manager')
    })

    it('devrait contenir le bouton CTA vers le dashboard', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('Voir mes congés')
      expect(html).toContain('https://smartplanning.fr/dashboard/conges')
    })

    it('devrait contenir le texte de preview personnalisé', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('Paul')
      expect(html).toContain('approuvée')
    })
  })

  // ==========================================================================
  // Props personnalisées
  // ==========================================================================

  describe('Props personnalisées', () => {
    it('devrait gérer un prénom différent', async () => {
      const customProps = {
        ...defaultProps,
        firstName: 'Sophie',
      }

      const html = await render(LeaveRejectedEmail(customProps))

      expect(html).toContain('Bonjour')
      expect(html).toContain('Sophie')
    })

    it('devrait gérer un type de congé différent', async () => {
      const customProps = {
        ...defaultProps,
        leaveType: 'Congé sans solde',
      }

      const html = await render(LeaveRejectedEmail(customProps))

      expect(html).toContain('Congé sans solde')
    })

    it('devrait gérer des dates différentes', async () => {
      const customProps = {
        ...defaultProps,
        startDate: '15 décembre 2026',
        endDate: '31 décembre 2026',
      }

      const html = await render(LeaveRejectedEmail(customProps))

      expect(html).toContain('15 décembre 2026')
      expect(html).toContain('31 décembre 2026')
    })

    it('devrait gérer un motif de refus différent', async () => {
      const customProps = {
        ...defaultProps,
        rejectionReason: 'Chevauchement avec les congés d\'un autre membre de l\'équipe.',
      }

      const html = await render(LeaveRejectedEmail(customProps))

      expect(html).toContain('Chevauchement')
    })

    it('devrait gérer un motif de refus long', async () => {
      const customProps = {
        ...defaultProps,
        rejectionReason:
          'Cette période correspond à notre phase de clôture annuelle. Tous les membres de l\'équipe comptabilité doivent être présents pour finaliser les bilans.',
      }

      const html = await render(LeaveRejectedEmail(customProps))

      expect(html).toContain('clôture annuelle')
      expect(html).toContain('bilans')
    })

    it('devrait gérer une URL de dashboard différente', async () => {
      const customProps = {
        ...defaultProps,
        dashboardUrl: 'https://app.smartplanning.fr/mes-conges',
      }

      const html = await render(LeaveRejectedEmail(customProps))

      expect(html).toContain('https://app.smartplanning.fr/mes-conges')
    })
  })

  // ==========================================================================
  // Structure et accessibilité
  // ==========================================================================

  describe('Structure et accessibilité', () => {
    it('devrait avoir l\'attribut lang="fr"', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('lang="fr"')
    })

    it('devrait contenir le logo SmartPlanning', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('alt="SmartPlanning"')
    })

    it('devrait contenir la signature de l\'équipe', async () => {
      const html = await render(LeaveRejectedEmail(defaultProps))

      expect(html).toContain('SmartPlanning')
    })
  })

  // ==========================================================================
  // Rendu texte brut
  // ==========================================================================

  describe('Rendu texte brut', () => {
    it('devrait pouvoir générer une version texte', async () => {
      const text = await render(LeaveRejectedEmail(defaultProps), {
        plainText: true,
      })

      expect(text).toContain('Paul')
      expect(text).toContain('RTT')
      expect(text).toContain('10 février 2026')
      expect(text).toContain('Période de forte activité')
    })
  })
})
