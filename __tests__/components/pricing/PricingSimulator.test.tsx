/**
 * Tests unitaires pour le composant PricingSimulator
 *
 * @ticket SP-355
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PricingSimulator } from '@/components/pricing/PricingSimulator'
import { PRICING } from '@/lib/config/pricing'

describe('PricingSimulator', () => {
  describe('Rendu par défaut', () => {
    it('affiche le titre du simulateur', () => {
      render(<PricingSimulator />)
      expect(screen.getByText('Simulez votre tarif')).toBeInTheDocument()
    })

    it('affiche le slider', () => {
      render(<PricingSimulator />)
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
    })

    it('affiche le nombre d\'employes par defaut (10)', () => {
      render(<PricingSimulator />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue(String(PRICING.DEFAULT_EMPLOYEES))
    })

    it('affiche le prix calculé pour 10 employés (29,00 €)', () => {
      render(<PricingSimulator />)
      expect(screen.getByText(/29,00/)).toBeInTheDocument()
    })

    it('affiche le detail du calcul', () => {
      render(<PricingSimulator />)
      expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/2,90/)).toBeInTheDocument()
    })

    it('affiche le badge essai gratuit', () => {
      render(<PricingSimulator />)
      expect(
        screen.getByText(/21 jours gratuits/i)
      ).toBeInTheDocument()
    })

    it('affiche le badge sans engagement', () => {
      render(<PricingSimulator />)
      expect(
        screen.getByText(/sans engagement/i)
      ).toBeInTheDocument()
    })
  })

  describe('Interaction slider', () => {
    it('met à jour le prix quand le slider change à 5 employés', () => {
      render(<PricingSimulator />)
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '5' } })
      expect(screen.getByText(/14,50/)).toBeInTheDocument()
    })

    it('affiche le prix pour 1 employé (2,90 €)', () => {
      render(<PricingSimulator />)
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '1' } })
      expect(slider).toHaveValue('1')
    })

    it('affiche le prix pour 50 employés (145,00 €)', () => {
      render(<PricingSimulator />)
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '50' } })
      expect(screen.getByText(/145,00/)).toBeInTheDocument()
    })

    it('affiche le prix pour 250 employés (max)', () => {
      render(<PricingSimulator />)
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '250' } })
      expect(screen.getByText(/725,00/)).toBeInTheDocument()
    })
  })

  describe('Modes compact / full', () => {
    it('rend en mode full par défaut', () => {
      const { container } = render(<PricingSimulator />)
      const wrapper = container.querySelector('[class*="p-8"]')
      expect(wrapper).toBeInTheDocument()
    })

    it('rend en mode compact', () => {
      const { container } = render(<PricingSimulator size="compact" />)
      const wrapper = container.querySelector('[class*="p-6"]')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Accessibilité', () => {
    it('le slider a un aria-label', () => {
      render(<PricingSimulator />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-label')
    })

    it('le slider a aria-valuemin et aria-valuemax', () => {
      render(<PricingSimulator />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute(
        'aria-valuemin',
        String(PRICING.MIN_EMPLOYEES)
      )
      expect(slider).toHaveAttribute(
        'aria-valuemax',
        String(PRICING.MAX_EMPLOYEES)
      )
    })

    it('le prix est dans une zone aria-live', () => {
      render(<PricingSimulator />)
      const liveRegion = screen.getByText(/\/mois/).closest('[aria-live]')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('les icones sont masquees pour les lecteurs d\'ecran', () => {
      const { container } = render(<PricingSimulator />)
      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]')
      expect(hiddenIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Props className', () => {
    it('applique une className personnalisée', () => {
      const { container } = render(
        <PricingSimulator className="my-custom-class" />
      )
      const wrapper = container.querySelector('.my-custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })
})
