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
          : 'hover-lift cursor-pointer hover:border-primary/50'
      )}
      data-testid={testId}
    >
      <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
        {/* Icône */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
          <Icon
            className="h-5 w-5 text-primary sm:h-6 sm:w-6"
            aria-hidden="true"
          />
        </div>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold sm:text-base">
              {title}
            </h3>
            {badge && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {description}
          </p>
        </div>

        {/* Chevron */}
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 transition-transform sm:h-5 sm:w-5',
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
