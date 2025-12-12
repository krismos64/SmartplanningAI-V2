/**
 * Tests unitaires pour EmployeeStats
 *
 * Teste le composant de statistiques avec :
 * - Affichage des 4 StatCards
 * - Formatage des heures
 * - Indicateurs de tendance
 * - Etat de chargement
 *
 * @ticket SP-145
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmployeeStats } from '@/app/(dashboard)/dashboard/employee/_components/EmployeeStats'
import type { EmployeeStatsResult } from '@/lib/services/dashboard/types'

// Mock des donnees de test
const mockStats: EmployeeStatsResult = {
  hoursWorked: {
    current: 120.5,
    previous: 115,
    trend: 4.78,
  },
  upcomingShifts: 5,
  leaveBalance: {
    remaining: 15,
    used: 10,
    total: 25,
  },
  pendingRequests: 2,
  nextShift: {
    date: new Date('2025-06-16'),
    startTime: '09:00',
    endTime: '17:00',
  },
  weeklySchedule: [
    { day: 'Lun', hours: 8 },
    { day: 'Mar', hours: 8 },
    { day: 'Mer', hours: 7.5 },
    { day: 'Jeu', hours: 8 },
    { day: 'Ven', hours: 7 },
    { day: 'Sam', hours: 0 },
    { day: 'Dim', hours: 0 },
  ],
}

describe('EmployeeStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Rendu des StatCards
  // ==========================================================================

  describe('rendu des StatCards', () => {
    it('devrait afficher les 4 titres de statistiques', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByText('Heures travaillees')).toBeInTheDocument()
      expect(screen.getByText('Shifts a venir')).toBeInTheDocument()
      expect(screen.getByText('Solde conges')).toBeInTheDocument()
      expect(screen.getByText('Demandes en attente')).toBeInTheDocument()
    })

    it('devrait afficher les heures travaillees formatees', () => {
      render(<EmployeeStats stats={mockStats} />)

      // 120.5h = 120h30
      expect(screen.getByText('120h30')).toBeInTheDocument()
    })

    it('devrait afficher le nombre de shifts a venir', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('devrait afficher le solde de conges avec unite', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByText('15 jours')).toBeInTheDocument()
    })

    it('devrait afficher le nombre de demandes en attente', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Formatage des heures
  // ==========================================================================

  describe('formatage des heures', () => {
    it('devrait formater les heures entieres sans minutes', () => {
      const stats = {
        ...mockStats,
        hoursWorked: { current: 120, previous: 115, trend: 4.35 },
      }

      render(<EmployeeStats stats={stats} />)

      expect(screen.getByText('120h')).toBeInTheDocument()
    })

    it('devrait formater les heures avec minutes', () => {
      const stats = {
        ...mockStats,
        hoursWorked: { current: 120.75, previous: 115, trend: 5 },
      }

      render(<EmployeeStats stats={stats} />)

      expect(screen.getByText('120h45')).toBeInTheDocument()
    })

    it('devrait formater 0 heures', () => {
      const stats = {
        ...mockStats,
        hoursWorked: { current: 0, previous: 0, trend: 0 },
      }

      render(<EmployeeStats stats={stats} />)

      expect(screen.getByText('0h')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Indicateurs de tendance
  // ==========================================================================

  describe('indicateurs de tendance', () => {
    it('devrait afficher la tendance positive', () => {
      render(<EmployeeStats stats={mockStats} />)

      // La tendance devrait etre affichee (4.78% arrondi)
      expect(screen.getByText(/vs mois dernier/)).toBeInTheDocument()
    })

    it('devrait gerer une tendance nulle', () => {
      const stats = {
        ...mockStats,
        hoursWorked: { current: 100, previous: 100, trend: 0 },
      }

      render(<EmployeeStats stats={stats} />)

      expect(screen.getByText('Heures travaillees')).toBeInTheDocument()
    })

    it('devrait gerer une tendance negative', () => {
      const stats = {
        ...mockStats,
        hoursWorked: { current: 100, previous: 120, trend: -16.67 },
      }

      render(<EmployeeStats stats={stats} />)

      expect(screen.getByText('Heures travaillees')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Descriptions
  // ==========================================================================

  describe('descriptions', () => {
    it('devrait afficher la description des heures', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByText('Ce mois')).toBeInTheDocument()
    })

    it('devrait afficher les conges utilises/total', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByText('10/25 utilises')).toBeInTheDocument()
    })

    it('devrait afficher "En cours de traitement" si demandes en attente', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByText('En cours de traitement')).toBeInTheDocument()
    })

    it('devrait afficher "Aucune demande" si pas de demandes', () => {
      const stats = { ...mockStats, pendingRequests: 0 }

      render(<EmployeeStats stats={stats} />)

      expect(screen.getByText('Aucune demande')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Accessibilite
  // ==========================================================================

  describe('accessibilite', () => {
    it('devrait avoir un role region', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('devrait avoir un aria-label', () => {
      render(<EmployeeStats stats={mockStats} />)

      expect(screen.getByLabelText('Statistiques employee')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Props
  // ==========================================================================

  describe('props', () => {
    it('devrait accepter className', () => {
      const { container } = render(
        <EmployeeStats stats={mockStats} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('devrait accepter isLoading', () => {
      render(<EmployeeStats stats={mockStats} isLoading={true} />)

      // En mode loading, StatsGrid affiche des skeletons
      expect(
        screen.getByLabelText('Chargement des statistiques')
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('edge cases', () => {
    it('devrait gerer 0 shifts a venir', () => {
      const stats = { ...mockStats, upcomingShifts: 0 }

      render(<EmployeeStats stats={stats} />)

      expect(screen.getAllByText('0')).toHaveLength(1)
    })

    it('devrait gerer un solde de conges negatif', () => {
      const stats = {
        ...mockStats,
        leaveBalance: { remaining: -2, used: 27, total: 25 },
      }

      render(<EmployeeStats stats={stats} />)

      expect(screen.getByText('-2 jours')).toBeInTheDocument()
    })

    it('devrait gerer des heures decimales complexes', () => {
      const stats = {
        ...mockStats,
        hoursWorked: { current: 123.333, previous: 100, trend: 23.33 },
      }

      render(<EmployeeStats stats={stats} />)

      // 0.333 * 60 = 20 minutes
      expect(screen.getByText('123h20')).toBeInTheDocument()
    })
  })
})
