/**
 * EmailVerificationBanner — Bannière invitant à vérifier son email
 *
 * Affichée sur toutes les pages /app/* quand l'utilisateur n'a pas encore
 * vérifié son adresse email. Dismissable pour 24h (localStorage).
 *
 * @ticket SP-299
 */
'use client'

import { useState, useEffect } from 'react'
import { Mail, X, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { sendVerificationEmailAction } from '@/lib/actions/verification-actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'sp-email-verify-dismissed'
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000 // 24h

interface EmailVerificationBannerProps {
  userEmail: string
}

export function EmailVerificationBanner({
  userEmail,
}: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true) // Masqué par défaut pour éviter le flash
  const [isResending, setIsResending] = useState(false)
  const [isResent, setIsResent] = useState(false)

  // Vérifier si la bannière a été masquée récemment
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10)
        if (Date.now() - dismissedAt < DISMISS_DURATION_MS) {
          setIsDismissed(true)
          return
        }
      }
      setIsDismissed(false)
    } catch {
      setIsDismissed(false)
    }
  }, [])

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
    } catch {
      // localStorage indisponible
    }
    setIsDismissed(true)
  }

  async function handleResend() {
    setIsResending(true)
    try {
      await sendVerificationEmailAction({ email: userEmail })
      setIsResent(true)
      toast.success('Email envoyé !', {
        description: 'Vérifiez votre boîte de réception.',
      })
    } catch {
      toast.error('Erreur', {
        description: "Impossible d'envoyer l'email. Réessayez plus tard.",
      })
    } finally {
      setIsResending(false)
    }
  }

  if (isDismissed) return null

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 border-b px-4 py-3',
        'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
      )}
      role="alert"
    >
      <Mail className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Vérifiez votre adresse email</strong> pour sécuriser votre
          compte et recevoir les notifications importantes (congés, plannings,
          alertes).
        </p>

        {isResent ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Email envoyé !
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleResend()}
            disabled={isResending}
            className="border-amber-300 bg-white/80 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Renvoyer le lien
              </>
            )}
          </Button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 rounded-md p-1 text-amber-600 transition-colors hover:bg-amber-200/50 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-800/50 dark:hover:text-amber-200"
        aria-label="Masquer la bannière"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
