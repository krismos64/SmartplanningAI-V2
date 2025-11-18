/**
 * DataTableRowActions - Menu d'actions par ligne
 *
 * ✅ Source : Shadcn/ui DropdownMenu patterns (Context7)
 *
 * OBJECTIF :
 * Dropdown menu avec actions View / Edit / Delete sur chaque ligne
 *
 * FONCTIONNALITÉS :
 * - Bouton icon "..." (MoreHorizontal)
 * - Menu déroulant avec 3 actions
 * - Callbacks personnalisables
 * - Icônes pour chaque action
 */

'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import type { DataTableRowActionsProps } from './data-table-types'

export function DataTableRowActions<TData>({
  row,
  onView,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  const data = row.original as TData

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {onView && (
          <DropdownMenuItem onClick={() => onView(data)}>
            <Eye className="mr-2 h-4 w-4" />
            Voir
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(data)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(data)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
