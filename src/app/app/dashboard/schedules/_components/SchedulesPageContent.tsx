/**
 * Contenu principal de la page Schedules
 *
 * @description Client Component avec navigation date, filtres et vue calendrier
 * Affiche les indisponibilités en overlay (SP-402)
 * @ticket SP-395, SP-402
 */

'use client'

import { useState, useTransition, useCallback, useEffect, useMemo } from 'react'
import { CalendarDays, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/toast/use-toast'
import {
  getSchedules,
  getScheduleById,
  deleteSchedule,
  deleteRecurrenceGroup,
  updateRecurrenceGroup,
  type ScheduleWithRelations,
} from '@/lib/actions/schedules'
import {
  getAvailabilitiesForCalendar,
  type AvailabilityWithEmployee,
} from '@/lib/actions/availabilities'
import {
  getTeamAbsences,
  type LeaveRequestWithEmployee,
} from '@/lib/actions/leaves'
import {
  getTeamsForSelect,
  getEmployeesForSelect,
} from '@/lib/actions/employees'
import {
  ScheduleCalendar,
  ShiftModal,
  ExportDropdown,
  WeeklyHoursPanel,
  RecurrenceEditDialog,
  type RecurrenceEditScope,
} from '@/components/schedules'
import type { EmployeeWithHours } from '@/components/schedules'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SchedulesFilters } from './SchedulesFilters'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { scheduleTypeLabels } from '@/lib/validations/schedule'
import type { ScheduleType } from '@prisma/client'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { fr } from 'date-fns/locale'

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'day' | 'week' | 'month'

interface SchedulesPageContentProps {
  initialSchedules: ScheduleWithRelations[]
  userRole: 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'
  /** ID de l'entreprise pour création de créneaux */
  companyId: string
  /** Date de début de la période initiale (pour référence) */
  initialStartDate?: Date
  /** Date de fin de la période initiale (pour référence) */
  initialEndDate?: Date
}

// ============================================================================
// Composant
// ============================================================================

export function SchedulesPageContent({
  initialSchedules,
  userRole,
  companyId,
  // Dates initiales disponibles pour usage futur si nécessaire
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialStartDate: _initialStartDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialEndDate: _initialEndDate,
}: SchedulesPageContentProps) {
  const toast = useToast()

  // États
  const [schedules, setSchedules] =
    useState<ScheduleWithRelations[]>(initialSchedules)
  const [calendarVersion, setCalendarVersion] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isPending, startTransition] = useTransition()
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>(
    {}
  )

  // État pour le modal ShiftModal
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleWithRelations | null>(null)
  const [shiftModalMode, setShiftModalMode] = useState<'create' | 'edit'>(
    'create'
  )

  // État pour le dialog de détail (lecture seule EMPLOYEE)
  const [detailSchedule, setDetailSchedule] =
    useState<ScheduleWithRelations | null>(null)

  // État pour le dialog récurrence (choix single/all)
  const [recurrenceSchedule, setRecurrenceSchedule] =
    useState<ScheduleWithRelations | null>(null)
  const [recurrenceAction, setRecurrenceAction] = useState<'edit' | 'delete'>(
    'edit'
  )
  const [isRecurrenceDialogOpen, setIsRecurrenceDialogOpen] = useState(false)
  const [isRecurrenceDeleting, setIsRecurrenceDeleting] = useState(false)
  // Si true, le prochain submit du ShiftModal appliquera les changements à toute la récurrence
  const [editRecurrenceGroupId, setEditRecurrenceGroupId] = useState<
    string | null
  >(null)

  // État pour les indisponibilités (SP-402)
  const [availabilities, setAvailabilities] = useState<
    AvailabilityWithEmployee[]
  >([])
  const [showAvailabilities] = useState(false)
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(false)

  // État pour les congés approuvés (overlay jour/mois)
  const [leaveRequests, setLeaveRequests] = useState<
    LeaveRequestWithEmployee[]
  >([])

  // État pour les équipes (filtre)
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])

  // État pour les employés (filtre + heures)
  const [employees, setEmployees] = useState<
    {
      id: string
      firstName: string
      lastName: string
      weeklyHours: number
      image?: string | null
    }[]
  >([])

  // Panneau heures toujours visible
  const showHoursPanel = true

  // Chargement des équipes et employés au mount
  useEffect(() => {
    void getTeamsForSelect().then((result) => {
      if (result.success && result.data) {
        setTeams(result.data)
      }
    })
    void getEmployeesForSelect().then((result) => {
      if (result.success && result.data) {
        setEmployees(result.data)
      }
    })
  }, [])

  // Permissions RBAC
  const canCreate = userRole === 'DIRECTOR' || userRole === 'MANAGER'
  const canExport = userRole !== 'SYSTEM_ADMIN'

  // Calcul des dates selon le mode de vue
  // Protéger contre une date invalide (ex: parsing Schedule-X)
  const safeDate = useMemo(
    () => (isNaN(currentDate.getTime()) ? new Date() : currentDate),
    [currentDate]
  )

  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return {
          start: startOfDay(safeDate),
          end: endOfDay(safeDate),
          label: format(safeDate, 'EEEE d MMMM yyyy', { locale: fr }),
        }
      case 'week': {
        const weekStart = startOfWeek(safeDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(safeDate, { weekStartsOn: 1 })
        return {
          start: weekStart,
          end: weekEnd,
          label: `${format(weekStart, 'd MMM', { locale: fr })} - ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`,
        }
      }
      case 'month': {
        const monthStart = startOfMonth(safeDate)
        const monthEnd = endOfMonth(safeDate)
        return {
          start: monthStart,
          end: monthEnd,
          label: format(safeDate, 'MMMM yyyy', { locale: fr }),
        }
      }
    }
  }, [viewMode, safeDate])

  // Chargement des indisponibilités (SP-402)
  const loadAvailabilities = useCallback(
    async (start: Date, end: Date) => {
      if (!showAvailabilities) {
        setAvailabilities([])
        return
      }

      setIsLoadingAvailabilities(true)
      try {
        const result = await getAvailabilitiesForCalendar(companyId, start, end)

        if (result.success && result.data) {
          setAvailabilities(result.data)
        } else {
          setAvailabilities([])
        }
      } catch (error) {
        console.error(
          '[SchedulesPageContent] Error loading availabilities:',
          error
        )
        setAvailabilities([])
      } finally {
        setIsLoadingAvailabilities(false)
      }
    },
    [companyId, showAvailabilities]
  )

  // Charger les congés approuvés pour overlay jour/mois
  const loadLeaveRequests = useCallback(
    async (start: Date, end: Date) => {
      if (teams.length === 0) return
      try {
        const results = await Promise.all(
          teams.map((t) => getTeamAbsences(t.id, start, end))
        )
        const allLeaves = results.flatMap((r) =>
          r.success ? r.data : []
        )
        setLeaveRequests(allLeaves)
      } catch {
        setLeaveRequests([])
      }
    },
    [teams]
  )

  // Charger les indisponibilités et congés au changement de période
  // On utilise getTime() pour des dépendances primitives stables
  const rangeStartTime = dateRange.start.getTime()
  const rangeEndTime = dateRange.end.getTime()

  useEffect(() => {
    void loadAvailabilities(new Date(rangeStartTime), new Date(rangeEndTime))
    void loadLeaveRequests(new Date(rangeStartTime), new Date(rangeEndTime))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStartTime, rangeEndTime, showAvailabilities, companyId, teams])

  // Rechargement des données
  const reloadSchedules = useCallback(
    (start: Date, end: Date, filters: Record<string, unknown> = {}) => {
      startTransition(async () => {
        const result = await getSchedules({
          startDate: start,
          endDate: end,
          limit: 500,
          ...filters,
        })

        if (result.success && result.data) {
          setSchedules(result.data.schedules)
          setCalendarVersion((v) => v + 1)
        }
      })
    },
    []
  )

  // Callback quand Schedule-X change de période (navigation interne)
  const handleRangeChange = useCallback(
    (start: Date, end: Date) => {
      // Déduire le viewMode depuis la durée du range
      const diffDays = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays <= 1) {
        setViewMode('day')
        setCurrentDate(start)
      } else if (diffDays <= 7) {
        setViewMode('week')
        setCurrentDate(start)
      } else {
        // Vue mois : le range commence au lundi de la première semaine visible
        // (ex: 23 fév pour mars). On prend le milieu du range pour cibler le bon mois.
        setViewMode('month')
        const mid = new Date(
          start.getTime() + (end.getTime() - start.getTime()) / 2
        )
        setCurrentDate(mid)
      }

      void reloadSchedules(start, end, activeFilters)
    },
    [activeFilters, reloadSchedules]
  )

  // Gestion des filtres
  const handleFiltersChange = useCallback(
    (filters: Record<string, unknown>) => {
      setActiveFilters(filters)
      void reloadSchedules(
        new Date(rangeStartTime),
        new Date(rangeEndTime),
        filters
      )
    },
    [rangeStartTime, rangeEndTime, reloadSchedules]
  )

  // Callback pour les mises à jour drag & drop
  const handleScheduleUpdate = useCallback(
    (_scheduleId: string, _startDate: Date, _endDate: Date) => {
      // Rafraîchir les données après une mise à jour réussie via drag & drop
      void reloadSchedules(
        new Date(rangeStartTime),
        new Date(rangeEndTime),
        activeFilters
      )
    },
    [rangeStartTime, rangeEndTime, activeFilters, reloadSchedules]
  )

  // Handler récurrence : choix single/all
  const handleRecurrenceConfirm = async (scope: RecurrenceEditScope) => {
    if (!recurrenceSchedule) return

    if (recurrenceAction === 'edit') {
      setIsRecurrenceDialogOpen(false)
      setShiftModalMode('edit')
      setSelectedSchedule(recurrenceSchedule)
      if (scope === 'single') {
        setEditRecurrenceGroupId(null)
      } else {
        setEditRecurrenceGroupId(recurrenceSchedule.recurrenceGroupId)
      }
      setIsShiftModalOpen(true)
    } else {
      // Suppression
      setIsRecurrenceDeleting(true)
      try {
        if (scope === 'single') {
          const result = await deleteSchedule(recurrenceSchedule.id)
          if (result.success) {
            toast.success('Créneau supprimé')
          } else {
            toast.error(result.error ?? 'Erreur')
          }
        } else {
          const result = await deleteRecurrenceGroup(
            recurrenceSchedule.recurrenceGroupId!
          )
          if (result.success) {
            toast.success(`${result.data.deletedCount} créneaux supprimés`)
          } else {
            toast.error(result.error ?? 'Erreur')
          }
        }
        setIsRecurrenceDialogOpen(false)
        setRecurrenceSchedule(null)
        void reloadSchedules(
          new Date(rangeStartTime),
          new Date(rangeEndTime),
          activeFilters
        )
      } catch {
        toast.error('Erreur inattendue')
      } finally {
        setIsRecurrenceDeleting(false)
      }
    }
  }

  // Compter les créneaux de la récurrence
  const recurrenceCounts = useMemo(() => {
    if (!recurrenceSchedule?.recurrenceGroupId) {
      return { single: 1, future: 0, all: 0 }
    }
    const groupId = recurrenceSchedule.recurrenceGroupId
    const allInGroup = schedules.filter((s) => s.recurrenceGroupId === groupId)
    const futureInGroup = allInGroup.filter(
      (s) =>
        new Date(s.startDate) >= new Date(recurrenceSchedule.startDate) &&
        s.id !== recurrenceSchedule.id
    )
    return {
      single: 1,
      future: futureInGroup.length + 1,
      all: allInGroup.length,
    }
  }, [recurrenceSchedule, schedules])

  return (
    <div className="space-y-6" data-testid="schedules-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="sp-icon-orb rounded-xl bg-primary/10 p-2.5">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1
              className="sp-page-title font-display text-2xl font-bold tracking-tight"
              data-testid="schedules-title"
            >
              Plannings
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez les horaires de travail de vos équipes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Sélecteur de vue */}
          <div className="hidden items-center rounded-lg border p-0.5 sm:flex">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode)
                  const range = (() => {
                    switch (mode) {
                      case 'day':
                        return {
                          start: startOfDay(safeDate),
                          end: endOfDay(safeDate),
                        }
                      case 'week':
                        return {
                          start: startOfWeek(safeDate, { weekStartsOn: 1 }),
                          end: endOfWeek(safeDate, { weekStartsOn: 1 }),
                        }
                      case 'month':
                        return {
                          start: startOfMonth(safeDate),
                          end: endOfMonth(safeDate),
                        }
                    }
                  })()
                  void reloadSchedules(range.start, range.end, activeFilters)
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          {canExport && (
            <ExportDropdown
              startDate={dateRange.start}
              endDate={dateRange.end}
              viewMode={viewMode === 'day' ? 'week' : viewMode}
              filters={activeFilters}
              allowedFormats={userRole === 'EMPLOYEE' ? ['pdf'] : undefined}
            />
          )}
          {canCreate && (
            <Button
              data-testid="new-shift-button"
              className="sp-btn-glow"
              onClick={() => {
                setShiftModalMode('create')
                setSelectedSchedule(null)
                setIsShiftModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau planning
            </Button>
          )}
        </div>
      </div>

      {/* Filtres — un seul composant, replié sur mobile */}
      <details open className="group">
        <summary className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtres
        </summary>
        <Card className="mt-2 md:mt-0">
          <CardContent className="pt-4">
            <SchedulesFilters
              onFiltersChange={handleFiltersChange}
              teams={teams}
              employees={employees}
              showStatusFilter={userRole !== 'EMPLOYEE'}
            />
          </CardContent>
        </Card>
      </details>

      {/* Calendrier + Panneau heures (SP-406) */}
      <div className="flex gap-6">
        <Card className="min-w-0 flex-1">
          <CardContent className="pt-6">
            <ScheduleCalendar
              key={calendarVersion}
              schedules={schedules}
              viewMode={viewMode}
              currentDate={currentDate}
              onScheduleClick={(schedule) => {
                if (!canCreate) {
                  setDetailSchedule(schedule)
                  return
                }
                // Si créneau récurrent → afficher le dialog de choix
                if (schedule.isRecurring && schedule.recurrenceGroupId) {
                  setRecurrenceSchedule(schedule)
                  setRecurrenceAction('edit')
                  setIsRecurrenceDialogOpen(true)
                } else {
                  setShiftModalMode('edit')
                  setSelectedSchedule(schedule)
                  setIsShiftModalOpen(true)
                }
              }}
              onScheduleUpdate={handleScheduleUpdate}
              isLoading={isPending || isLoadingAvailabilities}
              canEdit={canCreate}
              availabilities={availabilities}
              showAvailabilities={showAvailabilities}
              onRangeChange={handleRangeChange}
              teamIds={teams.map((t) => t.id)}
              companyId={companyId}
              leaveRequests={leaveRequests}
              showLeaves={true}
            />
          </CardContent>
        </Card>

        {/* Panneau heures desktop */}
        <div className="hidden md:block">
          <WeeklyHoursPanel
            schedules={schedules}
            employees={employees as EmployeeWithHours[]}
            isOpen={showHoursPanel}
            viewMode={viewMode}
            onToggle={() => {}}
          />
        </div>
      </div>

      {/* Bouton flottant mobile + Sheet (SP-406) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
              aria-label="Voir les heures"
              data-testid="hours-panel-mobile-trigger"
            >
              <Clock className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {viewMode === 'day'
                  ? 'Heures jour'
                  : viewMode === 'month'
                    ? 'Heures mois'
                    : 'Heures semaine'}
              </SheetTitle>
            </SheetHeader>
            <WeeklyHoursPanel
              schedules={schedules}
              employees={employees as EmployeeWithHours[]}
              isOpen={true}
              onToggle={() => {}}
              viewMode={viewMode}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Modal création/édition de créneau */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => {
          setIsShiftModalOpen(false)
          setSelectedSchedule(null)
          setEditRecurrenceGroupId(null)
        }}
        mode={shiftModalMode}
        schedule={selectedSchedule}
        companyId={companyId}
        onSuccess={() => {
          void (async () => {
            // Si édition récurrence "all" : appliquer les changements à toute la série
            if (editRecurrenceGroupId && selectedSchedule) {
              // Relire le schedule mis à jour par son ID
              const result = await getScheduleById(selectedSchedule.id)

              if (result.success && result.data) {
                const updated = result.data
                const updateResult = await updateRecurrenceGroup(
                  editRecurrenceGroupId,
                  {
                    startTime: updated.startTime,
                    endTime: updated.endTime,
                    type: updated.type,
                    status: updated.status,
                    title: updated.title,
                    description: updated.description,
                    location: updated.location,
                  }
                )
                if (updateResult.success) {
                  toast.success(
                    `${updateResult.data.updatedCount} créneaux mis à jour`
                  )
                } else {
                  toast.error(
                    updateResult.error ?? 'Erreur mise à jour récurrence'
                  )
                }
              }
            }

            setIsShiftModalOpen(false)
            setSelectedSchedule(null)
            setEditRecurrenceGroupId(null)
            void reloadSchedules(
              new Date(rangeStartTime),
              new Date(rangeEndTime),
              activeFilters
            )
          })()
        }}
      />

      {/* Dialog choix récurrence (modifier/supprimer single/all) */}
      <RecurrenceEditDialog
        isOpen={isRecurrenceDialogOpen}
        onClose={() => {
          setIsRecurrenceDialogOpen(false)
          setRecurrenceSchedule(null)
          setRecurrenceAction('edit')
        }}
        onConfirm={(scope) => void handleRecurrenceConfirm(scope)}
        action={recurrenceAction}
        counts={recurrenceCounts}
        isLoading={isRecurrenceDeleting}
        onActionChange={setRecurrenceAction}
      />

      {/* Dialog détail planning (lecture seule pour EMPLOYEE) */}
      <Dialog
        open={!!detailSchedule}
        onOpenChange={(open) => !open && setDetailSchedule(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Détail du planning
            </DialogTitle>
          </DialogHeader>
          {detailSchedule && (
            <div className="space-y-4">
              {/* Employé */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Employé
                </p>
                <p className="text-base font-semibold">
                  {detailSchedule.employee.firstName}{' '}
                  {detailSchedule.employee.lastName}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date
                </p>
                <p className="text-base">
                  {format(
                    new Date(detailSchedule.startDate),
                    'EEEE d MMMM yyyy',
                    { locale: fr }
                  )}
                </p>
              </div>

              {/* Horaires */}
              <div className="flex gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Début
                  </p>
                  <p className="text-lg font-semibold">
                    {detailSchedule.startTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fin
                  </p>
                  <p className="text-lg font-semibold">
                    {detailSchedule.endTime}
                  </p>
                </div>
              </div>

              {/* Type */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p className="text-base">
                  {scheduleTypeLabels[detailSchedule.type as ScheduleType] ??
                    detailSchedule.type}
                </p>
              </div>

              {/* Titre (si présent) */}
              {detailSchedule.title && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Titre
                  </p>
                  <p className="text-base">{detailSchedule.title}</p>
                </div>
              )}

              {/* Lieu (si présent) */}
              {detailSchedule.location && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lieu
                  </p>
                  <p className="text-base">{detailSchedule.location}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
