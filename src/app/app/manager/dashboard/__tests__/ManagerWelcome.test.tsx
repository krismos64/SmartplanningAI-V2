/**
 * Tests unitaires pour ManagerWelcome
 *
 * @ticket SP-316
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ManagerWelcome } from '../_components/ManagerWelcome'

describe('ManagerWelcome', () => {
  beforeEach(() => {
    // Mock la date pour avoir un resultat predictible
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-30T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('affiche le message de bienvenue avec le nom du manager', () => {
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={0}
        todayAbsences={0}
      />
    )

    // Le nom est maintenant dans un span séparé avec effet neon
    expect(screen.getByText(/Bonjour/)).toBeInTheDocument()
    expect(screen.getByText(/Marie/)).toBeInTheDocument()
  })

  it('affiche la date du jour', () => {
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={0}
        todayAbsences={0}
      />
    )

    // La date doit etre affichee en format francais
    expect(screen.getByText(/janvier 2026/)).toBeInTheDocument()
  })

  it('affiche le badge alerte si conges en attente > 0', () => {
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={3}
        todayAbsences={0}
      />
    )

    const badge = screen.getByTestId('pending-leaves-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('3 congés à valider')
  })

  it('affiche le badge singulier pour 1 conge', () => {
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={1}
        todayAbsences={0}
      />
    )

    const badge = screen.getByTestId('pending-leaves-badge')
    expect(badge).toHaveTextContent('1 congé à valider')
  })

  it('affiche le badge absences si absents > 0', () => {
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={0}
        todayAbsences={2}
      />
    )

    const badge = screen.getByTestId('absences-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent("2 absents aujourd'hui")
  })

  it('affiche les deux badges si conges et absences > 0', () => {
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={3}
        todayAbsences={2}
      />
    )

    expect(screen.getByTestId('pending-leaves-badge')).toBeInTheDocument()
    expect(screen.getByTestId('absences-badge')).toBeInTheDocument()
  })

  it('affiche le badge "Tout est en ordre" si aucune alerte', () => {
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={0}
        todayAbsences={0}
      />
    )

    const badge = screen.getByTestId('all-good-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Tout est en ordre')
  })

  it('a le data-testid manager-welcome', () => {
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={0}
        todayAbsences={0}
      />
    )

    expect(screen.getByTestId('manager-welcome')).toBeInTheDocument()
  })

  it('affiche le bon message selon l heure - matin', () => {
    vi.setSystemTime(new Date('2026-01-30T08:00:00'))
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={0}
        todayAbsences={0}
      />
    )

    expect(screen.getByText(/Bonjour/)).toBeInTheDocument()
  })

  it('affiche le bon message selon l heure - apres-midi', () => {
    vi.setSystemTime(new Date('2026-01-30T14:00:00'))
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={0}
        todayAbsences={0}
      />
    )

    expect(screen.getByText(/Bon après-midi/)).toBeInTheDocument()
  })

  it('affiche le bon message selon l heure - soir', () => {
    vi.setSystemTime(new Date('2026-01-30T20:00:00'))
    render(
      <ManagerWelcome
        userName="Marie"
        pendingLeaveRequests={0}
        todayAbsences={0}
      />
    )

    expect(screen.getByText(/Bonsoir/)).toBeInTheDocument()
  })
})
