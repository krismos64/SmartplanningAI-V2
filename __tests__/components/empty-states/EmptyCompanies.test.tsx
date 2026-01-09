/**
 * Tests unitaires pour EmptyCompanies
 *
 * Teste le composant Empty State pour la liste des entreprises :
 * - Affichage du message vide
 * - Bouton de création conditionnel
 * - Props canCreate
 *
 * @ticket SP-154
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyCompanies } from '@/components/empty-states'

describe('EmptyCompanies', () => {
  describe('affichage par défaut', () => {
    it('devrait afficher le titre "Aucune entreprise"', () => {
      render(<EmptyCompanies />)
      expect(screen.getByText('Aucune entreprise')).toBeInTheDocument()
    })

    it('devrait afficher une description encourageant la création', () => {
      render(<EmptyCompanies />)
      expect(
        screen.getByText(/La plateforme ne compte encore aucune entreprise/i)
      ).toBeInTheDocument()
    })

    it('devrait afficher le bouton de création par défaut', () => {
      render(<EmptyCompanies />)
      const createButton = screen.getByRole('link', {
        name: /Créer une entreprise/i,
      })
      expect(createButton).toBeInTheDocument()
      expect(createButton).toHaveAttribute('href', '/app/admin/companies/new')
    })

    it("devrait afficher l'icône Building2", () => {
      const { container } = render(<EmptyCompanies />)
      // L'icône est rendue comme SVG
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('avec canCreate=true', () => {
    it('devrait afficher le bouton de création', () => {
      render(<EmptyCompanies canCreate={true} />)
      expect(
        screen.getByRole('link', { name: /Créer une entreprise/i })
      ).toBeInTheDocument()
    })
  })

  describe('avec canCreate=false', () => {
    it('ne devrait PAS afficher le bouton de création', () => {
      render(<EmptyCompanies canCreate={false} />)
      expect(
        screen.queryByRole('link', { name: /Créer une entreprise/i })
      ).not.toBeInTheDocument()
    })

    it('devrait afficher une description alternative', () => {
      render(<EmptyCompanies canCreate={false} />)
      expect(
        screen.getByText(/Aucune entreprise n'a été trouvée/i)
      ).toBeInTheDocument()
    })
  })
})
