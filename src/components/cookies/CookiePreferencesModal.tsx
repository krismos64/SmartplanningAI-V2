'use client'

/**
 * Modal de préférences cookies RGPD
 *
 * @description Modal permettant de personnaliser finement les préférences
 * de cookies par catégorie. Intègre le focus trap et l'accessibilité clavier.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCookieConsentContext } from './CookieConsentProvider'
import {
  COOKIE_CATEGORIES,
  CookiePreferences,
  formatConsentDate,
} from '@/lib/cookies'
import { Lock } from 'lucide-react'

/**
 * Modal de personnalisation des préférences cookies
 *
 * @description Affiche chaque catégorie avec un switch on/off.
 * Le focus trap est géré par Radix Dialog.
 *
 * @example
 * ```tsx
 * <CookiePreferencesModal />
 * ```
 */
export function CookiePreferencesModal() {
  const {
    isPreferencesOpen,
    closePreferences,
    preferences,
    savePreferences,
    acceptAll,
    rejectAll,
    consent,
  } = useCookieConsentContext()

  // État local pour les préférences en cours d'édition
  const [localPreferences, setLocalPreferences] =
    useState<CookiePreferences>(preferences)

  // Synchronise les préférences locales avec le contexte
  useEffect(() => {
    setLocalPreferences(preferences)
  }, [preferences, isPreferencesOpen])

  const handleToggle = useCallback(
    (category: keyof CookiePreferences, checked: boolean) => {
      // On ne permet pas de désactiver les essentiels
      if (category === 'essential') return

      setLocalPreferences((prev) => ({
        ...prev,
        [category]: checked,
      }))
    },
    []
  )

  const handleSave = useCallback(() => {
    savePreferences(localPreferences)
  }, [localPreferences, savePreferences])

  const handleAcceptAll = useCallback(() => {
    acceptAll()
  }, [acceptAll])

  const handleRejectAll = useCallback(() => {
    rejectAll()
  }, [rejectAll])

  // Formatage de la date du dernier consentement
  const lastConsentDate = consent?.timestamp
    ? formatConsentDate(consent.timestamp)
    : null

  return (
    <Dialog open={isPreferencesOpen} onOpenChange={closePreferences}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        aria-describedby="cookie-preferences-description"
      >
        <DialogHeader>
          <DialogTitle>Préférences des cookies</DialogTitle>
          <DialogDescription id="cookie-preferences-description">
            Personnalisez vos choix de cookies. Les cookies essentiels sont
            nécessaires au fonctionnement du site et ne peuvent pas être
            désactivés.
          </DialogDescription>
        </DialogHeader>

        {/* Liste des catégories */}
        <div className="space-y-4 py-4">
          {COOKIE_CATEGORIES.map((category) => {
            const isEssential = category.id === 'essential'
            const isChecked = localPreferences[category.id]

            return (
              <div
                key={category.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`cookie-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                    {isEssential && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        Requis
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <Switch
                  id={`cookie-${category.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleToggle(category.id, checked)
                  }
                  disabled={isEssential}
                  aria-label={`${isChecked ? 'Désactiver' : 'Activer'} ${category.name}`}
                  aria-describedby={`cookie-desc-${category.id}`}
                />
                <span id={`cookie-desc-${category.id}`} className="sr-only">
                  {category.description}
                </span>
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          {/* Boutons d'action */}
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleRejectAll}
              aria-label="Refuser tous les cookies non essentiels"
            >
              Tout refuser
            </Button>
            <Button
              variant="secondary"
              onClick={handleAcceptAll}
              aria-label="Accepter tous les cookies"
            >
              Tout accepter
            </Button>
            <Button
              onClick={handleSave}
              aria-label="Sauvegarder mes préférences de cookies"
            >
              Sauvegarder mes choix
            </Button>
          </div>

          {/* Date du dernier consentement */}
          {lastConsentDate && (
            <p className="w-full text-center text-xs text-muted-foreground sm:text-right">
              Dernier consentement : {lastConsentDate}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CookiePreferencesModal
