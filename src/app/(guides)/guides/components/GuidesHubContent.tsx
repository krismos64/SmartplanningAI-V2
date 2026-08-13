/**
 * GuidesHubContent Component
 * Hub éditorial /guides : liste des guides pratiques
 *
 * @description Index des guides avec cartes (titre, résumé, temps de
 * lecture, date de mise à jour) et maillage vers les pages secteur.
 * Prose statique, sans animations whileInView.
 *
 * Mise en page reprise du prototype en SP-574, comme le hub des secteurs :
 * hero sur aplat bleu nuit, cartes en aplats vifs, maillage en filets et
 * CTA en bandeau corail. Cette page avait echappe a la refonte.
 *
 * @ticket SP-555
 * @see SP-574 - Hubs a la mise en page du prototype
 */

import Link from 'next/link'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import { ArrowUpRight, Clock3, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionLabel } from '@/components/public/SectionLabel'
import { getAllSectors } from '@/app/(sectors)/solutions/data'
import type { GuideData } from '../data'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

/**
 * Une teinte d'aplat par guide, meme serie que le hub des secteurs. La
 * troisieme prend le creme contraste : sur le bleu franc, seul le blanc
 * tient (4,88:1) et la serie perdrait sa couleur de texte commune.
 */
const GUIDE_TONES = [
  'bg-public-accent-surface',
  'bg-public-highlight-surface',
  'bg-public-surface-subtle',
] as const

interface GuidesHubContentProps {
  guides: readonly GuideData[]
}

export function GuidesHubContent({ guides }: GuidesHubContentProps) {
  return (
    <PublicPageShell breadcrumb={[{ label: 'Guides' }]}>
      {/* Hero sur aplat bleu nuit, comme /solutions et /tarifs. Cette page
          avait echappe a la refonte : titre centre a accent bleu brut et
          badge arrondi. */}
      <section className="bg-public-surface-dark py-20 lg:py-28">
        <div className="container-custom">
          <SectionLabel index={1} tone="onDark">
            Ressources
          </SectionLabel>

          <h1 className="mt-8 max-w-3xl font-geist text-4xl font-bold leading-[0.95] tracking-[-0.045em] text-public-content-on-dark sm:text-5xl lg:text-6xl">
            Guides pratiques
            <span className="mt-1 block font-editorial italic text-public-accent-on-dark">
              planning et RH.
            </span>
          </h1>

          <p className="mt-8 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-dark/80">
            Des méthodes concrètes et les règles légales à jour pour gérer les
            plannings, les congés et les équipes d&apos;une TPE ou d&apos;une
            PME. Rédigés et vérifiés par l&apos;équipe SmartPlanning.
          </p>
        </div>
      </section>

      <div className="container-custom pb-24 pt-20">
        {/* Liste des guides */}
        {/* Cartes en aplats vifs, filet bleu nuit en tete, comme le hub
            des secteurs. Texte en `content-on-vivid` : sur corail le blanc
            tombe a 3,19:1 et sur lime a 1,06:1. */}
        <ul
          className="grid gap-3 lg:grid-cols-3"
          role="list"
          aria-label="Liste des guides pratiques"
        >
          {guides.map((guide, index) => (
            <li key={guide.slug} className="h-full">
              <Link
                href={`/guides/${guide.slug}`}
                className={cn(
                  'group flex h-full flex-col transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-content focus-visible:ring-offset-2',
                  GUIDE_TONES[index % GUIDE_TONES.length]
                )}
              >
                <span
                  aria-hidden="true"
                  className="block h-[5px] w-full bg-public-content"
                />

                <span className="flex h-full flex-col gap-4 p-7">
                  <span
                    aria-hidden="true"
                    className="font-geist text-[0.625rem] font-bold tabular-nums text-public-content-on-vivid"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <h2 className="font-geist text-2xl font-bold leading-[1.05] tracking-[-0.035em] text-public-content-on-vivid">
                    {guide.title}
                  </h2>

                  <p className="flex-1 font-geist leading-relaxed text-public-content-on-vivid">
                    {guide.excerpt}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 font-geist text-sm font-semibold text-public-content-on-vivid underline underline-offset-8">
                    Lire le guide
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <span className="flex flex-wrap items-center gap-x-4 gap-y-1 font-geist text-xs text-public-content-on-vivid">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {guide.readingMinutes} min
                    </span>
                    <span>
                      Mis à jour le{' '}
                      <time dateTime={guide.lastModified}>
                        {dateFormatter.format(new Date(guide.lastModified))}
                      </time>
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Maillage vers les pages secteur, titre a gauche et liste en
            filets comme le hub des secteurs. */}
        <section
          aria-labelledby="sectors-title"
          className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
        >
          <div>
            <SectionLabel index={2}>Par métier</SectionLabel>

            <h2
              id="sectors-title"
              className="mt-8 font-geist text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-public-content sm:text-4xl"
            >
              SmartPlanning dans votre secteur
            </h2>

            <p className="mt-6 font-geist leading-relaxed text-public-content-muted">
              Découvrez comment SmartPlanning répond aux contraintes concrètes
              de votre métier.
            </p>
          </div>

          <ul role="list" aria-label="Pages solutions par secteur">
            {getAllSectors().map((sector) => (
              <li key={sector.slug}>
                <Link
                  href={`/solutions/${sector.slug}`}
                  className="flex min-h-[4.5rem] items-center gap-4 border-t border-public-border py-4 font-geist text-public-content transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent"
                >
                  <Store
                    className="h-4 w-4 shrink-0 text-public-accent"
                    aria-hidden="true"
                  />
                  {sector.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* CTA final, bandeau corail pleine largeur */}
      <section
        aria-labelledby="guides-cta-title"
        className="bg-public-accent-surface py-16 lg:py-20"
      >
        <div className="container-custom">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                id="guides-cta-title"
                className="max-w-xl font-geist text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-public-content-on-vivid sm:text-4xl"
              >
                Prêt à simplifier vos plannings ?
              </h2>
              <p className="mt-4 font-geist text-public-content-on-vivid">
                Essai gratuit 21 jours, sans carte bancaire, sans engagement.
              </p>
            </div>

            <Link
              href="/register"
              aria-label="Créer un compte SmartPlanning gratuitement"
              className="inline-flex min-h-[3.5rem] shrink-0 items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
            >
              Essayer gratuitement
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}
