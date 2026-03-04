/**
 * IncidentNoteForm - Formulaire de création/édition de note d'incident
 *
 * @description Formulaire avec sélection d'employé et visibilité RBAC
 * @ticket SP-426
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

import { z } from 'zod'
import {
  type IncidentNoteCreateInput,
  IncidentNoteVisibilitySchema,
  getVisibilityOptionsForRole,
  getDefaultVisibilityForRole,
} from '@/lib/validations/incident-note'
import { getEmployeesForSelect } from '@/lib/actions/employees'
import type { IncidentNoteWithRelations } from '@/lib/actions/incident-notes'

// Schéma interne pour le formulaire (visibility requis, pas optionnel)
const incidentNoteFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères'),
  content: z
    .string()
    .min(1, 'Le contenu est requis')
    .max(5000, 'Le contenu ne doit pas dépasser 5000 caractères'),
  date: z.coerce.date({
    errorMap: () => ({ message: "Date de l'incident invalide" }),
  }),
  visibility: IncidentNoteVisibilitySchema,
  subjectId: z.string().cuid("ID d'employé invalide"),
})

type IncidentNoteFormData = z.infer<typeof incidentNoteFormSchema>

import { useIsImpersonating } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VisibilityRadioGroup } from './VisibilityRadioGroup'

interface IncidentNoteFormProps {
  note?: IncidentNoteWithRelations | null
  onSubmit: (data: IncidentNoteCreateInput) => Promise<void>
  isSubmitting: boolean
  onCancel: () => void
  userRole: string
}

type EmployeeOption = {
  id: string
  firstName: string
  lastName: string
}

export function IncidentNoteForm({
  note,
  onSubmit,
  isSubmitting,
  onCancel,
  userRole,
}: IncidentNoteFormProps) {
  const isImpersonating = useIsImpersonating()
  const isEditMode = !!note
  const defaultVisibility = getDefaultVisibilityForRole(userRole)
  const visibilityOptions = getVisibilityOptionsForRole(userRole)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IncidentNoteFormData>({
    resolver: zodResolver(incidentNoteFormSchema),
    defaultValues: {
      title: '',
      content: '',
      date: new Date(),
      visibility: defaultVisibility,
      subjectId: '',
    },
  })

  // Load employees for select
  useEffect(() => {
    async function loadEmployees() {
      setLoadingEmployees(true)
      const result = await getEmployeesForSelect()
      if (result.success && result.data) {
        setEmployees(result.data)
      }
      setLoadingEmployees(false)
    }
    void loadEmployees()
  }, [])

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        content: note.content,
        date: new Date(note.date),
        visibility: note.visibility,
        subjectId: note.subjectId,
      })
    } else {
      reset({
        title: '',
        content: '',
        date: new Date(),
        visibility: defaultVisibility,
        subjectId: '',
      })
    }
  }, [note, reset, defaultVisibility])

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void handleFormSubmit(e)
  }

  return (
    <form
      onSubmit={onFormSubmit}
      className="space-y-4"
      data-testid="incident-note-form"
    >
      {/* Subject (Employee) */}
      <div className="space-y-2">
        <Label htmlFor="subjectId">
          Employé concerné <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="subjectId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={loadingEmployees || isEditMode}
            >
              <SelectTrigger
                id="subjectId"
                data-testid="subject-select"
                aria-invalid={errors.subjectId ? 'true' : 'false'}
              >
                <SelectValue
                  placeholder={
                    loadingEmployees
                      ? 'Chargement...'
                      : 'Sélectionner un employé'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.subjectId && (
          <p className="text-sm text-destructive" role="alert">
            {errors.subjectId.message}
          </p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Titre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Retard répété"
          {...register('title')}
          aria-invalid={errors.title ? 'true' : 'false'}
          data-testid="title-input"
        />
        {errors.title && (
          <p className="text-sm text-destructive" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          placeholder="Détails de l'incident..."
          rows={4}
          {...register('content')}
          aria-invalid={errors.content ? 'true' : 'false'}
          data-testid="content-input"
        />
        {errors.content && (
          <p className="text-sm text-destructive" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">
          Date de l&apos;incident <span className="text-destructive">*</span>
        </Label>
        <Input
          id="date"
          type="date"
          {...register('date', {
            setValueAs: (v: string) => (v ? new Date(v) : new Date()),
          })}
          defaultValue={
            note?.date
              ? format(new Date(note.date), 'yyyy-MM-dd')
              : format(new Date(), 'yyyy-MM-dd')
          }
          data-testid="date-input"
        />
        {errors.date && (
          <p className="text-sm text-destructive" role="alert">
            {errors.date.message}
          </p>
        )}
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label>Visibilité</Label>
        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <VisibilityRadioGroup
              value={field.value}
              onChange={field.onChange}
              options={visibilityOptions}
            />
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isImpersonating}
          title={isImpersonating ? 'Non disponible en mode support' : undefined}
          data-testid="submit-button"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Enregistrer' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
