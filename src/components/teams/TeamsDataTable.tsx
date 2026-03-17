/**
 * DataTable pour les Teams
 *
 * @description Tableau avec tri, filtres et pagination pour les equipes.
 * Utilise TanStack Table et les composants data-table.
 *
 * @ticket SP-153
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Users,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Plus,
  Search,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  type TeamWithCounts,
  getTeamInitials,
  formatMembersCount,
  getFullName,
} from '@/lib/validations/team'
import { useIsImpersonating } from '@/hooks'
import { TeamCard } from './TeamCard'

// ============================================================================
// Types
// ============================================================================

interface TeamsDataTableProps {
  /** Liste des équipes */
  teams: TeamWithCounts[]
  /** Callback pour suppression */
  onDelete?: (teamId: string) => void
  /** Loader pendant la suppression */
  isDeleting?: boolean
  /** Afficher le bouton de création */
  showCreateButton?: boolean
}

// ============================================================================
// Colonnes du tableau
// ============================================================================

const getColumns = (isImpersonating: boolean): ColumnDef<TeamWithCounts>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2"
      >
        Équipe
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const team = row.original
      return (
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: team.color }}
          >
            {getTeamInitials(team.name)}
          </div>
          <div>
            <div className="font-medium">{team.name}</div>
            {team.description && (
              <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                {team.description}
              </div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'manager',
    header: 'Manager',
    cell: ({ row }) => {
      const team = row.original
      if (!team.manager) {
        return (
          <span className="text-sm italic text-muted-foreground">
            Non assigné
          </span>
        )
      }
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={team.manager.user?.image || undefined} />
            <AvatarFallback className="text-xs">
              {team.manager.firstName[0]}
              {team.manager.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{getFullName(team.manager)}</span>
        </div>
      )
    },
    filterFn: (row, _id, value: string) => {
      const manager = row.original.manager
      if (!manager) return value === 'none'
      const fullName = getFullName(manager).toLowerCase()
      return fullName.includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'employees',
    header: () => (
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4" />
        Membres
      </div>
    ),
    cell: ({ row }) => {
      const count = row.original._count?.employees ?? 0
      return (
        <Badge variant={count > 0 ? 'secondary' : 'outline'}>
          {formatMembersCount(count)}
        </Badge>
      )
    },
    sortingFn: (a, b) => {
      const countA = a.original._count?.employees ?? 0
      const countB = b.original._count?.employees ?? 0
      return countA - countB
    },
  },
  {
    accessorKey: 'company',
    header: 'Entreprise',
    cell: ({ row }) => {
      const company = row.original.company
      return company ? (
        <span className="text-sm">{company.name}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    },
    enableHiding: true,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const team = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/app/directeur/equipes/${team.id}`}
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild={!isImpersonating}
              disabled={isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
            >
              {isImpersonating ? (
                <span className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </span>
              ) : (
                <Link
                  href={`/app/directeur/equipes/${team.id}/edit`}
                  className="flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild={!isImpersonating}
              disabled={isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
            >
              {isImpersonating ? (
                <span className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les membres
                </span>
              ) : (
                <Link
                  href={`/app/directeur/equipes/${team.id}/members`}
                  className="flex items-center"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les membres
                </Link>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
              onClick={() => {
                // Le callback onDelete sera géré par le parent
                const event = new CustomEvent('team-delete', {
                  detail: { teamId: team.id },
                })
                document.dispatchEvent(event)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// ============================================================================
// Composant
// ============================================================================

export function TeamsDataTable({
  teams,
  onDelete,
  isDeleting: _isDeleting = false,
  showCreateButton = true,
}: TeamsDataTableProps) {
  const isImpersonating = useIsImpersonating()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Memoize les données pour éviter les re-renders
  const data = useMemo(() => teams, [teams])

  // Memoize les colonnes avec le flag impersonation
  const columns = useMemo(() => getColumns(isImpersonating), [isImpersonating])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value: string) => {
      const team = row.original
      const searchValue = value.toLowerCase()
      return (
        team.name.toLowerCase().includes(searchValue) ||
        (team.description?.toLowerCase().includes(searchValue) ?? false) ||
        (team.manager
          ? getFullName(team.manager).toLowerCase().includes(searchValue)
          : false)
      )
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Écouter les événements de suppression
  useEffect(() => {
    const handleDelete = (event: Event) => {
      const customEvent = event as CustomEvent<{ teamId: string }>
      if (onDelete) {
        onDelete(customEvent.detail.teamId)
      }
    }

    document.addEventListener('team-delete', handleDelete)
    return () => {
      document.removeEventListener('team-delete', handleDelete)
    }
  }, [onDelete])

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une équipe..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        {showCreateButton &&
          (isImpersonating ? (
            <Button disabled title="Non disponible en mode support">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle équipe
            </Button>
          ) : (
            <Button asChild>
              <Link href="/app/directeur/equipes/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle équipe
              </Link>
            </Button>
          ))}
      </div>

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
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucune équipe trouvée
                    </p>
                    {showCreateButton &&
                      (isImpersonating ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          title="Non disponible en mode support"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Créer une équipe
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/app/directeur/equipes/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Créer une équipe
                          </Link>
                        </Button>
                      ))}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards mobile */}
      <div className="space-y-3 md:hidden">
        {table.getRowModel().rows?.length ? (
          table
            .getRowModel()
            .rows.map((row) => (
              <TeamCard
                key={row.id}
                team={row.original}
                showActions
                onDelete={onDelete}
              />
            ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune équipe trouvée</p>
            {showCreateButton &&
              (isImpersonating ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Non disponible en mode support"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une équipe
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/directeur/equipes/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une équipe
                  </Link>
                </Button>
              ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} équipe(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} sur{' '}
            {table.getPageCount() || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
