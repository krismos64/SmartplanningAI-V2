/**
 * Tests unitaires pour IncidentNotesList
 *
 * @ticket SP-426
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IncidentNotesList } from '../_components/IncidentNotesList'
import type { IncidentNoteWithRelations } from '@/lib/actions/incident-notes'

// Mock notes
const mockNotes: IncidentNoteWithRelations[] = [
  {
    id: 'note-1',
    title: 'Retard répété',
    content: "L'employé est arrivé en retard.",
    date: new Date('2026-01-15'),
    visibility: 'DIRECTOR_ONLY',
    subjectId: 'employee-1',
    authorId: 'user-1',
    companyId: 'company-1',
    createdAt: new Date('2026-01-15T10:00:00Z'),
    updatedAt: new Date('2026-01-15T10:00:00Z'),
    subject: {
      id: 'employee-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      teamId: 'team-1',
      team: { id: 'team-1', name: 'Équipe A' },
    },
    author: {
      id: 'user-1',
      name: 'Marie Martin',
      email: 'marie@example.com',
    },
    company: {
      id: 'company-1',
      name: 'Test Company',
    },
  },
  {
    id: 'note-2',
    title: 'Absence injustifiée',
    content: "L'employé était absent sans prévenir.",
    date: new Date('2026-01-16'),
    visibility: 'MANAGER_DIRECTOR',
    subjectId: 'employee-2',
    authorId: 'user-1',
    companyId: 'company-1',
    createdAt: new Date('2026-01-16T10:00:00Z'),
    updatedAt: new Date('2026-01-16T10:00:00Z'),
    subject: {
      id: 'employee-2',
      firstName: 'Pierre',
      lastName: 'Martin',
      teamId: 'team-1',
      team: { id: 'team-1', name: 'Équipe A' },
    },
    author: {
      id: 'user-1',
      name: 'Marie Martin',
      email: 'marie@example.com',
    },
    company: {
      id: 'company-1',
      name: 'Test Company',
    },
  },
]

describe('IncidentNotesList', () => {
  const defaultProps = {
    notes: mockNotes,
    userRole: 'DIRECTOR' as const,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onCreateNote: vi.fn(),
  }

  it('affiche la liste des notes', () => {
    render(<IncidentNotesList {...defaultProps} />)
    expect(screen.getByTestId('incidents-list')).toBeInTheDocument()
    expect(screen.getByText('Retard répété')).toBeInTheDocument()
    expect(screen.getByText('Absence injustifiée')).toBeInTheDocument()
  })

  it('affiche le bon nombre de cartes', () => {
    render(<IncidentNotesList {...defaultProps} />)
    expect(screen.getByTestId('incident-note-card-note-1')).toBeInTheDocument()
    expect(screen.getByTestId('incident-note-card-note-2')).toBeInTheDocument()
  })

  it("affiche l'état vide quand aucune note", () => {
    render(<IncidentNotesList {...defaultProps} notes={[]} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.queryByTestId('incidents-list')).not.toBeInTheDocument()
  })

  it("affiche l'état vide avec bouton créer pour DIRECTOR", () => {
    render(<IncidentNotesList {...defaultProps} notes={[]} />)
    expect(screen.getByTestId('empty-state-create-button')).toBeInTheDocument()
  })

  it("affiche l'état vide sans bouton créer pour EMPLOYEE", () => {
    render(
      <IncidentNotesList {...defaultProps} notes={[]} userRole="EMPLOYEE" />
    )
    expect(
      screen.queryByTestId('empty-state-create-button')
    ).not.toBeInTheDocument()
  })

  it("affiche l'état vide avec bouton créer pour MANAGER", () => {
    render(
      <IncidentNotesList {...defaultProps} notes={[]} userRole="MANAGER" />
    )
    expect(screen.getByTestId('empty-state-create-button')).toBeInTheDocument()
  })

  it('utilise une grille responsive', () => {
    render(<IncidentNotesList {...defaultProps} />)
    const list = screen.getByTestId('incidents-list')
    expect(list.className).toContain('grid')
    expect(list.className).toContain('sm:grid-cols-2')
    expect(list.className).toContain('lg:grid-cols-3')
  })
})
