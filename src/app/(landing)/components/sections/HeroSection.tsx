/**
 * HeroSection Component
 *
 * Hero de la page d'accueil, direction editoriale SP-567 : aplat bleu nuit,
 * titre a deux registres, apercu de planning construit en DOM.
 *
 * Server Component depuis SP-567. La version precedente etait cliente pour
 * un effet de parallaxe au scroll (useScroll, useTransform) qui tirait
 * Framer Motion dans le chemin critique de la page. L'effet est rendu en
 * CSS, l'animation d'entree se limite a une transition sur les elements
 * deja presents.
 *
 * CLS : le conteneur du mockup reserve sa hauteur par aspect-ratio, et
 * l'illustration ne charge aucune ressource externe. SP-556 avait corrige
 * un CLS mobile de 0,09 sur ce hero, cause par une image sans dimensions
 * reservees.
 *
 * @see SP-567 - Landing, hero et sections hautes
 */

import { PlanningMockup } from '@/components/public/mockups/PlanningMockup'
import { SectionLabel } from '@/components/public/SectionLabel'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

/** Faits verifiables, sans promesse chiffree. */
const REASSURANCE = [
  '21 jours gratuits',
  'Sans carte bancaire',
  'Données hébergées en France',
] as const

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-public-surface-dark">
      {/* Filet corail vertical, marqueur de la direction editoriale */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/3 h-40 w-1 bg-public-accent-surface"
      />

      <div className="container-custom py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Colonne texte */}
          <div className="max-w-2xl">
            <SectionLabel index={1} tone="onDark">
              Gestion d&rsquo;équipe pour TPE &amp; PME
            </SectionLabel>

            {/* h1 ecrit ici plutot que via DisplayTitle : la page ne porte
                qu'un seul h1, il merite d'etre lisible dans la source */}
            <h1 className="mt-8 font-geist text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-public-content-on-dark sm:text-6xl lg:text-7xl">
              Votre équipe avance.
              <span className="mt-1 block font-editorial italic text-public-accent-on-dark">
                Tout reste clair.
              </span>
            </h1>

            <p className="mt-8 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-dark/80 sm:text-xl">
              Plannings, congés, tâches, incidents et messagerie réunis dans un
              outil lisible, pensé pour les équipes de terrain.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-highlight-surface px-8 font-geist text-base font-semibold text-public-content-on-vivid transition-colors hover:bg-public-highlight-surface/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark"
              >
                Démarrer gratuitement
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>

              <Link
                href="#features"
                className="inline-flex min-h-[3.5rem] items-center justify-center px-2 font-geist text-base font-semibold text-public-content-on-dark underline underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark"
              >
                Voir le produit
              </Link>
            </div>

            <ul className="mt-10 flex flex-col gap-3 font-geist text-sm uppercase tracking-[0.12em] text-public-content-on-dark/70 sm:flex-row sm:flex-wrap sm:gap-x-8">
              {REASSURANCE.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 bg-public-accent-on-dark"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne illustration.
              `aspect-ratio` reserve la hauteur des le premier rendu : le
              mockup ne provoque aucun decalage de mise en page. */}
          <div className="relative lg:pl-4">
            <p className="mb-4 hidden text-right font-geist text-xs uppercase tracking-[0.2em] text-public-content-on-dark/50 lg:block">
              Une semaine en un coup d&rsquo;œil
            </p>
            <div className="aspect-[4/3] sm:aspect-[16/11]">
              <PlanningMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
