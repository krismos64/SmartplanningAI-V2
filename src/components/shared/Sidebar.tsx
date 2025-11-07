/**
 * Sidebar Component - Sidebar réutilisable
 *
 * ✅ Source : Component patterns Next.js 15
 *
 * OBJECTIF (CDA) :
 * Sidebar standalone réutilisable pour les dashboards.
 * Version actuelle : placeholder pour Phase 3.
 *
 * FONCTIONNALITÉS PRÉVUES (Phase 4) :
 * - Navigation dynamique selon le rôle
 * - Active link highlighting
 * - Collapse/expand
 * - Mobile drawer
 *
 * Note : Pour l'instant, la sidebar est intégrée directement
 * dans le layout dashboard. Ce composant sera utilisé en Phase 4+.
 */

'use client'

export function Sidebar() {
  return (
    <aside className="hidden w-64 border-r bg-white lg:block">
      <div className="p-6">
        <p className="text-lg font-semibold">Sidebar Component</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder - Phase 4
        </p>
      </div>
    </aside>
  )
}
