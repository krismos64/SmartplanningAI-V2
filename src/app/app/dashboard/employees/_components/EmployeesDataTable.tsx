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
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
import { Plus, Users, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useIsImpersonating } from '@/hooks'
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
  BulkDeleteDialog,
  EmployeeCard,
} from '@/components/admin/employees'
import {
  listEmployees,
  toggleEmployeeStatus,
  getTeamsForSelect,
  exportEmployeesCsv,
} from '@/lib/actions/employees'
import { ExportCsvButton, ExportPdfButton } from '@/components/exports'
import { EmptyState } from '@/components/ui/empty-state'
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
  const isImpersonating = useIsImpersonating()

  // Etat local
  const [data, setData] = useState<EmployeeWithCounts[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<EmployeeFiltersType>({})
  const [deleteEmployee, setDeleteEmployee] =
    useState<EmployeeWithCounts | null>(null)
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [toggleEmployee, setToggleEmployee] =
    useState<EmployeeWithCounts | null>(null)

  // Pagination TanStack
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Tri serveur
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastName', desc: false },
  ])

  // Un filtre est-il actif ? distingue "aucun employe du tout" de
  // "aucun resultat pour cette recherche/ce filtre"
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  )

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
      const currentSort = sorting[0]
      const result = await listEmployees(
        {
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          sortBy: currentSort?.id || 'lastName',
          sortOrder: currentSort?.desc ? 'desc' : 'asc',
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
  }, [pagination.pageIndex, pagination.pageSize, sorting, filters])

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
      // DIRECTOR : dialog de confirmation avec mention prorata
      if (userRole === 'DIRECTOR') {
        setToggleEmployee(employee)
        return
      }
      // Autres rôles : toggle direct
      void (async () => {
        try {
          await toggleEmployeeStatus(employee.id, !employee.isActive)
          await fetchData()
        } catch (error) {
          console.error('Erreur toggle status:', error)
        }
      })()
    },
    [fetchData, userRole]
  )

  const confirmToggleStatus = useCallback(() => {
    if (!toggleEmployee) return
    const emp = toggleEmployee
    setToggleEmployee(null)
    void (async () => {
      try {
        await toggleEmployeeStatus(emp.id, !emp.isActive)
        await fetchData()
      } catch (error) {
        console.error('Erreur toggle status:', error)
      }
    })()
  }, [toggleEmployee, fetchData])

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
      isImpersonating,
    })
  }, [
    handleView,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    canDelete,
    isImpersonating,
  ])

  // URL export PDF avec filtres et tri
  const pdfExportUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.teamId) params.set('teamId', filters.teamId)
    if (filters.isActive !== undefined)
      params.set('isActive', String(filters.isActive))
    const currentSort = sorting[0]
    if (currentSort) {
      params.set('sortBy', currentSort.id)
      params.set('sortOrder', currentSort.desc ? 'desc' : 'asc')
    }
    const qs = params.toString()
    return `/api/employees/export/pdf${qs ? `?${qs}` : ''}`
  }, [filters, sorting])

  // Handler de tri : reset page à 0 quand on change le tri
  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting(updater)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    []
  )

  // Configuration TanStack Table
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      pagination,
      rowSelection,
      sorting,
    },
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
  })

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:flex">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                Employés
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {totalCount} employé{totalCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportPdfButton
              href={pdfExportUrl}
              label="Export PDF"
              variant="outline"
              size="sm"
            />
            <ExportCsvButton
              action={exportEmployeesCsv}
              filters={{
                teamId: filters.teamId,
                isActive: filters.isActive,
                search: filters.search,
                sortBy: sorting[0]?.id,
                sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
              }}
              label="Export CSV"
              variant="outline"
              size="sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchData()}
              disabled={isLoading}
              className="hidden sm:flex"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Actualiser
            </Button>
            {/* Bouton desktop — masqué sur mobile (FAB en bas) */}
            {isImpersonating ? (
              <Button disabled title="Non disponible en mode support">
                <Plus className="mr-2 h-4 w-4" />
                Nouvel employé
              </Button>
            ) : (
              <Button asChild>
                <Link href="/app/dashboard/employees/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvel employé
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Filtres — un seul composant, dans un details replié sur mobile */}
        <details open className="group">
          <summary className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium md:hidden">
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
          <div className="mt-2 md:mt-0">
            <EmployeeFilters
              filters={filters}
              onFiltersChange={setFilters}
              teams={teams}
              disabled={isLoading}
              showCompanyFilter={userRole === 'SYSTEM_ADMIN'}
            />
          </div>
        </details>

        {/* Barre d'actions bulk */}
        {canDelete && Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2">
            <span className="text-sm font-medium">
              {Object.keys(rowSelection).length} employé
              {Object.keys(rowSelection).length > 1 ? 's' : ''} sélectionné
              {Object.keys(rowSelection).length > 1 ? 's' : ''}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer la selection
            </Button>
          </div>
        )}

        {/* Table desktop */}
        <div className="hidden rounded-md border md:block">
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
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState
                      variant={hasActiveFilters ? 'search' : 'default'}
                      size="sm"
                      title={
                        hasActiveFilters
                          ? 'Aucun employé ne correspond'
                          : 'Aucun employé pour le moment'
                      }
                      description={
                        hasActiveFilters
                          ? 'Essayez de modifier vos filtres ou votre recherche'
                          : 'Ajoutez votre premier employé pour commencer à construire vos équipes et plannings'
                      }
                      action={
                        !hasActiveFilters && !isImpersonating
                          ? {
                              label: 'Ajouter un employé',
                              onClick: () =>
                                router.push('/app/dashboard/employees/new'),
                            }
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards mobile — tap = voir détail */}
        <div className="space-y-2 md:hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : data.length > 0 ? (
            data.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onView={() => handleView(employee)}
              />
            ))
          ) : (
            <EmptyState
              variant={hasActiveFilters ? 'search' : 'default'}
              size="sm"
              title={
                hasActiveFilters
                  ? 'Aucun employé ne correspond'
                  : 'Aucun employé pour le moment'
              }
              description={
                hasActiveFilters
                  ? 'Essayez de modifier vos filtres ou votre recherche'
                  : 'Ajoutez votre premier employé pour commencer à construire vos équipes et plannings'
              }
              action={
                !hasActiveFilters && !isImpersonating
                  ? {
                      label: 'Ajouter un employé',
                      onClick: () => router.push('/app/dashboard/employees/new'),
                    }
                  : undefined
              }
            />
          )}
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

      {/* Dialog suppression individuelle */}
      <DeleteEmployeeDialog
        employee={deleteEmployee}
        open={!!deleteEmployee}
        onOpenChange={(open) => !open && setDeleteEmployee(null)}
        userRole={userRole}
        onSuccess={() => void fetchData()}
      />

      {/* Dialog confirmation toggle status — DIRECTOR uniquement */}
      <AlertDialog
        open={!!toggleEmployee}
        onOpenChange={(open) => !open && setToggleEmployee(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleEmployee?.isActive
                ? "Désactiver l'employé ?"
                : "Réactiver l'employé ?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  {toggleEmployee?.isActive ? (
                    <>
                      <span className="font-semibold text-foreground">
                        {toggleEmployee?.firstName} {toggleEmployee?.lastName}
                      </span>{' '}
                      ne sera plus inclus dans les plannings.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">
                        {toggleEmployee?.firstName} {toggleEmployee?.lastName}
                      </span>{' '}
                      sera de nouveau actif dans les plannings.
                    </>
                  )}
                </p>
                <div className="rounded-md bg-blue-500/10 p-3 text-sm text-blue-700 dark:text-blue-300">
                  {toggleEmployee?.isActive
                    ? 'La facturation sera ajustée au prorata \u2014 un crédit sera appliqué sur votre prochaine facture.'
                    : 'Cet employé sera facturé 2,90 \u20ac/mois au prorata des jours restants ce mois-ci.'}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleStatus}
              data-testid="confirm-toggle-status-btn"
            >
              {toggleEmployee?.isActive ? 'Désactiver' : 'Réactiver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog suppression en masse */}
      <BulkDeleteDialog
        selectedCount={Object.keys(rowSelection).length}
        selectedIds={Object.keys(rowSelection)
          .map((idx) => data[Number(idx)]?.id)
          .filter((id): id is string => !!id)}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onSuccess={() => {
          setRowSelection({})
          void fetchData()
        }}
      />

      {/* FAB Nouvel employé — mobile uniquement */}
      {!isImpersonating && (
        <Link
          href="/app/dashboard/employees/new"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 sm:hidden"
          aria-label="Nouvel employé"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </TooltipProvider>
  )
}
