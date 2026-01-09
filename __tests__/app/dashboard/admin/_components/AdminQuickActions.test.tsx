/**
 * Tests unitaires pour AdminQuickActions
 *
 * Teste le composant d'actions rapides avec :
 * - Rendu des boutons
 * - Liens de navigation
 * - Badges avec compteurs
 *
 * @ticket SP-148
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminQuickActions } from '@/app/app/admin/dashboard/_components/AdminQuickActions'

describe('AdminQuickActions', () => {
  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait rendre le titre', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      expect(screen.getByText('Actions rapides')).toBeInTheDocument()
    })

    it('devrait rendre 4 boutons', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      const buttons = screen.getAllByRole('link')
      expect(buttons.length).toBe(4)
    })
  })

  // ==========================================================================
  // Bouton Nouvelle entreprise
  // ==========================================================================

  describe('bouton Nouvelle entreprise', () => {
    it('devrait rendre le bouton Nouvelle entreprise', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      expect(screen.getByText('Nouvelle entreprise')).toBeInTheDocument()
    })

    it('devrait avoir le bon lien', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      const link = screen.getByRole('link', { name: /nouvelle entreprise/i })
      expect(link).toHaveAttribute('href', '/admin/companies/new')
    })
  })

  // ==========================================================================
  // Bouton Entreprises
  // ==========================================================================

  describe('bouton Entreprises', () => {
    it('devrait rendre le bouton Entreprises', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      expect(screen.getByText('Entreprises')).toBeInTheDocument()
    })

    it('devrait avoir le bon lien', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      const link = screen.getByRole('link', { name: /entreprises/i })
      expect(link).toHaveAttribute('href', '/admin/companies')
    })

    it('devrait afficher le badge avec le nombre total', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('devrait afficher 0 entreprises', () => {
      render(<AdminQuickActions totalCompanies={0} activeSubscriptions={0} />)

      // 2 badges avec 0 (companies et subscriptions)
      expect(screen.getAllByText('0').length).toBe(2)
    })
  })

  // ==========================================================================
  // Bouton Abonnements
  // ==========================================================================

  describe('bouton Abonnements', () => {
    it('devrait rendre le bouton Abonnements', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      expect(screen.getByText('Abonnements')).toBeInTheDocument()
    })

    it('devrait avoir le bon lien', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      const link = screen.getByRole('link', { name: /abonnements/i })
      expect(link).toHaveAttribute('href', '/admin/subscriptions')
    })

    it('devrait afficher le badge avec le nombre actif', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      expect(screen.getByText('120')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Bouton Parametres
  // ==========================================================================

  describe('bouton Parametres', () => {
    it('devrait rendre le bouton Parametres', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      expect(screen.getByText('Parametres')).toBeInTheDocument()
    })

    it('devrait avoir le bon lien', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      const link = screen.getByRole('link', { name: /parametres/i })
      expect(link).toHaveAttribute('href', '/admin/settings')
    })

    it('ne devrait pas avoir de badge', () => {
      render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      // Le bouton Parametres n'a pas de badge
      const parametresLink = screen.getByRole('link', { name: /parametres/i })
      const badge = parametresLink.querySelector('.rounded-full')
      expect(badge).toBeNull()
    })
  })

  // ==========================================================================
  // Icones
  // ==========================================================================

  describe('icones', () => {
    it('devrait avoir des icones SVG dans les boutons', () => {
      const { container } = render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(4)
    })
  })

  // ==========================================================================
  // Styles badges
  // ==========================================================================

  describe('styles badges', () => {
    it('devrait avoir le badge Entreprises avec style primary', () => {
      const { container } = render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      const primaryBadge = container.querySelector('.bg-primary\\/10')
      expect(primaryBadge).toBeInTheDocument()
    })

    it('devrait avoir le badge Abonnements avec style emerald', () => {
      const { container } = render(
        <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
      )

      const emeraldBadge = container.querySelector('.bg-emerald-500\\/10')
      expect(emeraldBadge).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Classes CSS
  // ==========================================================================

  describe('classes CSS', () => {
    it('devrait appliquer les classes personnalisees', () => {
      const { container } = render(
        <AdminQuickActions
          totalCompanies={150}
          activeSubscriptions={120}
          className="custom-class"
        />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })
})
