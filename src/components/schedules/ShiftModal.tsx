/**
 * Composant ShiftModal - Création et édition de créneaux
 *
 * @description Modal pour créer ou éditer des créneaux (shifts)
 * Supporte la sélection multi-employés avec recherche et la récurrence
 * Détecte et affiche les conflits avec les indisponibilités (SP-400)
 *
 * @ticket SP-397, SP-399, SP-400
 */

'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  AlertTriangle,
  CalendarIcon,
  ChevronRight,
  Clock,
  Users,
  Search,
  X,
  Check,
  Loader2,
  Repeat,
  Trash2,
} from 'lucide-react'
import { ScheduleType, ScheduleStatus } from '@prisma/client'

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import {
  scheduleTypeLabels,
  scheduleStatusLabels,
  scheduleTypeColors,
} from '@/lib/validations/schedule'
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  checkScheduleConflicts,
} from '@/lib/actions/schedules'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'
import { useShiftFormData, type EmployeeOption } from './useShiftFormData'
import { RecurrenceConfig } from './RecurrenceConfig'
import { ConflictAlert } from './ConflictAlert'
import {
  type RecurrenceRule,
  MAX_TOTAL_SCHEDULES,
  calculateTotalSchedules,
} from '@/lib/utils/recurrence'
import { useConflictDetection } from '@/hooks/use-conflict-detection'
import { useIsImpersonating } from '@/hooks'

// ============================================================================
// Types
// ============================================================================

export interface ShiftModalProps {
  /** Modal ouvert */
  isOpen: boolean
  /** Callback fermeture */
  onClose: () => void
  /** Mode du modal */
  mode: 'create' | 'edit'
  /** Données existantes (mode edit) */
  schedule?: ScheduleWithRelations | null
  /** ID entreprise (requis pour création) */
  companyId: string
  /** Callback après succès */
  onSuccess?: () => void
}

// ============================================================================
// Schema de validation formulaire
// ============================================================================

const shiftFormSchema = z
  .object({
    employeeIds: z.array(z.string()).min(1, 'Sélectionnez au moins un employé'),
    teamId: z.string().optional().nullable(),
    startDate: z.date({ required_error: 'Date de début requise' }),
    endDate: z.date({ required_error: 'Date de fin requise' }),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:mm requis'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:mm requis'),
    type: z.nativeEnum(ScheduleType),
    status: z.nativeEnum(ScheduleStatus),
    title: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    location: z.string().max(200).optional().nullable(),
  })
  .refine(
    (data) => {
      const startDateTime = new Date(
        `${format(data.startDate, 'yyyy-MM-dd')}T${data.startTime}`
      )
      const endDateTime = new Date(
        `${format(data.endDate, 'yyyy-MM-dd')}T${data.endTime}`
      )
      return endDateTime > startDateTime
    },
    {
      message: "L'heure de fin doit être après l'heure de début",
      path: ['endTime'],
    }
  )

type ShiftFormValues = z.infer<typeof shiftFormSchema>

// ============================================================================
// Composant principal
// ============================================================================

export function ShiftModal({
  isOpen,
  onClose,
  mode,
  schedule,
  companyId,
  onSuccess,
}: ShiftModalProps) {
  const isImpersonating = useIsImpersonating()

  // Charger les données du formulaire (employés, équipes, paramètres entreprise)
  const {
    employees,
    teams,
    companySettings,
    isLoading: isLoadingData,
    error: dataError,
  } = useShiftFormData()

  // Horaires par défaut : paramètres entreprise ou fallback
  const defaultStartTime = companySettings?.workingHoursStart ?? '09:00'
  const defaultEndTime = companySettings?.workingHoursEnd ?? '17:00'

  // États locaux
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const [employeeSearch, setEmployeeSearch] = useState('')

  // État pour la récurrence (mode création uniquement)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(
    null
  )

  // Formulaire
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      employeeIds: [],
      teamId: null,
      startDate: new Date(),
      endDate: new Date(),
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      type: 'WORK',
      status: 'CONFIRMED',
      title: '',
      description: '',
      location: '',
    },
  })

  // Reset du formulaire quand modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSubmitError(null)
      setEmployeeSearch('')

      if (mode === 'edit' && schedule) {
        // Mode édition : pas de récurrence modifiable pour le moment
        setIsRecurring(false)
        setRecurrenceRule(null)
        reset({
          employeeIds: [schedule.employeeId],
          teamId: schedule.teamId,
          startDate: new Date(schedule.startDate),
          endDate: new Date(schedule.endDate),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          type: schedule.type as ScheduleType,
          status: schedule.status as ScheduleStatus,
          title: schedule.title ?? '',
          description: schedule.description ?? '',
          location: schedule.location ?? '',
        })
      } else {
        // Mode création : réinitialiser avec horaires entreprise
        setIsRecurring(false)
        setRecurrenceRule(null)
        reset({
          employeeIds: [],
          teamId: null,
          startDate: new Date(),
          endDate: new Date(),
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          type: 'WORK',
          status: 'CONFIRMED',
          title: '',
          description: '',
          location: '',
        })
      }
    }
  }, [isOpen, mode, schedule, reset, defaultStartTime, defaultEndTime])

  // Employés sélectionnés et dates surveillées
  const selectedEmployeeIds = watch('employeeIds')
  const selectedTeamId = watch('teamId')
  const watchedStartDate = watch('startDate')
  const watchedEndDate = watch('endDate')
  const watchedStartTime = watch('startTime')
  const watchedEndTime = watch('endTime')
  const watchedType = watch('type')

  // Si type REST, forcer les horaires journée entière
  const isRestType = watchedType === 'REST'
  useEffect(() => {
    if (isRestType) {
      setValue('startTime', '00:00')
      setValue('endTime', '23:59')
    }
  }, [isRestType, setValue])

  // Détection des conflits avec les indisponibilités (SP-400)
  const {
    isChecking: isCheckingConflicts,
    hasConflict,
    hasHardConflict,
    conflicts,
    hardConflicts,
    softConflicts,
  } = useConflictDetection({
    employeeIds: selectedEmployeeIds || [],
    startDate: watchedStartDate,
    endDate: watchedEndDate,
    startTime: watchedStartTime,
    endTime: watchedEndTime,
    enabled: isOpen && selectedEmployeeIds?.length > 0,
    debounceMs: 300,
  })

  // Détection des conflits congés / plannings existants
  const [scheduleConflicts, setScheduleConflicts] = useState<{
    hasConflicts: boolean
    warning: string
    conflicts: Array<{ employeeName: string; type: string; details: string }>
  } | null>(null)
  const [isCheckingScheduleConflicts, setIsCheckingScheduleConflicts] =
    useState(false)
  const scheduleConflictTimerRef = useRef<NodeJS.Timeout | null>(null)

  const checkScheduleConflictsDebounced = useCallback(() => {
    if (scheduleConflictTimerRef.current) {
      clearTimeout(scheduleConflictTimerRef.current)
    }

    if (
      !isOpen ||
      !selectedEmployeeIds?.length ||
      !watchedStartDate ||
      !watchedEndDate ||
      !watchedStartTime ||
      !watchedEndTime
    ) {
      setScheduleConflicts(null)
      return
    }

    scheduleConflictTimerRef.current = setTimeout(async () => {
      setIsCheckingScheduleConflicts(true)
      try {
        const result = await checkScheduleConflicts(
          selectedEmployeeIds,
          watchedStartDate,
          watchedEndDate,
          watchedStartTime,
          watchedEndTime,
          mode === 'edit' ? schedule?.id : undefined
        )
        if (result.success) {
          setScheduleConflicts(result.data)
        }
      } catch {
        // Silently fail - non-blocking check
      } finally {
        setIsCheckingScheduleConflicts(false)
      }
    }, 400)
  }, [
    isOpen,
    selectedEmployeeIds,
    watchedStartDate,
    watchedEndDate,
    watchedStartTime,
    watchedEndTime,
    mode,
    schedule?.id,
  ])

  useEffect(() => {
    checkScheduleConflictsDebounced()
    return () => {
      if (scheduleConflictTimerRef.current) {
        clearTimeout(scheduleConflictTimerRef.current)
      }
    }
  }, [checkScheduleConflictsDebounced])

  // Filtrer les employés par recherche et équipe
  const filteredEmployees = useMemo(() => {
    let filtered = employees

    // Filtrer par équipe si sélectionnée
    if (selectedTeamId) {
      filtered = filtered.filter((emp) => emp.teamId === selectedTeamId)
    }

    // Filtrer par recherche
    if (employeeSearch.trim()) {
      const search = employeeSearch.toLowerCase().trim()
      filtered = filtered.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(search) ||
          emp.lastName.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [employees, selectedTeamId, employeeSearch])

  // Toggle sélection employé
  const toggleEmployee = (employeeId: string) => {
    const current = selectedEmployeeIds || []
    if (current.includes(employeeId)) {
      setValue(
        'employeeIds',
        current.filter((id) => id !== employeeId),
        {
          shouldValidate: true,
        }
      )
    } else {
      setValue('employeeIds', [...current, employeeId], {
        shouldValidate: true,
      })
    }
  }

  // Sélectionner tous les employés filtrés
  const selectAllFiltered = () => {
    const filteredIds = filteredEmployees.map((e) => e.id)
    const current = selectedEmployeeIds || []
    const allSelected = filteredIds.every((id) => current.includes(id))

    if (allSelected) {
      // Désélectionner tous les filtrés
      setValue(
        'employeeIds',
        current.filter((id) => !filteredIds.includes(id)),
        { shouldValidate: true }
      )
    } else {
      // Sélectionner tous les filtrés
      const newSelection = [...new Set([...current, ...filteredIds])]
      setValue('employeeIds', newSelection, { shouldValidate: true })
    }
  }

  // Soumettre le formulaire
  const onSubmit = async (data: ShiftFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (mode === 'create') {
        // Vérifier la limite de créneaux pour la récurrence
        if (isRecurring && recurrenceRule) {
          const totalSchedules = calculateTotalSchedules(
            recurrenceRule,
            data.employeeIds.length,
            data.startDate,
            data.endDate
          )
          if (totalSchedules > MAX_TOTAL_SCHEDULES) {
            setSubmitError(
              `Le nombre total de plannings (${totalSchedules}) dépasse la limite autorisée (${MAX_TOTAL_SCHEDULES}). Réduisez le nombre d'occurrences ou d'employés.`
            )
            setIsSubmitting(false)
            return
          }
        }

        const result = await createSchedule({
          employeeIds: data.employeeIds,
          companyId,
          teamId: data.teamId,
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          type: data.type,
          status: data.status,
          title: data.title || null,
          description: data.description || null,
          location: data.location || null,
          isRecurring,
          recurrenceRule: isRecurring ? recurrenceRule : null,
        })

        if (!result.success) {
          setSubmitError(result.error ?? 'Erreur lors de la création')
          setTimeout(
            () =>
              errorRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              }),
            100
          )
          return
        }
      } else if (mode === 'edit' && schedule) {
        const result = await updateSchedule({
          id: schedule.id,
          teamId: data.teamId,
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          type: data.type,
          status: data.status,
          title: data.title || null,
          description: data.description || null,
          location: data.location || null,
        })

        if (!result.success) {
          setSubmitError(result.error ?? 'Erreur lors de la modification')
          setTimeout(
            () =>
              errorRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              }),
            100
          )
          return
        }
      }

      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch {
      setSubmitError('Une erreur inattendue est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Supprimer un planning (mode edit uniquement)
  const handleDelete = async () => {
    if (!schedule) return
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce planning ? Cette action est irréversible.'
    )
    if (!confirmed) return

    setIsDeleting(true)
    setSubmitError(null)
    try {
      const result = await deleteSchedule(schedule.id)
      if (!result.success) {
        setSubmitError(result.error ?? 'Erreur lors de la suppression')
        return
      }
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch {
      setSubmitError('Une erreur inattendue est survenue')
    } finally {
      setIsDeleting(false)
    }
  }

  // Récupérer les infos d'un employé par ID
  const getEmployeeInfo = (id: string): EmployeeOption | undefined =>
    employees.find((e) => e.id === id)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        data-testid="shift-modal"
      >
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Créer un planning' : 'Modifier le planning'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Remplissez les informations pour créer un nouveau planning'
              : 'Modifiez les informations du planning'}
          </DialogDescription>
        </DialogHeader>

        {/* Erreur de chargement des données */}
        {dataError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {dataError}
          </div>
        )}

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
          className="space-y-6"
        >
          {/* Sélection des employés - uniquement en mode création */}
          {mode === 'create' && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Employés
              </Label>

              {/* Filtre par équipe */}
              <Controller
                name="teamId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? 'all'}
                    onValueChange={(value) =>
                      field.onChange(value === 'all' ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrer par équipe (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les équipes</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="pl-10"
                />
                {employeeSearch && (
                  <button
                    type="button"
                    onClick={() => setEmployeeSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Badges employés sélectionnés */}
              {selectedEmployeeIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedEmployeeIds.map((id) => {
                    const emp = getEmployeeInfo(id)
                    return emp ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {emp.firstName} {emp.lastName}
                        <button
                          type="button"
                          onClick={() => toggleEmployee(id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}

              {/* Liste des employés */}
              <ScrollArea className="h-48 rounded-md border">
                {isLoadingData ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Aucun employé trouvé
                  </div>
                ) : (
                  <div className="p-2">
                    {/* Sélectionner tout */}
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="mb-2 w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-primary/10"
                    >
                      {filteredEmployees.every((e) =>
                        selectedEmployeeIds.includes(e.id)
                      )
                        ? 'Tout désélectionner'
                        : 'Tout sélectionner'}
                    </button>

                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedEmployeeIds.includes(emp.id)
                      return (
                        <div
                          key={emp.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted',
                            isSelected && 'bg-muted'
                          )}
                          onClick={() => toggleEmployee(emp.id)}
                        >
                          <div
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                              isSelected && 'bg-primary text-primary-foreground'
                            )}
                            aria-hidden="true"
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span className="flex-1 text-sm">
                            {emp.firstName} {emp.lastName}
                          </span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>

              {errors.employeeIds && (
                <p className="text-sm text-destructive">
                  {errors.employeeIds.message}
                </p>
              )}
            </div>
          )}

          {/* Mode édition : afficher l'employé concerné */}
          {mode === 'edit' && schedule && (
            <div className="rounded-md bg-muted p-3">
              <Label className="text-muted-foreground">Employé</Label>
              <p className="font-medium">
                {schedule.employee.firstName} {schedule.employee.lastName}
              </p>
            </div>
          )}

          {/* Date et horaires */}
          <div className="space-y-4">
            {/* Date unique */}
            <div className="space-y-2">
              <Label>Date</Label>
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
                          ? format(field.value, 'EEEE d MMMM yyyy', {
                              locale: fr,
                            })
                          : 'Sélectionner une date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          // endDate = startDate (même jour)
                          if (date) {
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

            {/* Horaires — masqués pour REST (journée entière) */}
            {!isRestType ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Début
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
                    Fin
                  </Label>
                  <Input type="time" {...register('endTime')} />
                  {errors.endTime && (
                    <p className="text-sm text-destructive">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Journée entière (repos)
              </div>
            )}
          </div>

          {/* Type et Statut */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Type */}
            <div className="space-y-2">
              <Label>Type de planning</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(scheduleTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded"
                                style={{
                                  backgroundColor:
                                    scheduleTypeColors[value as ScheduleType],
                                }}
                              />
                              {label}
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(scheduleStatusLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Options avancées (titre, description, lieu) */}
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              Options avancées
            </summary>
            <div className="mt-3 space-y-4 pl-6">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  {...register('title')}
                  placeholder="Ex: Réunion d'équipe, Formation..."
                  maxLength={100}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  {...register('description')}
                  placeholder="Détails supplémentaires..."
                  maxLength={500}
                  rows={2}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Lieu</Label>
                <Input
                  {...register('location')}
                  placeholder="Ex: Bureau A, Salle de réunion..."
                  maxLength={200}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </details>

          {/* Récurrence (mode création uniquement) */}
          {mode === 'create' && (
            <RecurrenceConfig
              value={recurrenceRule}
              onChange={setRecurrenceRule}
              isEnabled={isRecurring}
              onEnabledChange={setIsRecurring}
              startDate={watch('startDate')}
              endDate={watch('endDate')}
              employeeCount={selectedEmployeeIds.length || 1}
              disabled={isSubmitting}
            />
          )}

          {/* Indicateur récurrence en mode édition */}
          {mode === 'edit' && schedule?.isRecurring && (
            <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <Repeat className="h-4 w-4" />
              <span>Ce planning fait partie d&apos;une série récurrente</span>
            </div>
          )}

          {/* Alerte de conflits avec les indisponibilités (SP-400) */}
          {hasConflict && !isCheckingConflicts && (
            <ConflictAlert
              conflicts={conflicts}
              hardConflicts={hardConflicts}
              softConflicts={softConflicts}
              showActions={false}
            />
          )}

          {/* Alerte de conflits congés / plannings existants */}
          {scheduleConflicts?.hasConflicts && !isCheckingScheduleConflicts && (
            <Alert
              variant="default"
              className="border-amber-500/50 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/30 dark:text-amber-200 [&>svg]:text-amber-600"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Conflit détecté</AlertTitle>
              <AlertDescription>
                <p className="mb-2">{scheduleConflicts.warning}</p>
                <ul className="space-y-1">
                  {scheduleConflicts.conflicts.map((c, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-amber-200 bg-white/50 px-2 py-1.5 text-xs dark:border-amber-800 dark:bg-amber-950/50"
                    >
                      <span className="font-medium">{c.employeeName}</span>
                      {' — '}
                      {c.details}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Indicateur de vérification en cours */}
          {(isCheckingConflicts || isCheckingScheduleConflicts) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Vérification des conflits...</span>
            </div>
          )}

          {/* Erreur de conflit (visible près des boutons) */}
          {submitError && (
            <div
              ref={errorRef}
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 h-4 w-4 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}

          {/* Actions */}
          <DialogFooter className="gap-2 sm:gap-0">
            {mode === 'edit' && schedule && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={isDeleting || isSubmitting || isImpersonating}
                title={
                  isImpersonating ? 'Non disponible en mode support' : undefined
                }
                data-testid="shift-delete-button"
                className="mr-auto"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Supprimer
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              data-testid="shift-save-button"
              disabled={
                isSubmitting || isDeleting || isLoadingData || isImpersonating
              }
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
              variant={hasHardConflict ? 'destructive' : 'default'}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {hasHardConflict
                ? 'Créer malgré le conflit'
                : mode === 'create'
                  ? 'Créer le planning'
                  : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
