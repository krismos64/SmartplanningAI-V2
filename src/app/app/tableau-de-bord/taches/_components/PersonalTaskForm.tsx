/**
 * PersonalTaskForm - Formulaire de création/édition de tâche
 *
 * @description Modal responsive (Dialog desktop, Sheet mobile)
 * @ticket SP-419
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import type { PersonalTask } from '@prisma/client'

import { useIsImpersonating } from '@/hooks'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  personalTaskCreateSchema,
  type PersonalTaskCreateInput,
} from '@/lib/validations/personal-task'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'

interface PersonalTaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: PersonalTask | null
  onSubmit: (data: PersonalTaskCreateInput) => Promise<void>
  isSubmitting: boolean
}

export function PersonalTaskForm({
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting,
}: PersonalTaskFormProps) {
  const isImpersonating = useIsImpersonating()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isEditMode = !!task

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalTaskCreateInput>({
    resolver: zodResolver(personalTaskCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: null,
    },
  })

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description ?? '',
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        })
      } else {
        reset({
          title: '',
          description: '',
          dueDate: null,
        })
      }
    }
  }, [open, task, reset])

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void handleFormSubmit(e)
  }

  const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    void handleFormSubmit(e)
  }

  const formContent = (
    <form onSubmit={onFormSubmit} className="space-y-4" data-testid="task-form">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Titre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Préparer la réunion"
          {...register('title')}
          aria-invalid={errors.title ? 'true' : 'false'}
          data-testid="task-title-input"
        />
        {errors.title && (
          <p className="text-sm text-destructive" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Détails de la tâche (optionnel)"
          rows={3}
          {...register('description')}
          aria-invalid={errors.description ? 'true' : 'false'}
          data-testid="task-description-input"
        />
        {errors.description && (
          <p className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label htmlFor="dueDate">Date d&apos;échéance</Label>
        <Input
          id="dueDate"
          type="date"
          {...register('dueDate', {
            setValueAs: (v: string) => (v ? new Date(v) : null),
          })}
          defaultValue={
            task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
          }
          data-testid="task-duedate-input"
        />
      </div>
    </form>
  )

  const footerContent = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      >
        Annuler
      </Button>
      <Button
        type="submit"
        onClick={onButtonClick}
        disabled={isSubmitting || isImpersonating}
        title={isImpersonating ? 'Non disponible en mode support' : undefined}
        data-testid="task-submit-button"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditMode ? 'Enregistrer' : 'Créer'}
      </Button>
    </>
  )

  // Desktop: Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter>{footerContent}</DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Mobile: Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </SheetTitle>
        </SheetHeader>
        <div className="py-4">{formContent}</div>
        <SheetFooter className="flex-row gap-2">{footerContent}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
