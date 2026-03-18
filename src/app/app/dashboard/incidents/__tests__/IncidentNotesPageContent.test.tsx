/**
 * Tests unitaires pour IncidentNotesPageContent
 *
 * @ticket SP-426
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock des modules avant les imports
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'test-user', role: 'DIRECTOR', companyId: 'company-1' },
  }),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {},
}))

vi.mock('@/lib/actions/incident-notes', () => ({
  createIncidentNote: vi.fn(),
  updateIncidentNote: vi.fn(),
  deleteIncidentNote: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock use-media-query
vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: vi.fn().mockReturnValue(true), // Desktop by default
}))

import { IncidentNotesPageContent } from '../_components/IncidentNotesPageContent'

// Type local pour éviter l'import du module mocké
type MockNote = {
  id: string
  title: string
  content: string
  date: Date
  visibility: 'DIRECTOR_ONLY' | 'MANAGER_ONLY' | 'MANAGER_DIRECTOR' | 'ALL'
  subjectId: string
  authorId: string
  companyId: string
  createdAt: Date
  updatedAt: Date
  subject: {
    id: string
    firstName: string
    lastName: string
    teamId: string | null
    team: { id: string; name: string } | null
  }
  author: {
    id: string
    name: string | null
    email: string
  }
  company: {
    id: string
    name: string
  }
}

// Mock note
const mockNote: MockNote = {
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
}

describe('IncidentNotesPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre de la page', () => {
    render(<IncidentNotesPageContent initialNotes={[]} userRole="DIRECTOR" />)
    expect(screen.getByText("Notes d'incident")).toBeInTheDocument()
  })

  it('affiche la description', () => {
    render(<IncidentNotesPageContent initialNotes={[]} userRole="DIRECTOR" />)
    expect(
      screen.getByText(/Suivi comportemental avec contrôle de visibilité/)
    ).toBeInTheDocument()
  })

  it('affiche le bouton créer pour DIRECTOR', () => {
    render(<IncidentNotesPageContent initialNotes={[]} userRole="DIRECTOR" />)
    expect(screen.getByTestId('create-note-button')).toBeInTheDocument()
  })

  it('affiche le bouton créer pour MANAGER', () => {
    render(<IncidentNotesPageContent initialNotes={[]} userRole="MANAGER" />)
    expect(screen.getByTestId('create-note-button')).toBeInTheDocument()
  })

  it('masque le bouton créer pour EMPLOYEE', () => {
    render(<IncidentNotesPageContent initialNotes={[]} userRole="EMPLOYEE" />)
    expect(screen.queryByTestId('create-note-button')).not.toBeInTheDocument()
  })

  it('affiche les filtres', () => {
    render(<IncidentNotesPageContent initialNotes={[]} userRole="DIRECTOR" />)
    // Deux instances de filtres (desktop visible + mobile details) — au moins une présente
    expect(
      screen.getAllByTestId('incidents-filters').length
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByTestId('search-input').length).toBeGreaterThanOrEqual(
      1
    )
  })

  it('affiche les notes initiales', () => {
    render(
      <IncidentNotesPageContent
        initialNotes={[mockNote] as never[]}
        userRole="DIRECTOR"
      />
    )
    expect(screen.getByText('Retard répété')).toBeInTheDocument()
  })

  it("affiche l'état vide quand aucune note", () => {
    render(<IncidentNotesPageContent initialNotes={[]} userRole="DIRECTOR" />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('filtre les notes par recherche', async () => {
    const notes: MockNote[] = [
      mockNote,
      {
        ...mockNote,
        id: 'note-2',
        title: 'Absence',
        content: 'Absent sans prévenir',
      },
    ]
    render(
      <IncidentNotesPageContent
        initialNotes={notes as never[]}
        userRole="DIRECTOR"
      />
    )

    // Les deux notes sont affichées
    expect(screen.getByText('Retard répété')).toBeInTheDocument()
    expect(screen.getByText('Absence')).toBeInTheDocument()

    // Filtrer par "Retard"
    fireEvent.change(screen.getAllByTestId('search-input')[0]!, {
      target: { value: 'Retard' },
    })

    await waitFor(() => {
      expect(screen.getByText('Retard répété')).toBeInTheDocument()
      expect(screen.queryByText('Absence')).not.toBeInTheDocument()
    })
  })

  it('a le data-testid incidents-page-content', () => {
    render(<IncidentNotesPageContent initialNotes={[]} userRole="DIRECTOR" />)
    expect(screen.getByTestId('incidents-page-content')).toBeInTheDocument()
  })
})
