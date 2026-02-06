/**
 * Tests unitaires pour le composant PricingCard
 *
 * @ticket SP-355
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PricingCard } from '@/components/pricing/PricingCard'

describe('PricingCard', () => {
  describe('Rendu par défaut', () => {
    it('affiche le prix 2,90 €', () => {
      render(<PricingCard />)
      expect(screen.getByText(/2,90/)).toBeInTheDocument()
    })

    it('affiche "par employé / mois"', () => {
      render(<PricingCard />)
      expect(screen.getByText(/par employé \/ mois/)).toBeInTheDocument()
    })

    it('affiche le badge essai gratuit', () => {
      render(<PricingCard />)
      expect(
        screen.getByText(/21 jours d'essai gratuit/i)
      ).toBeInTheDocument()
    })

    it('affiche la mention sans engagement', () => {
      render(<PricingCard />)
      expect(
        screen.getByText(/sans engagement/i)
      ).toBeInTheDocument()
    })
  })

  describe('Features', () => {
    it('affiche la liste des features', () => {
      render(<PricingCard />)
      expect(screen.getByText(/plannings drag/i)).toBeInTheDocument()
      expect(screen.getByText(/congés/i)).toBeInTheDocument()
      expect(screen.getByText(/rgpd/i)).toBeInTheDocument()
    })

    it('masque les features quand showFeatures=false', () => {
      render(<PricingCard showFeatures={false} />)
      expect(screen.queryByText(/plannings drag/i)).not.toBeInTheDocument()
    })
  })

  describe('CTA', () => {
    it('affiche le bouton CTA par défaut', () => {
      render(<PricingCard />)
      const cta = screen.getByRole('link', {
        name: /démarrer l'essai gratuit/i,
      })
      expect(cta).toBeInTheDocument()
    })

    it('le CTA pointe vers /register', () => {
      render(<PricingCard />)
      const cta = screen.getByRole('link', {
        name: /démarrer l'essai gratuit/i,
      })
      expect(cta).toHaveAttribute('href', '/register')
    })

    it('masque le CTA quand showCTA=false', () => {
      render(<PricingCard showCTA={false} />)
      expect(
        screen.queryByRole('link', { name: /démarrer/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Props className', () => {
    it('applique une className personnalisée', () => {
      const { container } = render(
        <PricingCard className="my-custom-class" />
      )
      const wrapper = container.querySelector('.my-custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })
})
