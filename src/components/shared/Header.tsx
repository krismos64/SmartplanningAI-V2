/**
 * Header Component - Header réutilisable
 *
 * ✅ Source : Component patterns Next.js 15
 *
 * OBJECTIF (CDA) :
 * Header standalone réutilisable dans différents layouts.
 * Version actuelle : placeholder pour Phase 3.
 *
 * FONCTIONNALITÉS PRÉVUES (Phase 4) :
 * - User dropdown avec session info
 * - Notifications badge
 * - Mobile burger menu
 * - Theme toggle (dark mode)
 *
 * Note : Pour l'instant, le header est intégré directement
 * dans les layouts. Ce composant sera utilisé en Phase 4+.
 */

'use client'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-lg font-semibold">Header Component</div>
        <div className="text-sm text-muted-foreground">
          Placeholder - Phase 4
        </div>
      </div>
    </header>
  )
}
