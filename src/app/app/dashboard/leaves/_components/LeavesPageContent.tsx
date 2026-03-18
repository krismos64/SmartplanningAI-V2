/**
 * LeavesPageContent - Composant orchestrateur pour la page congés
 *
 * @description Gère l'état, les filtres, les tabs et les interactions
 * @ticket SP-413
 */

'use client'

import { useState, useCallback, useTransition, useMemo } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import type { LeaveRequest, LeaveRequestStatus, UserRole } from '@prisma/client'

// UI Components
import { Button } from '@/components/ui/button'
import { ExportCsvButton, ExportPdfButton } from '@/components/exports'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Plus, List, Calendar } from 'lucide-react'

// Leaves Components
import {
  LeaveStatsBar,
  LeaveFilters,
  LeavesList,
  LeavesListMobile,
  LeaveCalendar,
  LeaveRequestForm,
  LeaveReviewDialog,
  LeaveManageDialog,
} from '@/components/leaves'

// Hooks
import { useMediaQuery } from '@/hooks/use-media-query'
import { useIsImpersonating } from '@/hooks'

// Actions
import {
  getLeaveRequests,
  getLeaveStats,
  getTeamAbsences,
  cancelLeaveRequest,
  exportLeavesCsv,
} from '@/lib/actions/leaves'

// Types
import type { LeaveRequestFilters } from '@/lib/validations/leave'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
    user?: {
      image: string | null
    } | null
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  image?: string | null
}

interface Team {
  id: string
  name: string
}

interface LeavesPageContentProps {
  initialRequests: LeaveRequestWithEmployee[]
  initialPagination: {
    page: number
    pageSize: number
    total: number
  }
  initialStats: {
    pending: number
    approved: number
    rejected: number
    cancelled: number
  }
  currentUser: {
    id: string
    role: UserRole
    companyId: string
    employeeId: string | null
  }
  employees: Employee[]
  teams: Team[]
}

export function LeavesPageContent({
  initialRequests,
  initialPagination,
  initialStats,
  currentUser,
  employees,
  teams,
}: LeavesPageContentProps) {
  // State
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRequest, setEditingRequest] =
    useState<LeaveRequestWithEmployee | null>(null)
  const [reviewingRequest, setReviewingRequest] =
    useState<LeaveRequestWithEmployee | null>(null)
  const [managingRequest, setManagingRequest] =
    useState<LeaveRequestWithEmployee | null>(null)
  const [requests, setRequests] =
    useState<LeaveRequestWithEmployee[]>(initialRequests)
  const [pagination, setPagination] = useState(initialPagination)
  const [stats, setStats] = useState(initialStats)
  const [activeStatus, setActiveStatus] = useState<LeaveRequestStatus | null>(
    null
  )
  const [isPending, startTransition] = useTransition()

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [calendarAbsencesRaw, setCalendarAbsencesRaw] = useState<
    LeaveRequestWithEmployee[]
  >([])
  const [calendarEmployees] = useState<Employee[]>(employees)

  // URL params for filters
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Impersonation guard
  const isImpersonating = useIsImpersonating()

  // Responsive
  const isMobile = useMediaQuery('(max-width: 1024px)')

  // Build initial filters from URL, then manage as local state
  const [filters, setFilters] = useState<LeaveRequestFilters>(() => ({
    status: (searchParams.get('status') as LeaveRequestStatus) || undefined,
    type: searchParams.get('type') as LeaveRequestFilters['type'],
    employeeId: searchParams.get('employee') || undefined,
    teamId: searchParams.get('team') || undefined,
    startDate: searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined,
    endDate: searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined,
  }))

  // Filtrage client des absences du calendrier (type, employé, période)
  const calendarAbsences = useMemo(() => {
    let filtered = calendarAbsencesRaw
    if (filters.type) {
      filtered = filtered.filter((a) => a.type === filters.type)
    }
    if (filters.employeeId) {
      filtered = filtered.filter((a) => a.employeeId === filters.employeeId)
    }
    if (filters.startDate) {
      filtered = filtered.filter(
        (a) => new Date(a.endDate) >= filters.startDate!
      )
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (a) => new Date(a.startDate) <= filters.endDate!
      )
    }
    return filtered
  }, [
    calendarAbsencesRaw,
    filters.type,
    filters.employeeId,
    filters.startDate,
    filters.endDate,
  ])

  // Filtrage des employés affichés dans le calendrier
  const filteredCalendarEmployees = useMemo(() => {
    if (filters.employeeId) {
      return calendarEmployees.filter((e) => e.id === filters.employeeId)
    }
    return calendarEmployees
  }, [calendarEmployees, filters.employeeId])

  // Refetch data helper
  const refetchData = useCallback(
    (
      newFilters?: LeaveRequestFilters,
      newPage?: number,
      newPageSize?: number
    ) => {
      startTransition(async () => {
        const [reqResult, statsResult] = await Promise.all([
          getLeaveRequests(newFilters, {
            page: newPage ?? pagination.page,
            pageSize: newPageSize ?? pagination.pageSize,
          }),
          getLeaveStats(),
        ])

        if (reqResult.success) {
          setRequests(reqResult.data.data)
          setPagination({
            page: reqResult.data.page,
            pageSize: reqResult.data.pageSize,
            total: reqResult.data.total,
          })
        }

        if (statsResult.success) {
          setStats({
            pending: statsResult.data.byStatus.PENDING ?? 0,
            approved: statsResult.data.byStatus.APPROVED ?? 0,
            rejected: statsResult.data.byStatus.REJECTED ?? 0,
            cancelled: statsResult.data.byStatus.CANCELLED ?? 0,
          })
        }
      })
    },
    [pagination.page, pagination.pageSize]
  )

  // Helper : charger les absences du calendrier pour un mois donné
  const fetchCalendarAbsences = useCallback(
    (targetMonth: Date, statusFilter?: LeaveRequestStatus) => {
      const firstTeamId = teams[0]?.id
      if (!firstTeamId) return
      startTransition(async () => {
        const startOfMonth = new Date(
          targetMonth.getFullYear(),
          targetMonth.getMonth(),
          1
        )
        const endOfMonth = new Date(
          targetMonth.getFullYear(),
          targetMonth.getMonth() + 1,
          0
        )
        const result = await getTeamAbsences(
          firstTeamId,
          startOfMonth,
          endOfMonth,
          statusFilter
        )
        if (result.success) {
          setCalendarAbsencesRaw(result.data)
        }
      })
    },
    [teams]
  )

  // Handlers
  const handleFiltersChange = useCallback(
    (newFilters: LeaveRequestFilters) => {
      // Update local state (source of truth for filters)
      setFilters(newFilters)

      // Sync URL for bookmarkability
      const params = new URLSearchParams()
      if (newFilters.status) params.set('status', newFilters.status)
      if (newFilters.type) params.set('type', newFilters.type)
      if (newFilters.employeeId) params.set('employee', newFilters.employeeId)
      if (newFilters.teamId) params.set('team', newFilters.teamId)
      if (newFilters.startDate)
        params.set('startDate', newFilters.startDate.toISOString())
      if (newFilters.endDate)
        params.set('endDate', newFilters.endDate.toISOString())
      const newUrl = `${pathname}${params.size > 0 ? `?${params.toString()}` : ''}`
      window.history.replaceState(null, '', newUrl)

      // Update active status highlight
      setActiveStatus(newFilters.status || null)

      // Refetch with new filters, reset to page 1
      refetchData(newFilters, 1)

      // Rafraîchir le calendrier si le filtre statut change et qu'on est sur le tab calendrier
      if (activeTab === 'calendar') {
        fetchCalendarAbsences(calendarMonth, newFilters.status)
      }
    },
    [pathname, refetchData, activeTab, calendarMonth, fetchCalendarAbsences]
  )

  const handleStatClick = useCallback(
    (status: LeaveRequestStatus) => {
      // Toggle: if clicking same status, clear filter
      if (activeStatus === status) {
        handleFiltersChange({ ...filters, status: undefined })
      } else {
        handleFiltersChange({ ...filters, status })
      }
    },
    [activeStatus, filters, handleFiltersChange]
  )

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      setPagination((prev) => ({ ...prev, page, pageSize }))
      refetchData(filters, page, pageSize)
    },
    [filters, refetchData]
  )

  const handleLoadMore = useCallback(() => {
    const nextPage = pagination.page + 1
    startTransition(async () => {
      const result = await getLeaveRequests(filters, {
        page: nextPage,
        pageSize: pagination.pageSize,
      })
      if (result.success) {
        setRequests((prev) => [...prev, ...result.data.data])
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
        }))
      }
    })
  }, [filters, pagination])

  const handleCreateSuccess = useCallback(() => {
    setIsCreateOpen(false)
    setEditingRequest(null)
    // Defer refetch to next microtask to avoid nested startTransition
    // (useCrudMutation's onSuccess runs inside its own startTransition)
    setTimeout(() => refetchData(filters), 0)
  }, [filters, refetchData])

  const handleReviewSuccess = useCallback(() => {
    setReviewingRequest(null)
    setTimeout(() => refetchData(filters), 0)
  }, [filters, refetchData])

  const handleEdit = useCallback((request: LeaveRequestWithEmployee) => {
    setEditingRequest(request)
    setIsCreateOpen(true)
  }, [])

  const handleEditMobile = useCallback(
    (id: string) => {
      const request = requests.find((r) => r.id === id)
      if (request) {
        setEditingRequest(request)
        setIsCreateOpen(true)
      }
    },
    [requests]
  )

  const handleReview = useCallback((request: LeaveRequestWithEmployee) => {
    setReviewingRequest(request)
  }, [])

  const handleReviewMobile = useCallback(
    (id: string) => {
      const request = requests.find((r) => r.id === id)
      if (request) {
        setReviewingRequest(request)
      }
    },
    [requests]
  )

  const handleManage = useCallback((request: LeaveRequestWithEmployee) => {
    setManagingRequest(request)
  }, [])

  const handleManageMobile = useCallback(
    (id: string) => {
      const request = requests.find((r) => r.id === id)
      if (request) {
        setManagingRequest(request)
      }
    },
    [requests]
  )

  const handleManageSuccess = useCallback(() => {
    setManagingRequest(null)
    setTimeout(() => refetchData(filters), 0)
  }, [filters, refetchData])

  const handleCancel = useCallback(
    (request: LeaveRequestWithEmployee) => {
      startTransition(async () => {
        const result = await cancelLeaveRequest(request.id)
        if (result.success) {
          refetchData(filters)
        }
      })
    },
    [filters, refetchData]
  )

  const handleCancelMobile = useCallback(
    (id: string) => {
      startTransition(async () => {
        const result = await cancelLeaveRequest(id)
        if (result.success) {
          refetchData(filters)
        }
      })
    },
    [filters, refetchData]
  )

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab as 'list' | 'calendar')
      if (tab === 'calendar') {
        fetchCalendarAbsences(calendarMonth, filters.status)
      }
    },
    [calendarMonth, filters.status, fetchCalendarAbsences]
  )

  const handleMonthChange = useCallback(
    (month: Date) => {
      setCalendarMonth(month)
      fetchCalendarAbsences(month, filters.status)
    },
    [filters.status, fetchCalendarAbsences]
  )

  // URL export PDF avec filtres
  const pdfExportUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.type) params.set('type', filters.type)
    if (filters.employeeId) params.set('employeeId', filters.employeeId)
    if (filters.teamId) params.set('teamId', filters.teamId)
    if (filters.startDate)
      params.set('startDate', filters.startDate.toISOString())
    if (filters.endDate) params.set('endDate', filters.endDate.toISOString())
    const qs = params.toString()
    return `/api/leaves/export/pdf${qs ? `?${qs}` : ''}`
  }, [filters])

  // Determine if user can create requests
  const canCreate = currentUser.employeeId !== null

  // Form default values for editing
  const formDefaultValues = editingRequest
    ? {
        type: editingRequest.type,
        startDate: new Date(editingRequest.startDate),
        endDate: new Date(editingRequest.endDate),
        halfDay: editingRequest.halfDay,
        halfDayPeriod: editingRequest.halfDayPeriod as 'AM' | 'PM' | undefined,
        reason: editingRequest.reason ?? undefined,
        employeeId: editingRequest.employeeId,
      }
    : undefined

  // Create button content
  const createButtonContent = (
    <Button
      onClick={() => setIsCreateOpen(true)}
      disabled={!canCreate || isImpersonating}
      title={isImpersonating ? 'Non disponible en mode support' : undefined}
      data-testid="create-leave-button"
    >
      <Plus className="mr-2 h-4 w-4" />
      Nouvelle demande
    </Button>
  )

  // Form content (used in both Dialog and Sheet)
  const formContent = currentUser.employeeId && (
    <LeaveRequestForm
      mode={editingRequest ? 'edit' : 'create'}
      requestId={editingRequest?.id}
      employeeId={currentUser.employeeId}
      defaultValues={formDefaultValues}
      onSuccess={handleCreateSuccess}
      onCancel={() => {
        setIsCreateOpen(false)
        setEditingRequest(null)
      }}
    />
  )

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Congés
          </h1>
          <p className="hidden text-muted-foreground sm:block">
            {currentUser.role === 'EMPLOYEE'
              ? 'Gérez vos demandes de congés'
              : 'Gérez les demandes de congés de votre équipe'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Exports */}
          {currentUser.role !== 'EMPLOYEE' && (
            <ExportCsvButton
              action={exportLeavesCsv}
              filters={{
                status: filters.status,
                type: filters.type,
                employeeId: filters.employeeId,
                teamId: filters.teamId,
                startDate: filters.startDate?.toISOString(),
                endDate: filters.endDate?.toISOString(),
              }}
              label="Export CSV"
              variant="outline"
              size="sm"
            />
          )}
          <ExportPdfButton
            href={pdfExportUrl}
            label="Export PDF"
            variant="outline"
            size="sm"
          />
          {/* Bouton nouvelle demande — visible sur desktop, FAB sur mobile */}
          <div className="hidden sm:block">{createButtonContent}</div>
        </div>
      </div>

      {/* Stats Bar — compacte sur mobile (juste En attente + Approuvés) */}
      <LeaveStatsBar
        stats={stats}
        onStatClick={handleStatClick}
        activeStatus={activeStatus}
      />

      {/* Filters — repliés sur mobile */}
      <div className="hidden md:block">
        <LeaveFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          currentUserRole={currentUser.role}
          employees={employees}
          teams={teams}
        />
      </div>
      <details className="md:hidden">
        <summary className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium">
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
        <div className="mt-2">
          <LeaveFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            currentUserRole={currentUser.role}
            employees={employees}
            teams={teams}
          />
        </div>
      </details>

      {/* Contenu principal */}
      {isMobile ? (
        /* Mobile : liste directe, pas de tabs */
        <LeavesListMobile
          requests={requests}
          pagination={pagination}
          onLoadMore={handleLoadMore}
          currentUserRole={currentUser.role}
          currentUserId={currentUser.employeeId ?? ''}
          onReview={handleReviewMobile}
          onEdit={handleEditMobile}
          onCancel={handleCancelMobile}
          onManage={handleManageMobile}
          isLoading={isPending}
        />
      ) : (
        /* Desktop : tabs Liste / Calendrier */
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendrier
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="list"
            className="mt-4"
            data-testid="leaves-list-tab"
          >
            <LeavesList
              requests={requests}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              currentUserRole={currentUser.role}
              currentUserId={currentUser.employeeId ?? ''}
              onReview={handleReview}
              onEdit={handleEdit}
              onCancel={(request) => handleCancel(request)}
              onManage={handleManage}
              isLoading={isPending}
            />
          </TabsContent>

          <TabsContent
            value="calendar"
            className="mt-4"
            data-testid="leaves-calendar-tab"
          >
            {teams.length > 0 ? (
              <LeaveCalendar
                month={calendarMonth}
                absences={calendarAbsences}
                employees={filteredCalendarEmployees}
                onMonthChange={handleMonthChange}
              />
            ) : (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">
                  Aucune équipe disponible pour afficher le calendrier
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create/Edit Dialog (Desktop) / Sheet (Mobile) */}
      {isMobile ? (
        <Sheet
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open)
            if (!open) setEditingRequest(null)
          }}
        >
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>
                {editingRequest ? 'Modifier la demande' : 'Nouvelle demande'}
              </SheetTitle>
            </SheetHeader>
            {formContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open)
            if (!open) setEditingRequest(null)
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRequest ? 'Modifier la demande' : 'Nouvelle demande'}
              </DialogTitle>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      )}

      {/* Review Dialog */}
      {reviewingRequest && (
        <LeaveReviewDialog
          open={!!reviewingRequest}
          onOpenChange={(open) => {
            if (!open) setReviewingRequest(null)
          }}
          request={reviewingRequest}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Manage Dialog (Modifier/Révoquer une demande approuvée) */}
      {managingRequest && (
        <LeaveManageDialog
          open={!!managingRequest}
          onOpenChange={(open) => {
            if (!open) setManagingRequest(null)
          }}
          request={managingRequest}
          onSuccess={handleManageSuccess}
        />
      )}

      {/* FAB Nouvelle demande — mobile uniquement */}
      {canCreate && isMobile && !isImpersonating && (
        <Button
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg sm:hidden"
          onClick={() => setIsCreateOpen(true)}
          aria-label="Nouvelle demande de congé"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
