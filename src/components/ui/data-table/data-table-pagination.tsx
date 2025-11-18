/**
 * DataTablePagination - Contrôles de pagination
 *
 * ✅ Source : TanStack Table v8 pagination patterns (Context7)
 *
 * OBJECTIF :
 * Composant de pagination complet avec navigation et sélecteur de taille
 *
 * FONCTIONNALITÉS :
 * - Boutons Previous / Next
 * - Sélecteur de taille de page (10, 20, 50, 100)
 * - Affichage "Page X of Y"
 * - États disabled quand navigation impossible
 */

'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DataTablePaginationProps } from './data-table-types'

export function DataTablePagination({
  table,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <div className="flex items-center justify-between gap-4 border-t px-2 py-4">
      {/* Affichage total de lignes */}
      <div className="flex-1 text-sm text-muted-foreground">
        {totalRows} ligne(s) au total
      </div>

      <div className="flex items-center gap-6 lg:gap-8">
        {/* Sélecteur de taille de page */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Lignes par page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-9 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Numéro de page actuelle */}
        <div className="flex items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} sur {pageCount}
        </div>

        {/* Boutons de navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 w-9 p-0"
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 w-9 p-0"
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
