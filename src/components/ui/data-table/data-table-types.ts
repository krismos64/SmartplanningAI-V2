/**
 * DataTable Types - Définitions TypeScript pour le composant DataTable
 *
 * ✅ Source : TanStack Table v8 + TypeScript best practices (Context7)
 *
 * OBJECTIF :
 * Types stricts pour garantir la sécurité TypeScript du composant DataTable
 * Compatible avec TanStack Table v8 et Shadcn/ui
 */

import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
} from '@tanstack/react-table'

/**
 * Props principales du composant DataTable
 *
 * @typeParam TData - Type des données du tableau (ex: User, Product)
 * @typeParam TValue - Type des valeurs des colonnes (string, number, etc.)
 */
export interface DataTableProps<TData, TValue = unknown> {
  /** Colonnes du tableau avec définitions TanStack Table */
  columns: ColumnDef<TData, TValue>[]

  /** Données à afficher dans le tableau */
  data: TData[]

  /** Callback quand l'utilisateur clique "View" sur une ligne */
  onView?: (row: TData) => void

  /** Callback quand l'utilisateur clique "Edit" sur une ligne */
  onEdit?: (row: TData) => void

  /** Callback quand l'utilisateur clique "Delete" sur une ligne */
  onDelete?: (row: TData) => void

  /** Placeholder pour le champ de recherche globale */
  searchPlaceholder?: string

  /** Colonne utilisée pour la recherche globale (par défaut : première colonne) */
  searchColumn?: string

  /** Afficher le loader pendant le chargement */
  isLoading?: boolean

  /** Message à afficher quand aucune donnée */
  emptyMessage?: string

  /** Activer la pagination (par défaut : true) */
  enablePagination?: boolean

  /** Nombre de lignes par page par défaut */
  pageSize?: number

  /** Options de tailles de page (ex: [10, 20, 50, 100]) */
  pageSizeOptions?: number[]
}

/**
 * Props pour le composant DataTableToolbar
 */
export interface DataTableToolbarProps<TData> {
  /** Instance TanStack Table */
  table: any // eslint-disable-line @typescript-eslint/no-explicit-any

  /** Placeholder pour le champ de recherche */
  searchPlaceholder?: string

  /** Colonne utilisée pour la recherche */
  searchColumn?: string
}

/**
 * Props pour le composant DataTablePagination
 */
export interface DataTablePaginationProps<TData> {
  /** Instance TanStack Table */
  table: any // eslint-disable-line @typescript-eslint/no-explicit-any

  /** Options de tailles de page */
  pageSizeOptions?: number[]
}

/**
 * Props pour le composant DataTableRowActions
 */
export interface DataTableRowActionsProps<TData> {
  /** Ligne du tableau (TanStack Table Row) */
  row: any // eslint-disable-line @typescript-eslint/no-explicit-any

  /** Callback View */
  onView?: (data: TData) => void

  /** Callback Edit */
  onEdit?: (data: TData) => void

  /** Callback Delete */
  onDelete?: (data: TData) => void
}

/**
 * Props pour le composant DataTableCards (mobile)
 */
export interface DataTableCardsProps<TData> {
  /** Colonnes (pour extraire les définitions) */
  columns: ColumnDef<TData, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any

  /** Données filtrées et triées */
  data: TData[]

  /** Instance TanStack Table */
  table: any // eslint-disable-line @typescript-eslint/no-explicit-any

  /** Callback actions */
  onView?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
}

/**
 * État global du DataTable
 */
export interface DataTableState {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  pagination: PaginationState
  rowSelection: RowSelectionState
}
