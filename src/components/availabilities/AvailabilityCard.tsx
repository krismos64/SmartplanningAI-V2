/**
 * Composant AvailabilityCard - Carte d'indisponibilité
 *
 * @description Affiche une indisponibilité avec actions edit/delete
 * @ticket SP-401
 */

'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Ban,
  Star,
  Palmtree,
  Thermometer,
  GraduationCap,
  CircleHelp,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import { AvailabilityType } from '@prisma/client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import {
  availabilityTypeLabels,
  availabilityTypeColors,
} from '@/lib/validations/availability'
import type { AvailabilityWithRelations } from '@/lib/actions/availabilities'

// ============================================================================
// Types
// ============================================================================

export interface AvailabilityCardProps {
  /** L'indisponibilité à afficher */
  availability: AvailabilityWithRelations
  /** Callback pour édition */
  onEdit?: (availability: AvailabilityWithRelations) => void
  /** Callback pour suppression */
  onDelete?: (availability: AvailabilityWithRelations) => void
  /** Afficher le nom de l'employé */
  showEmployee?: boolean
  /** Carte compacte (pour calendrier) */
  compact?: boolean
  /** Désactiver les actions */
  disabled?: boolean
}

// ============================================================================
// Icônes par type
// ============================================================================

const typeIcons: Record<AvailabilityType, React.ElementType> = {
  UNAVAILABLE: Ban,
  PREFERRED: Star,
  VACATION: Palmtree,
  SICK: Thermometer,
  TRAINING: GraduationCap,
  OTHER: CircleHelp,
}

// ============================================================================
// Composant principal
// ============================================================================

export function AvailabilityCard({
  availability,
  onEdit,
  onDelete,
  showEmployee = false,
  compact = false,
  disabled = false,
}: AvailabilityCardProps) {
  const TypeIcon = typeIcons[availability.type]
  const typeColor = availabilityTypeColors[availability.type]
  const typeLabel = availabilityTypeLabels[availability.type]

  // Formater les dates
  const startDateStr = format(new Date(availability.startDate), 'dd MMM yyyy', {
    locale: fr,
  })
  const endDateStr = format(new Date(availability.endDate), 'dd MMM yyyy', {
    locale: fr,
  })
  const isSameDay =
    format(new Date(availability.startDate), 'yyyy-MM-dd') ===
    format(new Date(availability.endDate), 'yyyy-MM-dd')

  // Formater la période
  const dateRange = isSameDay ? startDateStr : `${startDateStr} - ${endDateStr}`

  // Formater les heures si présentes
  const hasTime = availability.startTime && availability.endTime
  const timeRange = hasTime
    ? `${availability.startTime} - ${availability.endTime}`
    : 'Journée entière'

  // Version compacte (pour calendrier)
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white',
                disabled && 'opacity-60'
              )}
              style={{ backgroundColor: typeColor }}
              onClick={() => !disabled && onEdit?.(availability)}
            >
              <TypeIcon className="h-3 w-3" />
              <span className="truncate">{typeLabel}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{typeLabel}</p>
              <p className="text-muted-foreground">{dateRange}</p>
              {hasTime && <p className="text-muted-foreground">{timeRange}</p>}
              {availability.reason && (
                <p className="text-muted-foreground">{availability.reason}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-md',
        disabled && 'opacity-60'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icône avec couleur */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${typeColor}20` }}
          >
            <TypeIcon className="h-5 w-5" style={{ color: typeColor }} />
          </div>

          {/* Contenu */}
          <div className="min-w-0 flex-1">
            {/* Header avec type et actions */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-1"
                  style={{
                    backgroundColor: `${typeColor}20`,
                    color: typeColor,
                    borderColor: typeColor,
                  }}
                >
                  {typeLabel}
                </Badge>

                {/* Nom employé si demandé */}
                {showEmployee && (
                  <p className="font-medium">
                    {availability.employee.firstName}{' '}
                    {availability.employee.lastName}
                  </p>
                )}
              </div>

              {/* Actions */}
              {(onEdit || onDelete) && !disabled && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(availability)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(availability)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Dates */}
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dateRange}</span>
            </div>

            {/* Heures */}
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{timeRange}</span>
            </div>

            {/* Raison */}
            {availability.reason && (
              <p className="mt-2 text-sm text-muted-foreground">
                {availability.reason}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
