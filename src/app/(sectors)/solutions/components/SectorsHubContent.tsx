/**
 * SectorsHubContent Component
 * Hub /solutions : index des pages secteur
 *
 * @description Index des secteurs couverts avec cartes (nom, promesse,
 * date de mise à jour) et maillage vers les guides. Prose statique,
 * sans animations whileInView, sur le modèle de GuidesHubContent.
 *
 * Mise en page reprise du prototype en SP-574. Cette page avait echappe a
 * la refonte : titre centre avec un accent `text-blue-600` brut, cartes
 * blanches a bordure fine, badge a icone. Le prototype pose un hero sur
 * aplat bleu nuit et trois cartes en aplats vifs a filet noir.
 *
 * @ticket SP-563
 * @see SP-574 - Hub solutions a la mise en page du prototype
 */

import Link from 'next/link'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionLabel } from '@/components/public/SectionLabel'
import type { SectorData } from '../data'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

/**
 * Une teinte d'aplat par secteur, dans l'ordre du registre.
 *
 * Le prototype pose corail, lime et un jaune absent de la palette publique.
 * La troisieme carte prend le creme contraste plutot que le bleu franc :
 * sur ce bleu, seul le blanc tient (4,88:1), le bleu nuit n'y passe pas, et
 * la serie perdrait sa couleur de texte commune. Etendre la palette pour une
 * seule carte serait disproportionne.
 */
const SECTOR_TONES = [
  'bg-public-accent-surface',
  'bg-public-highlight-surface',
  'bg-public-surface-subtle',
] as const

/**
 * Lien de guide réduit au strict nécessaire. Le registre complet n'est pas
 * importé ici : ce composant est un Client Component, et `getAllGuides()`
 * embarquerait le texte intégral de chaque guide dans le bundle client.
 * Même choix que LandingHeader et LandingFooter.
 */
interface GuideLink {
  slug: string
  title: string
}

interface SectorsHubContentProps {
  sectors: readonly SectorData[]
  guides: readonly GuideLink[]
}

export function SectorsHubContent({ sectors, guides }: SectorsHubContentProps) {
  return (
    <PublicPageShell breadcrumb={[{ label: 'Solutions' }]}>
      {/* Hero sur aplat bleu nuit, comme le prototype. Le titre centre sur
          fond creme ne posait aucun contraste a l'entree de page. */}
      <section className="bg-public-surface-dark py-20 lg:py-28">
        <div className="container-custom">
          <SectionLabel index={1} tone="onDark">
            Solutions par secteur
          </SectionLabel>

          <h1 className="mt-8 max-w-3xl font-geist text-4xl font-bold leading-[0.95] tracking-[-0.045em] text-public-content-on-dark sm:text-5xl lg:text-6xl">
            Un même produit.
            <span className="mt-1 block font-editorial italic text-public-accent-on-dark">
              Des réalités différentes.
            </span>
          </h1>

          <p className="mt-8 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-dark/80">
            Les contraintes de planning d&apos;un restaurant ne sont pas celles
            d&apos;un chantier. Chaque page détaille les règles, les cas
            concrets et le tarif pour un secteur donné : 2,90 € HT par employé
            et par mois, essai gratuit de 21 jours.
          </p>
        </div>
      </section>

      <div className="container-custom pb-24 pt-20">
        {/*
          Liste des secteurs en aplats vifs, comme le prototype, une teinte
          par secteur et un filet bleu nuit en tete.

          Le texte est pose en bleu nuit sur les trois aplats : sur le corail
          le blanc tombe a 3,19:1, et le lime a 1,06:1. C'est ce que porte
          `content-on-vivid`.
        */}
        <ul
          className="grid gap-3 lg:grid-cols-3"
          role="list"
          aria-label="Liste des secteurs couverts"
        >
          {sectors.map((sector, index) => (
            <li key={sector.slug} className="h-full">
              <Link
                href={`/solutions/${sector.slug}`}
                className={cn(
                  'group flex h-full flex-col transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-content focus-visible:ring-offset-2',
                  SECTOR_TONES[index % SECTOR_TONES.length]
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
                    {sector.name}
                  </h2>

                  <p className="flex-1 font-geist leading-relaxed text-public-content-on-vivid">
                    {sector.intro[0]}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 font-geist text-sm font-semibold text-public-content-on-vivid underline underline-offset-8">
                    Voir la solution
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <span className="font-geist text-xs text-public-content-on-vivid">
                    Mis à jour le{' '}
                    <time dateTime={sector.lastModified}>
                      {dateFormatter.format(new Date(sector.lastModified))}
                    </time>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Maillage vers les guides.
            Titre a gauche et liste en filets, comme les autres sections
            refondues, au lieu d'un bloc centre a badges arrondis. */}
        <section
          aria-labelledby="guides-title"
          className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
        >
          <div>
            <SectionLabel index={2}>Aller plus loin</SectionLabel>

            <h2
              id="guides-title"
              className="mt-8 font-geist text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-public-content sm:text-4xl"
            >
              Les guides pratiques
            </h2>

            <p className="mt-6 font-geist leading-relaxed text-public-content-muted">
              Les méthodes et les règles légales qui s&apos;appliquent quel que
              soit votre secteur.
            </p>
          </div>

          <ul role="list" aria-label="Guides pratiques">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="flex min-h-[4.5rem] items-center gap-4 border-t border-public-border py-4 font-geist text-public-content transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent"
                >
                  <BookOpen
                    className="h-4 w-4 shrink-0 text-public-accent"
                    aria-hidden="true"
                  />
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* CTA final, bandeau corail pleine largeur comme la landing et les
          pages secteur, au lieu d'un encart centre a bouton arrondi. */}
      <section
        aria-labelledby="hub-cta-title"
        className="bg-public-accent-surface py-16 lg:py-20"
      >
        <div className="container-custom">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                id="hub-cta-title"
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
