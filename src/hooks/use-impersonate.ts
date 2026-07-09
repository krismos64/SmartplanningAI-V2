'use client'

/**
 * useImpersonate — démarre le mode support « Voir espace client »
 *
 * Flux partagé (SP-447/SP-543) : POST /api/admin/impersonate avec le
 * companyId cible, mise à jour du JWT via session.update(), puis full page
 * reload pour que le middleware + layouts Server Components se ré-exécutent
 * avec le nouveau JWT (rôle DIRECTOR, companyId cible).
 *
 * Extrait de CompaniesDataTable/UsersDataTable (review PR #50) pour éviter
 * la dérive entre les deux implémentations.
 *
 * @ticket SP-543
 */

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface ImpersonateResult {
  success: boolean
  error?: string
}

// Verrou module-level (pas de state React) : empêche deux appels concurrents
// (double-clic, ou clic sur une deuxième ligne avant le reload) de déclencher
// deux POST /api/admin/impersonate en parallèle. Sans ce verrou, le JWT
// SYSTEM_ADMIN n'a pas encore été rafraîchi par le premier session.update()
// quand le second démarre, ce qui écrase l'admin d'origine dans le token
// (cf. auth.config.ts, garde `wasAlreadyImpersonating`).
let impersonateInFlight = false

export function useImpersonate() {
  const { update: updateSession } = useSession()

  const impersonate = useCallback(
    async (companyId: string): Promise<ImpersonateResult> => {
      if (impersonateInFlight) {
        return { success: false, error: 'Impersonation déjà en cours' }
      }
      impersonateInFlight = true
      let redirecting = false
      try {
        const response = await fetch('/api/admin/impersonate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId }),
        })

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string }
          return {
            success: false,
            error: errorData.error ?? "Échec de l'impersonation",
          }
        }

        const result = (await response.json()) as {
          success: boolean
          redirectTo: string
          impersonation: Record<string, unknown>
        }

        if (result.success) {
          // Forcer NextAuth à relire le JWT enrichi
          await updateSession(result.impersonation)
          // Full page reload : middleware + layout Server Component
          // se ré-exécutent avec le nouveau JWT. Le module JS (et donc le
          // verrou) est réinitialisé par le reload, pas besoin de le libérer.
          redirecting = true
          window.location.href = result.redirectTo
        }

        return { success: result.success }
      } catch (error) {
        console.error('Erreur impersonation:', error)
        return { success: false, error: "Échec de l'impersonation" }
      } finally {
        if (!redirecting) {
          impersonateInFlight = false
        }
      }
    },
    [updateSession]
  )

  return { impersonate }
}
