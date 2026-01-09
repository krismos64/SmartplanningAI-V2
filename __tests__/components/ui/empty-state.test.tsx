/**
 * Tests unitaires pour le composant EmptyState générique
 *
 * Teste le composant UI réutilisable pour les états vides :
 * - Affichage de l'icône
 * - Affichage du titre et description
 * - Affichage conditionnel de l'action (lien ou bouton)
 *
 * @ticket SP-154
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from '@/components/ui/empty-state'
import { Users } from 'lucide-react'

describe('EmptyState', () => {
  describe('affichage de base', () => {
    it('devrait afficher le titre', () => {
      render(
        <EmptyState
          icon={<Users data-testid="icon" />}
          title="Titre de test"
          description="Description de test"
        />
      )
      expect(screen.getByText('Titre de test')).toBeInTheDocument()
    })

    it('devrait afficher la description', () => {
      render(
        <EmptyState
          icon={<Users data-testid="icon" />}
          title="Titre de test"
          description="Description de test"
        />
      )
      expect(screen.getByText('Description de test')).toBeInTheDocument()
    })

    it("devrait afficher l'icône fournie", () => {
      render(
        <EmptyState
          icon={<Users data-testid="test-icon" />}
          title="Titre"
          description="Description"
        />
      )
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })
  })

  describe('avec action href (lien)', () => {
    it('devrait afficher un lien avec le bon href', () => {
      render(
        <EmptyState
          icon={<Users />}
          title="Titre"
          description="Description"
          action={{
            label: 'Créer',
            href: '/create',
          }}
        />
      )
      const link = screen.getByRole('link', { name: /Créer/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/create')
    })

    it('devrait afficher le label du bouton', () => {
      render(
        <EmptyState
          icon={<Users />}
          title="Titre"
          description="Description"
          action={{
            label: 'Ajouter un élément',
            href: '/add',
          }}
        />
      )
      expect(screen.getByText('Ajouter un élément')).toBeInTheDocument()
    })
  })

  describe('avec action onClick (bouton)', () => {
    it('devrait appeler onClick au clic', () => {
      const handleClick = vi.fn()
      render(
        <EmptyState
          icon={<Users />}
          title="Titre"
          description="Description"
          action={{
            label: 'Cliquer',
            onClick: handleClick,
          }}
        />
      )
      const button = screen.getByRole('button', { name: /Cliquer/i })
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('sans action', () => {
    it("ne devrait pas afficher de bouton si action n'est pas fourni", () => {
      render(
        <EmptyState
          icon={<Users />}
          title="Titre sans action"
          description="Description sans action"
        />
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('classes CSS personnalisées', () => {
    it('devrait accepter une className personnalisée', () => {
      const { container } = render(
        <EmptyState
          icon={<Users />}
          title="Titre"
          description="Description"
          className="custom-class"
        />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
