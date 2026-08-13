/**
 * GuideContent Component
 * Template des guides pratiques /guides/[slug]
 *
 * Article long format optimise lecture et SEO/GEO, structure inchangee
 * depuis SP-555 : reponse directe en ouverture, sommaire ancre, sections
 * H2 avec identifiants stables, FAQ, date de mise a jour visible.
 *
 * Server Component depuis SP-570 : la page n'etait cliente que pour l'etat
 * de l'accordeon de FAQ, desormais isole dans FaqAccordion. La prose, qui
 * porte le referencement, est rendue cote serveur sans JavaScript.
 *
 * Mise en page reprise du prototype en SP-575 : hero sur aplat bleu nuit,
 * puis sommaire collant a gauche et prose a droite. La version SP-570
 * empilait tout dans une colonne centree de 48rem, sans rupture d'aplat ni
 * reperage possible dans un guide de neuf sections.
 *
 * Le contenu vient du registre `data/` : ce fichier ne fait que le mettre
 * en page, il n'en modifie aucun texte.
 *
 * @ticket SP-555
 * @see SP-570 - Pages secteur et guides
 * @see SP-575 - Guides a la mise en page du prototype
 */

import Link from 'next/link'
import { ArrowUpRight, Clock3 } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { FaqAccordion } from '@/components/public/FaqAccordion'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import { PRICING } from '@/lib/config/pricing'
import type { GuideData } from '../data'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

interface GuideContentProps {
  guide: GuideData
}

export function GuideContent({ guide }: GuideContentProps) {
  return (
    <PublicPageShell
      breadcrumb={[
        { label: 'Guides', href: '/guides' },
        { label: guide.title },
      ]}
    >
      <article aria-labelledby="guide-title">
        {/* Hero sur aplat bleu nuit, comme le hub et les pages secteur.
            SP-570 laissait le titre sur creme, sans rupture d'aplat entre
            le fil d'Ariane et la prose. */}
        <header className="bg-public-surface-dark pb-16 pt-8 lg:pb-24 lg:pt-12">
          <div className="container-custom">
            <SectionLabel index={1} tone="onDark">
              Guide pratique
            </SectionLabel>

            <h1
              id="guide-title"
              className="mt-8 max-w-4xl font-geist text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-public-content-on-dark sm:text-4xl lg:text-5xl"
            >
              {guide.title}
            </h1>

            {/* Reponse directe (GEO) : la reponse a la requete, citable */}
            <p className="mt-8 max-w-2xl font-geist text-lg leading-relaxed text-public-content-on-dark/80">
              {guide.directAnswer}
            </p>

            <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-geist text-sm text-public-content-on-dark/70">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {guide.readingMinutes} min de lecture
              </span>
              <span>
                Mis à jour le{' '}
                <time dateTime={guide.lastModified}>
                  {dateFormatter.format(new Date(guide.lastModified))}
                </time>
              </span>
            </p>
          </div>
        </header>

        {/* Sommaire collant a gauche, prose a droite, comme au prototype.
            En dessous de `lg` la grille retombe en une colonne et le
            sommaire reprend sa place au fil du document. */}
        <div className="container-custom py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,42rem)] lg:gap-20">
            <nav
              aria-label="Sommaire du guide"
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <h2 className="font-geist text-xs font-semibold uppercase tracking-[0.14em] text-public-accent">
                Dans ce guide
              </h2>
              <ol className="mt-4 space-y-0.5">
                {guide.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex min-h-[2.75rem] items-center gap-3 font-geist text-sm leading-snug text-public-content-muted transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent"
                    >
                      <span
                        aria-hidden="true"
                        className="text-xs tabular-nums text-public-accent"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div>
              {/* Sections, separees par un filet comme au prototype */}
              {guide.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="mb-11 scroll-mt-28 border-b border-public-border pb-11 last:border-b-0"
                >
                  <h2
                    id={`${section.id}-title`}
                    className="mb-5 font-geist text-2xl font-bold leading-[1.1] tracking-[-0.035em] text-public-content sm:text-3xl"
                  >
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 font-geist text-lg leading-relaxed text-public-content-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="mb-4 space-y-3 border-l border-public-border pl-6">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="font-geist text-lg leading-relaxed text-public-content-muted"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/* FAQ, alimente le schema FAQPage */}
              <section
                id="faq"
                aria-labelledby="faq-title"
                className="scroll-mt-28 pt-4"
              >
                <h2
                  id="faq-title"
                  className="mb-6 font-geist text-2xl font-bold leading-[1.1] tracking-[-0.035em] text-public-content sm:text-3xl"
                >
                  Questions fréquentes
                </h2>
                <FaqAccordion items={[...guide.faqs]} idPrefix="guide-faq" />
              </section>
            </div>
          </div>
        </div>
      </article>

      {/* CTA final */}
      <section
        aria-labelledby="guide-cta-title"
        className="bg-public-accent-surface py-16 lg:py-20"
      >
        <div className="container-custom">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <DisplayTitle
                as="h2"
                id="guide-cta-title"
                accent="à la pratique."
                tone="onVivid"
                className="text-public-content-on-vivid"
              >
                Passez de la théorie
              </DisplayTitle>

              <p className="mt-6 font-geist text-public-content-on-vivid">
                Plannings, congés et messagerie d&rsquo;équipe dans un seul
                outil. Essai gratuit {PRICING.TRIAL_DAYS} jours, sans carte
                bancaire.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:shrink-0">
              <Link
                href="/register"
                aria-label="Créer un compte SmartPlanning gratuitement"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
              >
                Essayer gratuitement
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>

              <Link
                href="/guides"
                aria-label="Voir tous les guides pratiques"
                className="inline-flex min-h-[3.5rem] items-center justify-center px-6 font-geist text-base font-semibold text-public-content-on-vivid underline underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
              >
                Tous les guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}
