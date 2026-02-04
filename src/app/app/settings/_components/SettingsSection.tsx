'use client'

/**
 * SettingsSection - Card navigable pour une section de paramètres
 *
 * Card cliquable avec icône, titre, description et chevron.
 * Supporte un badge optionnel pour les sections futures.
 * Design Cyber Glass 3D avec hover-lift.
 *
 * @ticket SP-274
 */

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SettingsSectionProps {
  /** Icône Lucide à afficher */
  icon: LucideIcon
  /** Titre de la section */
  title: string
  /** Description courte */
  description: string
  /** URL de destination */
  href: string
  /** Badge optionnel (désactive le lien si présent) */
  badge?: string
  /** data-testid pour les tests */
  testId?: string
}

export function SettingsSection({
  icon: Icon,
  title,
  description,
  href,
  badge,
  testId,
}: SettingsSectionProps) {
  const isDisabled = !!badge

  const cardContent = (
    <Card
      className={cn(
        'glass h-full transition-all duration-200',
        isDisabled
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover-lift hover:border-primary/50'
      )}
      data-testid={testId}
    >
      <CardContent className="flex items-center gap-4 p-6">
        {/* Icône */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Chevron */}
        <ChevronRight
          className={cn(
            'h-5 w-5 shrink-0 transition-transform',
            isDisabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
          )}
          aria-hidden="true"
        />
      </CardContent>
    </Card>
  )

  // Si désactivé (badge présent), pas de lien
  if (isDisabled) {
    return cardContent
  }

  return (
    <Link
      href={href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {cardContent}
    </Link>
  )
}
