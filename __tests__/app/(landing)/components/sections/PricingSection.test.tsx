/**
 * Tests unitaires pour la PricingSection de la landing page
 *
 * @ticket SP-358
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PricingSection } from '@/app/(landing)/components/sections/PricingSection'

// Mock IntersectionObserver (requis par Framer Motion whileInView)
const mockIntersectionObserver = vi.fn()

beforeEach(() => {
  mockIntersectionObserver.mockImplementation(
    (_callback: IntersectionObserverCallback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: vi.fn().mockReturnValue([]),
    })
  )

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockIntersectionObserver,
  })
})

describe('PricingSection', () => {
  describe('Structure de la section', () => {
    it('rend une section avec id="pricing"', () => {
      const { container } = render(<PricingSection />)
      const section = container.querySelector('section#pricing')
      expect(section).toBeInTheDocument()
    })

    it('affiche le titre "Un tarif simple et transparent"', () => {
      render(<PricingSection />)
      expect(screen.getByText(/un tarif simple et/i)).toBeInTheDocument()
      expect(screen.getByText('transparent')).toBeInTheDocument()
    })

    it('affiche la description avec le prix 2,90', () => {
      render(<PricingSection />)
      expect(screen.getAllByText(/2,90/).length).toBeGreaterThanOrEqual(1)
    })

    it('affiche le badge "Tarification"', () => {
      render(<PricingSection />)
      expect(screen.getByText('Tarification')).toBeInTheDocument()
    })
  })

  describe('Composants pricing', () => {
    it('affiche le simulateur (titre "Simulez votre tarif")', () => {
      render(<PricingSection />)
      expect(screen.getByText('Simulez votre tarif')).toBeInTheDocument()
    })

    it('affiche le slider du simulateur', () => {
      render(<PricingSection />)
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    it('affiche la PricingCard avec les features', () => {
      render(<PricingSection />)
      expect(screen.getByText(/plannings drag/i)).toBeInTheDocument()
    })

    it('affiche le CTA vers /register', () => {
      render(<PricingSection />)
      const cta = screen.getByRole('link', {
        name: /essai gratuit/i,
      })
      expect(cta).toHaveAttribute('href', '/register')
    })
  })

  describe('Lien vers page pricing', () => {
    it('affiche le lien "Voir le detail des tarifs"', () => {
      render(<PricingSection />)
      const link = screen.getByRole('link', {
        name: /voir le d.tail des tarifs/i,
      })
      expect(link).toBeInTheDocument()
    })

    it('le lien pointe vers /pricing', () => {
      render(<PricingSection />)
      const link = screen.getByRole('link', {
        name: /voir le d.tail des tarifs/i,
      })
      expect(link).toHaveAttribute('href', '/tarifs')
    })
  })

  describe('Layout responsive', () => {
    it('a une grille 2 colonnes pour desktop (lg:grid-cols-2)', () => {
      const { container } = render(<PricingSection />)
      const grid = container.querySelector('[class*="lg:grid-cols-2"]')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Absence des anciens plans', () => {
    it('ne contient pas "Starter"', () => {
      render(<PricingSection />)
      expect(screen.queryByText('Starter')).not.toBeInTheDocument()
    })

    it('ne contient pas "Enterprise"', () => {
      render(<PricingSection />)
      expect(screen.queryByText('Enterprise')).not.toBeInTheDocument()
    })

    it('ne contient pas "Le plus populaire"', () => {
      render(<PricingSection />)
      expect(screen.queryByText('Le plus populaire')).not.toBeInTheDocument()
    })
  })
})
