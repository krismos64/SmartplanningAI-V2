/**
 * IncidentNotesPageContent - Composant orchestrateur pour la page incidents
 *
 * @description Gère l'état, les interactions et les formulaires modaux
 * @ticket SP-426
 */

'use client'

import { useState, useCallback, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { useIsImpersonating } from '@/hooks'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/lib/navigation/menu-items'
import type { IncidentNoteWithRelations } from '@/lib/actions/incident-notes'
import type { IncidentNoteCreateInput } from '@/lib/validations/incident-note'

import {
  createIncidentNote,
  updateIncidentNote,
  deleteIncidentNote,
} from '@/lib/actions/incident-notes'

import { IncidentNotesList } from './IncidentNotesList'
import { IncidentNoteSheet } from './IncidentNoteSheet'
import { IncidentNoteDetailSheet } from './IncidentNoteDetailSheet'
import { IncidentNotesFilters } from './IncidentNotesFilters'

interface IncidentNotesPageContentProps {
  initialNotes: IncidentNoteWithRelations[]
  userRole: UserRole
}

export type IncidentNotesFiltersState = {
  search: string
  startDate: string
  endDate: string
}

export function IncidentNotesPageContent({
  initialNotes,
  userRole,
}: IncidentNotesPageContentProps) {
  const isImpersonating = useIsImpersonating()

  // État local des notes (optimistic updates)
  const [notes, setNotes] = useState<IncidentNoteWithRelations[]>(initialNotes)

  // État des filtres
  const [filters, setFilters] = useState<IncidentNotesFiltersState>({
    search: '',
    startDate: '',
    endDate: '',
  })

  // État du formulaire modal
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingNote, setEditingNote] =
    useState<IncidentNoteWithRelations | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // État de la vue détail
  const [viewingNote, setViewingNote] =
    useState<IncidentNoteWithRelations | null>(null)

  // Transition pour les mutations
  const [isPending, startTransition] = useTransition()

  // Permissions RBAC
  const canCreate = userRole === 'DIRECTOR' || userRole === 'MANAGER'

  // ─── Filtered notes ───────────────────────────────────────────────────

  const filteredNotes = notes.filter((note) => {
    // Filter by search (title or content)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = note.title.toLowerCase().includes(searchLower)
      const matchesContent = note.content.toLowerCase().includes(searchLower)
      const matchesSubject =
        `${note.subject.firstName} ${note.subject.lastName}`
          .toLowerCase()
          .includes(searchLower)
      if (!matchesTitle && !matchesContent && !matchesSubject) {
        return false
      }
    }

    // Filter by date range
    if (filters.startDate) {
      const noteDate = new Date(note.date)
      const startDate = new Date(filters.startDate)
      if (noteDate < startDate) return false
    }

    if (filters.endDate) {
      const noteDate = new Date(note.date)
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59, 999)
      if (noteDate > endDate) return false
    }

    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────

  const handleCreateNote = useCallback(() => {
    setEditingNote(null)
    setIsFormOpen(true)
  }, [])

  const handleEditNote = useCallback((note: IncidentNoteWithRelations) => {
    setEditingNote(note)
    setIsFormOpen(true)
  }, [])

  const handleViewNote = useCallback((note: IncidentNoteWithRelations) => {
    setViewingNote(note)
  }, [])

  const handleFormSubmit = useCallback(
    async (data: IncidentNoteCreateInput) => {
      setIsSubmitting(true)

      try {
        if (editingNote) {
          // Mode édition
          const result = await updateIncidentNote(editingNote.id, data)

          if (result.success) {
            setNotes((prev) =>
              prev.map((n) => (n.id === editingNote.id ? result.data : n))
            )
            toast.success('Note modifiée')
            setIsFormOpen(false)
          } else {
            toast.error(result.error ?? 'Erreur lors de la modification')
          }
        } else {
          // Mode création
          const result = await createIncidentNote(data)

          if (result.success) {
            setNotes((prev) => [result.data, ...prev])
            toast.success('Note créée')
            setIsFormOpen(false)
          } else {
            toast.error(result.error ?? 'Erreur lors de la création')
          }
        }
      } catch {
        toast.error('Une erreur est survenue')
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingNote]
  )

  const handleDelete = useCallback((id: string) => {
    // Sauvegarder pour rollback
    let deletedNote: IncidentNoteWithRelations | undefined

    startTransition(async () => {
      // Optimistic update
      setNotes((prev) => {
        deletedNote = prev.find((n) => n.id === id)
        return prev.filter((n) => n.id !== id)
      })

      const result = await deleteIncidentNote(id)

      if (result.success) {
        toast.success('Note supprimée')
      } else {
        // Rollback
        if (deletedNote) {
          setNotes((prev) => [...prev, deletedNote!])
        }
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    })
  }, [])

  const handleFiltersChange = useCallback(
    (newFilters: Partial<IncidentNotesFiltersState>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }))
    },
    []
  )

  const handleResetFilters = useCallback(() => {
    setFilters({ search: '', startDate: '', endDate: '' })
  }, [])

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" data-testid="incidents-page-content">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Notes d&apos;incident
          </h1>
          <p className="text-muted-foreground">
            Suivi comportemental avec contrôle de visibilité
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={handleCreateNote}
            disabled={isImpersonating}
            title={
              isImpersonating ? 'Non disponible en mode support' : undefined
            }
            data-testid="create-note-button"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nouvelle note
          </Button>
        )}
      </div>

      {/* Filters */}
      <IncidentNotesFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
      />

      {/* Notes list */}
      <IncidentNotesList
        notes={filteredNotes}
        userRole={userRole}
        onView={handleViewNote}
        onEdit={handleEditNote}
        onDelete={handleDelete}
        onCreateNote={handleCreateNote}
      />

      {/* Form modal */}
      {canCreate && (
        <IncidentNoteSheet
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          note={editingNote}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Detail sheet */}
      <IncidentNoteDetailSheet
        note={viewingNote}
        onOpenChange={(open) => !open && setViewingNote(null)}
        userRole={userRole}
        onEdit={handleEditNote}
      />

      {/* Loading indicator pour transitions */}
      {isPending && (
        <div
          className="fixed bottom-4 right-4 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg"
          role="status"
          aria-live="polite"
        >
          Mise à jour...
        </div>
      )}
    </div>
  )
}
