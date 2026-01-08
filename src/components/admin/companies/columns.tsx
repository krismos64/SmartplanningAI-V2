/**
 * Colonnes DataTable pour la liste des Companies
 *
 * @description Configuration des colonnes TanStack Table pour affichage CRUD Companies.
 * Inclut badges colorés, actions, tri et formatage dates.
 *
 * @ticket SP-151
 * @see Context7 - TanStack Table column definitions
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  MoreHorizontal,
  Building2,
  Users,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
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
  subscriptionPlanLabels,
  subscriptionStatusLabels,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from '@/lib/validations/company'
import type { CompanyWithCounts } from '@/lib/actions/companies'

// ============================================================================
// Types pour les actions
// ============================================================================

export interface CompanyActionsProps {
  onView?: (company: CompanyWithCounts) => void
  onEdit?: (company: CompanyWithCounts) => void
  onDelete?: (company: CompanyWithCounts) => void
  onToggleStatus?: (company: CompanyWithCounts) => void
}

// ============================================================================
// Helpers pour badges
// ============================================================================

/**
 * Couleurs des badges par plan d'abonnement
 */
const planBadgeVariants: Record<
  SubscriptionPlan,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  FREE: 'secondary',
  STARTER: 'outline',
  BUSINESS: 'default',
  ENTERPRISE: 'default',
}

/**
 * Couleurs des badges par statut d'abonnement
 */
const statusBadgeVariants: Record<
  SubscriptionStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  TRIAL: 'outline',
  ACTIVE: 'default',
  PAST_DUE: 'destructive',
  CANCELED: 'destructive',
  EXPIRED: 'secondary',
}

// ============================================================================
// Définition des colonnes
// ============================================================================

/**
 * Crée les colonnes pour la DataTable Companies
 *
 * @param actions - Callbacks pour les actions (view, edit, delete, toggleStatus)
 * @returns Définition des colonnes TanStack Table
 */
export function createCompanyColumns(
  actions: CompanyActionsProps = {}
): ColumnDef<CompanyWithCounts>[] {
  const { onView, onEdit, onDelete, onToggleStatus } = actions

  return [
    // Checkbox de sélection
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

    // Nom de l'entreprise
    {
      accessorKey: 'name',
      header: 'Entreprise',
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{company.name}</span>
              <span className="text-xs text-muted-foreground">
                {company.slug}
              </span>
            </div>
          </div>
        )
      },
    },

    // Plan d'abonnement
    {
      accessorKey: 'subscriptionPlan',
      header: 'Plan',
      cell: ({ row }) => {
        const plan = row.original.subscriptionPlan as SubscriptionPlan
        return (
          <Badge variant={planBadgeVariants[plan]}>
            {subscriptionPlanLabels[plan]}
          </Badge>
        )
      },
      filterFn: (row, _id, value: string[]) => {
        return value.includes(row.original.subscriptionPlan)
      },
    },

    // Statut d'abonnement
    {
      accessorKey: 'subscriptionStatus',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.subscriptionStatus as SubscriptionStatus
        return (
          <Badge variant={statusBadgeVariants[status]}>
            {subscriptionStatusLabels[status]}
          </Badge>
        )
      },
      filterFn: (row, _id, value: string[]) => {
        return value.includes(row.original.subscriptionStatus)
      },
    },

    // Nombre d'employés
    {
      accessorKey: '_count.employees',
      header: 'Employés',
      cell: ({ row }) => {
        const count = row.original._count.employees
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{count}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {count} employé{count > 1 ? 's' : ''}
            </TooltipContent>
          </Tooltip>
        )
      },
    },

    // Nombre d'équipes
    {
      accessorKey: '_count.teams',
      header: 'Équipes',
      cell: ({ row }) => {
        const count = row.original._count.teams
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{count}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {count} équipe{count > 1 ? 's' : ''}
            </TooltipContent>
          </Tooltip>
        )
      },
    },

    // Date de création
    {
      accessorKey: 'createdAt',
      header: 'Créée le',
      cell: ({ row }) => {
        const date = row.original.createdAt
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
      header: 'Actif',
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
        const company = row.original

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
                <DropdownMenuItem onClick={() => onView(company)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </DropdownMenuItem>
              )}

              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(company)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )}

              {onToggleStatus && (
                <DropdownMenuItem onClick={() => onToggleStatus(company)}>
                  {company.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Activer
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(company)}
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
