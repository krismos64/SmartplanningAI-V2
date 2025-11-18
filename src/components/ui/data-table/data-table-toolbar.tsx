/**
 * DataTableToolbar - Barre de recherche et filtres
 *
 * ✅ Source : TanStack Table v8 filtering patterns (Context7)
 *
 * OBJECTIF :
 * Toolbar avec recherche globale fuzzy et bouton clear filters
 * Affiche le nombre de lignes sélectionnées
 *
 * FONCTIONNALITÉS :
 * - Recherche globale instantanée (fuzzy matching)
 * - Bouton "Clear" pour réinitialiser les filtres
 * - Compteur de sélection "X of Y row(s) selected"
 * - Icône de recherche (loupe)
 */

'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { DataTableToolbarProps } from './data-table-types'

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Rechercher...',
  searchColumn,
}: DataTableToolbarProps<TData>) {
  // Récupérer la colonne de recherche (première colonne par défaut)
  const column = searchColumn
    ? table.getColumn(searchColumn)
    : table.getAllColumns()[0]

  // Valeur actuelle du filtre
  const filterValue = (column?.getFilterValue() as string) ?? ''

  // Nombre de lignes sélectionnées
  const selectedRows = table.getFilteredSelectedRowModel().rows.length
  const totalRows = table.getFilteredRowModel().rows.length

  // Vérifier si des filtres sont actifs
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Champ de recherche */}
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={filterValue}
          onChange={(event) => column?.setFilterValue(event.target.value)}
          className="h-10 w-full max-w-sm"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-10 px-2 lg:px-3"
          >
            Réinitialiser
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Compteur de sélection */}
      {selectedRows > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedRows} sur {totalRows} ligne(s) sélectionnée(s)
        </div>
      )}
    </div>
  )
}
