/**
 * Tests unitaires pour le composant TrendIndicator
 *
 * @ticket SP-142
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendIndicator } from '@/components/dashboard/TrendIndicator'

describe('TrendIndicator', () => {
  describe('Rendu de base', () => {
    it('affiche la valeur de tendance formatee', () => {
      render(<TrendIndicator value={12.5} direction="up" />)
      expect(screen.getByText(/\+12,5\s*%/)).toBeInTheDocument()
    })

    it('affiche le label optionnel', () => {
      render(<TrendIndicator value={12.5} direction="up" label="vs mois dernier" />)
      expect(screen.getByText('vs mois dernier')).toBeInTheDocument()
    })

    it('a un role status pour l accessibilite', () => {
      render(<TrendIndicator value={12.5} direction="up" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('contient aria-label descriptif', () => {
      render(<TrendIndicator value={12.5} direction="up" label="vs mois dernier" />)
      const element = screen.getByRole('status')
      expect(element).toHaveAttribute('aria-label')
      expect(element.getAttribute('aria-label')).toContain('Tendance')
    })
  })

  describe('Direction up', () => {
    it('affiche l icone TrendingUp', () => {
      const { container } = render(<TrendIndicator value={12.5} direction="up" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('applique les styles verts', () => {
      const { container } = render(<TrendIndicator value={12.5} direction="up" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('text-emerald')
      expect(wrapper.className).toContain('bg-emerald')
    })
  })

  describe('Direction down', () => {
    it('affiche une valeur negative', () => {
      render(<TrendIndicator value={-5.3} direction="down" />)
      expect(screen.getByText(/-5,3\s*%/)).toBeInTheDocument()
    })

    it('applique les styles rouges', () => {
      const { container } = render(<TrendIndicator value={-5.3} direction="down" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('text-red')
      expect(wrapper.className).toContain('bg-red')
    })
  })

  describe('Direction neutral', () => {
    it('affiche zero', () => {
      render(<TrendIndicator value={0} direction="neutral" />)
      expect(screen.getByText(/0,0\s*%/)).toBeInTheDocument()
    })

    it('applique les styles gris', () => {
      const { container } = render(<TrendIndicator value={0} direction="neutral" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('text-gray')
      expect(wrapper.className).toContain('bg-gray')
    })
  })

  describe('Tailles', () => {
    it('applique la taille sm', () => {
      const { container } = render(<TrendIndicator value={10} direction="up" size="sm" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('text-xs')
    })

    it('applique la taille md par defaut', () => {
      const { container } = render(<TrendIndicator value={10} direction="up" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('text-sm')
    })

    it('applique la taille lg', () => {
      const { container } = render(<TrendIndicator value={10} direction="up" size="lg" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('text-base')
    })
  })

  describe('Classes CSS personnalisees', () => {
    it('accepte des classes additionnelles', () => {
      const { container } = render(
        <TrendIndicator value={10} direction="up" className="custom-class" />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-class')
    })
  })
})
