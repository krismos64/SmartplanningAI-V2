/**
 * Tests unitaires pour EmptyTeams
 *
 * Teste le composant Empty State pour la liste des équipes :
 * - Affichage du message vide
 * - Bouton de création conditionnel
 * - Props canCreate
 *
 * @ticket SP-154
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyTeams } from '@/components/empty-states'

describe('EmptyTeams', () => {
  describe('affichage par défaut', () => {
    it('devrait afficher le titre "Aucune équipe"', () => {
      render(<EmptyTeams />)
      expect(screen.getByText('Aucune équipe')).toBeInTheDocument()
    })

    it('devrait afficher une description encourageant la création', () => {
      render(<EmptyTeams />)
      expect(
        screen.getByText(/Organisez vos collaborateurs en équipes/i)
      ).toBeInTheDocument()
    })

    it('devrait afficher le bouton de création par défaut', () => {
      render(<EmptyTeams />)
      const createButton = screen.getByRole('link', {
        name: /Créer une équipe/i,
      })
      expect(createButton).toBeInTheDocument()
      expect(createButton).toHaveAttribute('href', '/app/director/teams/new')
    })

    it("devrait afficher l'icône UsersRound", () => {
      const { container } = render(<EmptyTeams />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('avec canCreate=true', () => {
    it('devrait afficher le bouton de création', () => {
      render(<EmptyTeams canCreate={true} />)
      expect(
        screen.getByRole('link', { name: /Créer une équipe/i })
      ).toBeInTheDocument()
    })
  })

  describe('avec canCreate=false', () => {
    it('ne devrait PAS afficher le bouton de création', () => {
      render(<EmptyTeams canCreate={false} />)
      expect(
        screen.queryByRole('link', { name: /Créer une équipe/i })
      ).not.toBeInTheDocument()
    })

    it('devrait afficher une description alternative', () => {
      render(<EmptyTeams canCreate={false} />)
      expect(
        screen.getByText(/Aucune équipe n'a été trouvée/i)
      ).toBeInTheDocument()
    })
  })
})
