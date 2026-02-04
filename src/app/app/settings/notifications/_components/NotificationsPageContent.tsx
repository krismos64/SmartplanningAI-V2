'use client'

/**
 * NotificationsPageContent - Contenu principal de la page Notifications
 *
 * Client Component orchestrateur avec :
 * - 4 catégories de notifications (planning, leaves, tasks, system)
 * - 2 canaux par catégorie (email, in-app)
 * - Optimistic UI avec rollback en cas d'erreur
 * - Bouton de réinitialisation
 *
 * @ticket SP-275
 */

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AnimatedContainer,
  AnimatedItem,
} from '@/components/ui/animated-container'
import { useToast } from '@/hooks'
import {
  updateNotificationPreferences,
  resetNotificationPreferences,
} from '@/lib/actions/notification-preferences'
import type {
  NotificationPreferences,
  NotificationChannelPreferences,
} from '@/types/preferences'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/preferences'

import { NotificationCategoryCard } from './NotificationCategoryCard'

interface NotificationsPageContentProps {
  /** Préférences initiales chargées côté serveur */
  initialPreferences: NotificationPreferences
}

/** Ordre des catégories à afficher */
const CATEGORIES: (keyof NotificationChannelPreferences)[] = [
  'planning',
  'leaves',
  'tasks',
  'system',
]

export function NotificationsPageContent({
  initialPreferences,
}: NotificationsPageContentProps) {
  // État local pour les préférences (optimistic UI)
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(initialPreferences)
  const [isPending, startTransition] = useTransition()
  const { success: toastSuccess, error: toastError } = useToast()

  /**
   * Toggle une préférence et sauvegarde
   */
  const handleToggle = (
    channel: 'email' | 'inApp',
    category: keyof NotificationChannelPreferences,
    enabled: boolean
  ) => {
    // Sauvegarde pour rollback
    const previousPreferences = { ...preferences }

    // Optimistic update
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [category]: enabled,
      },
    }))

    // Sauvegarde en arrière-plan
    startTransition(async () => {
      const result = await updateNotificationPreferences({
        [channel]: { [category]: enabled },
      })

      if (!result.success) {
        // Rollback
        setPreferences(previousPreferences)
        toastError(result.error || 'Erreur lors de la sauvegarde')
      } else {
        toastSuccess('Préférences enregistrées')
      }
    })
  }

  /**
   * Réinitialise toutes les préférences
   */
  const handleReset = () => {
    // Sauvegarde pour rollback
    const previousPreferences = { ...preferences }

    // Optimistic update
    setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES })

    startTransition(async () => {
      const result = await resetNotificationPreferences()

      if (!result.success) {
        // Rollback
        setPreferences(previousPreferences)
        toastError(result.error || 'Erreur lors de la réinitialisation')
      } else {
        toastSuccess('Préférences réinitialisées')
      }
    })
  }

  return (
    <div className="space-y-6" data-testid="notifications-page">
      {/* Header avec bouton retour */}
      <AnimatedContainer animation="fadeInDown">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/settings" aria-label="Retour aux paramètres">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Configurez vos préférences de notifications par catégorie et par
              canal
            </p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Categories avec animation stagger */}
      <AnimatedContainer stagger staggerSpeed="normal">
        {CATEGORIES.map((category) => (
          <AnimatedItem key={category}>
            <NotificationCategoryCard
              category={category}
              emailEnabled={preferences.email[category]}
              inAppEnabled={preferences.inApp[category]}
              onEmailChange={(enabled) =>
                handleToggle('email', category, enabled)
              }
              onInAppChange={(enabled) =>
                handleToggle('inApp', category, enabled)
              }
              disabled={isPending}
            />
          </AnimatedItem>
        ))}
      </AnimatedContainer>

      {/* Bouton de réinitialisation */}
      <AnimatedContainer animation="fadeInUp">
        <div className="flex justify-end border-t pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
            data-testid="reset-button"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser par défaut
          </Button>
        </div>
      </AnimatedContainer>
    </div>
  )
}
