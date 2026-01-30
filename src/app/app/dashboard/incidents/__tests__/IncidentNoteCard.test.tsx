/**
 * Tests unitaires pour IncidentNoteCard
 *
 * @ticket SP-426
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IncidentNoteCard } from '../_components/IncidentNoteCard'
import type { IncidentNoteWithRelations } from '@/lib/actions/incident-notes'

// Mock note
const mockNote: IncidentNoteWithRelations = {
  id: 'note-1',
  title: 'Retard répété',
  content: "L'employé est arrivé en retard 3 fois cette semaine.",
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
}

describe('IncidentNoteCard', () => {
  const defaultProps = {
    note: mockNote,
    userRole: 'DIRECTOR' as const,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }

  it('affiche le titre de la note', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    expect(screen.getByText('Retard répété')).toBeInTheDocument()
  })

  it('affiche le contenu tronqué', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    expect(
      screen.getByText("L'employé est arrivé en retard 3 fois cette semaine.")
    ).toBeInTheDocument()
  })

  it('affiche le nom du sujet', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
  })

  it('affiche le badge de visibilité DIRECTOR_ONLY', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    expect(
      screen.getByTestId('visibility-badge-DIRECTOR_ONLY')
    ).toBeInTheDocument()
  })

  it('appelle onView au clic sur la carte', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    fireEvent.click(screen.getByTestId(`incident-note-card-${mockNote.id}`))
    expect(defaultProps.onView).toHaveBeenCalledWith(mockNote)
  })

  it('affiche le bouton modifier pour DIRECTOR', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    expect(screen.getByTestId(`edit-button-${mockNote.id}`)).toBeInTheDocument()
  })

  it('affiche le bouton supprimer pour DIRECTOR', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    expect(
      screen.getByTestId(`delete-button-${mockNote.id}`)
    ).toBeInTheDocument()
  })

  it('masque les boutons modifier/supprimer pour EMPLOYEE', () => {
    render(<IncidentNoteCard {...defaultProps} userRole="EMPLOYEE" />)
    expect(
      screen.queryByTestId(`edit-button-${mockNote.id}`)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(`delete-button-${mockNote.id}`)
    ).not.toBeInTheDocument()
  })

  it('affiche le dialog de confirmation au clic sur supprimer', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    fireEvent.click(screen.getByTestId(`delete-button-${mockNote.id}`))
    expect(screen.getByText('Supprimer cette note ?')).toBeInTheDocument()
  })

  it('appelle onDelete après confirmation de suppression', () => {
    render(<IncidentNoteCard {...defaultProps} />)
    fireEvent.click(screen.getByTestId(`delete-button-${mockNote.id}`))
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockNote.id)
  })

  it('affiche le bouton modifier pour MANAGER', () => {
    render(<IncidentNoteCard {...defaultProps} userRole="MANAGER" />)
    expect(screen.getByTestId(`edit-button-${mockNote.id}`)).toBeInTheDocument()
  })

  it('tronque le contenu long (>120 caractères)', () => {
    const longNote = {
      ...mockNote,
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    }
    render(<IncidentNoteCard {...defaultProps} note={longNote} />)
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument()
  })
})
