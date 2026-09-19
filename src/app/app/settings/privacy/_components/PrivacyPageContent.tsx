'use client'

/**
 * Contenu de la page Confidentialité et cookies
 *
 * @ticket SP-600
 *
 * Affiche l'état courant du consentement et permet de le modifier, en
 * réutilisant le modal de préférences déjà en place (SP-283).
 */

import { Cookie, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCookieConsentContext } from '@/components/cookies/CookieConsentProvider'

export function PrivacyPageContent() {
  const { hasConsented, isLoaded, preferences, openPreferences, rejectAll } =
    useCookieConsentContext()

  const analyticsActif = isLoaded && hasConsented && preferences.analytics

  return (
    <div className="space-y-6" data-testid="privacy-page">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
          Confidentialité et cookies
        </h1>
        <p className="text-sm text-muted-foreground">
          Vos préférences s&apos;appliquent immédiatement et restent modifiables
          à tout moment.
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cookie className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Mesure d&apos;audience
                </CardTitle>
                <CardDescription>
                  Statistiques d&apos;usage anonymes, pour améliorer le produit
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={analyticsActif ? 'default' : 'secondary'}
              data-testid="analytics-status"
            >
              {!isLoaded ? '...' : analyticsActif ? 'Activée' : 'Désactivée'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={openPreferences}
            data-testid="open-cookie-preferences"
          >
            Modifier mes préférences
          </Button>
          {analyticsActif && (
            <Button
              variant="outline"
              onClick={rejectAll}
              data-testid="reject-all-from-settings"
            >
              Tout refuser
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Cookies essentiels</CardTitle>
          <CardDescription>
            Nécessaires à votre connexion et à la sécurité de votre compte, ils
            ne peuvent pas être désactivés.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default PrivacyPageContent
