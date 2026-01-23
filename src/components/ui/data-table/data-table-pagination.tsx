/**
 * DataTablePagination - Contrôles de pagination responsive
 *
 * ✅ Source : TanStack Table v8 pagination patterns (Context7)
 *
 * @see SP-387 - Pagination responsive mobile
 *
 * OBJECTIF :
 * Composant de pagination complet avec navigation et sélecteur de taille.
 * Adaptatif : layout compact sur mobile, complet sur desktop.
 *
 * FONCTIONNALITÉS :
 * - Boutons Previous / Next avec zones tactiles 44px sur mobile
 * - Sélecteur de taille de page (10, 20, 50, 100)
 * - Affichage "Page X of Y" (simplifié sur mobile)
 * - États disabled quand navigation impossible
 * - Layout responsive (empilé sur mobile, inline sur desktop)
 */

'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TouchableButton, useIsMobile } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import type { DataTablePaginationProps } from './data-table-types'
import { cn } from '@/lib/utils'

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps<TData>) {
  const isMobile = useIsMobile()
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const totalRows = table.getFilteredRowModel().rows.length

  // Options réduites sur mobile
  const mobilePageSizeOptions = [10, 25, 50]
  const effectiveOptions = isMobile ? mobilePageSizeOptions : pageSizeOptions

  return (
    <div
      className={cn(
        'flex border-t px-2 py-4',
        // Mobile: layout vertical centré
        isMobile
          ? 'flex-col items-center gap-4'
          : 'flex-row items-center justify-between gap-4'
      )}
      data-testid="data-table-pagination"
    >
      {/* Affichage total de lignes - masqué sur mobile */}
      {!isMobile && (
        <div className="flex-1 text-sm text-muted-foreground">
          {totalRows} ligne(s) au total
        </div>
      )}

      {/* Contrôles de pagination */}
      <div
        className={cn(
          'flex items-center',
          isMobile ? 'w-full flex-col gap-3' : 'gap-6 lg:gap-8'
        )}
      >
        {/* Row 1 mobile: Navigation + Page indicator */}
        <div
          className={cn(
            'flex items-center',
            isMobile ? 'w-full justify-between' : 'gap-4'
          )}
        >
          {/* Boutons de navigation */}
          <div className="flex items-center gap-1.5">
            {/* First page - visible only on desktop */}
            {!isMobile && (
              <TouchableButton
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label="Première page"
                data-testid="pagination-first"
              >
                <ChevronsLeft className="h-4 w-4" />
              </TouchableButton>
            )}

            {/* Previous page */}
            <TouchableButton
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Page précédente"
              data-testid="pagination-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </TouchableButton>

            {/* Page indicator - inline on mobile */}
            <div
              className={cn(
                'flex items-center justify-center text-sm font-medium',
                isMobile && 'min-w-[80px] px-2'
              )}
              data-testid="pagination-info"
            >
              {isMobile ? (
                <span>
                  {pageIndex + 1}/{pageCount}
                </span>
              ) : (
                <span>
                  Page {pageIndex + 1} sur {pageCount}
                </span>
              )}
            </div>

            {/* Next page */}
            <TouchableButton
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Page suivante"
              data-testid="pagination-next"
            >
              <ChevronRight className="h-4 w-4" />
            </TouchableButton>

            {/* Last page - visible only on desktop */}
            {!isMobile && (
              <TouchableButton
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
                aria-label="Dernière page"
                data-testid="pagination-last"
              >
                <ChevronsRight className="h-4 w-4" />
              </TouchableButton>
            )}
          </div>
        </div>

        {/* Row 2 mobile: Page size selector */}
        <div
          className={cn(
            'flex items-center gap-2',
            isMobile && 'w-full justify-center'
          )}
        >
          <p className="text-sm text-muted-foreground">
            {isMobile ? 'Par page' : 'Lignes par page'}
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger
              className={cn('w-[70px]', isMobile && 'h-11 min-h-[44px]')}
              data-testid="pagination-page-size"
            >
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top">
              {effectiveOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile: Total rows indicator (compact) */}
        {isMobile && (
          <div className="text-xs text-muted-foreground">
            {totalRows} résultat(s)
          </div>
        )}
      </div>
    </div>
  )
}
