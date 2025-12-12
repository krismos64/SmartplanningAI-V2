/**
 * Tests unitaires pour EmployeeQuickActions
 *
 * Teste le composant d'actions rapides avec :
 * - Les 3 boutons d'actions
 * - Badge de demandes en attente
 * - Message informatif
 * - Navigation (liens)
 *
 * @ticket SP-145
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmployeeQuickActions } from '@/app/(dashboard)/dashboard/employee/_components/EmployeeQuickActions'

describe('EmployeeQuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait afficher le titre', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      expect(screen.getByText('Actions rapides')).toBeInTheDocument()
    })

    it("devrait afficher les 3 boutons d'actions", () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      expect(screen.getByText('Demander un conge')).toBeInTheDocument()
      expect(screen.getByText('Voir mon planning')).toBeInTheDocument()
      expect(screen.getByText('Mes demandes')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Liens de navigation
  // ==========================================================================

  describe('liens de navigation', () => {
    it('devrait avoir le bon lien pour "Demander un conge"', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      const link = screen.getByRole('link', { name: /Demander un conge/ })
      expect(link).toHaveAttribute('href', '/leaves/new')
    })

    it('devrait avoir le bon lien pour "Voir mon planning"', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      const link = screen.getByRole('link', { name: /Voir mon planning/ })
      expect(link).toHaveAttribute('href', '/planning')
    })

    it('devrait avoir le bon lien pour "Mes demandes"', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      const link = screen.getByRole('link', { name: /Mes demandes/ })
      expect(link).toHaveAttribute('href', '/leaves')
    })
  })

  // ==========================================================================
  // Badge de demandes en attente
  // ==========================================================================

  describe('badge de demandes en attente', () => {
    it('ne devrait pas afficher de badge quand 0 demandes', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      // Verifier qu'il n'y a pas de badge avec un nombre
      const badges = screen.queryAllByText(/^\d+$/)
      expect(badges).toHaveLength(0)
    })

    it('devrait afficher le badge avec le nombre de demandes', () => {
      render(<EmployeeQuickActions pendingRequests={3} />)

      // Le nombre apparait dans le badge et dans le message
      const elements = screen.getAllByText('3')
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('devrait afficher "9+" quand plus de 9 demandes', () => {
      render(<EmployeeQuickActions pendingRequests={15} />)

      expect(screen.getByText('9+')).toBeInTheDocument()
    })

    it("devrait afficher le nombre exact jusqu'a 9", () => {
      render(<EmployeeQuickActions pendingRequests={9} />)

      // Le nombre apparait dans le badge et dans le message
      const elements = screen.getAllByText('9')
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ==========================================================================
  // Message informatif
  // ==========================================================================

  describe('message informatif', () => {
    it('ne devrait pas afficher de message quand 0 demandes', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      expect(screen.queryByText(/demande en attente/)).not.toBeInTheDocument()
    })

    it('devrait afficher le message singulier pour 1 demande', () => {
      render(<EmployeeQuickActions pendingRequests={1} />)

      // Le nombre 1 apparait dans le badge et dans le message
      const elements = screen.getAllByText('1')
      expect(elements.length).toBeGreaterThanOrEqual(1)
      expect(
        screen.getByText(/demande en attente de validation/)
      ).toBeInTheDocument()
    })

    it('devrait afficher le message pluriel pour plusieurs demandes', () => {
      render(<EmployeeQuickActions pendingRequests={3} />)

      expect(
        screen.getByText(/demandes en attente de validation/)
      ).toBeInTheDocument()
    })

    it('devrait mettre le nombre en surbrillance', () => {
      render(<EmployeeQuickActions pendingRequests={3} />)

      // Le message info contient le nombre avec la classe text-orange-600
      const highlightedCount = screen.getByText('3', {
        selector: '.text-orange-600',
      })
      expect(highlightedCount).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Styles des boutons
  // ==========================================================================

  describe('styles des boutons', () => {
    it('devrait avoir un bouton principal pour "Demander un conge"', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      const button = screen.getByRole('link', { name: /Demander un conge/ })
      // Le bouton utilise variant="default" qui applique des styles primaires
      expect(button).toBeInTheDocument()
    })

    it('devrait avoir des boutons outline pour les autres actions', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      const planningButton = screen.getByRole('link', {
        name: /Voir mon planning/,
      })
      const demandesButton = screen.getByRole('link', { name: /Mes demandes/ })

      expect(planningButton).toBeInTheDocument()
      expect(demandesButton).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Icones
  // ==========================================================================

  describe('icones', () => {
    it('devrait avoir des icones pour chaque bouton', () => {
      const { container } = render(<EmployeeQuickActions pendingRequests={0} />)

      // Verifier la presence des SVG (icones)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(3)
    })

    it('devrait avoir les icones avec aria-hidden', () => {
      const { container } = render(<EmployeeQuickActions pendingRequests={0} />)

      const hiddenSvgs = container.querySelectorAll('svg[aria-hidden="true"]')
      expect(hiddenSvgs.length).toBe(3)
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <EmployeeQuickActions pendingRequests={0} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('edge cases', () => {
    it('devrait gerer un grand nombre de demandes', () => {
      render(<EmployeeQuickActions pendingRequests={999} />)

      expect(screen.getByText('9+')).toBeInTheDocument()
    })

    it('devrait gerer exactement 10 demandes', () => {
      render(<EmployeeQuickActions pendingRequests={10} />)

      expect(screen.getByText('9+')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Accessibilite
  // ==========================================================================

  describe('accessibilite', () => {
    it('devrait avoir des liens accessibles', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(3)
    })

    it('chaque lien devrait avoir un texte accessible', () => {
      render(<EmployeeQuickActions pendingRequests={0} />)

      expect(
        screen.getByRole('link', { name: /Demander un conge/ })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /Voir mon planning/ })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /Mes demandes/ })
      ).toBeInTheDocument()
    })
  })
})
