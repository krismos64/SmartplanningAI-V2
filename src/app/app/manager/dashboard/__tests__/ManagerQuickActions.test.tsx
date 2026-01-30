/**
 * Tests unitaires pour ManagerQuickActions
 *
 * @ticket SP-316
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ManagerQuickActions } from '../_components/ManagerQuickActions'

describe('ManagerQuickActions', () => {
  it('affiche le titre "Actions rapides"', () => {
    render(<ManagerQuickActions />)

    expect(screen.getByText('Actions rapides')).toBeInTheDocument()
  })

  it('affiche le bouton "Voir l equipe"', () => {
    render(<ManagerQuickActions />)

    expect(screen.getByText("Voir l'equipe")).toBeInTheDocument()
  })

  it('affiche le bouton "Voir le planning"', () => {
    render(<ManagerQuickActions />)

    expect(screen.getByText('Voir le planning')).toBeInTheDocument()
  })

  it('affiche le bouton "Tous les conges"', () => {
    render(<ManagerQuickActions />)

    expect(screen.getByText('Tous les conges')).toBeInTheDocument()
  })

  it('affiche le bouton "Notes d incident"', () => {
    render(<ManagerQuickActions />)

    expect(screen.getByText("Notes d'incident")).toBeInTheDocument()
  })

  it('a les liens corrects', () => {
    render(<ManagerQuickActions />)

    // Lien equipe
    const equipeLink = screen.getByRole('link', { name: /Voir l'equipe/i })
    expect(equipeLink).toHaveAttribute('href', '/app/dashboard/employees')

    // Lien planning
    const planningLink = screen.getByRole('link', { name: /Voir le planning/i })
    expect(planningLink).toHaveAttribute('href', '/app/dashboard/schedules')

    // Lien conges
    const congesLink = screen.getByRole('link', { name: /Tous les conges/i })
    expect(congesLink).toHaveAttribute('href', '/app/dashboard/leaves')

    // Lien incidents
    const incidentsLink = screen.getByRole('link', {
      name: /Notes d'incident/i,
    })
    expect(incidentsLink).toHaveAttribute('href', '/app/dashboard/incidents')
  })

  it('affiche le badge si pendingLeaveRequests > 0', () => {
    render(<ManagerQuickActions pendingLeaveRequests={5} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('n affiche pas le badge si pendingLeaveRequests = 0', () => {
    render(<ManagerQuickActions pendingLeaveRequests={0} />)

    // Pas de badge avec un chiffre seul
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('affiche 9+ si plus de 9 demandes', () => {
    render(<ManagerQuickActions pendingLeaveRequests={15} />)

    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('a le data-testid manager-quick-actions', () => {
    render(<ManagerQuickActions />)

    expect(screen.getByTestId('manager-quick-actions')).toBeInTheDocument()
  })
})
