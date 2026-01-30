/**
 * Tests unitaires pour ManagerStats
 *
 * @ticket SP-316
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mocks necessaires pour eviter les erreurs d'import NextAuth
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {},
}))

import { ManagerStats } from '../_components/ManagerStats'

// Type local pour eviter l'import du service
type ManagerStatsResult = {
  teamSize: number
  pendingLeaveRequests: number
  todayAbsences: number
  coverageRate: number
  teamHoursWorked: {
    current: number
    previous: number
    trend: number
  }
  teamPerformance: Array<{
    name: string
    hoursWorked: number
    scheduledHours: number
  }>
  leaveRequestsTrend: Array<{
    date: string
    pending: number
    approved: number
    rejected: number
  }>
}

const mockStats: ManagerStatsResult = {
  teamSize: 8,
  pendingLeaveRequests: 3,
  todayAbsences: 2,
  coverageRate: 95,
  teamHoursWorked: {
    current: 280.5,
    previous: 265,
    trend: 5.8,
  },
  teamPerformance: [
    { name: 'Alice D.', hoursWorked: 35, scheduledHours: 35 },
    { name: 'Bob M.', hoursWorked: 32, scheduledHours: 35 },
  ],
  leaveRequestsTrend: [],
}

describe('ManagerStats', () => {
  it('affiche les 4 KPIs', () => {
    render(<ManagerStats stats={mockStats} />)

    expect(screen.getByText('Membres equipe')).toBeInTheDocument()
    expect(screen.getByText('Conges a valider')).toBeInTheDocument()
    expect(screen.getByText("Absents aujourd'hui")).toBeInTheDocument()
    expect(screen.getByText('Heures equipe')).toBeInTheDocument()
  })

  it('affiche la valeur du nombre de membres', () => {
    render(<ManagerStats stats={mockStats} />)

    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('affiche le nombre de conges a valider', () => {
    render(<ManagerStats stats={mockStats} />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('affiche le nombre d absents', () => {
    render(<ManagerStats stats={mockStats} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('affiche les heures equipe formatees', () => {
    render(<ManagerStats stats={mockStats} />)

    // 280.5 heures = 280h30
    expect(screen.getByText('280h30')).toBeInTheDocument()
  })

  it('affiche la tendance positive', () => {
    render(<ManagerStats stats={mockStats} />)

    // La tendance de +5,8 % doit etre affichee (format francais avec virgule)
    expect(screen.getByText(/5,8\s*%/)).toBeInTheDocument()
  })

  it('affiche la description pour les membres', () => {
    render(<ManagerStats stats={mockStats} />)

    expect(screen.getByText('Collaborateurs actifs')).toBeInTheDocument()
  })

  it('affiche "Aucune demande" si pas de conges en attente', () => {
    const statsNoPending = {
      ...mockStats,
      pendingLeaveRequests: 0,
    }
    render(<ManagerStats stats={statsNoPending} />)

    expect(screen.getByText('Aucune demande')).toBeInTheDocument()
  })

  it('affiche "Equipe au complet" si pas d absents', () => {
    const statsNoAbsences = {
      ...mockStats,
      todayAbsences: 0,
    }
    render(<ManagerStats stats={statsNoAbsences} />)

    expect(screen.getByText('Equipe au complet')).toBeInTheDocument()
  })

  it('a le data-testid manager-stats', () => {
    render(<ManagerStats stats={mockStats} />)

    expect(screen.getByTestId('manager-stats')).toBeInTheDocument()
  })

  it('a le role region avec aria-label', () => {
    render(<ManagerStats stats={mockStats} />)

    expect(
      screen.getByRole('region', { name: 'Statistiques equipe' })
    ).toBeInTheDocument()
  })

  it('gere les heures entieres sans minutes', () => {
    const statsWholeHours = {
      ...mockStats,
      teamHoursWorked: {
        current: 280,
        previous: 265,
        trend: 5.6,
      },
    }
    render(<ManagerStats stats={statsWholeHours} />)

    expect(screen.getByText('280h')).toBeInTheDocument()
  })

  it('affiche tendance negative', () => {
    const statsNegativeTrend = {
      ...mockStats,
      teamHoursWorked: {
        current: 250,
        previous: 280,
        trend: -10.7,
      },
    }
    render(<ManagerStats stats={statsNegativeTrend} />)

    // Format francais avec virgule decimale
    expect(screen.getByText(/10,7\s*%/)).toBeInTheDocument()
  })
})
