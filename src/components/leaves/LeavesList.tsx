'use client'

import { useMemo } from 'react'
import type { LeaveRequest, UserRole } from '@prisma/client'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, X, CheckCircle, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LeaveTypeBadge } from './LeaveTypeBadge'
import { LeaveStatusBadge } from './LeaveStatusBadge'
import { Skeleton } from '@/components/ui/skeleton'

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

interface LeavesListProps {
  requests: LeaveRequestWithEmployee[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  onPaginationChange: (page: number, pageSize: number) => void
  currentUserRole: UserRole
  currentUserId: string
  onReview?: (request: LeaveRequestWithEmployee) => void
  onEdit?: (request: LeaveRequestWithEmployee) => void
  onCancel?: (request: LeaveRequestWithEmployee) => void
  onView?: (request: LeaveRequestWithEmployee) => void
  isLoading?: boolean
}

function createColumns(
  currentUserRole: UserRole,
  currentUserId: string,
  actions: {
    onView?: (r: LeaveRequestWithEmployee) => void
    onEdit?: (r: LeaveRequestWithEmployee) => void
    onCancel?: (r: LeaveRequestWithEmployee) => void
    onReview?: (r: LeaveRequestWithEmployee) => void
  }
): ColumnDef<LeaveRequestWithEmployee>[] {
  const canManage =
    currentUserRole === 'MANAGER' ||
    currentUserRole === 'DIRECTOR' ||
    currentUserRole === 'SYSTEM_ADMIN'

  return [
    {
      accessorKey: 'employee',
      header: 'Employé',
      cell: ({ row }) => {
        const emp = row.original.employee
        const initials =
          `${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}`.toUpperCase()
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {emp.user?.image && (
                <AvatarImage
                  src={emp.user.image}
                  alt={`${emp.firstName} ${emp.lastName}`}
                />
              )}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {emp.firstName} {emp.lastName}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <LeaveTypeBadge type={row.original.type} size="sm" />,
    },
    {
      accessorKey: 'startDate',
      header: 'Dates',
      cell: ({ row }) => {
        const start = new Date(row.original.startDate)
        const end = new Date(row.original.endDate)
        return (
          <span className="text-sm">
            {format(start, 'd MMM', { locale: fr })} –{' '}
            {format(end, 'd MMM yyyy', { locale: fr })}
          </span>
        )
      },
    },
    {
      accessorKey: 'days',
      header: 'Jours',
      cell: ({ row }) => {
        const { days, halfDay } = row.original
        return (
          <span>
            {days}
            {halfDay && ' ½'}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <LeaveStatusBadge status={row.original.status} size="sm" />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const request = row.original
        const isOwner = request.employee.id === currentUserId
        const isPending = request.status === 'PENDING'
        const isApproved = request.status === 'APPROVED'

        const showEdit = isOwner && isPending && actions.onEdit
        const showCancel =
          isOwner && (isPending || isApproved) && actions.onCancel
        const showReview = canManage && isPending && actions.onReview

        if (!showEdit && !showCancel && !showReview && !actions.onView) {
          return null
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.onView && (
                <DropdownMenuItem onClick={() => actions.onView!(request)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </DropdownMenuItem>
              )}
              {showEdit && (
                <DropdownMenuItem onClick={() => actions.onEdit!(request)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )}
              {showReview && (
                <DropdownMenuItem onClick={() => actions.onReview!(request)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Examiner
                </DropdownMenuItem>
              )}
              {showCancel && (
                <DropdownMenuItem onClick={() => actions.onCancel!(request)}>
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export function LeavesList({
  requests,
  pagination,
  onPaginationChange,
  currentUserRole,
  currentUserId,
  onReview,
  onEdit,
  onCancel,
  onView,
  isLoading = false,
}: LeavesListProps) {
  const columns = useMemo(
    () =>
      createColumns(currentUserRole, currentUserId, {
        onView,
        onEdit,
        onCancel,
        onReview,
      }),
    [currentUserRole, currentUserId, onView, onEdit, onCancel, onReview]
  )

  const table = useReactTable({
    data: requests,
    columns,
    pageCount: Math.ceil(pagination.total / pagination.pageSize),
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: pagination.page - 1,
          pageSize: pagination.pageSize,
        })
        onPaginationChange(newState.pageIndex + 1, newState.pageSize)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  const totalPages = Math.ceil(pagination.total / pagination.pageSize) || 1

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucune demande de congé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {pagination.page} sur {totalPages} ({pagination.total} résultat
          {pagination.total > 1 ? 's' : ''})
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
