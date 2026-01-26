/**
 * Composant ScheduleCalendarDesktop - Calendrier Schedule-X
 *
 * @description Calendrier interactif Schedule-X pour desktop (≥768px)
 * Intègre les vues jour/semaine/mois avec drag & drop et resize
 *
 * @ticket SP-396, SP-398
 * @see https://schedule-x.dev/
 */

'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
} from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createResizePlugin } from '@schedule-x/resize'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import { format } from 'date-fns'
import { ScheduleCalendarProps } from './ScheduleCalendar'
import { ScheduleWithRelations, updateSchedule } from '@/lib/actions/schedules'
import {
  checkAvailabilityConflicts,
  type AvailabilityConflict,
} from '@/lib/actions/availabilities'
import { CalendarX, GripVertical } from 'lucide-react'
import { useToast } from '@/components/toast/use-toast'
import { ConflictConfirmDialog } from './ConflictConfirmDialog'

// ============================================================================
// Configuration des couleurs par type de schedule
// ============================================================================

const scheduleTypeToCalendarId: Record<string, string> = {
  WORK: 'work',
  BREAK: 'break',
  MEETING: 'meeting',
  TRAINING: 'training',
  REMOTE: 'remote',
  ON_CALL: 'oncall',
  OVERTIME: 'overtime',
}

const calendars = {
  work: {
    colorName: 'work',
    lightColors: {
      main: '#3b82f6',
      container: '#dbeafe',
      onContainer: '#1e40af',
    },
    darkColors: {
      main: '#60a5fa',
      container: '#1e3a5f',
      onContainer: '#bfdbfe',
    },
  },
  break: {
    colorName: 'break',
    lightColors: {
      main: '#eab308',
      container: '#fef3c7',
      onContainer: '#854d0e',
    },
    darkColors: {
      main: '#facc15',
      container: '#422006',
      onContainer: '#fef08a',
    },
  },
  meeting: {
    colorName: 'meeting',
    lightColors: {
      main: '#8b5cf6',
      container: '#ede9fe',
      onContainer: '#5b21b6',
    },
    darkColors: {
      main: '#a78bfa',
      container: '#2e1065',
      onContainer: '#ddd6fe',
    },
  },
  training: {
    colorName: 'training',
    lightColors: {
      main: '#f97316',
      container: '#ffedd5',
      onContainer: '#9a3412',
    },
    darkColors: {
      main: '#fb923c',
      container: '#431407',
      onContainer: '#fed7aa',
    },
  },
  remote: {
    colorName: 'remote',
    lightColors: {
      main: '#14b8a6',
      container: '#ccfbf1',
      onContainer: '#115e59',
    },
    darkColors: {
      main: '#2dd4bf',
      container: '#134e4a',
      onContainer: '#99f6e4',
    },
  },
  oncall: {
    colorName: 'oncall',
    lightColors: {
      main: '#ef4444',
      container: '#fee2e2',
      onContainer: '#991b1b',
    },
    darkColors: {
      main: '#f87171',
      container: '#450a0a',
      onContainer: '#fecaca',
    },
  },
  overtime: {
    colorName: 'overtime',
    lightColors: {
      main: '#ec4899',
      container: '#fce7f3',
      onContainer: '#9d174d',
    },
    darkColors: {
      main: '#f472b6',
      container: '#500724',
      onContainer: '#fbcfe8',
    },
  },
}

// Labels pour la légende
const typeLabels: Record<string, string> = {
  work: 'Travail',
  break: 'Pause',
  meeting: 'Réunion',
  training: 'Formation',
  remote: 'Télétravail',
  oncall: 'Astreinte',
  overtime: 'Heures sup.',
}

// ============================================================================
// Composant principal
// ============================================================================

export function ScheduleCalendarDesktop({
  schedules,
  viewMode,
  currentDate,
  onScheduleClick,
  onScheduleUpdate,
  isLoading,
  canEdit = false,
}: ScheduleCalendarProps) {
  const { success, error: toastError } = useToast()

  // État de mise à jour en cours
  const [isUpdating, setIsUpdating] = useState(false)

  // État pour la détection de conflits lors du drag & drop
  const [pendingUpdate, setPendingUpdate] = useState<{
    eventId: string
    startDate: Date
    endDate: Date
    startTime: string
    endTime: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalEvent: any
  } | null>(null)
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false)
  const [detectedConflicts, setDetectedConflicts] = useState<{
    conflicts: AvailabilityConflict[]
    hardConflicts: AvailabilityConflict[]
    softConflicts: AvailabilityConflict[]
  }>({ conflicts: [], hardConflicts: [], softConflicts: [] })
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false)

  // Ref pour le service d'events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventsServiceRef = useRef<any>(null)

  // Store schedule data pour accès dans callbacks
  const schedulesMapRef = useRef<Map<string, ScheduleWithRelations>>(new Map())

  // Store des événements originaux pour rollback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalEventsRef = useRef<Map<string, any>>(new Map())

  // Créer le service d'events une seule fois
  const [eventsService] = useState(() => {
    const service = createEventsServicePlugin()
    eventsServiceRef.current = service
    return service
  })

  // Fonction pour effectuer la mise à jour réelle
  const performUpdate = useCallback(
    async (
      eventId: string,
      startDate: Date,
      endDate: Date,
      startTime: string,
      endTime: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      originalEvent: any
    ) => {
      setIsUpdating(true)

      try {
        const result = await updateSchedule({
          id: eventId,
          startDate,
          endDate,
          startTime,
          endTime,
        })

        if (result.success) {
          success('Créneau modifié', {
            description: 'Le créneau a été déplacé avec succès.',
          })

          // Mettre à jour la référence originale
          originalEventsRef.current.set(eventId, {
            id: eventId,
            start: startDate,
            end: endDate,
          })

          // Notifier le parent pour refresh
          onScheduleUpdate?.(eventId, startDate, endDate)
        } else {
          // Rollback en cas d'erreur
          /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
          if (originalEvent && eventsServiceRef.current) {
            eventsServiceRef.current.update(originalEvent)
          }
          /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

          toastError('Erreur', {
            description: result.error || 'Impossible de modifier le créneau.',
          })
        }
      } catch (err) {
        // Rollback en cas d'exception
        /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
        if (originalEvent && eventsServiceRef.current) {
          eventsServiceRef.current.update(originalEvent)
        }
        /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

        toastError('Erreur', {
          description: 'Une erreur est survenue lors de la modification.',
        })
        console.error('[ScheduleCalendarDesktop] Update error:', err)
      } finally {
        setIsUpdating(false)
        setPendingUpdate(null)
      }
    },
    [onScheduleUpdate, success, toastError]
  )

  // Handler pour confirmer la mise à jour malgré les conflits
  const handleConfirmWithConflicts = useCallback(async () => {
    if (!pendingUpdate) return

    setConflictDialogOpen(false)
    await performUpdate(
      pendingUpdate.eventId,
      pendingUpdate.startDate,
      pendingUpdate.endDate,
      pendingUpdate.startTime,
      pendingUpdate.endTime,
      pendingUpdate.originalEvent
    )
  }, [pendingUpdate, performUpdate])

  // Handler pour annuler la mise à jour (rollback)
  const handleCancelUpdate = useCallback(() => {
    if (pendingUpdate?.originalEvent && eventsServiceRef.current) {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
      eventsServiceRef.current.update(pendingUpdate.originalEvent)
      /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    }
    setConflictDialogOpen(false)
    setPendingUpdate(null)
    setDetectedConflicts({
      conflicts: [],
      hardConflicts: [],
      softConflicts: [],
    })
  }, [pendingUpdate])

  // Handler pour la mise à jour d'un événement (drag ou resize)
  const handleEventUpdate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (event: any) => {
      if (!canEdit || isUpdating || isCheckingConflicts) return

      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
      const eventId = event.id as string

      // Sauvegarder l'événement original pour rollback
      const originalEvent = originalEventsRef.current.get(eventId)

      // Parser les dates Temporal
      const startStr = String(event.start.toString())
      const endStr = String(event.end.toString())

      // Extraire date et heure du format ISO Temporal
      const startDate = new Date(startStr)
      const endDate = new Date(endStr)

      // Extraire les heures au format HH:mm
      const startTime = format(startDate, 'HH:mm')
      const endTime = format(endDate, 'HH:mm')

      // Récupérer le schedule pour obtenir l'employeeId
      const schedule = schedulesMapRef.current.get(eventId)
      if (!schedule?.employeeId) {
        // Pas d'employé associé, on fait la mise à jour directement
        await performUpdate(
          eventId,
          startDate,
          endDate,
          startTime,
          endTime,
          originalEvent
        )
        return
      }

      // Vérifier les conflits avant de sauvegarder
      setIsCheckingConflicts(true)

      try {
        const conflictResult = await checkAvailabilityConflicts(
          [schedule.employeeId],
          startDate,
          endDate,
          startTime,
          endTime
        )

        if (conflictResult.success && conflictResult.data?.hasConflict) {
          // Stocker les infos pour le dialog de confirmation
          setPendingUpdate({
            eventId,
            startDate,
            endDate,
            startTime,
            endTime,
            originalEvent,
          })
          setDetectedConflicts({
            conflicts: conflictResult.data.conflicts,
            hardConflicts: conflictResult.data.hardConflicts,
            softConflicts: conflictResult.data.softConflicts,
          })
          setConflictDialogOpen(true)
        } else {
          // Pas de conflit, mise à jour directe
          await performUpdate(
            eventId,
            startDate,
            endDate,
            startTime,
            endTime,
            originalEvent
          )
        }
      } catch (err) {
        console.error('[ScheduleCalendarDesktop] Conflict check error:', err)
        // En cas d'erreur de vérification, on propose quand même la mise à jour
        await performUpdate(
          eventId,
          startDate,
          endDate,
          startTime,
          endTime,
          originalEvent
        )
      } finally {
        setIsCheckingConflicts(false)
      }
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
    },
    [canEdit, isUpdating, isCheckingConflicts, performUpdate]
  )

  // Convertir les schedules en events Schedule-X avec Temporal API
  const events = useMemo(() => {
    // Mettre à jour la map pour les callbacks
    schedulesMapRef.current.clear()
    schedules.forEach((s) => schedulesMapRef.current.set(s.id, s))

    return schedules.map((schedule) => {
      const startDateStr = format(new Date(schedule.startDate), 'yyyy-MM-dd')
      const endDateStr = format(new Date(schedule.endDate), 'yyyy-MM-dd')
      const [startHour, startMin] = schedule.startTime.split(':')
      const [endHour, endMin] = schedule.endTime.split(':')

      return {
        id: schedule.id,
        title:
          schedule.title ||
          `${schedule.employee?.firstName ?? ''} ${schedule.employee?.lastName ?? ''}`.trim() ||
          'Sans titre',
        start: Temporal.ZonedDateTime.from(
          `${startDateStr}T${startHour}:${startMin}:00[Europe/Paris]`
        ),
        end: Temporal.ZonedDateTime.from(
          `${endDateStr}T${endHour}:${endMin}:00[Europe/Paris]`
        ),
        calendarId: scheduleTypeToCalendarId[schedule.type] || 'work',
      }
    })
  }, [schedules])

  // Mapper le viewMode vers les vues Schedule-X
  const getDefaultView = () => {
    switch (viewMode) {
      case 'day':
        return 'day'
      case 'week':
        return 'week'
      case 'month':
        return 'month-grid'
      default:
        return 'week'
    }
  }

  // Plugins (créés une seule fois)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins = useMemo((): any[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list: any[] = [eventsService]
    if (canEdit) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dragPlugin = createDragAndDropPlugin()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const resizePluginInstance = createResizePlugin()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      list.push(dragPlugin)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      list.push(resizePluginInstance)
    }
    return list
  }, [canEdit, eventsService])

  // Configuration du calendrier
  const calendar = useCalendarApp(
    {
      views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
      defaultView: getDefaultView(),
      selectedDate: Temporal.PlainDate.from(format(currentDate, 'yyyy-MM-dd')),
      events,
      calendars,
      locale: 'fr-FR',
      firstDayOfWeek: 1, // Lundi
      dayBoundaries: {
        start: '06:00',
        end: '22:00',
      },
      weekOptions: {
        gridHeight: 600,
        nDays: 7,
        eventWidth: 95,
      },
      callbacks: {
        onEventClick: (event) => {
          if (onScheduleClick) {
            const schedule = schedulesMapRef.current.get(event.id as string)
            if (schedule) {
              onScheduleClick(schedule)
            }
          }
        },
        onEventUpdate: (event) => {
          if (canEdit) {
            // Utiliser le handler async avec persistance
            void handleEventUpdate(event)
          }
        },
      },
    },
    plugins
  )

  // Synchroniser les events quand schedules change
  useEffect(() => {
    if (eventsServiceRef.current && events.length > 0) {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      const service = eventsServiceRef.current

      // Clear existing events
      const existingEvents = service.getAll()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      existingEvents.forEach((event: any) => {
        service.remove(event.id as string)
      })

      // Clear original events ref
      originalEventsRef.current.clear()

      // Add new events and save originals for rollback
      events.forEach((event) => {
        service.add(event)
        // Sauvegarder une copie pour rollback potentiel
        originalEventsRef.current.set(event.id, { ...event })
      })
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    }
  }, [events])

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  // Aucun schedule
  if (schedules.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
        <CalendarX className="mb-4 h-12 w-12 opacity-50" />
        <p className="text-lg font-medium">Aucun planning pour cette période</p>
        <p className="text-sm">Créez un nouveau shift pour commencer</p>
      </div>
    )
  }

  return (
    <div className="schedule-calendar-desktop relative space-y-4">
      {/* Indicateur de mise à jour */}
      {(isUpdating || isCheckingConflicts) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-background/50">
          <div className="flex items-center gap-2 rounded-md bg-background p-4 shadow-lg">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">
              {isCheckingConflicts
                ? 'Vérification des conflits...'
                : 'Mise à jour en cours...'}
            </span>
          </div>
        </div>
      )}

      {/* Calendrier Schedule-X */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <ScheduleXCalendar calendarApp={calendar} />
      </div>

      {/* Info drag & drop + Légende */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Message d'aide pour le drag & drop */}
        {canEdit && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <GripVertical className="h-4 w-4" />
            Glissez-déposez les créneaux pour les déplacer. Redimensionnez-les
            en tirant sur les bords.
          </p>
        )}

        {/* Légende des couleurs */}
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(calendars).map(([key, cal]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: cal.lightColors.main }}
              />
              <span>{typeLabels[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog de confirmation de conflits */}
      <ConflictConfirmDialog
        open={conflictDialogOpen}
        onOpenChange={setConflictDialogOpen}
        conflicts={detectedConflicts.conflicts}
        hardConflicts={detectedConflicts.hardConflicts}
        softConflicts={detectedConflicts.softConflicts}
        onConfirm={() => void handleConfirmWithConflicts()}
        onCancel={handleCancelUpdate}
        employeeName={
          pendingUpdate
            ? (() => {
                const schedule = schedulesMapRef.current.get(
                  pendingUpdate.eventId
                )
                return schedule?.employee
                  ? `${schedule.employee.firstName} ${schedule.employee.lastName}`
                  : undefined
              })()
            : undefined
        }
        scheduleDate={
          pendingUpdate
            ? format(pendingUpdate.startDate, 'dd/MM/yyyy')
            : undefined
        }
        isLoading={isUpdating}
      />
    </div>
  )
}
