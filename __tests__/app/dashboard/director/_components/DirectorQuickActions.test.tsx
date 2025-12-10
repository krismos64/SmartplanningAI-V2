/**
 * Tests unitaires pour DirectorQuickActions
 *
 * Teste le composant d'actions rapides avec :
 * - Affichage des 4 boutons
 * - Liens corrects
 * - Badge compteur
 * - Message informatif
 *
 * @ticket SP-147
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DirectorQuickActions } from '@/app/(dashboard)/dashboard/director/_components/DirectorQuickActions'

describe('DirectorQuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Affichage des boutons
  // ==========================================================================

  describe('affichage des boutons', () => {
    it('devrait afficher les 4 boutons d action', () => {
      render(<DirectorQuickActions />)

      expect(screen.getByRole('link', { name: /Gerer les equipes/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Tous les employes/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Conges en attente/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Parametres/ })).toBeInTheDocument()
    })

    it('devrait afficher le titre', () => {
      render(<DirectorQuickActions />)

      expect(screen.getByText('Actions rapides')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Liens corrects
  // ==========================================================================

  describe('liens corrects', () => {
    it('devrait avoir le bon lien pour gerer les equipes', () => {
      render(<DirectorQuickActions />)

      const link = screen.getByRole('link', { name: /Gerer les equipes/ })
      expect(link).toHaveAttribute('href', '/teams')
    })

    it('devrait avoir le bon lien pour tous les employes', () => {
      render(<DirectorQuickActions />)

      const link = screen.getByRole('link', { name: /Tous les employes/ })
      expect(link).toHaveAttribute('href', '/employees')
    })

    it('devrait avoir le bon lien pour conges en attente', () => {
      render(<DirectorQuickActions />)

      const link = screen.getByRole('link', { name: /Conges en attente/ })
      expect(link).toHaveAttribute('href', '/leaves/pending')
    })

    it('devrait avoir le bon lien pour parametres', () => {
      render(<DirectorQuickActions />)

      const link = screen.getByRole('link', { name: /Parametres/ })
      expect(link).toHaveAttribute('href', '/settings/company')
    })
  })

  // ==========================================================================
  // Badge compteur
  // ==========================================================================

  describe('badge compteur', () => {
    it('devrait afficher le badge si des conges en attente', () => {
      render(<DirectorQuickActions pendingLeaves={5} />)

      // Le chiffre apparait dans le badge ET dans le message
      expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1)
    })

    it('devrait afficher 9+ si plus de 9 conges', () => {
      render(<DirectorQuickActions pendingLeaves={15} />)

      expect(screen.getByText('9+')).toBeInTheDocument()
    })

    it('ne devrait pas afficher de badge si 0 conges', () => {
      const { container } = render(<DirectorQuickActions pendingLeaves={0} />)

      // Pas de badge avec la classe bg-orange-500
      const badges = container.querySelectorAll('.bg-orange-500')
      expect(badges.length).toBe(0)
    })

    it('ne devrait pas afficher de badge sans props', () => {
      const { container } = render(<DirectorQuickActions />)

      // Pas de badge avec la classe bg-orange-500
      const badges = container.querySelectorAll('.bg-orange-500')
      expect(badges.length).toBe(0)
    })
  })

  // ==========================================================================
  // Message informatif
  // ==========================================================================

  describe('message informatif', () => {
    it('devrait afficher le message si conges en attente (singulier)', () => {
      const { container } = render(<DirectorQuickActions pendingLeaves={1} />)

      expect(container.textContent).toContain('demande de conges en attente de validation')
    })

    it('devrait afficher le message si conges en attente (pluriel)', () => {
      const { container } = render(<DirectorQuickActions pendingLeaves={5} />)

      expect(container.textContent).toContain('demandes de conges en attente de validation')
    })

    it('ne devrait pas afficher le message si 0 conges', () => {
      const { container } = render(<DirectorQuickActions pendingLeaves={0} />)

      expect(container.textContent).not.toContain('en attente de validation')
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <DirectorQuickActions className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('devrait avoir pendingLeaves par defaut a 0', () => {
      const { container } = render(<DirectorQuickActions />)

      // Pas de badge ni de message
      expect(container.textContent).not.toContain('en attente de validation')
    })
  })
})
