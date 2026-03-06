/**
 * Contenu principal de la page Schedules
 *
 * @description Client Component avec navigation date, filtres et vue calendrier
 * Affiche les indisponibilités en overlay (SP-402)
 * @ticket SP-395, SP-402
 */

'use client'

import { useState, useTransition, useCallback, useEffect, useMemo } from 'react'
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { getSchedules, ScheduleWithRelations } from '@/lib/actions/schedules'
import {
  getAvailabilitiesForCalendar,
  type AvailabilityWithEmployee,
} from '@/lib/actions/availabilities'
import {
  getTeamsForSelect,
  getEmployeesForSelect,
} from '@/lib/actions/employees'
import {
  ScheduleCalendar,
  ShiftModal,
  ExportDropdown,
  WeeklyHoursPanel,
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
  format,
  addDays,
  addWeeks,
  addMonths,
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
  // États
  const [schedules, setSchedules] =
    useState<ScheduleWithRelations[]>(initialSchedules)
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

  // État pour les indisponibilités (SP-402)
  const [availabilities, setAvailabilities] = useState<
    AvailabilityWithEmployee[]
  >([])
  const [showAvailabilities, setShowAvailabilities] = useState(true)
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(false)

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

  // État pour le panneau heures semaine (SP-406)
  const [showHoursPanel, setShowHoursPanel] = useState(true)

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

  // Calcul des dates selon le mode de vue (stabilisé par timestamps)
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return {
          start: currentDate,
          end: currentDate,
          label: format(currentDate, 'EEEE d MMMM yyyy', { locale: fr }),
        }
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        return {
          start: weekStart,
          end: weekEnd,
          label: `${format(weekStart, 'd MMM', { locale: fr })} - ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`,
        }
      }
      case 'month': {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        return {
          start: monthStart,
          end: monthEnd,
          label: format(currentDate, 'MMMM yyyy', { locale: fr }),
        }
      }
    }
  }, [viewMode, currentDate])

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

  // Charger les indisponibilités au changement de période ou toggle
  // On utilise getTime() pour des dépendances primitives stables
  const rangeStartTime = dateRange.start.getTime()
  const rangeEndTime = dateRange.end.getTime()

  useEffect(() => {
    void loadAvailabilities(new Date(rangeStartTime), new Date(rangeEndTime))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStartTime, rangeEndTime, showAvailabilities, companyId])

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
        }
      })
    },
    []
  )

  // Navigation
  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      const offset = direction === 'prev' ? -1 : 1
      let newDate: Date

      switch (viewMode) {
        case 'day':
          newDate = addDays(currentDate, offset)
          break
        case 'week':
          newDate = addWeeks(currentDate, offset)
          break
        case 'month':
          newDate = addMonths(currentDate, offset)
          break
      }

      setCurrentDate(newDate)

      // Calculer les nouvelles dates et recharger
      const newRange = (() => {
        switch (viewMode) {
          case 'day':
            return { start: newDate, end: newDate }
          case 'week':
            return {
              start: startOfWeek(newDate, { weekStartsOn: 1 }),
              end: endOfWeek(newDate, { weekStartsOn: 1 }),
            }
          case 'month':
            return {
              start: startOfMonth(newDate),
              end: endOfMonth(newDate),
            }
        }
      })()

      void reloadSchedules(newRange.start, newRange.end, activeFilters)
    },
    [viewMode, currentDate, activeFilters, reloadSchedules]
  )

  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(today)

    const range = (() => {
      switch (viewMode) {
        case 'day':
          return { start: today, end: today }
        case 'week':
          return {
            start: startOfWeek(today, { weekStartsOn: 1 }),
            end: endOfWeek(today, { weekStartsOn: 1 }),
          }
        case 'month':
          return {
            start: startOfMonth(today),
            end: endOfMonth(today),
          }
      }
    })()

    void reloadSchedules(range.start, range.end, activeFilters)
  }, [viewMode, activeFilters, reloadSchedules])

  // Changement de mode de vue
  const handleViewModeChange = useCallback(
    (newMode: ViewMode) => {
      setViewMode(newMode)

      const range = (() => {
        switch (newMode) {
          case 'day':
            return { start: currentDate, end: currentDate }
          case 'week':
            return {
              start: startOfWeek(currentDate, { weekStartsOn: 1 }),
              end: endOfWeek(currentDate, { weekStartsOn: 1 }),
            }
          case 'month':
            return {
              start: startOfMonth(currentDate),
              end: endOfMonth(currentDate),
            }
        }
      })()

      void reloadSchedules(range.start, range.end, activeFilters)
    },
    [currentDate, activeFilters, reloadSchedules]
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

      {/* Navigation et contrôles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Navigation date */}
            <div className="flex items-center gap-2">
              <Button
                data-testid="nav-prev"
                variant="outline"
                size="icon"
                onClick={() => navigate('prev')}
                disabled={isPending}
                aria-label="Période précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                data-testid="nav-today"
                variant="outline"
                onClick={goToToday}
                className="min-w-[100px]"
                disabled={isPending}
              >
                Aujourd&apos;hui
              </Button>
              <Button
                data-testid="nav-next"
                variant="outline"
                size="icon"
                onClick={() => navigate('next')}
                disabled={isPending}
                aria-label="Période suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span
                className="ml-4 font-display text-lg font-semibold capitalize tracking-tight"
                data-testid="date-range-label"
              >
                {dateRange.label}
              </span>
            </div>

            {/* Contrôles de vue */}
            <div className="flex items-center gap-2">
              {/* Export PDF (SP-403) */}
              {canExport && (
                <ExportDropdown
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  viewMode={viewMode === 'day' ? 'week' : viewMode}
                  filters={activeFilters}
                />
              )}

              {/* Toggle indisponibilités (SP-402) */}
              <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 transition-shadow duration-150 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <Switch
                  id="show-availabilities"
                  data-testid="availability-toggle"
                  checked={showAvailabilities}
                  onCheckedChange={setShowAvailabilities}
                  aria-label="Afficher les indisponibilités"
                />
                <Label
                  htmlFor="show-availabilities"
                  className="flex cursor-pointer items-center gap-1.5 text-sm"
                >
                  {showAvailabilities ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Indispos</span>
                </Label>
              </div>

              {/* Toggle heures semaine (SP-406) */}
              <Button
                variant={showHoursPanel ? 'default' : 'outline'}
                size="sm"
                className="hidden items-center gap-1.5 md:flex"
                onClick={() => setShowHoursPanel((v) => !v)}
                aria-label="Afficher les heures semaine"
                data-testid="hours-panel-toggle"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden lg:inline">Heures</span>
              </Button>

              <Select
                value={viewMode}
                onValueChange={(value: ViewMode) => handleViewModeChange(value)}
              >
                <SelectTrigger
                  className="w-[130px]"
                  data-testid="view-mode-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Jour</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Filtres */}
        <CardContent className="border-t pt-4">
          <SchedulesFilters
            onFiltersChange={handleFiltersChange}
            teams={teams}
            employees={employees}
          />
        </CardContent>
      </Card>

      {/* Calendrier + Panneau heures (SP-406) */}
      <div className="flex gap-6">
        <Card className="min-w-0 flex-1">
          <CardContent className="pt-6">
            <ScheduleCalendar
              schedules={schedules}
              viewMode={viewMode}
              currentDate={currentDate}
              onScheduleClick={(schedule) => {
                if (canCreate) {
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
            />
          </CardContent>
        </Card>

        {/* Panneau heures desktop */}
        <div className="hidden md:block">
          <WeeklyHoursPanel
            schedules={schedules}
            employees={employees as EmployeeWithHours[]}
            isOpen={showHoursPanel}
            onToggle={() => setShowHoursPanel((v) => !v)}
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
              aria-label="Voir les heures semaine"
              data-testid="hours-panel-mobile-trigger"
            >
              <Clock className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Heures semaine
              </SheetTitle>
            </SheetHeader>
            <WeeklyHoursPanel
              schedules={schedules}
              employees={employees as EmployeeWithHours[]}
              isOpen={true}
              onToggle={() => {}}
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
        }}
        mode={shiftModalMode}
        schedule={selectedSchedule}
        companyId={companyId}
        onSuccess={() => {
          setIsShiftModalOpen(false)
          setSelectedSchedule(null)
          void reloadSchedules(
            new Date(rangeStartTime),
            new Date(rangeEndTime),
            activeFilters
          )
        }}
      />

    </div>
  )
}
