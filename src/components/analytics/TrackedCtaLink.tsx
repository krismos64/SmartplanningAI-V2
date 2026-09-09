'use client'

/**
 * Lien de conversion instrumenté
 *
 * @description Un `Link` qui émet `funnel-cta-click` avant de naviguer, pour
 * mesurer l'entrée du tunnel de conversion (étape 1).
 *
 * Pourquoi un composant plutôt qu'un `useUmamiTrack` dans chaque section : les
 * sections de la landing sont des Server Components. Y appeler un hook
 * imposerait de les passer en `'use client'`, ce qui alourdirait le bundle
 * initial et ferait perdre le rendu serveur sur des pages dont le
 * référencement est l'enjeu principal. Ce composant isole la partie cliente au
 * seul lien.
 *
 * L'émission passe par `useUmamiTrack`, donc reste conditionnée au
 * consentement analytics : sans consentement, rien ne part et la navigation
 * fonctionne normalement.
 *
 * @ticket SP-591
 */

import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { useUmamiTrack } from '@/hooks/use-umami-track'

/** Emplacements possibles d'un CTA, pour savoir lequel convertit. */
export type CtaLocation =
  | 'hero'
  | 'pricing'
  | 'footer'
  | 'cta-section'
  | 'role-demos'
  | 'sector-page'
  | 'guide-page'

interface TrackedCtaLinkProps
  extends Omit<ComponentProps<typeof Link>, 'onClick'> {
  /** D'où part le clic, pour comparer les emplacements entre eux */
  location: CtaLocation
  children: ReactNode
}

/**
 * Lien qui signale son clic avant de naviguer.
 *
 * L'événement part sans être attendu : `track` est synchrone côté appelant et
 * Umami poste en arrière-plan. Retarder la navigation pour une analytics
 * dégraderait l'expérience au moment précis où le visiteur décide de
 * s'inscrire.
 */
export function TrackedCtaLink({
  location,
  children,
  ...linkProps
}: TrackedCtaLinkProps) {
  const { track } = useUmamiTrack()

  return (
    <Link
      {...linkProps}
      onClick={() => {
        track('funnel-cta-click', { location, stepRank: 1, source: 'client' })
      }}
    >
      {children}
    </Link>
  )
}

export default TrackedCtaLink
