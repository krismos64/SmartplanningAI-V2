'use client'

/**
 * ThemeSelector - Sélecteur de thème visuel
 *
 * Affiche 3 cards cliquables pour System/Light/Dark
 * avec prévisualisation du thème.
 *
 * @ticket SP-276
 */

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Sun, Moon, Check } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ThemePreference } from '@/types/preferences'
import { THEME_OPTIONS } from '@/types/preferences'

interface ThemeSelectorProps {
  /** Thème actuellement sélectionné */
  value: ThemePreference
  /** Callback lors du changement */
  onChange: (value: ThemePreference) => void
  /** Désactive les interactions */
  disabled?: boolean
}

const THEME_ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const

const THEME_DESCRIPTIONS = {
  system: 'Suit les préférences de votre système',
  light: 'Interface claire avec fond blanc',
  dark: 'Interface sombre pour réduire la fatigue oculaire',
} as const

export function ThemeSelector({
  value,
  onChange,
  disabled,
}: ThemeSelectorProps) {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Évite le mismatch d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: ThemePreference) => {
    if (disabled) return

    // Mettre à jour next-themes immédiatement pour le visuel
    setTheme(newTheme)

    // Notifier le parent pour la persistence
    onChange(newTheme)
  }

  // Pendant le SSR, ne pas afficher la sélection active
  const activeTheme = mounted ? value : undefined

  return (
    <Card data-testid="theme-selector">
      <CardHeader>
        <CardTitle className="text-lg">Thème</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choisissez l&apos;apparence de l&apos;interface
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => {
            const Icon = THEME_ICONS[option.value as ThemePreference]
            const isActive = activeTheme === option.value
            const description =
              THEME_DESCRIPTIONS[option.value as ThemePreference]

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  handleThemeChange(option.value as ThemePreference)
                }
                disabled={disabled}
                className={cn(
                  'relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 text-center transition-all',
                  'hover:border-primary/50 hover:bg-accent/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted bg-card'
                )}
                data-testid={`theme-option-${option.value}`}
                aria-pressed={isActive}
              >
                {/* Icône de check si actif */}
                {isActive && (
                  <div className="absolute right-2 top-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}

                {/* Icône du thème */}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'font-medium',
                    isActive ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {option.label}
                </span>

                {/* Description */}
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
