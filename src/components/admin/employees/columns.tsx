/**
 * Colonnes DataTable pour la liste des Employees
 *
 * @description Configuration des colonnes TanStack Table pour affichage CRUD Employees.
 * Inclut badges colorés pour departement, actions RBAC, tri et formatage dates.
 *
 * @ticket SP-152
 * @see Context7 - TanStack Table column definitions
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  MoreHorizontal,
  User,
  Users,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Phone,
  Briefcase,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  departmentLabels,
  type Department,
} from '@/lib/validations/employee'
import type { EmployeeWithCounts } from '@/lib/validations/employee'

// ============================================================================
// Types pour les actions
// ============================================================================

export interface EmployeeActionsProps {
  onView?: (employee: EmployeeWithCounts) => void
  onEdit?: (employee: EmployeeWithCounts) => void
  onDelete?: (employee: EmployeeWithCounts) => void
  onToggleStatus?: (employee: EmployeeWithCounts) => void
  /** MANAGER ne peut pas supprimer, seulement desactiver */
  canDelete?: boolean
}

// ============================================================================
// Helpers pour badges
// ============================================================================

/**
 * Couleurs des badges par departement
 */
const departmentBadgeVariants: Record<
  Department,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  DIRECTION: 'default',
  RESSOURCES_HUMAINES: 'default',
  COMMERCIAL: 'outline',
  MARKETING: 'outline',
  TECHNIQUE: 'secondary',
  PRODUCTION: 'secondary',
  LOGISTIQUE: 'outline',
  FINANCE: 'default',
  JURIDIQUE: 'default',
  SUPPORT: 'secondary',
  AUTRE: 'outline',
}

// ============================================================================
// Definition des colonnes
// ============================================================================

/**
 * Cree les colonnes pour la DataTable Employees
 *
 * @param actions - Callbacks pour les actions (view, edit, delete, toggleStatus)
 * @returns Definition des colonnes TanStack Table
 */
export function createEmployeeColumns(
  actions: EmployeeActionsProps = {}
): ColumnDef<EmployeeWithCounts>[] {
  const { onView, onEdit, onDelete, onToggleStatus, canDelete = true } = actions

  return [
    // Checkbox de selection
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Tout selectionner"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selectionner la ligne"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Nom complet de l'employe
    {
      accessorKey: 'lastName',
      header: 'Employe',
      cell: ({ row }) => {
        const employee = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              {employee.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={employee.user.image}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">
                {employee.firstName} {employee.lastName}
              </span>
              {employee.user?.email && (
                <span className="text-xs text-muted-foreground">
                  {employee.user.email}
                </span>
              )}
            </div>
          </div>
        )
      },
    },

    // Poste
    {
      accessorKey: 'jobTitle',
      header: 'Poste',
      cell: ({ row }) => {
        const jobTitle = row.getValue('jobTitle') as string | null
        return (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {jobTitle || <span className="text-muted-foreground">-</span>}
            </span>
          </div>
        )
      },
    },

    // Departement
    {
      accessorKey: 'department',
      header: 'Departement',
      cell: ({ row }) => {
        const department = row.getValue('department') as Department | null
        if (!department) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <Badge variant={departmentBadgeVariants[department]}>
            {departmentLabels[department]}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },

    // Equipe
    {
      accessorKey: 'team.name',
      header: 'Equipe',
      cell: ({ row }) => {
        const team = row.original.team
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {team?.name || <span className="text-muted-foreground">-</span>}
            </span>
          </div>
        )
      },
    },

    // Telephone
    {
      accessorKey: 'phone',
      header: 'Telephone',
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string | null
        if (!phone) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{phone}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Appeler {phone}</TooltipContent>
          </Tooltip>
        )
      },
    },

    // Heures hebdomadaires
    {
      accessorKey: 'weeklyHours',
      header: 'Heures/sem',
      cell: ({ row }) => {
        const hours = row.getValue('weeklyHours') as number
        return (
          <span className="text-sm font-medium">
            {hours}h
          </span>
        )
      },
    },

    // Date d'embauche
    {
      accessorKey: 'hireDate',
      header: 'Embauche',
      cell: ({ row }) => {
        const date = row.getValue('hireDate') as Date | null
        if (!date) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), 'dd MMM yyyy', { locale: fr })}
          </span>
        )
      },
    },

    // Statut actif/inactif
    {
      accessorKey: 'isActive',
      header: 'Statut',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        )
      },
    },

    // Actions
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const employee = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onView && (
                <DropdownMenuItem onClick={() => onView(employee)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir details
                </DropdownMenuItem>
              )}

              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(employee)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )}

              {onToggleStatus && (
                <DropdownMenuItem onClick={() => onToggleStatus(employee)}>
                  {employee.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Desactiver
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Activer
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {onDelete && canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(employee)}
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
      },
    },
  ]
}
