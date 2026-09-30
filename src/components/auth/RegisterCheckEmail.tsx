/**
 * RegisterCheckEmail - Écran affiché après une inscription réussie
 *
 * @description Depuis SP-526, la connexion exige un email vérifié. Le
 * formulaire d'inscription tentait pourtant une connexion automatique, vouée
 * à l'échec, puis renvoyait vers /login avec « Connectez-vous pour
 * continuer ». Rien ne disait d'aller cliquer le lien reçu par email (SP-605).
 *
 * Cet écran remplace le formulaire : il nomme l'adresse, dit quoi faire, et
 * permet de renvoyer l'email sans quitter la page.
 *
 * @ticket SP-605
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, MailCheck } from 'lucide-react'
import { toast } from 'sonner'

import { resendVerificationEmailAction } from '@/lib/actions/verification-actions'
import { AUTH_BUTTON_CLASSES } from '@/app/(landing)/components'
import { cn } from '@/lib/utils'

interface RegisterCheckEmailProps {
  /** Adresse saisie à l'inscription, à laquelle le lien a été envoyé */
  email: string
}

export function RegisterCheckEmail({ email }: RegisterCheckEmailProps) {
  const [isResending, setIsResending] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Le formulaire disparaît : le focus suit le nouveau contenu, sinon un
  // lecteur d'écran reste sur un bouton qui n'existe plus
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  async function onResend() {
    setIsResending(true)
    try {
      await resendVerificationEmailAction({ email })
      toast.success('Email renvoyé', {
        // Un seul jeton actif : le renvoi invalide le lien du premier email
        description: `Un nouveau lien part vers ${email}. Utilisez celui de ce dernier email, le précédent n'est plus valable.`,
      })
    } catch {
      toast.error('Erreur', {
        description: "Impossible d'envoyer l'email. Veuillez réessayer.",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <section
      aria-labelledby="register-check-email-title"
      className="space-y-6 border-l-4 border-public-highlight bg-public-surface p-6"
    >
      <MailCheck aria-hidden="true" className="h-8 w-8 text-public-content" />

      <div className="space-y-3">
        <h2
          id="register-check-email-title"
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-28 font-geist text-2xl font-bold tracking-[-0.02em] text-public-content focus:outline-none"
        >
          Vérifiez votre boîte mail
        </h2>
        <p className="font-geist text-base text-public-content">
          Votre compte est créé. Nous avons envoyé un lien de confirmation à{' '}
          <strong className="break-all">{email}</strong>.
        </p>
        <p className="font-geist text-base text-public-content-muted">
          Cliquez sur ce lien pour activer votre compte, puis connectez-vous.
          Il peut mettre une ou deux minutes à arriver. Pensez à regarder dans
          vos courriers indésirables.
        </p>
      </div>

      <div className="flex flex-col items-start gap-3">
        <Link
          href="/login"
          className={cn(
            AUTH_BUTTON_CLASSES,
            'inline-flex w-full items-center justify-center focus-visible:outline-none'
          )}
        >
          Me connecter
        </Link>
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={isResending}
          className="inline-flex min-h-11 items-center justify-center px-2 font-geist text-sm font-semibold text-public-content underline underline-offset-4 transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Je n'ai rien reçu, renvoyer l'email"
          )}
        </button>
      </div>
    </section>
  )
}
