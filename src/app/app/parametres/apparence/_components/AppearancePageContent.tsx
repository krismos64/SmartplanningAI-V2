'use client'

/**
 * AppearancePageContent - Contenu principal de la page Apparence
 *
 * Client Component orchestrateur avec :
 * - Sélection du thème
 * - Sélection du format de date
 * - Sélection du format d'heure
 * - Prévisualisation en temps réel
 * - Sauvegarde automatique
 *
 * @ticket SP-276
 */

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AnimatedContainer,
  AnimatedItem,
} from '@/components/ui/animated-container'
import { useToast } from '@/hooks'
import { updateDisplayPreferences } from '@/lib/actions/display-preferences'
import type { DisplayPreferences } from '@/types/preferences'

import { ThemeSelector } from './ThemeSelector'
import { DateTimeFormatSelector } from './DateTimeFormatSelector'
import { PreferencesPreview } from './PreferencesPreview'

interface AppearancePageContentProps {
  /** Préférences initiales chargées côté serveur */
  initialPreferences: DisplayPreferences
}

export function AppearancePageContent({
  initialPreferences,
}: AppearancePageContentProps) {
  // État local pour les préférences (optimistic UI)
  const [preferences, setPreferences] =
    useState<DisplayPreferences>(initialPreferences)
  const [isPending, startTransition] = useTransition()
  const { error: toastError } = useToast()

  /**
   * Met à jour une préférence et sauvegarde
   */
  const handlePreferenceChange = (
    key: keyof DisplayPreferences,
    value: string
  ) => {
    // Optimistic update
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)

    // Sauvegarde en arrière-plan
    startTransition(async () => {
      const result = await updateDisplayPreferences({ [key]: value })

      if (!result.success) {
        // Rollback en cas d'erreur
        setPreferences(preferences)
        toastError(result.error || 'Impossible de sauvegarder les préférences')
      }
    })
  }

  return (
    <div className="space-y-6" data-testid="appearance-page">
      {/* Header avec bouton retour */}
      <AnimatedContainer animation="fadeInDown">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/parametres" aria-label="Retour aux paramètres">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Apparence</h1>
            <p className="text-muted-foreground">
              Personnalisez le thème et les formats d&apos;affichage
            </p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Sections avec animation stagger */}
      <AnimatedContainer stagger staggerSpeed="normal">
        {/* Section Thème */}
        <AnimatedItem>
          <ThemeSelector
            value={preferences.theme}
            onChange={(value) => handlePreferenceChange('theme', value)}
            disabled={isPending}
          />
        </AnimatedItem>

        {/* Section Date/Heure */}
        <AnimatedItem>
          <DateTimeFormatSelector
            dateFormat={preferences.dateFormat}
            timeFormat={preferences.timeFormat}
            onDateFormatChange={(value) =>
              handlePreferenceChange('dateFormat', value)
            }
            onTimeFormatChange={(value) =>
              handlePreferenceChange('timeFormat', value)
            }
            disabled={isPending}
          />
        </AnimatedItem>

        {/* Section Prévisualisation */}
        <AnimatedItem>
          <PreferencesPreview preferences={preferences} />
        </AnimatedItem>
      </AnimatedContainer>
    </div>
  )
}
