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
      className="glass-strong flex items-center gap-4 rounded-xl p-6"
      data-testid="settings-header"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Settings className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-neon-primary text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>
    </div>
  )
}
