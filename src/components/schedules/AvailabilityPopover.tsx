/**
 * Popover de détail d'une indisponibilité
 *
 * @description Affiche les détails complets d'une indisponibilité au clic
 * @ticket SP-402
 */

'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X, Calendar, Clock, MessageSquare } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'
import {
  AVAILABILITY_TYPE_CONFIG,
  HARD_AVAILABILITY_TYPES,
} from './AvailabilityBadge'

// ============================================================================
// Types
// ============================================================================

export interface AvailabilityPopoverProps {
  availability: AvailabilityWithEmployee
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

// ============================================================================
// Helpers
// ============================================================================

function formatDateRange(startDate: Date, endDate: Date): string {
  const start = format(startDate, 'd MMM yyyy', { locale: fr })
  const end = format(endDate, 'd MMM yyyy', { locale: fr })

  if (start === end) {
    return start
  }

  return `${start} - ${end}`
}

function formatTimeRange(
  startTime: string | null,
  endTime: string | null
): string | null {
  if (!startTime || !endTime) {
    return 'Journee entiere'
  }

  return `${startTime} - ${endTime}`
}

// ============================================================================
// Composant
// ============================================================================

export function AvailabilityPopover({
  availability,
  open,
  onOpenChange,
  children,
}: AvailabilityPopoverProps) {
  const config = AVAILABILITY_TYPE_CONFIG[availability.type]
  const isHard = HARD_AVAILABILITY_TYPES.includes(availability.type)
  const employeeName = `${availability.employee.firstName} ${availability.employee.lastName}`
  const dateRange = formatDateRange(availability.startDate, availability.endDate)
  const timeRange = formatTimeRange(availability.startTime, availability.endTime)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-3 border-b ${config.bgColor}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {config.emoji}
            </span>
            <div>
              <h3 className={`font-semibold ${config.textColor}`}>
                {config.label}
              </h3>
              <Badge
                variant={isHard ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {isHard ? 'Bloquant' : 'Avertissement'}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onOpenChange(false)}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Employe */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Employe
            </p>
            <p className="font-medium">{employeeName}</p>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-0.5">
                Periode
              </p>
              <p className="text-sm">{dateRange}</p>
            </div>
          </div>

          {/* Heures */}
          {timeRange && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-0.5">
                  Horaires
                </p>
                <p className="text-sm">{timeRange}</p>
              </div>
            </div>
          )}

          {/* Raison */}
          {availability.reason && (
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-0.5">
                  Raison
                </p>
                <p className="text-sm">{availability.reason}</p>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
