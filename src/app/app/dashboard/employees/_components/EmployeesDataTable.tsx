/**
 * DataTable Employees avec pagination serveur et RBAC
 *
 * @description Client Component pour afficher la liste des employes
 * avec TanStack Table, pagination serveur, filtres et actions CRUD.
 * Adapte au RBAC : SYSTEM_ADMIN, DIRECTOR, MANAGER ont des acces differents.
 *
 * @ticket SP-152
 */

'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  PaginationState,
} from '@tanstack/react-table'
import { Plus, Users, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  createEmployeeColumns,
  EmployeeFilters,
  DeleteEmployeeDialog,
} from '@/components/admin/employees'
import {
  listEmployees,
  toggleEmployeeStatus,
  getTeamsForSelect,
} from '@/lib/actions/employees'
import type {
  EmployeeWithCounts,
  EmployeeFilters as EmployeeFiltersType,
} from '@/lib/validations/employee'

// ============================================================================
// Types
// ============================================================================

interface EmployeesDataTableProps {
  /** Role de l'utilisateur connecte */
  userRole: 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER'
}

// ============================================================================
// Composant
// ============================================================================

export function EmployeesDataTable({ userRole }: EmployeesDataTableProps) {
  const router = useRouter()

  // Etat local
  const [data, setData] = useState<EmployeeWithCounts[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<EmployeeFiltersType>({})
  const [deleteEmployee, setDeleteEmployee] =
    useState<EmployeeWithCounts | null>(null)
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])

  // Pagination TanStack
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Chargement des equipes pour les filtres
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const result = await getTeamsForSelect()
        if (result.success && result.data) {
          setTeams(result.data)
        }
      } catch (error) {
        console.error('Erreur chargement equipes:', error)
      }
    }
    void loadTeams()
  }, [])

  // Chargement des donnees
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await listEmployees(
        {
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          sortBy: 'lastName',
          sortOrder: 'asc',
        },
        filters
      )

      if (result.success && result.data) {
        setData(result.data.data)
        setTotalCount(result.data.total)
      }
    } catch (error) {
      console.error('Erreur chargement employees:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, filters])

  // Effet pour charger les donnees
  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // Handlers actions
  const handleView = useCallback(
    (employee: EmployeeWithCounts) => {
      router.push(`/app/dashboard/employees/${employee.id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (employee: EmployeeWithCounts) => {
      router.push(`/app/dashboard/employees/${employee.id}/edit`)
    },
    [router]
  )

  const handleDelete = useCallback((employee: EmployeeWithCounts) => {
    setDeleteEmployee(employee)
  }, [])

  const handleToggleStatus = useCallback(
    (employee: EmployeeWithCounts) => {
      void (async () => {
        try {
          await toggleEmployeeStatus(employee.id, !employee.isActive)
          await fetchData()
        } catch (error) {
          console.error('Erreur toggle status:', error)
        }
      })()
    },
    [fetchData]
  )

  // MANAGER ne peut pas supprimer, seulement desactiver
  const canDelete = userRole !== 'MANAGER'

  // Colonnes avec actions - wrap handlers to avoid promise issues
  const columns = useMemo(() => {
    return createEmployeeColumns({
      onView: handleView,
      onEdit: handleEdit,
      onDelete: canDelete ? handleDelete : undefined,
      onToggleStatus: handleToggleStatus,
      canDelete,
    })
  }, [handleView, handleEdit, handleDelete, handleToggleStatus, canDelete])

  // Configuration TanStack Table
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Employes</h1>
              <p className="text-sm text-muted-foreground">
                {totalCount} employe{totalCount > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchData()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Actualiser
            </Button>
            <Button asChild>
              <Link href="/app/dashboard/employees/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvel employe
              </Link>
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <EmployeeFilters
          filters={filters}
          onFiltersChange={setFilters}
          teams={teams}
          disabled={isLoading}
          showCompanyFilter={userRole === 'SYSTEM_ADMIN'}
        />

        {/* Table */}
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
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
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
                    Aucun employe trouve.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} sur{' '}
            {Math.ceil(totalCount / pagination.pageSize) || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              Precedent
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

      {/* Dialog suppression */}
      <DeleteEmployeeDialog
        employee={deleteEmployee}
        open={!!deleteEmployee}
        onOpenChange={(open) => !open && setDeleteEmployee(null)}
        onSuccess={() => void fetchData()}
      />
    </TooltipProvider>
  )
}
