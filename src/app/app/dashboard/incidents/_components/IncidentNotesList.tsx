/**
 * IncidentNotesList - Grille de cartes des notes d'incident
 *
 * @description Affiche les notes en grille responsive avec état vide
 * @ticket SP-426
 */

'use client'

import type { UserRole } from '@/lib/navigation/menu-items'
import type { IncidentNoteWithRelations } from '@/lib/actions/incident-notes'
import { IncidentNoteCard } from './IncidentNoteCard'
import { IncidentNotesEmptyState } from './IncidentNotesEmptyState'

interface IncidentNotesListProps {
  notes: IncidentNoteWithRelations[]
  userRole: UserRole
  onView: (note: IncidentNoteWithRelations) => void
  onEdit: (note: IncidentNoteWithRelations) => void
  onDelete: (id: string) => void
  onCreateNote: () => void
}

export function IncidentNotesList({
  notes,
  userRole,
  onView,
  onEdit,
  onDelete,
  onCreateNote,
}: IncidentNotesListProps) {
  const canCreate = userRole === 'DIRECTOR' || userRole === 'MANAGER'

  if (notes.length === 0) {
    return (
      <IncidentNotesEmptyState
        onCreateNote={onCreateNote}
        canCreate={canCreate}
      />
    )
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="incidents-list"
    >
      {notes.map((note) => (
        <IncidentNoteCard
          key={note.id}
          note={note}
          userRole={userRole}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
