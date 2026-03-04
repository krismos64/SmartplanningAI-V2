/**
 * IncidentNoteSheet - Sheet responsive pour création/édition
 *
 * @description Dialog (desktop) / Sheet (mobile) pour le formulaire
 * @ticket SP-426
 */

'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import type { IncidentNoteWithRelations } from '@/lib/actions/incident-notes'
import type { IncidentNoteCreateInput } from '@/lib/validations/incident-note'

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

import { IncidentNoteForm } from './IncidentNoteForm'

interface IncidentNoteSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: IncidentNoteWithRelations | null
  onSubmit: (data: IncidentNoteCreateInput) => Promise<void>
  isSubmitting: boolean
  userRole: string
}

export function IncidentNoteSheet({
  open,
  onOpenChange,
  note,
  onSubmit,
  isSubmitting,
  userRole,
}: IncidentNoteSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isEditMode = !!note

  const title = isEditMode ? 'Modifier la note' : "Nouvelle note d'incident"

  const formContent = (
    <IncidentNoteForm
      note={note}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      onCancel={() => onOpenChange(false)}
      userRole={userRole}
    />
  )

  // Desktop: Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">{formContent}</div>
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
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="py-4">{formContent}</div>
      </SheetContent>
    </Sheet>
  )
}
