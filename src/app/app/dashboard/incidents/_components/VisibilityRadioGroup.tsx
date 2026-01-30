/**
 * VisibilityRadioGroup - Sélecteur de visibilité pour formulaire
 *
 * @description Radio group stylisé avec icônes et descriptions
 * @ticket SP-426
 */

'use client'

import { ShieldAlert, Users, Globe } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { IncidentNoteVisibility } from '@prisma/client'

interface VisibilityOption {
  value: IncidentNoteVisibility
  label: string
  description: string
}

interface VisibilityRadioGroupProps {
  value: IncidentNoteVisibility
  onChange: (value: IncidentNoteVisibility) => void
  options: VisibilityOption[]
}

const icons: Record<IncidentNoteVisibility, typeof ShieldAlert> = {
  DIRECTOR_ONLY: ShieldAlert,
  MANAGER_DIRECTOR: Users,
  ALL: Globe,
}

const colorClasses: Record<IncidentNoteVisibility, string> = {
  DIRECTOR_ONLY: 'border-red-200 bg-red-50 data-[state=checked]:border-red-500',
  MANAGER_DIRECTOR:
    'border-amber-200 bg-amber-50 data-[state=checked]:border-amber-500',
  ALL: 'border-green-200 bg-green-50 data-[state=checked]:border-green-500',
}

const iconColors: Record<IncidentNoteVisibility, string> = {
  DIRECTOR_ONLY: 'text-red-600',
  MANAGER_DIRECTOR: 'text-amber-600',
  ALL: 'text-green-600',
}

export function VisibilityRadioGroup({
  value,
  onChange,
  options,
}: VisibilityRadioGroupProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v: string) => onChange(v as IncidentNoteVisibility)}
      className="grid gap-2"
      data-testid="visibility-radio-group"
    >
      {options.map((option) => {
        const Icon = icons[option.value]
        return (
          <div key={option.value}>
            <RadioGroupItem
              value={option.value}
              id={`visibility-${option.value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`visibility-${option.value}`}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all',
                'hover:bg-muted/50 peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                colorClasses[option.value],
                value === option.value && 'ring-2 ring-ring'
              )}
            >
              <Icon
                className={cn('mt-0.5 h-5 w-5', iconColors[option.value])}
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}
