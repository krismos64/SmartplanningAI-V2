/**
 * ImpersonationBanner — Banniere sticky pour le mode impersonation SYSTEM_ADMIN
 *
 * Affichee quand un SYSTEM_ADMIN est en mode "Voir espace client".
 * Permet de quitter l'impersonation via DELETE /api/admin/impersonate.
 *
 * @ticket SP-453
 */
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Shield, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

// ============================================================================
// Types
// ============================================================================

export interface ImpersonationBannerProps {
  /** Nom de l'entreprise impersonnee */
  companyName: string
  /** Email de l'utilisateur impersonne */
  userEmail: string
}

// ============================================================================
// Component
// ============================================================================

export function ImpersonationBanner({
  companyName,
  userEmail,
}: ImpersonationBannerProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuit = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        toast.error('Erreur', {
          description:
            data.error || 'Impossible de quitter le mode impersonation',
        })
        return
      }

      // Resetter la session NextAuth (supprimer les champs impersonation)
      await updateSession({
        isImpersonating: false,
        originalAdminId: null,
        impersonatedUserId: null,
        impersonatedCompanyId: null,
        impersonatedUserEmail: null,
        impersonatedCompanyName: null,
      })

      // Full page reload pour restaurer le layout SYSTEM_ADMIN complet
      window.location.href = '/app/admin/companies'
    } catch {
      toast.error('Erreur', {
        description: 'Une erreur inattendue est survenue',
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, updateSession])

  return (
    <div
      className="flex items-center gap-3 border-b border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-700 dark:text-orange-300 md:px-6"
      role="status"
      data-testid="impersonation-banner"
    >
      {/* Icone */}
      <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />

      {/* Message */}
      <p className="flex-1 font-medium" data-testid="impersonation-banner-text">
        Mode support : vous visualisez l&apos;espace de{' '}
        <strong>{companyName}</strong> ({userEmail})
      </p>

      {/* Bouton quitter */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => void handleQuit()}
        disabled={isLoading}
        className="shrink-0 border-orange-500/30 text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
        data-testid="quit-impersonation-button"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        Quitter le mode support
      </Button>
    </div>
  )
}
