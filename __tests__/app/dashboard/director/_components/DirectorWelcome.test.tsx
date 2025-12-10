/**
 * Tests unitaires pour DirectorWelcome
 *
 * Teste le composant de bienvenue avec :
 * - Message de salutation contextuel
 * - Affichage du nom entreprise
 * - Indicateurs de sante et alertes
 *
 * @ticket SP-147
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DirectorWelcome } from '@/app/(dashboard)/dashboard/director/_components/DirectorWelcome'

describe('DirectorWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // Message de salutation
  // ==========================================================================

  describe('message de salutation', () => {
    it('devrait afficher Bonjour le matin (9h)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 9, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={95}
        />
      )

      expect(screen.getByText('Bonjour, Marie !')).toBeInTheDocument()
    })

    it('devrait afficher Bon apres-midi a 14h', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 14, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={95}
        />
      )

      expect(screen.getByText('Bon apres-midi, Marie !')).toBeInTheDocument()
    })

    it('devrait afficher Bonsoir le soir (20h)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 20, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={95}
        />
      )

      expect(screen.getByText('Bonsoir, Marie !')).toBeInTheDocument()
    })

    it('devrait afficher le nom du directeur', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Jean-Pierre"
          companyName="Startup"
          pendingLeaves={0}
          attendanceRate={90}
        />
      )

      expect(screen.getByText('Bonjour, Jean-Pierre !')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Affichage entreprise
  // ==========================================================================

  describe('affichage entreprise', () => {
    it('devrait afficher le nom de l entreprise', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp France"
          pendingLeaves={0}
          attendanceRate={95}
        />
      )

      expect(screen.getByText('TechCorp France')).toBeInTheDocument()
    })

    it('devrait afficher Vue globale de', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={95}
        />
      )

      expect(screen.getByText(/Vue globale de/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Indicateur de sante
  // ==========================================================================

  describe('indicateur de sante', () => {
    it('devrait afficher Excellent si taux >= 90%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={92}
        />
      )

      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('devrait afficher Correct si taux entre 75% et 89%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={82}
        />
      )

      expect(screen.getByText('Correct')).toBeInTheDocument()
    })

    it('devrait afficher Attention requise si taux < 75%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={65}
        />
      )

      expect(screen.getByText('Attention requise')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Badge alertes conges
  // ==========================================================================

  describe('badge alertes conges', () => {
    it('devrait afficher Aucune alerte si 0 conges en attente', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={95}
        />
      )

      expect(screen.getByText('Aucune alerte')).toBeInTheDocument()
    })

    it('devrait afficher 1 conge en attente (singulier)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={1}
          attendanceRate={95}
        />
      )

      expect(screen.getByText('1 conge en attente')).toBeInTheDocument()
    })

    it('devrait afficher X conges en attente (pluriel)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={5}
          attendanceRate={95}
        />
      )

      expect(screen.getByText('5 conges en attente')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      const { container } = render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={95}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('edge cases', () => {
    it('devrait gerer un taux de presence de 100%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={100}
        />
      )

      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('devrait gerer un taux de presence de 0%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <DirectorWelcome
          userName="Marie"
          companyName="TechCorp"
          pendingLeaves={0}
          attendanceRate={0}
        />
      )

      expect(screen.getByText('Attention requise')).toBeInTheDocument()
    })
  })
})
