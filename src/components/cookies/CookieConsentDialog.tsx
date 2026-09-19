'use client'

/**
 * Modale de consentement cookies pour l'application privée
 *
 * @description Dans le back-office, la bannière fixe en bas d'écran recouvrait
 * le contenu et absorbait les clics : mesuré à 89 pour cent de la grille de
 * plannings masquée, et quatre clics sur quatre interceptés (SP-600). Une
 * modale centrée demande le choix une fois, puis libère l'écran entièrement.
 *
 * Le consentement reste dû dans l'application privée : Umami n'exclut aucune
 * route, la catégorie analytics y est donc pertinente.
 *
 * @see SP-600 - Le consentement ne doit plus recouvrir le back-office
 * @see SP-283 - Consent manager d'origine, dont le stockage est réutilisé tel quel
 */

import Link from 'next/link'
import { Cookie } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCookieConsentContext } from './CookieConsentProvider'

export interface CookieConsentDialogProps {
  /** Callback appelé après acceptation ou refus (optionnel) */
  onConsentChange?: () => void
}

/**
 * Modale de consentement, rendue à la place de la bannière dans `/app/*`.
 *
 * Elle ne se ferme ni au clic extérieur ni à la touche Échap : un choix
 * implicite ne vaut pas consentement, et la refermer sans répondre la ferait
 * réapparaître au rechargement suivant.
 */
export function CookieConsentDialog({
  onConsentChange,
}: CookieConsentDialogProps) {
  const { hasConsented, isLoaded, acceptAll, rejectAll, openPreferences } =
    useCookieConsentContext()

  // Évite le flash (CLS) en attendant le chargement côté client
  if (!isLoaded) return null

  // Ne pas afficher si l'utilisateur a déjà tranché
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
    <Dialog open>
      <DialogContent
        data-testid="cookie-consent-dialog"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        // Pas de croix : la refermer sans répondre ne vaudrait pas
        // consentement, et la modale reviendrait au rechargement suivant.
        showCloseButton={false}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Cookie className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <DialogTitle>Nous respectons votre vie privée</DialogTitle>
          <DialogDescription>
            SmartPlanning utilise des cookies de mesure d&apos;audience pour
            améliorer le produit. Les cookies essentiels au fonctionnement de
            votre compte sont toujours actifs.{' '}
            <Link
              href="/cookies"
              className="underline underline-offset-2 hover:text-foreground"
            >
              En savoir plus
            </Link>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={openPreferences}
            aria-label="Personnaliser les préférences de cookies"
            data-testid="cookie-settings"
          >
            Personnaliser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRejectAll}
            aria-label="Refuser tous les cookies non essentiels"
            data-testid="cookie-reject-all"
          >
            Tout refuser
          </Button>
          <Button
            size="sm"
            onClick={handleAcceptAll}
            aria-label="Accepter tous les cookies"
            data-testid="cookie-accept-all"
          >
            Tout accepter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CookieConsentDialog
