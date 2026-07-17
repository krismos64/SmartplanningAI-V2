/**
 * OnboardingChecklist - Checklist de démarrage contextuelle (DIRECTOR)
 *
 * Affichée sur le dashboard tant que l'entreprise n'est pas complètement
 * configurée (aucune équipe, aucun employé ou aucun planning). Remplace le
 * mur de widgets vides (6 KPIs à zéro, graphiques vides) qui donnait
 * l'impression d'un dashboard cassé plutôt que d'un compte à configurer.
 *
 * Repliable mais jamais masquable définitivement : tant qu'il reste une
 * étape, elle réapparaît dépliée à la prochaine visite (pas de persistance
 * du collapse en base, c'est un simple confort d'affichage dans la session).
 */
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'

export interface OnboardingChecklistProps {
  /** Au moins une équipe créée */
  hasTeam: boolean
  /** Au moins un employé créé */
  hasEmployee: boolean
  /** Au moins un planning créé */
  hasSchedule: boolean
  /** Classes CSS additionnelles */
  className?: string
}

interface ChecklistStep {
  key: string
  label: string
  description: string
  done: boolean
  href: string
  ctaLabel: string
}

export function OnboardingChecklist({
  hasTeam,
  hasEmployee,
  hasSchedule,
  className,
}: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false)

  const steps: ChecklistStep[] = [
    {
      key: 'employee',
      label: 'Ajouter votre premier employé',
      description: 'La base de vos équipes et de vos plannings',
      done: hasEmployee,
      href: '/app/dashboard/employees/new',
      ctaLabel: 'Ajouter',
    },
    {
      key: 'team',
      label: 'Créer votre première équipe',
      description: 'Regroupez vos employés et assignez un manager',
      done: hasTeam,
      href: '/app/director/teams/new',
      ctaLabel: 'Créer',
    },
    {
      key: 'schedule',
      label: 'Créer votre premier planning',
      description: 'Planifiez les horaires de votre équipe',
      done: hasSchedule,
      href: '/app/dashboard/schedules',
      ctaLabel: 'Planifier',
    },
  ]

  const completedCount = steps.filter((step) => step.done).length
  const progress = Math.round((completedCount / steps.length) * 100)
  const isComplete = completedCount === steps.length

  if (isComplete) {
    return null
  }

  const nextStep = steps.find((step) => !step.done)

  return (
    <Card className={cn('glass-strong border-none', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              Configuration de votre entreprise
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{steps.length} étapes complétées
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Développer' : 'Réduire'}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ProgressBar value={progress} size="sm" color="primary" />
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.key}
              className={cn(
                'flex items-center justify-between gap-4 rounded-lg border p-3',
                step.done ? 'border-transparent bg-muted/40' : 'border-border'
              )}
            >
              <div className="flex items-start gap-3">
                {step.done ? (
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.done && 'text-muted-foreground line-through'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>

              {!step.done && (
                <Button asChild size="sm" variant="outline">
                  <Link href={step.href}>{step.ctaLabel}</Link>
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      )}

      {collapsed && nextStep && (
        <CardContent className="pt-0">
          <Button asChild size="sm" variant="outline">
            <Link href={nextStep.href}>
              Prochaine étape : {nextStep.label}
            </Link>
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export default OnboardingChecklist
