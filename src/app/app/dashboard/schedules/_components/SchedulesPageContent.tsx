/**
 * Contenu principal de la page Schedules
 *
 * @description Client Component avec navigation date, filtres et vue calendrier
 * @ticket SP-395
 */

'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  CalendarDays,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
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
import { getSchedules, ScheduleWithRelations } from '@/lib/actions/schedules'
import { ScheduleCalendar } from '@/components/schedules'
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
  initialTotal: number
  userRole: 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'
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
  initialTotal,
  userRole,
  // Dates initiales disponibles pour usage futur si nécessaire
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialStartDate: _initialStartDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialEndDate: _initialEndDate,
}: SchedulesPageContentProps) {
  // États
  const [schedules, setSchedules] =
    useState<ScheduleWithRelations[]>(initialSchedules)
  const [totalCount, setTotalCount] = useState(initialTotal)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>(
    {}
  )

  // Permissions RBAC
  const canCreate = userRole === 'DIRECTOR' || userRole === 'MANAGER'

  // Calcul des dates selon le mode de vue
  const getDateRange = useCallback(() => {
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

  const dateRange = getDateRange()

  // Rechargement des données
  const reloadSchedules = useCallback(
    (start: Date, end: Date, filters: Record<string, unknown> = {}) => {
      startTransition(async () => {
        const result = await getSchedules({
          startDate: start,
          endDate: end,
          limit: 100,
          ...filters,
        })

        if (result.success && result.data) {
          setSchedules(result.data.schedules)
          setTotalCount(result.data.total)
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
      void reloadSchedules(dateRange.start, dateRange.end, filters)
    },
    [dateRange.start, dateRange.end, reloadSchedules]
  )

  // Calculs pour les stats
  const uniqueEmployees = new Set(schedules.map((s) => s.employeeId)).size
  const confirmedCount = schedules.filter(
    (s) => s.status === 'CONFIRMED'
  ).length
  const draftCount = schedules.filter((s) => s.status === 'DRAFT').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plannings</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les horaires de travail de vos équipes
            </p>
          </div>
        </div>
        {canCreate && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau shift
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
                variant="outline"
                size="icon"
                onClick={() => navigate('prev')}
                disabled={isPending}
                aria-label="Période précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={goToToday}
                className="min-w-[100px]"
                disabled={isPending}
              >
                Aujourd&apos;hui
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('next')}
                disabled={isPending}
                aria-label="Période suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="ml-4 text-lg font-medium capitalize">
                {dateRange.label}
              </span>
            </div>

            {/* Contrôles de vue */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtres
                {Object.keys(activeFilters).length > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {Object.keys(activeFilters).length}
                  </span>
                )}
              </Button>
              <Select
                value={viewMode}
                onValueChange={(value: ViewMode) => handleViewModeChange(value)}
              >
                <SelectTrigger className="w-[130px]">
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

        {/* Filtres (collapsible) */}
        {isFiltersOpen && (
          <CardContent className="border-t pt-4">
            <SchedulesFilters onFiltersChange={handleFiltersChange} />
          </CardContent>
        )}
      </Card>

      {/* Calendrier des schedules (responsive) */}
      <Card>
        <CardContent className="pt-6">
          <ScheduleCalendar
            schedules={schedules}
            viewMode={viewMode}
            currentDate={currentDate}
            onScheduleClick={(_schedule) => {
              // TODO SP-397: Ouvrir modal d'édition
            }}
            onScheduleUpdate={(_id, _startDate, _endDate) => {
              // TODO SP-397: Appeler updateSchedule via Server Action
            }}
            isLoading={isPending}
            canEdit={canCreate}
          />
        </CardContent>
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-sm text-muted-foreground">
              Shifts cette période
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{uniqueEmployees}</div>
            <p className="text-sm text-muted-foreground">Employés planifiés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {confirmedCount}
            </div>
            <p className="text-sm text-muted-foreground">Shifts confirmés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {draftCount}
            </div>
            <p className="text-sm text-muted-foreground">Brouillons</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
