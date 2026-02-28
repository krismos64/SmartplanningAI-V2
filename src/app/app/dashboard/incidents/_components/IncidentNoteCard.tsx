/**
 * IncidentNoteCard - Carte individuelle d'une note d'incident
 *
 * @description Affiche une note avec actions RBAC (voir, éditer, supprimer)
 * @ticket SP-426
 */

'use client'

import { memo, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, Pencil, Trash2, Calendar } from 'lucide-react'

import { useIsImpersonating } from '@/hooks'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import type { UserRole } from '@/lib/navigation/menu-items'
import type { IncidentNoteWithRelations } from '@/lib/actions/incident-notes'
import { VisibilityBadge } from './VisibilityBadge'

interface IncidentNoteCardProps {
  note: IncidentNoteWithRelations
  userRole: UserRole
  onView: (note: IncidentNoteWithRelations) => void
  onEdit: (note: IncidentNoteWithRelations) => void
  onDelete: (id: string) => void
}

function IncidentNoteCardComponent({
  note,
  userRole,
  onView,
  onEdit,
  onDelete,
}: IncidentNoteCardProps) {
  const isImpersonating = useIsImpersonating()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Permissions RBAC
  const canEdit = userRole === 'DIRECTOR' || userRole === 'MANAGER'
  const canDelete = userRole === 'DIRECTOR' || userRole === 'MANAGER'

  // Tronquer le contenu
  const truncatedContent =
    note.content.length > 120
      ? `${note.content.slice(0, 120)}...`
      : note.content

  const subjectName = `${note.subject.firstName} ${note.subject.lastName}`

  return (
    <>
      <Card
        className={cn(
          'transition-all duration-200 hover:shadow-md',
          'cursor-pointer'
        )}
        onClick={() => onView(note)}
        data-testid={`incident-note-card-${note.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base" title={note.title}>
              {note.title}
            </CardTitle>
            <VisibilityBadge visibility={note.visibility} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Content preview */}
          <p
            className="line-clamp-3 text-sm text-muted-foreground"
            data-testid={`note-content-${note.id}`}
          >
            {truncatedContent}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Avatar size="xs">
                {note.subject.user?.image && (
                  <AvatarImage src={note.subject.user.image} alt={subjectName} />
                )}
                <AvatarFallback>
                  {note.subject.firstName.charAt(0)}{note.subject.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {subjectName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {format(new Date(note.date), 'd MMM yyyy', { locale: fr })}
            </span>
          </div>

          {/* Actions */}
          <div
            className="flex justify-end gap-1 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(note)}
              aria-label="Voir la note"
              data-testid={`view-button-${note.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(note)}
                disabled={isImpersonating}
                title={
                  isImpersonating ? 'Non disponible en mode support' : undefined
                }
                aria-label="Modifier la note"
                data-testid={`edit-button-${note.id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isImpersonating}
                title={
                  isImpersonating ? 'Non disponible en mode support' : undefined
                }
                aria-label="Supprimer la note"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                data-testid={`delete-button-${note.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette note ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La note &quot;{note.title}&quot;
              sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(note.id)}
              disabled={isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const IncidentNoteCard = memo(IncidentNoteCardComponent)
