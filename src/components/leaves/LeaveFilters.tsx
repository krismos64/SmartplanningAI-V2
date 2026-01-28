'use client'

import { useState } from 'react'
import { LeaveType, LeaveRequestStatus, UserRole } from '@prisma/client'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS,
  type LeaveRequestFilters,
} from '@/lib/validations/leave'
import type { DateRange } from 'react-day-picker'

interface Employee {
  id: string
  firstName: string
  lastName: string
}

interface Team {
  id: string
  name: string
}

interface LeaveFiltersProps {
  filters: LeaveRequestFilters
  onFiltersChange: (filters: LeaveRequestFilters) => void
  currentUserRole: UserRole
  employees?: Employee[]
  teams?: Team[]
  className?: string
}

export function LeaveFilters({
  filters,
  onFiltersChange,
  currentUserRole,
  employees = [],
  teams = [],
  className,
}: LeaveFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.startDate && filters.endDate
      ? { from: filters.startDate, to: filters.endDate }
      : undefined
  )

  const canFilterByEmployee =
    currentUserRole === 'MANAGER' ||
    currentUserRole === 'DIRECTOR' ||
    currentUserRole === 'SYSTEM_ADMIN'

  const canFilterByTeam =
    currentUserRole === 'DIRECTOR' || currentUserRole === 'SYSTEM_ADMIN'

  const activeFiltersCount = [
    filters.status,
    filters.type,
    filters.employeeId,
    filters.teamId,
    filters.startDate,
  ].filter(Boolean).length

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as LeaveRequestStatus),
    })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as LeaveType),
    })
  }

  const handleEmployeeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      employeeId: value === 'all' ? undefined : value,
    })
  }

  const handleTeamChange = (value: string) => {
    onFiltersChange({
      ...filters,
      teamId: value === 'all' ? undefined : value,
    })
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    onFiltersChange({
      ...filters,
      startDate: range?.from,
      endDate: range?.to,
    })
  }

  const handleReset = () => {
    setDateRange(undefined)
    onFiltersChange({})
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-end gap-4">
        {/* Statut */}
        <div className="w-[160px]">
          <label className="mb-1.5 block text-sm font-medium">Statut</label>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(LEAVE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="w-[180px]">
          <label className="mb-1.5 block text-sm font-medium">Type</label>
          <Select
            value={filters.type ?? 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employé (MANAGER/DIRECTOR) */}
        {canFilterByEmployee && employees.length > 0 && (
          <div className="w-[200px]">
            <label className="mb-1.5 block text-sm font-medium">Employé</label>
            <Select
              value={filters.employeeId ?? 'all'}
              onValueChange={handleEmployeeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les employés</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Équipe (DIRECTOR) */}
        {canFilterByTeam && teams.length > 0 && (
          <div className="w-[180px]">
            <label className="mb-1.5 block text-sm font-medium">Équipe</label>
            <Select
              value={filters.teamId ?? 'all'}
              onValueChange={handleTeamChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
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
          </div>
        )}

        {/* Période */}
        <div className="w-[280px]">
          <label className="mb-1.5 block text-sm font-medium">Période</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange?.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd MMM', { locale: fr })} –{' '}
                      {format(dateRange.to, 'dd MMM yyyy', { locale: fr })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd MMM yyyy', { locale: fr })
                  )
                ) : (
                  'Sélectionner une période'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                locale={fr}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Reset */}
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            Réinitialiser
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  )
}
