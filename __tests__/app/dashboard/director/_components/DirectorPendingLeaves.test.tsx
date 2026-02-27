/**
 * Tests unitaires pour DirectorPendingLeaves
 *
 * Teste le composant de liste des conges avec :
 * - Affichage des conges
 * - Formatage des dates
 * - Badge compteur
 * - Etat vide
 * - Bouton voir plus
 *
 * @ticket SP-147
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DirectorPendingLeaves } from '@/app/app/director/dashboard/_components/DirectorPendingLeaves'
import type { PendingLeaveItem } from '@/app/app/director/dashboard/_components/DirectorPendingLeaves'

// Mock des donnees de test
const mockPendingLeaves: PendingLeaveItem[] = [
  {
    id: '1',
    employeeName: 'Jean Dupont',
    teamName: 'Equipe A',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2025-06-20'),
    type: 'PAID_LEAVE',
  },
  {
    id: '2',
    employeeName: 'Marie Martin',
    teamName: 'Equipe B',
    startDate: new Date('2025-06-18'),
    endDate: new Date('2025-06-18'),
    type: 'RTT',
  },
  {
    id: '3',
    employeeName: 'Pierre Durand',
    teamName: 'Equipe C',
    startDate: new Date('2025-06-22'),
    endDate: new Date('2025-06-25'),
    type: 'SICK_LEAVE',
  },
]

describe('DirectorPendingLeaves', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Titre et compteur
  // ==========================================================================

  describe('titre et compteur', () => {
    it('devrait afficher le titre', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
        />
      )

      expect(screen.getByText('Conges en attente')).toBeInTheDocument()
    })

    it('devrait afficher le nombre de demandes (singulier)', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves.slice(0, 1)}
          totalPending={1}
        />
      )

      expect(screen.getByText('1 demande en attente')).toBeInTheDocument()
    })

    it('devrait afficher le nombre de demandes (pluriel)', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
        />
      )

      expect(screen.getByText('3 demandes en attente')).toBeInTheDocument()
    })

    it('devrait afficher le badge compteur', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={5}
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('devrait afficher 9+ si plus de 9 demandes', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={15}
        />
      )

      expect(screen.getByText('9+')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Affichage des conges
  // ==========================================================================

  describe('affichage des conges', () => {
    it('devrait afficher les noms des employes', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
        />
      )

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
      expect(screen.getByText('Pierre Durand')).toBeInTheDocument()
    })

    it('devrait afficher les equipes et types', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
        />
      )

      expect(screen.getByText(/Equipe A/)).toBeInTheDocument()
      expect(screen.getByText(/Conges payes/)).toBeInTheDocument()
    })

    it('devrait afficher les types de conges traduits', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
        />
      )

      expect(screen.getByText(/RTT/)).toBeInTheDocument()
      expect(screen.getByText(/Maladie/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Formatage des dates
  // ==========================================================================

  describe('formatage des dates', () => {
    it('devrait formater une periode de dates', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
        />
      )

      // 15 juin - 20 juin
      expect(screen.getByText(/15 juin/)).toBeInTheDocument()
    })

    it('devrait formater une date unique (meme jour)', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
        />
      )

      // 18 juin (meme jour debut et fin)
      expect(screen.getByText('18 juin')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Etat vide
  // ==========================================================================

  describe('etat vide', () => {
    it('devrait afficher Aucune demande en attente', () => {
      render(<DirectorPendingLeaves pendingLeaves={[]} totalPending={0} />)

      expect(screen.getByText('Aucune demande en attente')).toBeInTheDocument()
    })

    it('devrait afficher le message de succes', () => {
      render(<DirectorPendingLeaves pendingLeaves={[]} totalPending={0} />)

      expect(
        screen.getByText('Toutes les demandes ont ete traitees')
      ).toBeInTheDocument()
    })

    it('ne devrait pas afficher de badge si 0 demandes', () => {
      render(<DirectorPendingLeaves pendingLeaves={[]} totalPending={0} />)

      // Le badge avec le chiffre ne devrait pas etre present
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Bouton voir plus
  // ==========================================================================

  describe('bouton voir plus', () => {
    it('devrait afficher le bouton si plus de 5 demandes', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={10}
        />
      )

      expect(
        screen.getByRole('link', { name: /Voir toutes les demandes \(10\)/ })
      ).toBeInTheDocument()
    })

    it('ne devrait pas afficher le bouton si 5 demandes ou moins', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
        />
      )

      expect(
        screen.queryByRole('link', { name: /Voir toutes les demandes/ })
      ).not.toBeInTheDocument()
    })

    it('devrait avoir le bon lien', () => {
      render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={10}
        />
      )

      const link = screen.getByRole('link', {
        name: /Voir toutes les demandes/,
      })
      expect(link).toHaveAttribute('href', '/app/dashboard/leaves')
    })
  })

  // ==========================================================================
  // Etat de chargement
  // ==========================================================================

  describe('etat de chargement', () => {
    it('devrait afficher les skeletons en chargement', () => {
      const { container } = render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
          isLoading={true}
        />
      )

      expect(
        container.querySelectorAll('.animate-pulse').length
      ).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <DirectorPendingLeaves
          pendingLeaves={mockPendingLeaves}
          totalPending={3}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
