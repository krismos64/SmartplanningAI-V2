'use client'

/**
 * SettingsHeader - En-tête de la page paramètres
 *
 * Affiche le titre et la description de la page.
 * Design Cyber Glass cohérent avec ProfileHeader.
 *
 * @ticket SP-274
 */

import { Settings } from 'lucide-react'

export function SettingsHeader() {
  return (
    <div
      className="glass-strong flex items-center gap-3 rounded-xl p-4 sm:gap-4 sm:p-6"
      data-testid="settings-header"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
        <Settings
          className="h-5 w-5 text-primary sm:h-6 sm:w-6"
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-neon-primary truncate text-xl font-bold sm:text-2xl">
          Paramètres
        </h1>
        <p className="truncate text-sm text-muted-foreground sm:text-base">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>
    </div>
  )
}
