/**
 * Tests unitaires pour ManagerPendingLeaves
 *
 * @ticket SP-316
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ManagerPendingLeaves } from '../_components/ManagerPendingLeaves'
import type { PendingLeaveItem } from '../_components/ManagerPendingLeaves'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockLeaves: PendingLeaveItem[] = [
  {
    id: 'leave-1',
    employeeName: 'Jean Dupont',
    startDate: new Date('2026-02-15'),
    endDate: new Date('2026-02-17'),
    type: 'PAID_LEAVE',
  },
  {
    id: 'leave-2',
    employeeName: 'Marie Martin',
    startDate: new Date('2026-02-20'),
    endDate: new Date('2026-02-20'),
    type: 'RTT',
  },
]

describe('ManagerPendingLeaves', () => {
  it('affiche le titre "Conges a valider"', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    expect(screen.getByText('Congés à valider')).toBeInTheDocument()
  })

  it('affiche le nombre de demandes en attente', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    expect(screen.getByText('2 demandes en attente')).toBeInTheDocument()
  })

  it('affiche le badge avec le nombre', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    // Badge avec le chiffre 2
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('affiche les noms des employes', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('Marie Martin')).toBeInTheDocument()
  })

  it('affiche les types de conges', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    expect(screen.getByText('CP')).toBeInTheDocument()
    expect(screen.getByText('RTT')).toBeInTheDocument()
  })

  it('affiche l etat vide si aucune demande', () => {
    render(<ManagerPendingLeaves pendingLeaves={[]} />)

    expect(
      screen.getByText('Toutes les demandes ont été traitées')
    ).toBeInTheDocument()
  })

  it('affiche "Aucune demande en attente" dans le sous-titre si vide', () => {
    render(<ManagerPendingLeaves pendingLeaves={[]} />)

    expect(screen.getByText('Aucune demande en attente')).toBeInTheDocument()
  })

  it('affiche singulier pour 1 demande', () => {
    render(<ManagerPendingLeaves pendingLeaves={[mockLeaves[0]!]} />)

    expect(screen.getByText('1 demande en attente')).toBeInTheDocument()
  })

  it('formate la periode de dates', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    // Periode du 15 au 17 fevrier (avec accent)
    expect(screen.getByText(/15 févr\. - 17 févr\./i)).toBeInTheDocument()
  })

  it('affiche date unique si meme jour', () => {
    render(<ManagerPendingLeaves pendingLeaves={[mockLeaves[1]!]} />)

    // Date unique 20 fevrier (avec accent)
    expect(screen.getByText(/20 févr\./i)).toBeInTheDocument()
  })

  it('a le data-testid manager-pending-leaves', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    expect(screen.getByTestId('manager-pending-leaves')).toBeInTheDocument()
  })

  it('affiche data-testid pour chaque demande', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    expect(screen.getByTestId('pending-leave-leave-1')).toBeInTheDocument()
    expect(screen.getByTestId('pending-leave-leave-2')).toBeInTheDocument()
  })

  it('affiche les boutons si callbacks fournis', () => {
    const onApprove = vi.fn()
    const onReject = vi.fn()

    render(
      <ManagerPendingLeaves
        pendingLeaves={mockLeaves}
        onApprove={onApprove}
        onReject={onReject}
      />
    )

    expect(screen.getAllByText('Approuver')).toHaveLength(2)
    expect(screen.getAllByText('Refuser')).toHaveLength(2)
  })

  it('n affiche pas les boutons sans callbacks', () => {
    render(<ManagerPendingLeaves pendingLeaves={mockLeaves} />)

    expect(screen.queryByText('Approuver')).not.toBeInTheDocument()
    expect(screen.queryByText('Refuser')).not.toBeInTheDocument()
  })

  it('limite a 5 demandes affichees', () => {
    const manyLeaves: PendingLeaveItem[] = Array.from(
      { length: 7 },
      (_, i) => ({
        id: `leave-${i}`,
        employeeName: `Employee ${i}`,
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-17'),
        type: 'PAID_LEAVE',
      })
    )

    render(<ManagerPendingLeaves pendingLeaves={manyLeaves} />)

    // Seulement 5 employees affiches
    expect(screen.getByText('Employee 0')).toBeInTheDocument()
    expect(screen.getByText('Employee 4')).toBeInTheDocument()
    expect(screen.queryByText('Employee 5')).not.toBeInTheDocument()
  })

  it('affiche le lien "Voir toutes les demandes" si plus de 5', () => {
    const manyLeaves: PendingLeaveItem[] = Array.from(
      { length: 7 },
      (_, i) => ({
        id: `leave-${i}`,
        employeeName: `Employee ${i}`,
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-17'),
        type: 'PAID_LEAVE',
      })
    )

    render(<ManagerPendingLeaves pendingLeaves={manyLeaves} />)

    expect(screen.getByText('Voir toutes les demandes (7)')).toBeInTheDocument()
  })

  it('gere le type SICK_LEAVE', () => {
    const sickLeave: PendingLeaveItem[] = [
      {
        id: 'leave-sick',
        employeeName: 'Bob',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-15'),
        type: 'SICK_LEAVE',
      },
    ]

    render(<ManagerPendingLeaves pendingLeaves={sickLeave} />)

    expect(screen.getByText('Maladie')).toBeInTheDocument()
  })

  it('gere un type inconnu', () => {
    const unknownType: PendingLeaveItem[] = [
      {
        id: 'leave-unknown',
        employeeName: 'Unknown',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-15'),
        type: 'UNKNOWN_TYPE',
      },
    ]

    render(<ManagerPendingLeaves pendingLeaves={unknownType} />)

    expect(screen.getByText('UNKNOWN_TYPE')).toBeInTheDocument()
  })
})
