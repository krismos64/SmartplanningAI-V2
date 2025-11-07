/**
 * AuthLayout Component - Layout réutilisable pour authentification
 *
 * ✅ Source : Component patterns Next.js 15
 *
 * OBJECTIF (CDA) :
 * Composant layout standalone réutilisable pour les formulaires auth.
 * Version standalone du layout intégré dans app/(auth)/layout.tsx.
 *
 * UTILISATION FUTURE (Phase 4+) :
 * Import et utilisation dans les pages auth pour un layout cohérent
 * sans dupliquer le code.
 *
 * Note : Pour Phase 3, le layout est directement dans app/(auth)/layout.tsx
 */

import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-md">
        {(title || description) && (
          <div className="mb-6 text-center">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="rounded-xl border bg-white p-8 shadow-sm">{children}</div>
      </div>
    </div>
  )
}
