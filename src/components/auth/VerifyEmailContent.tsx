/**
 * VerifyEmailContent - Composant de vérification d'email
 *
 * @description Client Component pour la vérification automatique :
 * - Appel verifyEmailAction au montage (auto-trigger)
 * - États : loading, succès, erreur, token expiré
 * - Countdown redirect vers /login après succès
 * - Bouton "Renvoyer" si token expiré
 *
 * @ticket SP-299
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Mail,
} from 'lucide-react'

import {
  verifyEmailAction,
  resendVerificationEmailAction,
} from '@/lib/actions/verification-actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PRIMARY_BUTTON_CLASSES } from '@/app/(landing)/components'

interface VerifyEmailContentProps {
  token: string
}

export function VerifyEmailContent({ token }: VerifyEmailContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [isResending, setIsResending] = useState(false)
  const [isResendSuccess, setIsResendSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Vérification automatique au montage
  const verify = useCallback(async () => {
    try {
      const result = await verifyEmailAction({ token })

      if (result.success) {
        setIsSuccess(true)
      } else {
        if (result.error.includes('expiré')) {
          setIsExpired(true)
        }
        setErrorMessage(result.error)
      }
    } catch {
      setErrorMessage('Une erreur inattendue est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void verify()
  }, [verify])

  // Countdown et redirection après succès
  useEffect(() => {
    if (!isSuccess) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isSuccess, router])

  // Renvoyer l'email de vérification
  async function handleResend() {
    if (!userEmail) return
    setIsResending(true)

    try {
      const result = await resendVerificationEmailAction({ email: userEmail })
      if (result.success) {
        setIsResendSuccess(true)
      }
    } catch {
      // Silently fail — anti-enumeration
    } finally {
      setIsResending(false)
    }
  }

  // État : chargement
  if (isLoading) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400" />
        </div>
        <p className="text-sm text-muted-foreground">
          Vérification en cours...
        </p>
      </div>
    )
  }

  // État : succès
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Email vérifié !
          </h2>
          <p className="text-sm text-muted-foreground">
            Votre adresse email a été vérifiée avec succès. Vous pouvez
            maintenant vous connecter.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Redirection dans{' '}
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
              {countdown}
            </span>{' '}
            secondes...
          </p>
          <Link href="/login">
            <Button className={cn('w-full', PRIMARY_BUTTON_CLASSES)}>
              Se connecter maintenant
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // État : token expiré
  if (isExpired) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
          <RefreshCw className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Lien expiré
          </h2>
          <p className="text-sm text-muted-foreground">
            Ce lien de vérification a expiré. Saisissez votre email pour
            recevoir un nouveau lien.
          </p>
        </div>

        {isResendSuccess ? (
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nouveau lien envoyé ! Vérifiez votre boîte mail.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onChange={(e) => setUserEmail(e.target.value)}
              value={userEmail || ''}
            />
            <Button
              onClick={() => void handleResend()}
              disabled={isResending || !userEmail}
              className={cn('w-full', PRIMARY_BUTTON_CLASSES)}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Renvoyer le lien de vérification
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  // État : erreur générique
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
        <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Vérification échouée
        </h2>
        <p className="text-sm text-muted-foreground">
          {errorMessage || 'Une erreur est survenue lors de la vérification.'}
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
