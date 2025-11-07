/**
 * DashboardLayout Component - Layout réutilisable pour dashboards
 *
 * ✅ Source : Component patterns Next.js 15
 *
 * OBJECTIF (CDA) :
 * Composant layout standalone réutilisable pour les pages dashboard.
 * Version standalone du layout intégré dans app/(dashboard)/layout.tsx.
 *
 * UTILISATION FUTURE (Phase 4+) :
 * Import et utilisation dans les pages pour un layout cohérent
 * sans dupliquer le code.
 *
 * Note : Pour Phase 3, le layout est directement dans app/(dashboard)/layout.tsx
 */

'use client'

import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container-custom py-8">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
