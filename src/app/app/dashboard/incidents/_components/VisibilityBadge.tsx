/**
 * VisibilityBadge - Badge de visibilité avec icône et couleur
 *
 * @description Affiche le niveau de visibilité d'une note d'incident
 * @ticket SP-426
 */

'use client'

import { ShieldAlert, Users, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { IncidentNoteVisibility } from '@prisma/client'
import {
  INCIDENT_NOTE_VISIBILITY_LABELS,
  INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS,
  INCIDENT_NOTE_VISIBILITY_COLORS,
} from '@/types/incident-note'

interface VisibilityBadgeProps {
  visibility: IncidentNoteVisibility
  showTooltip?: boolean
}

const icons = {
  DIRECTOR_ONLY: ShieldAlert,
  MANAGER_DIRECTOR: Users,
  ALL: Globe,
}

export function VisibilityBadge({
  visibility,
  showTooltip = true,
}: VisibilityBadgeProps) {
  const Icon = icons[visibility]
  const label = INCIDENT_NOTE_VISIBILITY_LABELS[visibility]
  const description = INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS[visibility]
  const colorClasses = INCIDENT_NOTE_VISIBILITY_COLORS[visibility]

  const badge = (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 ${colorClasses}`}
      data-testid={`visibility-badge-${visibility}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span className="text-xs">{label}</span>
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
