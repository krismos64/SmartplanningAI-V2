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
    <div className="space-y-4 md:space-y-6" data-testid="incidents-page-content">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Notes d&apos;incident
          </h1>
          <p className="hidden text-muted-foreground sm:block">
            Suivi comportemental avec contrôle de visibilité
          </p>
        </div>
        {canCreate && (
          <div className="hidden sm:block">
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
          </div>
        )}
      </div>

      {/* Filters — visibles desktop, repliés mobile */}
      <div className="hidden md:block">
        <IncidentNotesFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={handleResetFilters}
        />
      </div>
      <details className="md:hidden">
        <summary className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtres
        </summary>
        <div className="mt-2">
          <IncidentNotesFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
          />
        </div>
      </details>

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
          userRole={userRole}
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

      {/* FAB Nouvelle note — mobile uniquement */}
      {canCreate && !isImpersonating && (
        <Button
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg sm:hidden"
          onClick={handleCreateNote}
          aria-label="Nouvelle note d'incident"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
