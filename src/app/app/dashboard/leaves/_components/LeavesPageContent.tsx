/**
 * LeavesPageContent - Composant orchestrateur pour la page congés
 *
 * @description Gère l'état, les filtres, les tabs et les interactions
 * @ticket SP-413
 */

'use client'

import { useState, useCallback, useTransition, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { LeaveRequest, LeaveRequestStatus, UserRole } from '@prisma/client'

// UI Components
import { Button } from '@/components/ui/button'
import { ExportCsvButton } from '@/components/exports'
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
  const [calendarAbsences, setCalendarAbsences] = useState<
    LeaveRequestWithEmployee[]
  >([])
  const [calendarEmployees] = useState<Employee[]>(employees)

  // URL params for filters
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Impersonation guard
  const isImpersonating = useIsImpersonating()

  // Responsive
  const isMobile = useMediaQuery('(max-width: 1024px)')

  // Build filters from URL (memoized to avoid recreation on each render)
  const filters = useMemo<LeaveRequestFilters>(
    () => ({
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
    }),
    [searchParams]
  )

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

  // Handlers
  const handleFiltersChange = useCallback(
    (newFilters: LeaveRequestFilters) => {
      const params = new URLSearchParams()
      if (newFilters.status) params.set('status', newFilters.status)
      if (newFilters.type) params.set('type', newFilters.type)
      if (newFilters.employeeId) params.set('employee', newFilters.employeeId)
      if (newFilters.teamId) params.set('team', newFilters.teamId)
      if (newFilters.startDate)
        params.set('startDate', newFilters.startDate.toISOString())
      if (newFilters.endDate)
        params.set('endDate', newFilters.endDate.toISOString())

      router.push(`${pathname}?${params.toString()}`)

      // Update active status highlight
      setActiveStatus(newFilters.status || null)

      // Refetch with new filters, reset to page 1
      refetchData(newFilters, 1)
    },
    [pathname, router, refetchData]
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
    refetchData(filters)
  }, [filters, refetchData])

  const handleReviewSuccess = useCallback(() => {
    setReviewingRequest(null)
    refetchData(filters)
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
        // Fetch absences for calendar
        const firstTeamId = teams[0]?.id
        if (firstTeamId) {
          startTransition(async () => {
            const startOfMonth = new Date(
              calendarMonth.getFullYear(),
              calendarMonth.getMonth(),
              1
            )
            const endOfMonth = new Date(
              calendarMonth.getFullYear(),
              calendarMonth.getMonth() + 1,
              0
            )
            const result = await getTeamAbsences(
              firstTeamId,
              startOfMonth,
              endOfMonth
            )
            if (result.success) {
              setCalendarAbsences(result.data)
            }
          })
        }
      }
    },
    [calendarMonth, teams]
  )

  const handleMonthChange = useCallback(
    (month: Date) => {
      setCalendarMonth(month)
      const firstTeamId = teams[0]?.id
      if (firstTeamId) {
        startTransition(async () => {
          const startOfMonth = new Date(
            month.getFullYear(),
            month.getMonth(),
            1
          )
          const endOfMonth = new Date(
            month.getFullYear(),
            month.getMonth() + 1,
            0
          )
          const result = await getTeamAbsences(
            firstTeamId,
            startOfMonth,
            endOfMonth
          )
          if (result.success) {
            setCalendarAbsences(result.data)
          }
        })
      }
    },
    [teams]
  )

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Congés</h1>
          <p className="text-muted-foreground">
            {currentUser.role === 'EMPLOYEE'
              ? 'Gérez vos demandes de congés'
              : 'Gérez les demandes de congés de votre équipe'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton
            action={exportLeavesCsv}
            filters={{
              status: filters.status,
              type: filters.type,
              teamId: filters.teamId,
              startDate: filters.startDate?.toISOString(),
              endDate: filters.endDate?.toISOString(),
            }}
            label="Export CSV"
            variant="outline"
            size="sm"
          />
          {createButtonContent}
        </div>
      </div>

      {/* Stats Bar */}
      <LeaveStatsBar
        stats={stats}
        onStatClick={handleStatClick}
        activeStatus={activeStatus}
      />

      {/* Filters */}
      <LeaveFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        currentUserRole={currentUser.role}
        employees={employees}
        teams={teams}
      />

      {/* Tabs Liste / Calendrier */}
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
          {isMobile ? (
            <LeavesListMobile
              requests={requests}
              pagination={pagination}
              onLoadMore={handleLoadMore}
              currentUserRole={currentUser.role}
              currentUserId={currentUser.employeeId ?? ''}
              onReview={handleReviewMobile}
              onEdit={handleEditMobile}
              onCancel={handleCancelMobile}
              isLoading={isPending}
            />
          ) : (
            <LeavesList
              requests={requests}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              currentUserRole={currentUser.role}
              currentUserId={currentUser.employeeId ?? ''}
              onReview={handleReview}
              onEdit={handleEdit}
              onCancel={(request) => handleCancel(request)}
              isLoading={isPending}
            />
          )}
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
              employees={calendarEmployees}
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
    </div>
  )
}
