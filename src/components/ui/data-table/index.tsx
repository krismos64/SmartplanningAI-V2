/**
 * DataTable - Composant de tableau réutilisable production-ready
 *
 * ✅ Source : TanStack Table v8 + Shadcn/ui + Next.js 15 (Context7)
 *
 * OBJECTIF :
 * Composant DataTable complet avec tri, pagination, filtres, sélection
 * Responsive : table desktop / cards mobile
 *
 * FONCTIONNALITÉS :
 * - Tri multi-colonnes avec indicateurs ↑↓
 * - Pagination client-side (10/20/50/100)
 * - Recherche/filtrage global fuzzy
 * - Actions par ligne (View/Edit/Delete)
 * - Sélection multi-rows avec checkbox
 * - Empty state et Loading state
 * - Responsive : table (≥1024px) / cards (<768px)
 * - TypeScript strict avec generics
 *
 * USAGE :
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */

'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import type { SortingState, ColumnFiltersState, RowSelectionState } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMediaQuery } from '@/hooks/use-media-query'
import { DataTableToolbar } from './data-table-toolbar'
import { DataTablePagination } from './data-table-pagination'
import { DataTableCards } from './data-table-cards'
import type { DataTableProps } from './data-table-types'

/**
 * Fonction de filtre fuzzy avec match-sorter
 * Permet une recherche flexible (tolère les fautes de frappe)
 */
const fuzzyFilter = (row: any, columnId: string, value: any, addMeta: any) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

/**
 * Composant DataTable principal
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  searchPlaceholder = 'Rechercher...',
  searchColumn,
  isLoading = false,
  emptyMessage = 'Aucun résultat trouvé',
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTableProps<TData, TValue>) {
  // ===================================================================
  // ÉTATS (États du tableau TanStack Table)
  // ===================================================================
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // ===================================================================
  // RESPONSIVE (Détection mobile/desktop)
  // ===================================================================
  const isMobile = useMediaQuery('(max-width: 767px)')

  // ===================================================================
  // TANSTACK TABLE (Configuration du tableau)
  // ===================================================================
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: fuzzyFilter,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: enablePagination
        ? {
            pageIndex: 0,
            pageSize,
          }
        : undefined,
    },
    initialState: {
      pagination: enablePagination
        ? {
            pageSize,
          }
        : undefined,
    },
  })

  // ===================================================================
  // LOADING STATE
  // ===================================================================
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex h-16 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // ===================================================================
  // EMPTY STATE (Aucune donnée)
  // ===================================================================
  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  // ===================================================================
  // RENDU (Table desktop ou Cards mobile)
  // ===================================================================
  return (
    <div className="space-y-4">
      {/* Toolbar : Recherche + Clear filters */}
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchColumn={searchColumn}
      />

      {/* Table (Desktop) ou Cards (Mobile) */}
      {isMobile ? (
        // Mode MOBILE : Cards verticales
        <DataTableCards
          columns={columns}
          data={data}
          table={table}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        // Mode DESKTOP : Table classique
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
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
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {enablePagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  )
}
