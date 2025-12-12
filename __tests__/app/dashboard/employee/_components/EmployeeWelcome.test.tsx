/**
 * Tests unitaires pour EmployeeWelcome
 *
 * Teste le composant de bienvenue avec :
 * - Affichage du nom utilisateur
 * - Message contextuel selon l'heure
 * - Prochain shift (present ou absent)
 *
 * @ticket SP-145
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmployeeWelcome } from '@/app/(dashboard)/dashboard/employee/_components/EmployeeWelcome'

describe('EmployeeWelcome', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it("devrait afficher le nom de l'utilisateur", () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      render(<EmployeeWelcome userName="Jean" nextShift={null} />)

      expect(screen.getByText(/Jean/)).toBeInTheDocument()
    })

    it('devrait afficher la date du jour', () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      render(<EmployeeWelcome userName="Jean" nextShift={null} />)

      // La date devrait contenir "15" et "juin"
      expect(screen.getByText(/15/)).toBeInTheDocument()
      expect(screen.getByText(/juin/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Messages de salutation
  // ==========================================================================

  describe('messages de salutation', () => {
    it('devrait afficher "Bonjour" le matin (5h-12h)', () => {
      vi.setSystemTime(new Date('2025-06-15T09:00:00'))

      render(<EmployeeWelcome userName="Jean" nextShift={null} />)

      expect(screen.getByText(/Bonjour/)).toBeInTheDocument()
    })

    it('devrait afficher "Bon apres-midi" l\'apres-midi (12h-18h)', () => {
      vi.setSystemTime(new Date('2025-06-15T14:00:00'))

      render(<EmployeeWelcome userName="Jean" nextShift={null} />)

      expect(screen.getByText(/Bon apres-midi/)).toBeInTheDocument()
    })

    it('devrait afficher "Bonsoir" le soir (18h-5h)', () => {
      vi.setSystemTime(new Date('2025-06-15T20:00:00'))

      render(<EmployeeWelcome userName="Jean" nextShift={null} />)

      expect(screen.getByText(/Bonsoir/)).toBeInTheDocument()
    })

    it('devrait afficher "Bonsoir" la nuit (apres minuit)', () => {
      vi.setSystemTime(new Date('2025-06-15T02:00:00'))

      render(<EmployeeWelcome userName="Jean" nextShift={null} />)

      expect(screen.getByText(/Bonsoir/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Prochain shift
  // ==========================================================================

  describe('prochain shift', () => {
    it('devrait afficher le prochain shift quand present', () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      const nextShift = {
        date: new Date('2025-06-16T00:00:00'),
        startTime: '09:00',
        endTime: '17:00',
      }

      render(<EmployeeWelcome userName="Jean" nextShift={nextShift} />)

      expect(screen.getByText(/Prochain shift/)).toBeInTheDocument()
      expect(screen.getByText(/09:00/)).toBeInTheDocument()
      expect(screen.getByText(/17:00/)).toBeInTheDocument()
    })

    it('devrait afficher "Aujourd\'hui" si le shift est aujourd\'hui', () => {
      vi.setSystemTime(new Date('2025-06-15T08:00:00'))

      const nextShift = {
        date: new Date('2025-06-15T00:00:00'),
        startTime: '09:00',
        endTime: '17:00',
      }

      render(<EmployeeWelcome userName="Jean" nextShift={nextShift} />)

      expect(screen.getByText(/Aujourd'hui/)).toBeInTheDocument()
    })

    it('devrait afficher "Demain" si le shift est demain', () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      const nextShift = {
        date: new Date('2025-06-16T00:00:00'),
        startTime: '09:00',
        endTime: '17:00',
      }

      render(<EmployeeWelcome userName="Jean" nextShift={nextShift} />)

      expect(screen.getByText(/Demain/)).toBeInTheDocument()
    })

    it('devrait afficher la date formatee si le shift est plus tard', () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      const nextShift = {
        date: new Date('2025-06-20T00:00:00'),
        startTime: '09:00',
        endTime: '17:00',
      }

      render(<EmployeeWelcome userName="Jean" nextShift={nextShift} />)

      // Utiliser getAllByText car le jour 20 peut apparaitre a plusieurs endroits
      const elements = screen.getAllByText(/20/)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('devrait afficher "Aucun shift programme" si pas de prochain shift', () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      render(<EmployeeWelcome userName="Jean" nextShift={null} />)

      expect(screen.getByText(/Aucun shift programme/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Classes CSS
  // ==========================================================================

  describe('classes CSS', () => {
    it('devrait accepter une className personnalisee', () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      const { container } = render(
        <EmployeeWelcome
          userName="Jean"
          nextShift={null}
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
    it('devrait gerer un nom vide', () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      render(<EmployeeWelcome userName="" nextShift={null} />)

      expect(screen.getByText(/Bonjour, !/)).toBeInTheDocument()
    })

    it('devrait gerer un nom avec caracteres speciaux', () => {
      vi.setSystemTime(new Date('2025-06-15T10:00:00'))

      render(<EmployeeWelcome userName="Jean-Pierre" nextShift={null} />)

      expect(screen.getByText(/Jean-Pierre/)).toBeInTheDocument()
    })
  })
})
