/**
 * CTASection Component
 *
 * Appel a l'action avant le pied de page, direction editoriale SP-568 :
 * aplat corail pleine largeur, titre a deux registres.
 *
 * Server Component depuis SP-568.
 *
 * Le texte est pose en bleu nuit et non en blanc : sur le corail, le blanc
 * tombe a 3.19:1, insuffisant hors grands titres. C'est ce que porte le
 * token `content-on-vivid`.
 *
 * @see SP-568 - Landing, sections basses
 */

import { DisplayTitle } from '@/components/public/DisplayTitle'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section
      aria-labelledby="cta-title"
      className="bg-public-accent-surface py-20 lg:py-28"
    >
      <div className="container-custom">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <DisplayTitle
            as="h2"
            id="cta-title"
            accent="votre équipe."
            tone="onVivid"
            className="max-w-2xl text-public-content-on-vivid"
          >
            21 jours pour réunir la gestion de
          </DisplayTitle>

          <div className="flex flex-col gap-4 sm:flex-row lg:shrink-0">
            <Link
              href="/register"
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
            >
              Essayer gratuitement
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-[3.5rem] items-center justify-center px-6 font-geist text-base font-semibold text-public-content-on-vivid underline underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
            >
              Poser une question
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
