/**
 * DataTable Companies avec pagination serveur
 *
 * @description Client Component pour afficher la liste des entreprises
 * avec TanStack Table, pagination serveur, filtres et actions CRUD.
 *
 * @ticket SP-151
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
import { Plus, Building2, RefreshCw } from 'lucide-react'
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
  createCompanyColumns,
  CompanyFilters,
  DeleteCompanyDialog,
} from '@/components/admin/companies'
import {
  listCompanies,
  toggleCompanyStatus,
  type CompanyWithCounts,
} from '@/lib/actions/companies'
import type { CompanyFilters as CompanyFiltersType } from '@/lib/validations/company'

// ============================================================================
// Composant
// ============================================================================

export function CompaniesDataTable() {
  const router = useRouter()

  // État local
  const [data, setData] = useState<CompanyWithCounts[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<CompanyFiltersType>({})
  const [deleteCompany, setDeleteCompany] = useState<CompanyWithCounts | null>(
    null
  )

  // Pagination TanStack
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Chargement des données
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await listCompanies(
        {
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
        filters
      )

      if (result.success && result.data) {
        setData(result.data.data)
        setTotalCount(result.data.total)
      }
    } catch (error) {
      console.error('Erreur chargement companies:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, filters])

  // Effet pour charger les données
  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // Handlers actions
  const handleView = useCallback(
    (company: CompanyWithCounts) => {
      router.push(`/dashboard/admin/companies/${company.id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (company: CompanyWithCounts) => {
      router.push(`/dashboard/admin/companies/${company.id}`)
    },
    [router]
  )

  const handleDelete = useCallback((company: CompanyWithCounts) => {
    setDeleteCompany(company)
  }, [])

  const handleToggleStatus = useCallback(
    (company: CompanyWithCounts) => {
      void (async () => {
        try {
          await toggleCompanyStatus(company.id, !company.isActive)
          await fetchData()
        } catch (error) {
          console.error('Erreur toggle status:', error)
        }
      })()
    },
    [fetchData]
  )

  // Colonnes avec actions
  const columns = useMemo(
    () =>
      createCompanyColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleStatus: handleToggleStatus,
      }),
    [handleView, handleEdit, handleDelete, handleToggleStatus]
  )

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
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Entreprises</h1>
              <p className="text-sm text-muted-foreground">
                {totalCount} entreprise{totalCount > 1 ? 's' : ''} au total
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
              <Link href="/dashboard/admin/companies/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle entreprise
              </Link>
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <CompanyFilters
          filters={filters}
          onFiltersChange={setFilters}
          disabled={isLoading}
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
                    Aucune entreprise trouvée.
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

      {/* Dialog suppression */}
      <DeleteCompanyDialog
        company={deleteCompany}
        open={!!deleteCompany}
        onOpenChange={(open) => !open && setDeleteCompany(null)}
        onSuccess={() => void fetchData()}
      />
    </TooltipProvider>
  )
}
