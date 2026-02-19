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
  Mail,
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
  /** Mode impersonation - desactive les actions de mutation */
  isImpersonating?: boolean
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
  const {
    onView,
    onEdit,
    onDelete,
    onToggleStatus,
    canDelete = true,
    isImpersonating = false,
  } = actions

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
            <span className="font-medium">
              {employee.firstName} {employee.lastName}
            </span>
          </div>
        )
      },
    },

    // Email
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const email = row.original.email || row.original.user?.email
        if (!email) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            {email}
          </a>
        )
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
        const phone = row.original.phone
        if (!phone) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {phone}
              </a>
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
        const hours = row.original.weeklyHours
        return <span className="text-sm font-medium">{hours}h</span>
      },
    },

    // Date d'embauche
    {
      accessorKey: 'hireDate',
      header: 'Embauche',
      cell: ({ row }) => {
        const date = row.original.hireDate
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
        const isActive = row.original.isActive
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
                <DropdownMenuItem
                  onClick={() => onEdit(employee)}
                  disabled={isImpersonating}
                  title={
                    isImpersonating
                      ? 'Non disponible en mode support'
                      : undefined
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )}

              {onToggleStatus && (
                <DropdownMenuItem
                  onClick={() => onToggleStatus(employee)}
                  disabled={isImpersonating}
                  title={
                    isImpersonating
                      ? 'Non disponible en mode support'
                      : undefined
                  }
                >
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
                    disabled={isImpersonating}
                    title={
                      isImpersonating
                        ? 'Non disponible en mode support'
                        : undefined
                    }
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
