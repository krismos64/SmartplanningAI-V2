'use client'

/**
 * Bannière de consentement cookies RGPD
 *
 * @description Bannière fixe en bas de page affichant les options de consentement.
 * Conforme au RGPD avec design glassmorphism adapté au thème dark.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCookieConsentContext } from './CookieConsentProvider'
import { Cookie } from 'lucide-react'

export interface CookieBannerProps {
  /** Callback appelé après acceptation/refus (optionnel) */
  onConsentChange?: () => void
}

/**
 * Bannière de consentement cookies
 *
 * @example
 * ```tsx
 * <CookieBanner />
 * ```
 */
export function CookieBanner({ onConsentChange }: CookieBannerProps) {
  const { hasConsented, isLoaded, acceptAll, rejectAll, openPreferences } =
    useCookieConsentContext()

  // Évite le flash (CLS) en attendant le chargement côté client
  if (!isLoaded) return null

  // Ne pas afficher si l'utilisateur a déjà consenti
  if (hasConsented) return null

  const handleAcceptAll = () => {
    acceptAll()
    onConsentChange?.()
  }

  const handleRejectAll = () => {
    rejectAll()
    onConsentChange?.()
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Paramètres des cookies"
      aria-describedby="cookie-banner-description"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          {/* Icône */}
          <div className="hidden shrink-0 md:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Cookie className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 space-y-3">
            <h2 className="text-lg font-semibold text-white">
              Nous respectons votre vie privée
            </h2>
            <p
              id="cookie-banner-description"
              className="text-sm leading-relaxed text-slate-300"
            >
              Ce site utilise des cookies pour améliorer votre expérience et
              analyser notre trafic. Vous pouvez choisir les cookies que vous
              acceptez.{' '}
              <Link
                href="/cookies"
                className="text-primary underline underline-offset-2 hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                En savoir plus
              </Link>
            </p>

            {/* Boutons */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                aria-label="Refuser tous les cookies non essentiels"
              >
                Tout refuser
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openPreferences}
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Personnaliser les préférences de cookies"
              >
                Personnaliser
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-primary text-white hover:bg-primary/90"
                aria-label="Accepter tous les cookies"
              >
                Tout accepter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieBanner
