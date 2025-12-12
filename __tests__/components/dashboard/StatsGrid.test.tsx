/**
 * Tests unitaires pour le composant StatsGrid
 *
 * @ticket SP-142
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Users, DollarSign } from 'lucide-react'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import type { StatCardProps } from '@/types/dashboard'

const mockStats: StatCardProps[] = [
  { title: 'Utilisateurs', value: 1234 },
  { title: 'Revenus', value: '12 345 €', icon: DollarSign },
  {
    title: 'Croissance',
    value: 15,
    unit: '%',
    trend: { value: 5, direction: 'up' },
  },
  { title: 'Equipes', value: 8, icon: Users },
]

describe('StatsGrid', () => {
  describe('Rendu de base', () => {
    it('affiche toutes les cartes statistiques', () => {
      render(<StatsGrid stats={mockStats} />)
      expect(screen.getByText('Utilisateurs')).toBeInTheDocument()
      expect(screen.getByText('Revenus')).toBeInTheDocument()
      expect(screen.getByText('Croissance')).toBeInTheDocument()
      expect(screen.getByText('Equipes')).toBeInTheDocument()
    })

    it('affiche les valeurs des cartes', () => {
      render(<StatsGrid stats={mockStats} />)
      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('12 345 €')).toBeInTheDocument()
      expect(screen.getByText('15%')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('affiche les tendances', () => {
      render(<StatsGrid stats={mockStats} />)
      expect(screen.getByText(/\+5,0\s*%/)).toBeInTheDocument()
    })
  })

  describe('Colonnes', () => {
    it('applique 4 colonnes par defaut', () => {
      const { container } = render(<StatsGrid stats={mockStats} />)
      const grid = container.firstChild as HTMLElement
      expect(grid.className).toContain('lg:grid-cols-4')
    })

    it('applique 2 colonnes si specifie', () => {
      const { container } = render(<StatsGrid stats={mockStats} columns={2} />)
      const grid = container.firstChild as HTMLElement
      expect(grid.className).toContain('sm:grid-cols-2')
      expect(grid.className).not.toContain('lg:grid-cols-4')
    })

    it('applique 3 colonnes si specifie', () => {
      const { container } = render(<StatsGrid stats={mockStats} columns={3} />)
      const grid = container.firstChild as HTMLElement
      expect(grid.className).toContain('lg:grid-cols-3')
    })
  })

  describe('Empty state', () => {
    it('affiche un message quand stats est vide', () => {
      render(<StatsGrid stats={[]} />)
      expect(
        screen.getByText('Aucune statistique disponible')
      ).toBeInTheDocument()
    })

    it('affiche un message quand stats est undefined', () => {
      render(<StatsGrid stats={undefined as unknown as StatCardProps[]} />)
      expect(
        screen.getByText('Aucune statistique disponible')
      ).toBeInTheDocument()
    })

    it('a un role status pour l accessibilite', () => {
      render(<StatsGrid stats={[]} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('contient aria-label descriptif', () => {
      render(<StatsGrid stats={[]} />)
      const element = screen.getByRole('status')
      expect(element).toHaveAttribute(
        'aria-label',
        'Aucune statistique disponible'
      )
    })
  })

  describe('Loading state', () => {
    it('affiche des skeletons en chargement', () => {
      const { container } = render(<StatsGrid stats={mockStats} isLoading />)
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('affiche le nombre de skeletons correspondant aux stats', () => {
      const { container } = render(<StatsGrid stats={mockStats} isLoading />)
      // Chaque StatCard en loading a plusieurs skeletons
      const cards = container.querySelectorAll('[class*="card"]')
      expect(cards.length).toBe(4)
    })

    it('affiche columns skeletons si pas de stats', () => {
      const { container } = render(
        <StatsGrid stats={[]} columns={3} isLoading />
      )
      const cards = container.querySelectorAll('[class*="card"]')
      expect(cards.length).toBe(3)
    })

    it('ne affiche pas les vraies valeurs en chargement', () => {
      render(<StatsGrid stats={mockStats} isLoading />)
      expect(screen.queryByText('Utilisateurs')).not.toBeInTheDocument()
      expect(screen.queryByText('1234')).not.toBeInTheDocument()
    })

    it('a aria-busy en chargement', () => {
      render(<StatsGrid stats={mockStats} isLoading />)
      const grid = screen.getByRole('status')
      expect(grid).toHaveAttribute('aria-busy', 'true')
    })

    it('a aria-label pour le chargement', () => {
      render(<StatsGrid stats={mockStats} isLoading />)
      const grid = screen.getByRole('status')
      expect(grid).toHaveAttribute('aria-label', 'Chargement des statistiques')
    })
  })

  describe('Classes CSS personnalisees', () => {
    it('accepte des classes additionnelles', () => {
      const { container } = render(
        <StatsGrid stats={mockStats} className="custom-class" />
      )
      const grid = container.firstChild as HTMLElement
      expect(grid.className).toContain('custom-class')
    })

    it('applique les classes sur l empty state', () => {
      const { container } = render(
        <StatsGrid stats={[]} className="custom-class" />
      )
      const emptyState = container.firstChild as HTMLElement
      expect(emptyState.className).toContain('custom-class')
    })

    it('applique les classes en chargement', () => {
      const { container } = render(
        <StatsGrid stats={mockStats} className="custom-class" isLoading />
      )
      const grid = container.firstChild as HTMLElement
      expect(grid.className).toContain('custom-class')
    })
  })

  describe('Integration avec StatCard', () => {
    it('passe correctement les icones aux StatCard', () => {
      const { container } = render(<StatsGrid stats={mockStats} />)
      // Verifier qu'il y a des SVG (icones)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('passe correctement les tendances aux StatCard', () => {
      render(<StatsGrid stats={mockStats} />)
      // La tendance du 3eme element
      expect(
        screen.getByRole('status', { name: /Tendance/ })
      ).toBeInTheDocument()
    })
  })
})
