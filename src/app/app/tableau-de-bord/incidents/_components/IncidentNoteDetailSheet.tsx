/**
 * IncidentNoteDetailSheet - Sheet de lecture d'une note d'incident
 *
 * @description Affiche les détails complets avec option d'édition
 * @ticket SP-426
 */

'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Pencil, UserCircle } from 'lucide-react'

import { useMediaQuery } from '@/hooks/use-media-query'
import type { UserRole } from '@/lib/navigation/menu-items'
import type { IncidentNoteWithRelations } from '@/lib/actions/incident-notes'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

import { VisibilityBadge } from './VisibilityBadge'

interface IncidentNoteDetailSheetProps {
  note: IncidentNoteWithRelations | null
  onOpenChange: (open: boolean) => void
  userRole: UserRole
  onEdit: (note: IncidentNoteWithRelations) => void
}

export function IncidentNoteDetailSheet({
  note,
  onOpenChange,
  userRole,
  onEdit,
}: IncidentNoteDetailSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const open = !!note
  const canEdit = userRole === 'DIRECTOR' || userRole === 'MANAGER'

  if (!note) return null

  const subjectName = `${note.subject.firstName} ${note.subject.lastName}`
  const authorName = note.author.name || note.author.email

  const content = (
    <div className="space-y-6" data-testid="incident-note-detail">
      {/* Header with visibility badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{note.title}</h3>
        </div>
        <VisibilityBadge visibility={note.visibility} />
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {note.subject.user?.image && (
              <AvatarImage src={note.subject.user.image} alt={subjectName} />
            )}
            <AvatarFallback>
              {note.subject.firstName.charAt(0)}
              {note.subject.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span>
            <strong>Concerné :</strong> {subjectName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span>
            <strong>Date :</strong>{' '}
            {format(new Date(note.date), 'd MMMM yyyy', { locale: fr })}
          </span>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Description de l&apos;incident
        </h4>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {note.content}
        </p>
      </div>

      <Separator />

      {/* Author info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <UserCircle className="h-4 w-4" aria-hidden="true" />
        <span>
          Créé par <strong>{authorName}</strong> le{' '}
          {format(new Date(note.createdAt), 'd MMMM yyyy à HH:mm', {
            locale: fr,
          })}
        </span>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => {
              onEdit(note)
              onOpenChange(false)
            }}
            data-testid="edit-from-detail-button"
          >
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Modifier
          </Button>
        </div>
      )}
    </div>
  )

  // Desktop: Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="sr-only">Détails de la note</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  // Mobile: Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">Détails de la note</SheetTitle>
        </SheetHeader>
        <div className="py-4">{content}</div>
      </SheetContent>
    </Sheet>
  )
}
