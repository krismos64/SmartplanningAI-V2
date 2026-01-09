/**
 * Tests unitaires pour EmptyEmployees
 *
 * Teste le composant Empty State pour la liste des employés :
 * - Affichage du message vide
 * - Bouton de création conditionnel
 * - Props canCreate
 *
 * @ticket SP-154
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyEmployees } from '@/components/empty-states'

describe('EmptyEmployees', () => {
  describe('affichage par défaut', () => {
    it('devrait afficher le titre "Aucun employé"', () => {
      render(<EmptyEmployees />)
      expect(screen.getByText('Aucun employé')).toBeInTheDocument()
    })

    it('devrait afficher une description encourageant la création', () => {
      render(<EmptyEmployees />)
      expect(
        screen.getByText(/Votre entreprise ne compte encore aucun collaborateur/i)
      ).toBeInTheDocument()
    })

    it('devrait afficher le bouton de création par défaut', () => {
      render(<EmptyEmployees />)
      const createButton = screen.getByRole('link', {
        name: /Ajouter un employé/i,
      })
      expect(createButton).toBeInTheDocument()
      expect(createButton).toHaveAttribute(
        'href',
        '/app/dashboard/employees/new'
      )
    })

    it("devrait afficher l'icône Users", () => {
      const { container } = render(<EmptyEmployees />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('avec canCreate=true', () => {
    it('devrait afficher le bouton de création', () => {
      render(<EmptyEmployees canCreate={true} />)
      expect(
        screen.getByRole('link', { name: /Ajouter un employé/i })
      ).toBeInTheDocument()
    })
  })

  describe('avec canCreate=false', () => {
    it('ne devrait PAS afficher le bouton de création', () => {
      render(<EmptyEmployees canCreate={false} />)
      expect(
        screen.queryByRole('link', { name: /Ajouter un employé/i })
      ).not.toBeInTheDocument()
    })

    it('devrait afficher une description alternative', () => {
      render(<EmptyEmployees canCreate={false} />)
      expect(
        screen.getByText(/Aucun employé n'a été trouvé/i)
      ).toBeInTheDocument()
    })
  })
})
