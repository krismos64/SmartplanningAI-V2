/**
 * Composant ScheduleCalendarDesktop - Calendrier Schedule-X
 *
 * @description Calendrier interactif Schedule-X pour desktop (≥768px)
 * Intègre les vues jour/semaine/mois avec drag & drop
 *
 * @ticket SP-396
 * @see https://schedule-x.dev/
 */

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
} from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import { format } from 'date-fns'
import { ScheduleCalendarProps } from './ScheduleCalendar'
import { ScheduleWithRelations } from '@/lib/actions/schedules'
import { CalendarX } from 'lucide-react'

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
  // Ref pour le service d'events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventsServiceRef = useRef<any>(null)

  // Store schedule data pour accès dans callbacks
  const schedulesMapRef = useRef<Map<string, ScheduleWithRelations>>(new Map())

  // Créer le service d'events une seule fois
  const [eventsService] = useState(() => {
    const service = createEventsServicePlugin()
    eventsServiceRef.current = service
    return service
  })

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
  const plugins = useMemo(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
    const list: any[] = [eventsService]
    if (canEdit) {
      list.push(createDragAndDropPlugin())
    }
    return list
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
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
          if (onScheduleUpdate && canEdit) {
            // Parser les dates Temporal
            const startStr = event.start.toString()
            const endStr = event.end.toString()

            // Extraire date et heure du format ISO
            const startDate = new Date(startStr)
            const endDate = new Date(endStr)

            onScheduleUpdate(event.id as string, startDate, endDate)
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

      // Add new events
      events.forEach((event) => {
        service.add(event)
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
    <div className="schedule-calendar-desktop space-y-4">
      {/* Calendrier Schedule-X */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <ScheduleXCalendar calendarApp={calendar} />
      </div>

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
  )
}
