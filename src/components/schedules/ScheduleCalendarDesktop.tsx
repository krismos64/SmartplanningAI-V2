/**
 * Composant ScheduleCalendarDesktop - Calendrier Schedule-X
 *
 * @description Calendrier interactif Schedule-X pour desktop (≥768px)
 * Intègre les vues jour/semaine/mois avec drag & drop et resize
 * Affiche les indisponibilités en overlay (SP-402)
 *
 * @ticket SP-396, SP-398, SP-402
 * @see https://schedule-x.dev/
 */

'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
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
  type AvailabilityWithEmployee,
} from '@/lib/actions/availabilities'
import type { LeaveRequestWithEmployee } from '@/lib/actions/leaves'
import { GripVertical } from 'lucide-react'
import { LeaveType } from '@prisma/client'
import { useToast } from '@/components/toast/use-toast'
import Image from 'next/image'
import { ConflictConfirmDialog } from './ConflictConfirmDialog'
import { AvailabilityPopover } from './AvailabilityPopover'
import { AvailabilityType } from '@prisma/client'

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
  REST: 'rest',
}

/**
 * Retourne le calendarId selon le type ET le statut.
 * Les DRAFT utilisent un variant atténué (ex: 'work-draft')
 */
function getCalendarId(type: string, status: string): string {
  const base = scheduleTypeToCalendarId[type] || 'work'
  return status === 'DRAFT' ? `${base}-draft` : base
}

/**
 * Génère les calendriers DRAFT (couleurs atténuées + opacité réduite)
 */
function buildDraftCalendars() {
  const draft: Record<string, (typeof calendars)[keyof typeof calendars]> = {}
  for (const [key, cal] of Object.entries(calendars)) {
    draft[`${key}-draft`] = {
      colorName: `${cal.colorName}-draft`,
      lightColors: {
        main: cal.lightColors.main,
        container: `${cal.lightColors.container}80`,
        onContainer: `${cal.lightColors.onContainer}99`,
      },
      darkColors: {
        main: cal.darkColors.main,
        container: `${cal.darkColors.container}80`,
        onContainer: `${cal.darkColors.onContainer}99`,
      },
    }
  }
  return draft
}

const calendars = {
  work: {
    colorName: 'work',
    lightColors: {
      main: '#2563eb',
      container: '#c7d9fc',
      onContainer: '#1e3a8a',
    },
    darkColors: {
      main: '#60a5fa',
      container: '#1e3b6e',
      onContainer: '#e0edff',
    },
  },
  break: {
    colorName: 'break',
    lightColors: {
      main: '#ca8a04',
      container: '#fde68a',
      onContainer: '#713f12',
    },
    darkColors: {
      main: '#fbbf24',
      container: '#5c4813',
      onContainer: '#fef3c7',
    },
  },
  meeting: {
    colorName: 'meeting',
    lightColors: {
      main: '#7c3aed',
      container: '#d8ccfc',
      onContainer: '#4c1d95',
    },
    darkColors: {
      main: '#a78bfa',
      container: '#3b1e7a',
      onContainer: '#ede9fe',
    },
  },
  training: {
    colorName: 'training',
    lightColors: {
      main: '#ea580c',
      container: '#fdcfab',
      onContainer: '#7c2d12',
    },
    darkColors: {
      main: '#fb923c',
      container: '#6b2f0e',
      onContainer: '#ffedd5',
    },
  },
  remote: {
    colorName: 'remote',
    lightColors: {
      main: '#0d9488',
      container: '#a7f3d0',
      onContainer: '#134e4a',
    },
    darkColors: {
      main: '#2dd4bf',
      container: '#1a5c52',
      onContainer: '#ccfbf1',
    },
  },
  oncall: {
    colorName: 'oncall',
    lightColors: {
      main: '#dc2626',
      container: '#fca5a5',
      onContainer: '#7f1d1d',
    },
    darkColors: {
      main: '#f87171',
      container: '#6e1a1a',
      onContainer: '#fee2e2',
    },
  },
  overtime: {
    colorName: 'overtime',
    lightColors: {
      main: '#db2777',
      container: '#f9a8d4',
      onContainer: '#831843',
    },
    darkColors: {
      main: '#f472b6',
      container: '#6b1a42',
      onContainer: '#fce7f3',
    },
  },
  rest: {
    colorName: 'rest',
    lightColors: {
      main: '#16a34a',
      container: '#bbf7d0',
      onContainer: '#14532d',
    },
    darkColors: {
      main: '#4ade80',
      container: '#14532d',
      onContainer: '#dcfce7',
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
  rest: 'Repos',
}

// ============================================================================
// Configuration des calendriers pour les indisponibilités (SP-402)
// ============================================================================

const availabilityCalendars = {
  'availability-vacation': {
    colorName: 'availability-vacation',
    lightColors: {
      main: '#3b82f6',
      container: 'rgba(59, 130, 246, 0.20)',
      onContainer: '#1e40af',
    },
    darkColors: {
      main: '#60a5fa',
      container: 'rgba(59, 130, 246, 0.30)',
      onContainer: '#93c5fd',
    },
  },
  'availability-sick': {
    colorName: 'availability-sick',
    lightColors: {
      main: '#ef4444',
      container: 'rgba(239, 68, 68, 0.20)',
      onContainer: '#991b1b',
    },
    darkColors: {
      main: '#f87171',
      container: 'rgba(239, 68, 68, 0.30)',
      onContainer: '#fca5a5',
    },
  },
  'availability-training': {
    colorName: 'availability-training',
    lightColors: {
      main: '#8b5cf6',
      container: 'rgba(139, 92, 246, 0.15)',
      onContainer: '#5b21b6',
    },
    darkColors: {
      main: '#a78bfa',
      container: 'rgba(139, 92, 246, 0.25)',
      onContainer: '#c4b5fd',
    },
  },
  'availability-unavailable': {
    colorName: 'availability-unavailable',
    lightColors: {
      main: '#6b7280',
      container: 'rgba(107, 114, 128, 0.20)',
      onContainer: '#374151',
    },
    darkColors: {
      main: '#9ca3af',
      container: 'rgba(107, 114, 128, 0.30)',
      onContainer: '#d1d5db',
    },
  },
  'availability-preferred': {
    colorName: 'availability-preferred',
    lightColors: {
      main: '#eab308',
      container: 'rgba(234, 179, 8, 0.12)',
      onContainer: '#854d0e',
    },
    darkColors: {
      main: '#facc15',
      container: 'rgba(234, 179, 8, 0.18)',
      onContainer: '#fde047',
    },
  },
  'availability-other': {
    colorName: 'availability-other',
    lightColors: {
      main: '#64748b',
      container: 'rgba(100, 116, 139, 0.15)',
      onContainer: '#334155',
    },
    darkColors: {
      main: '#94a3b8',
      container: 'rgba(100, 116, 139, 0.25)',
      onContainer: '#cbd5e1',
    },
  },
}

// ============================================================================
// Configuration des calendriers pour les congés (SP-415)
// ============================================================================

const leaveCalendars = {
  'leave-paid': {
    colorName: 'leave-paid',
    lightColors: {
      main: '#22c55e',
      container: 'rgba(34, 197, 94, 0.20)',
      onContainer: '#166534',
    },
    darkColors: {
      main: '#4ade80',
      container: 'rgba(34, 197, 94, 0.30)',
      onContainer: '#86efac',
    },
  },
  'leave-rtt': {
    colorName: 'leave-rtt',
    lightColors: {
      main: '#06b6d4',
      container: 'rgba(6, 182, 212, 0.20)',
      onContainer: '#155e75',
    },
    darkColors: {
      main: '#22d3ee',
      container: 'rgba(6, 182, 212, 0.30)',
      onContainer: '#67e8f9',
    },
  },
  'leave-sick': {
    colorName: 'leave-sick',
    lightColors: {
      main: '#ef4444',
      container: 'rgba(239, 68, 68, 0.20)',
      onContainer: '#991b1b',
    },
    darkColors: {
      main: '#f87171',
      container: 'rgba(239, 68, 68, 0.30)',
      onContainer: '#fca5a5',
    },
  },
  'leave-unpaid': {
    colorName: 'leave-unpaid',
    lightColors: {
      main: '#6b7280',
      container: 'rgba(107, 114, 128, 0.20)',
      onContainer: '#374151',
    },
    darkColors: {
      main: '#9ca3af',
      container: 'rgba(107, 114, 128, 0.30)',
      onContainer: '#d1d5db',
    },
  },
  'leave-parental': {
    colorName: 'leave-parental',
    lightColors: {
      main: '#ec4899',
      container: 'rgba(236, 72, 153, 0.20)',
      onContainer: '#9d174d',
    },
    darkColors: {
      main: '#f472b6',
      container: 'rgba(236, 72, 153, 0.30)',
      onContainer: '#fbcfe8',
    },
  },
  'leave-family': {
    colorName: 'leave-family',
    lightColors: {
      main: '#f59e0b',
      container: 'rgba(245, 158, 11, 0.20)',
      onContainer: '#92400e',
    },
    darkColors: {
      main: '#fbbf24',
      container: 'rgba(245, 158, 11, 0.30)',
      onContainer: '#fde68a',
    },
  },
  'leave-other': {
    colorName: 'leave-other',
    lightColors: {
      main: '#8b5cf6',
      container: 'rgba(139, 92, 246, 0.20)',
      onContainer: '#5b21b6',
    },
    darkColors: {
      main: '#a78bfa',
      container: 'rgba(139, 92, 246, 0.30)',
      onContainer: '#c4b5fd',
    },
  },
}

// Mapping LeaveType → calendarId
const leaveTypeToCalendarId: Record<LeaveType, string> = {
  PAID_LEAVE: 'leave-paid',
  RTT: 'leave-rtt',
  SICK_LEAVE: 'leave-sick',
  UNPAID_LEAVE: 'leave-unpaid',
  PARENTAL_LEAVE: 'leave-parental',
  FAMILY_EVENT: 'leave-family',
  OTHER: 'leave-other',
}

// Labels des types de congé avec emojis
const leaveTypeLabels: Record<LeaveType, string> = {
  PAID_LEAVE: '🌴 CP',
  RTT: '⏰ RTT',
  SICK_LEAVE: '🤒 Maladie',
  UNPAID_LEAVE: '📋 Sans solde',
  PARENTAL_LEAVE: '👶 Parental',
  FAMILY_EVENT: '👨‍👩‍👧 Famille',
  OTHER: '📝 Autre',
}

// Tous les calendriers combinés (incluant les variants DRAFT)
const draftCalendars = buildDraftCalendars()
const allCalendars = {
  ...calendars,
  ...draftCalendars,
  ...availabilityCalendars,
  ...leaveCalendars,
}

// Labels des types d'indisponibilité avec emojis
const availabilityTypeLabels: Record<AvailabilityType, string> = {
  VACATION: '\u{1F3D6}\u{FE0F} Vacances',
  SICK: '\u{1F912} Maladie',
  TRAINING: '\u{1F4DA} Formation',
  UNAVAILABLE: '\u{26D4} Indisponible',
  PREFERRED: '\u{2B50} Preference',
  OTHER: '\u{1F4DD} Autre',
}

// ============================================================================
// Custom time grid event avec avatar employé (vue jour/semaine)
// ============================================================================

function TimeGridEventWithAvatar({
  calendarEvent,
}: {
  calendarEvent: Record<string, unknown>
}) {
  const title = (calendarEvent.title as string) ?? ''
  const image = calendarEvent._employeeImage as string | null
  const employeeName = (calendarEvent._employeeName as string) ?? ''
  const scheduleTime = (calendarEvent._scheduleTime as string) ?? ''
  const calendarId = (calendarEvent.calendarId as string) ?? 'work'
  const canEdit = Boolean(calendarEvent._canEdit)
  const initials = employeeName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Récupérer les couleurs du calendrier (Schedule-X les supprime pour les custom components)
  const cal = allCalendars[calendarId as keyof typeof allCalendars]
  const backgroundColor = cal?.lightColors?.container ?? '#c7d9fc'
  const textColor = cal?.lightColors?.onContainer ?? '#1e3a8a'
  const borderColor = cal?.lightColors?.main ?? '#2563eb'

  return (
    <div
      className="group flex h-full items-start gap-2 overflow-hidden rounded-sm px-1.5 py-1"
      style={{
        backgroundColor,
        color: textColor,
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      {/* Avatar */}
      {(image || employeeName) && (
        <div className="mt-0.5 flex-shrink-0">
          {image ? (
            <Image
              src={image}
              alt={employeeName}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-white/50"
            />
          ) : (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-1 ring-white/30"
              style={{ backgroundColor: `${borderColor}33` }}
            >
              {initials}
            </div>
          )}
        </div>
      )}
      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold leading-tight">
          {title}
        </div>
        {scheduleTime && (
          <div className="truncate text-[10px] leading-tight opacity-80">
            {scheduleTime}
          </div>
        )}
      </div>

      {/* Affordance drag & drop : visible en permanence (opacité réduite au
          repos, pleine au hover) pour signaler que l'événement est
          déplaçable sans avoir à lire le texte d'aide sous le calendrier */}
      {canEdit && (
        <GripVertical
          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 opacity-40 transition-opacity group-hover:opacity-90"
          aria-hidden="true"
        />
      )}
    </div>
  )
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
  availabilities = [],
  showAvailabilities = true,
  onAvailabilityClick,
  leaveRequests = [],
  showLeaves = true,
  onLeaveClick,
  onRangeChange,
}: ScheduleCalendarProps) {
  const { success, error: toastError } = useToast()

  // Ref stable pour onRangeChange (closure dans useNextCalendarApp)
  const onRangeChangeRef = useRef(onRangeChange)
  onRangeChangeRef.current = onRangeChange

  // État pour le popover d'indisponibilité
  const [selectedAvailability, setSelectedAvailability] =
    useState<AvailabilityWithEmployee | null>(null)
  const [availabilityPopoverOpen, setAvailabilityPopoverOpen] = useState(false)

  // Map pour accéder aux availabilities par ID d'event
  const availabilitiesMapRef = useRef<Map<string, AvailabilityWithEmployee>>(
    new Map()
  )

  // Map pour accéder aux leaves par ID d'event (SP-415)
  const leavesMapRef = useRef<Map<string, LeaveRequestWithEmployee>>(new Map())

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

  // Créer les plugins une seule fois (via useState pour stabilité)
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
          success('Planning modifié', {
            description: 'Le planning a été déplacé avec succès.',
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
            description: result.error || 'Impossible de modifier le planning.',
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

      // En v3.7.3, event.start/end sont des Temporal.ZonedDateTime
      // toString() produit '2026-01-27T09:00:00+01:00[Europe/Paris]'
      // new Date() ne sait pas parser le bracket → on le retire
      const startStr = String(event.start.toString()).replace(/\[.*\]$/, '')
      const endStr = String(event.end.toString()).replace(/\[.*\]$/, '')

      const startDate = new Date(startStr)
      const endDate = new Date(endStr)

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
  const scheduleEvents = useMemo(() => {
    // Mettre à jour la map pour les callbacks
    schedulesMapRef.current.clear()
    schedules.forEach((s) => schedulesMapRef.current.set(s.id, s))

    return schedules.map((schedule) => {
      const startDateStr = format(new Date(schedule.startDate), 'yyyy-MM-dd')
      const endDateStr = format(new Date(schedule.endDate), 'yyyy-MM-dd')
      const [startHour, startMin] = schedule.startTime.split(':')
      const [endHour, endMin] = schedule.endTime.split(':')

      const employeeName =
        `${schedule.employee?.firstName ?? ''} ${schedule.employee?.lastName ?? ''}`.trim()

      // REST = journée entière (PlainDate), autres = horaires (ZonedDateTime)
      const isRest = schedule.type === 'REST'

      return {
        id: schedule.id,
        title: isRest
          ? `🛌 ${schedule.title || 'Repos'} — ${employeeName}`
          : schedule.title || employeeName || 'Sans titre',
        start: isRest
          ? Temporal.PlainDate.from(startDateStr)
          : Temporal.ZonedDateTime.from(
              `${startDateStr}T${startHour}:${startMin}:00[Europe/Paris]`
            ),
        end: isRest
          ? Temporal.PlainDate.from(endDateStr)
          : Temporal.ZonedDateTime.from(
              // Utiliser startDateStr pour éviter les événements multi-jours en bandeau
              `${startDateStr}T${endHour}:${endMin}:00[Europe/Paris]`
            ),
        calendarId: getCalendarId(schedule.type, schedule.status),
        // Données custom pour le rendu avec avatar
        _employeeImage: schedule.employee?.user?.image ?? null,
        _employeeName: employeeName,
        _scheduleTime: `${schedule.startTime} - ${schedule.endTime}`,
        // Affordance drag & drop visible au repos (pas seulement au hover)
        _canEdit: canEdit,
      }
    })
  }, [schedules, canEdit])

  // Convertir les availabilities en events Schedule-X (SP-402)
  const availabilityEvents = useMemo(() => {
    if (!showAvailabilities || availabilities.length === 0) {
      availabilitiesMapRef.current.clear()
      return []
    }

    // Mettre à jour la map pour les callbacks
    availabilitiesMapRef.current.clear()

    return availabilities.map((avail) => {
      const eventId = `avail-${avail.id}`
      availabilitiesMapRef.current.set(eventId, avail)

      const startDateStr = format(new Date(avail.startDate), 'yyyy-MM-dd')
      const endDateStr = format(new Date(avail.endDate), 'yyyy-MM-dd')

      // Utiliser les heures si définies, sinon journée complète
      const startTime = avail.startTime || '00:00'
      const endTime = avail.endTime || '23:59'
      const [startHour, startMin] = startTime.split(':')
      const [endHour, endMin] = endTime.split(':')

      const employeeName = `${avail.employee.firstName} ${avail.employee.lastName}`
      const typeLabel = availabilityTypeLabels[avail.type]

      return {
        id: eventId,
        title: `${employeeName} - ${typeLabel}`,
        start: Temporal.ZonedDateTime.from(
          `${startDateStr}T${startHour}:${startMin}:00[Europe/Paris]`
        ),
        end: Temporal.ZonedDateTime.from(
          `${endDateStr}T${endHour}:${endMin}:00[Europe/Paris]`
        ),
        calendarId: `availability-${avail.type.toLowerCase()}`,
      }
    })
  }, [availabilities, showAvailabilities])

  // Convertir les congés en events Schedule-X (SP-415)
  const leaveEvents = useMemo(() => {
    if (!showLeaves || leaveRequests.length === 0) {
      leavesMapRef.current.clear()
      return []
    }

    // Mettre à jour la map pour les callbacks
    leavesMapRef.current.clear()

    return leaveRequests.map((leave) => {
      const eventId = `leave-${leave.id}`
      leavesMapRef.current.set(eventId, leave)

      const startDateStr = format(new Date(leave.startDate), 'yyyy-MM-dd')
      const endDateStr = format(new Date(leave.endDate), 'yyyy-MM-dd')

      const employeeName = `${leave.employee.firstName} ${leave.employee.lastName}`
      const typeLabel = leaveTypeLabels[leave.type]

      // Congés = journée entière (PlainDate)
      return {
        id: eventId,
        title: `${employeeName} - ${typeLabel}`,
        start: Temporal.PlainDate.from(startDateStr),
        end: Temporal.PlainDate.from(endDateStr),
        calendarId: leaveTypeToCalendarId[leave.type],
      }
    })
  }, [leaveRequests, showLeaves])

  // Combiner tous les events
  const events = useMemo(() => {
    return [...scheduleEvents, ...availabilityEvents, ...leaveEvents]
  }, [scheduleEvents, availabilityEvents, leaveEvents])

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
  const calendar = useNextCalendarApp(
    {
      views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
      defaultView: getDefaultView(),
      selectedDate: Temporal.PlainDate.from(format(currentDate, 'yyyy-MM-dd')),
      events,
      calendars: allCalendars,
      locale: 'fr-FR',
      timezone: 'Europe/Paris',
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
          const eventId = event.id as string

          // Vérifier si c'est une indisponibilité (SP-402)
          if (eventId.startsWith('avail-')) {
            const availability = availabilitiesMapRef.current.get(eventId)
            if (availability) {
              if (onAvailabilityClick) {
                onAvailabilityClick(availability)
              } else {
                // Afficher le popover par défaut
                setSelectedAvailability(availability)
                setAvailabilityPopoverOpen(true)
              }
            }
            return
          }

          // Vérifier si c'est un congé (SP-415)
          if (eventId.startsWith('leave-')) {
            const leave = leavesMapRef.current.get(eventId)
            if (leave && onLeaveClick) {
              onLeaveClick(leave)
            }
            return
          }

          // Sinon c'est un schedule
          if (onScheduleClick) {
            const schedule = schedulesMapRef.current.get(eventId)
            if (schedule) {
              onScheduleClick(schedule)
            }
          }
        },
        onRangeUpdate(range) {
          if (onRangeChangeRef.current) {
            // Schedule-X range peut être string 'YYYY-MM-DD HH:mm' ou 'YYYY-MM-DD'
            const toDate = (v: unknown): Date => {
              const s = typeof v === 'string' ? v : String(v)
              // Extraire juste YYYY-MM-DD (10 premiers caractères)
              const dateOnly = s.substring(0, 10)
              return new Date(dateOnly + 'T00:00:00')
            }
            onRangeChangeRef.current(toDate(range.start), toDate(range.end))
          }
        },
        onEventUpdate: (event) => {
          const eventId = event.id as string

          // Ne pas permettre le drag & drop des indisponibilités
          if (eventId.startsWith('avail-')) {
            return
          }

          // Ne pas permettre le drag & drop des congés (SP-415)
          if (eventId.startsWith('leave-')) {
            return
          }

          if (canEdit) {
            // Utiliser le handler async avec persistance
            void handleEventUpdate(event)
          }
        },
      },
    },
    plugins
  )

  // Sauvegarder les events originaux pour rollback après drag & drop
  useEffect(() => {
    if (!calendar) return
    originalEventsRef.current.clear()
    events.forEach((event) => {
      originalEventsRef.current.set(event.id, { ...event })
    })
  }, [events, calendar])

  // Marquer visuellement les events DRAFT dans le DOM
  useEffect(() => {
    const draftIds = new Set(
      schedules.filter((s) => s.status === 'DRAFT').map((s) => s.id)
    )
    if (draftIds.size === 0) return

    // Schedule-X injecte l'id dans data-event-id
    const timer = setTimeout(() => {
      const eventEls = document.querySelectorAll<HTMLElement>(
        '.sx__time-grid-event, .sx__month-grid-event'
      )
      eventEls.forEach((el) => {
        const eventId = el.getAttribute('data-event-id')
        if (eventId && draftIds.has(eventId)) {
          el.classList.add('sx__event--draft')
        } else {
          el.classList.remove('sx__event--draft')
        }
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [schedules, events])

  // Masquer les jours hors du mois courant dans la vue mois
  useEffect(() => {
    if (viewMode !== 'month') return

    const timer = setTimeout(() => {
      const dayEls = document.querySelectorAll<HTMLElement>(
        '.sx__month-grid-day'
      )
      dayEls.forEach((el) => {
        const dateHeader = el.querySelector('.sx__month-grid-day__header-date')
        if (!dateHeader) return

        // Schedule-X stocke la date dans un attribut ou on peut la déduire du texte
        const dayNum = parseInt(dateHeader.textContent ?? '', 10)
        if (isNaN(dayNum)) return

        // Dernier groupe de la grille : si les numéros sont petits (1-14), c'est le mois suivant
        // Premier groupe : si les numéros sont grands (15-31), c'est le mois précédent
        const allDayEls = Array.from(
          document.querySelectorAll('.sx__month-grid-day')
        )
        const idx = allDayEls.indexOf(el)
        const isLeading = idx < 7 && dayNum > 14
        const isTrailing = idx >= allDayEls.length - 14 && dayNum <= 14

        if (isLeading || isTrailing) {
          el.style.visibility = 'hidden'
        } else {
          el.style.visibility = ''
        }
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [viewMode, currentDate, schedules])

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
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
        <ScheduleXCalendar
          calendarApp={calendar}
          customComponents={{
            timeGridEvent: TimeGridEventWithAvatar,
          }}
        />
      </div>

      {/* Info drag & drop + Légende */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Message d'aide pour le drag & drop */}
        {canEdit && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <GripVertical className="h-4 w-4" />
            Glissez-déposez les plannings pour les déplacer. Redimensionnez-les
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

      {/* Popover de détail d'indisponibilité (SP-402) */}
      {selectedAvailability && (
        <AvailabilityPopover
          availability={selectedAvailability}
          open={availabilityPopoverOpen}
          onOpenChange={(open) => {
            setAvailabilityPopoverOpen(open)
            if (!open) {
              setSelectedAvailability(null)
            }
          }}
        >
          {/* Trigger invisible - le popover est déclenché par état */}
          <span />
        </AvailabilityPopover>
      )}
    </div>
  )
}
