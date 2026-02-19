/**
 * CompanyCard - Carte entreprise pour vue mobile
 *
 * @description Affichage compact d'une entreprise avec toutes les informations
 * essentielles et menu d'actions. Utilisé dans la vue mobile de CompaniesDataTable.
 *
 * @ticket SP-462, SP-447
 */

'use client'

import {
  Building2,
  Users,
  Calendar,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Shield,
  UserCheck,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CompanyWithCounts } from '@/lib/actions/companies'
import {
  subscriptionPlanLabels,
  subscriptionStatusLabels,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from '@/lib/validations/company'

// ============================================================================
// Types
// ============================================================================

interface CompanyCardProps {
  company: CompanyWithCounts
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleStatus?: () => void
  /** SP-447 : Impersonation */
  onImpersonate?: () => void
}

// ============================================================================
// Helpers
// ============================================================================

const PLAN_COLORS: Record<
  SubscriptionPlan,
  'secondary' | 'default' | 'outline' | 'destructive'
> = {
  FREE: 'secondary',
  PER_SEAT: 'default',
}

const STATUS_COLORS: Record<
  SubscriptionStatus,
  'secondary' | 'default' | 'outline' | 'destructive'
> = {
  TRIAL: 'outline',
  ACTIVE: 'default',
  PAST_DUE: 'destructive',
  CANCELED: 'secondary',
  EXPIRED: 'destructive',
  INCOMPLETE: 'outline',
}

// ============================================================================
// Composant
// ============================================================================

export function CompanyCard({
  company,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onImpersonate,
}: CompanyCardProps) {
  return (
    <Card
      className="transition-all hover:border-primary/50"
      data-testid="company-card"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Name + status + menu */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold">
                  {company.name}
                </h3>
                {company.slug && (
                  <p className="truncate text-xs text-muted-foreground">
                    {company.slug}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    data-testid="company-card-menu"
                  >
                    <span className="sr-only">Menu actions</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {onView && (
                    <DropdownMenuItem onClick={onView}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && (
                    <DropdownMenuItem onClick={onToggleStatus}>
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
                  {onImpersonate && company.isActive && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onImpersonate}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Voir espace client
                      </DropdownMenuItem>
                    </>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Badges: Plan + Status + Active */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant={
                  PLAN_COLORS[
                    (company.subscription?.plan ?? 'FREE') as SubscriptionPlan
                  ]
                }
              >
                {
                  subscriptionPlanLabels[
                    (company.subscription?.plan ?? 'FREE') as SubscriptionPlan
                  ]
                }
              </Badge>
              <Badge
                variant={
                  STATUS_COLORS[
                    (company.subscription?.status ??
                      'TRIAL') as SubscriptionStatus
                  ]
                }
              >
                {
                  subscriptionStatusLabels[
                    (company.subscription?.status ??
                      'TRIAL') as SubscriptionStatus
                  ]
                }
              </Badge>
              <Badge variant={company.isActive ? 'default' : 'secondary'}>
                {company.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {/* Stats: Utilisateurs + Équipes */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {company._count?.users || 0} utilisateur
                  {(company._count?.users || 0) > 1 ? 's' : ''}
                </span>
              </div>
              <span>&middot;</span>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span>
                  {company._count?.teams || 0} équipe
                  {(company._count?.teams || 0) > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Footer: Email + Date création */}
            <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
              {company.email && <div className="truncate">{company.email}</div>}
              {company.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Créée le{' '}
                    {format(new Date(company.createdAt), 'dd MMM yyyy', {
                      locale: fr,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
