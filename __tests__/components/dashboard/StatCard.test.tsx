/**
 * Tests unitaires pour le composant StatCard
 *
 * @ticket SP-142
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'

describe('StatCard', () => {
  describe('Rendu de base', () => {
    it('affiche le titre', () => {
      render(<StatCard title="Utilisateurs" value={1234} />)
      expect(screen.getByText('Utilisateurs')).toBeInTheDocument()
    })

    it('affiche la valeur numerique', () => {
      render(<StatCard title="Utilisateurs" value={1234} />)
      expect(screen.getByText('1234')).toBeInTheDocument()
    })

    it('affiche la valeur string', () => {
      render(<StatCard title="Revenus" value="12 345 €" />)
      expect(screen.getByText('12 345 €')).toBeInTheDocument()
    })

    it('affiche la valeur avec unite', () => {
      render(<StatCard title="Taux" value={95} unit="%" />)
      expect(screen.getByText('95%')).toBeInTheDocument()
    })
  })

  describe('Icone', () => {
    it('affiche l icone si fournie', () => {
      const { container } = render(
        <StatCard title="Utilisateurs" value={100} icon={Users} />
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('n affiche pas d icone si non fournie', () => {
      const { container } = render(
        <StatCard title="Utilisateurs" value={100} />
      )
      const iconWrapper = container.querySelector('.rounded-md.bg-primary\\/10')
      expect(iconWrapper).not.toBeInTheDocument()
    })

    it('l icone a aria-hidden pour accessibilite', () => {
      const { container } = render(
        <StatCard title="Utilisateurs" value={100} icon={Users} />
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Tendance', () => {
    it('affiche l indicateur de tendance', () => {
      render(
        <StatCard
          title="Utilisateurs"
          value={100}
          trend={{ value: 12.5, direction: 'up' }}
        />
      )
      expect(screen.getByText(/\+12,5\s*%/)).toBeInTheDocument()
    })

    it('affiche le label de tendance', () => {
      render(
        <StatCard
          title="Utilisateurs"
          value={100}
          trend={{ value: 12.5, direction: 'up', label: 'vs mois dernier' }}
        />
      )
      expect(screen.getByText('vs mois dernier')).toBeInTheDocument()
    })

    it('affiche tendance negative', () => {
      render(
        <StatCard
          title="Utilisateurs"
          value={100}
          trend={{ value: -5, direction: 'down' }}
        />
      )
      expect(screen.getByText(/-5,0\s*%/)).toBeInTheDocument()
    })
  })

  describe('Description', () => {
    it('affiche la description sans tendance', () => {
      render(
        <StatCard
          title="Utilisateurs"
          value={100}
          description="Utilisateurs actifs"
        />
      )
      expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument()
    })

    it('affiche la description avec tendance', () => {
      render(
        <StatCard
          title="Utilisateurs"
          value={100}
          description="Utilisateurs actifs"
          trend={{ value: 10, direction: 'up' }}
        />
      )
      expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument()
      expect(screen.getByText(/\+10,0\s*%/)).toBeInTheDocument()
    })
  })

  describe('Etat de chargement', () => {
    it('affiche les skeletons en chargement', () => {
      const { container } = render(
        <StatCard title="Utilisateurs" value={100} isLoading />
      )
      const skeletons = container.querySelectorAll('[data-testid="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('ne affiche pas le titre en chargement', () => {
      render(<StatCard title="Utilisateurs" value={100} isLoading />)
      expect(screen.queryByText('Utilisateurs')).not.toBeInTheDocument()
    })

    it('ne affiche pas la valeur en chargement', () => {
      render(<StatCard title="Utilisateurs" value={100} isLoading />)
      expect(screen.queryByText('100')).not.toBeInTheDocument()
    })

    it('ne affiche pas l icone en chargement', () => {
      const { container } = render(
        <StatCard title="Utilisateurs" value={100} icon={Users} isLoading />
      )
      // Chercher les SVG qui ne sont pas des skeletons
      const svgs = container.querySelectorAll('svg.lucide-users')
      expect(svgs.length).toBe(0)
    })
  })

  describe('Classes CSS personnalisees', () => {
    it('accepte des classes additionnelles', () => {
      const { container } = render(
        <StatCard title="Test" value={100} className="custom-class" />
      )
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('custom-class')
    })

    it('applique les classes meme en chargement', () => {
      const { container } = render(
        <StatCard title="Test" value={100} className="custom-class" isLoading />
      )
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('custom-class')
    })
  })

  describe('Cas limites', () => {
    it('gere une valeur zero', () => {
      render(<StatCard title="Utilisateurs" value={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('gere une valeur negative', () => {
      render(<StatCard title="Balance" value={-500} />)
      expect(screen.getByText('-500')).toBeInTheDocument()
    })

    it('gere une valeur vide', () => {
      render(<StatCard title="Status" value="" />)
      const content = screen.getByText('Status').closest('[class*="card"]')
      expect(content).toBeInTheDocument()
    })

    it('gere un titre long', () => {
      const longTitle =
        'Ceci est un titre tres long pour tester le comportement'
      render(<StatCard title={longTitle} value={100} />)
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })
  })
})
