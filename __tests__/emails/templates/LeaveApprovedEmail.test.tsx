/**
 * Tests unitaires pour le template LeaveApprovedEmail
 *
 * @ticket SP-300
 * @description Tests du rendu HTML et des props du template de congé approuvé
 */

import { render } from '@react-email/components'
import { describe, it, expect } from 'vitest'

import { LeaveApprovedEmail } from '../../../emails/templates/LeaveApprovedEmail'

describe('LeaveApprovedEmail', () => {
  const defaultProps = {
    firstName: 'Marie',
    leaveType: 'Congés payés',
    startDate: '15 janvier 2026',
    endDate: '20 janvier 2026',
    dashboardUrl: 'https://smartplanning.fr/dashboard/conges',
  }

  // ==========================================================================
  // Rendu HTML
  // ==========================================================================

  describe('Rendu HTML', () => {
    it('devrait générer un HTML valide', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('<!DOCTYPE html')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('devrait contenir le prénom dans la salutation', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('Bonjour')
      expect(html).toContain('Marie')
    })

    it('devrait contenir le message de félicitations', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('Bonne nouvelle')
      expect(html).toContain('approuvée')
    })

    it('devrait contenir le type de congé', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('Congés payés')
    })

    it('devrait contenir les dates de début et fin', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('15 janvier 2026')
      expect(html).toContain('20 janvier 2026')
    })

    it('devrait contenir le bouton CTA vers le dashboard', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('Voir mes congés')
      expect(html).toContain('https://smartplanning.fr/dashboard/conges')
    })

    it('devrait contenir le texte de preview personnalisé', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('Bonne nouvelle Marie')
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
        firstName: 'Paul',
      }

      const html = await render(LeaveApprovedEmail(customProps))

      expect(html).toContain('Bonjour')
      expect(html).toContain('Paul')
    })

    it('devrait gérer un type de congé RTT', async () => {
      const customProps = {
        ...defaultProps,
        leaveType: 'RTT',
      }

      const html = await render(LeaveApprovedEmail(customProps))

      expect(html).toContain('RTT')
    })

    it('devrait gérer un type de congé maladie', async () => {
      const customProps = {
        ...defaultProps,
        leaveType: 'Arrêt maladie',
      }

      const html = await render(LeaveApprovedEmail(customProps))

      expect(html).toContain('Arrêt maladie')
    })

    it('devrait gérer des dates différentes', async () => {
      const customProps = {
        ...defaultProps,
        startDate: '1 mars 2026',
        endDate: '5 mars 2026',
      }

      const html = await render(LeaveApprovedEmail(customProps))

      expect(html).toContain('1 mars 2026')
      expect(html).toContain('5 mars 2026')
    })

    it('devrait gérer une URL de dashboard différente', async () => {
      const customProps = {
        ...defaultProps,
        dashboardUrl: 'https://app.smartplanning.fr/conges',
      }

      const html = await render(LeaveApprovedEmail(customProps))

      expect(html).toContain('https://app.smartplanning.fr/conges')
    })
  })

  // ==========================================================================
  // Structure et accessibilité
  // ==========================================================================

  describe('Structure et accessibilité', () => {
    it('devrait avoir l\'attribut lang="fr"', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('lang="fr"')
    })

    it('devrait contenir le logo SmartPlanning', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('alt="SmartPlanning"')
    })

    it('devrait contenir la signature de l\'équipe', async () => {
      const html = await render(LeaveApprovedEmail(defaultProps))

      expect(html).toContain('SmartPlanning')
    })
  })

  // ==========================================================================
  // Rendu texte brut
  // ==========================================================================

  describe('Rendu texte brut', () => {
    it('devrait pouvoir générer une version texte', async () => {
      const text = await render(LeaveApprovedEmail(defaultProps), {
        plainText: true,
      })

      expect(text).toContain('Marie')
      expect(text).toContain('Congés payés')
      expect(text).toContain('15 janvier 2026')
    })
  })
})
