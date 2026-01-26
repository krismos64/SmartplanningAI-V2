/**
 * Composant AvailabilityModal - Création et édition d'indisponibilités
 *
 * @description Modal pour créer ou éditer des indisponibilités
 * @ticket SP-401
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  CalendarIcon,
  Clock,
  User,
  Loader2,
  Ban,
  Star,
  Palmtree,
  Thermometer,
  GraduationCap,
  CircleHelp,
} from 'lucide-react'
import { AvailabilityType } from '@prisma/client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import {
  availabilityTypeLabels,
  availabilityTypeColors,
} from '@/lib/validations/availability'
import {
  createAvailability,
  updateAvailability,
} from '@/lib/actions/availabilities'
import type { AvailabilityWithRelations } from '@/lib/actions/availabilities'

// ============================================================================
// Types
// ============================================================================

export interface AvailabilityModalProps {
  /** Modal ouvert */
  isOpen: boolean
  /** Callback fermeture */
  onClose: () => void
  /** Mode du modal */
  mode: 'create' | 'edit'
  /** Données existantes (mode edit) */
  availability?: AvailabilityWithRelations | null
  /** ID employé (requis pour création) */
  employeeId: string
  /** ID entreprise (requis pour création) */
  companyId: string
  /** Nom de l'employé (pour affichage) */
  employeeName?: string
  /** Callback après succès */
  onSuccess?: () => void
}

// ============================================================================
// Icônes par type
// ============================================================================

const typeIcons: Record<AvailabilityType, React.ElementType> = {
  UNAVAILABLE: Ban,
  PREFERRED: Star,
  VACATION: Palmtree,
  SICK: Thermometer,
  TRAINING: GraduationCap,
  OTHER: CircleHelp,
}

// ============================================================================
// Schema de validation formulaire
// ============================================================================

const availabilityFormSchema = z
  .object({
    startDate: z.date({ required_error: 'Date de début requise' }),
    endDate: z.date({ required_error: 'Date de fin requise' }),
    startTime: z
      .string()
      .regex(/^\d{1,2}:\d{2}$/, 'Format HH:mm requis')
      .optional()
      .nullable(),
    endTime: z
      .string()
      .regex(/^\d{1,2}:\d{2}$/, 'Format HH:mm requis')
      .optional()
      .nullable(),
    type: z.nativeEnum(AvailabilityType),
    reason: z.string().max(500).optional().nullable(),
    allDay: z.boolean(),
  })
  .refine(
    (data) => {
      return data.endDate >= data.startDate
    },
    {
      message: 'La date de fin doit être après la date de début',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // Si pas journée entière, vérifier les heures
      if (!data.allDay) {
        if (!data.startTime || !data.endTime) {
          return false
        }
        // Si même jour, vérifier que endTime > startTime
        if (
          format(data.startDate, 'yyyy-MM-dd') ===
          format(data.endDate, 'yyyy-MM-dd')
        ) {
          return data.endTime > data.startTime
        }
      }
      return true
    },
    {
      message: "L'heure de fin doit être après l'heure de début",
      path: ['endTime'],
    }
  )

type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>

// ============================================================================
// Composant principal
// ============================================================================

export function AvailabilityModal({
  isOpen,
  onClose,
  mode,
  availability,
  employeeId,
  companyId,
  employeeName,
  onSuccess,
}: AvailabilityModalProps) {
  // États locaux
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Formulaire
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      startTime: null,
      endTime: null,
      type: 'UNAVAILABLE',
      reason: '',
      allDay: true,
    },
  })

  const allDay = watch('allDay')

  // Reset du formulaire quand modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSubmitError(null)

      if (mode === 'edit' && availability) {
        const hasTime = availability.startTime && availability.endTime
        reset({
          startDate: new Date(availability.startDate),
          endDate: new Date(availability.endDate),
          startTime: availability.startTime,
          endTime: availability.endTime,
          type: availability.type,
          reason: availability.reason ?? '',
          allDay: !hasTime,
        })
      } else {
        reset({
          startDate: new Date(),
          endDate: new Date(),
          startTime: null,
          endTime: null,
          type: 'UNAVAILABLE',
          reason: '',
          allDay: true,
        })
      }
    }
  }, [isOpen, mode, availability, reset])

  // Quand allDay change, reset les heures
  useEffect(() => {
    if (allDay) {
      setValue('startTime', null)
      setValue('endTime', null)
    } else if (!watch('startTime')) {
      setValue('startTime', '09:00')
      setValue('endTime', '17:00')
    }
  }, [allDay, setValue, watch])

  // Soumettre le formulaire
  const onSubmit = async (data: AvailabilityFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (mode === 'create') {
        const result = await createAvailability({
          employeeId,
          companyId,
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.allDay ? undefined : data.startTime,
          endTime: data.allDay ? undefined : data.endTime,
          type: data.type,
          reason: data.reason || undefined,
          isRecurring: false,
        })

        if (!result.success) {
          setSubmitError(result.error ?? 'Erreur lors de la création')
          return
        }
      } else if (mode === 'edit' && availability) {
        const result = await updateAvailability({
          id: availability.id,
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.allDay ? null : data.startTime,
          endTime: data.allDay ? null : data.endTime,
          type: data.type,
          reason: data.reason || null,
        })

        if (!result.success) {
          setSubmitError(result.error ?? 'Erreur lors de la modification')
          return
        }
      }

      onSuccess?.()
      onClose()
    } catch {
      setSubmitError('Une erreur inattendue est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? 'Ajouter une indisponibilité'
              : "Modifier l'indisponibilité"}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Remplissez les informations pour ajouter une indisponibilité'
              : "Modifiez les informations de l'indisponibilité"}
          </DialogDescription>
        </DialogHeader>

        {/* Erreur de soumission */}
        {submitError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e)
          }}
          className="space-y-4"
        >
          {/* Employé (affichage) */}
          {employeeName && (
            <div className="rounded-md bg-muted p-3">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Employé
              </Label>
              <p className="mt-1 font-medium">{employeeName}</p>
            </div>
          )}

          {/* Type d'indisponibilité */}
          <div className="space-y-2">
            <Label>Type d&apos;indisponibilité</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(availabilityTypeLabels).map(
                      ([value, label]) => {
                        const TypeIcon = typeIcons[value as AvailabilityType]
                        const color =
                          availabilityTypeColors[value as AvailabilityType]
                        return (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4" style={{ color }} />
                              {label}
                            </div>
                          </SelectItem>
                        )
                      }
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Date de début */}
          <div className="space-y-2">
            <Label>Date de début</Label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(field.value, 'PPP', { locale: fr })
                        : 'Sélectionner'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date)
                        // Mettre à jour endDate si elle est avant startDate
                        const endDate = watch('endDate')
                        if (date && endDate && date > endDate) {
                          setValue('endDate', date)
                        }
                      }}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* Date de fin */}
          <div className="space-y-2">
            <Label>Date de fin</Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(field.value, 'PPP', { locale: fr })
                        : 'Sélectionner'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const startDate = watch('startDate')
                        return startDate ? date < startDate : false
                      }}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>

          {/* Journée entière */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="allDay">Journée entière</Label>
              <p className="text-sm text-muted-foreground">
                Désactivez pour spécifier des heures
              </p>
            </div>
            <Controller
              name="allDay"
              control={control}
              render={({ field }) => (
                <Switch
                  id="allDay"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Heures (si pas journée entière) */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Heure de début
                </Label>
                <Input type="time" {...register('startTime')} />
                {errors.startTime && (
                  <p className="text-sm text-destructive">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Heure de fin
                </Label>
                <Input type="time" {...register('endTime')} />
                {errors.endTime && (
                  <p className="text-sm text-destructive">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Raison (optionnelle) */}
          <div className="space-y-2">
            <Label>Raison (optionnelle)</Label>
            <Textarea
              {...register('reason')}
              placeholder="Précisez la raison si nécessaire..."
              maxLength={500}
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === 'create' ? 'Ajouter' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
