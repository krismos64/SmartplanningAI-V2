/**
 * Columns - Définitions des colonnes du DataTable
 *
 * ✅ Source : TanStack Table v8 ColumnDef patterns (Context7)
 *
 * OBJECTIF :
 * Définir les colonnes du tableau avec tri, filtrage, formatage
 */

'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions'
import type { User } from './mock-data'

export const getColumns = (
  onView?: (user: User) => void,
  onEdit?: (user: User) => void,
  onDelete?: (user: User) => void
): ColumnDef<User>[] => [
  // ===================================================================
  // COLONNE CHECKBOX (Sélection)
  // ===================================================================
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // ===================================================================
  // COLONNE ID (Triable)
  // ===================================================================
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('id')}</div>,
  },

  // ===================================================================
  // COLONNE NAME (Triable + Filtrable)
  // ===================================================================
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },

  // ===================================================================
  // COLONNE EMAIL (Triable)
  // ===================================================================
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.getValue('email')}</div>
    ),
  },

  // ===================================================================
  // COLONNE ROLE (Badge coloré + Triable)
  // ===================================================================
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Rôle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = String(row.getValue('role'))

      // Couleurs par rôle
      const roleVariants: Record<
        string,
        'default' | 'secondary' | 'destructive' | 'outline'
      > = {
        admin: 'destructive',
        manager: 'default',
        employee: 'secondary',
        viewer: 'outline',
      }

      // Labels français
      const roleLabels: Record<string, string> = {
        admin: 'Administrateur',
        manager: 'Manager',
        employee: 'Employé',
        viewer: 'Lecteur',
      }

      return (
        <Badge variant={roleVariants[role] || 'secondary'} className="text-xs">
          {roleLabels[role] || role}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return value.includes(row.getValue(id))
    },
  },

  // ===================================================================
  // COLONNE STATUS (Badge vert/rouge + Triable)
  // ===================================================================
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Statut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = String(row.getValue('status'))
      const isActive = status === 'actif'

      return (
        <Badge
          variant={isActive ? 'default' : 'destructive'}
          className="text-xs"
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return value.includes(row.getValue(id))
    },
  },

  // ===================================================================
  // COLONNE CREATED AT (Date formatée + Triable)
  // ===================================================================
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Date de création
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )
    },
  },

  // ===================================================================
  // COLONNE ACTIONS (Dropdown menu)
  // ===================================================================
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return (
        <DataTableRowActions
          row={row}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )
    },
  },
]
