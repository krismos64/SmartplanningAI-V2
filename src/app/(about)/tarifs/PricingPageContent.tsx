'use client'

/**
 * PricingPageContent Component
 * Page tarifs /tarifs
 *
 * Reste un Client Component : le simulateur porte l'effectif saisi, et
 * l'accordeon de FAQ son etat, desormais isole dans FaqAccordion.
 *
 * Identifiants preserves pour les tests E2E (e2e/pages/pricing.page.ts) :
 * #pricing-hero-title, #simulator-title, #features-title, #faq-title,
 * data-testid pricing-hero-description, large-team-message et cta-register.
 *
 * Le simulateur occupe la largeur en deux colonnes depuis SP-574, curseur a
 * gauche et resultat sur aplat bleu a droite, comme le prototype. Il sert
 * aussi la landing, ou sa variante `compact` garde la colonne unique.
 *
 * PricingCard a ete retiree de cette page, puis de la landing en SP-574 :
 * elle repetait le prix du simulateur et sa liste de fonctionnalites dans le
 * meme ecran. Plus aucun appelant.
 *
 * Mise en page rapprochee du prototype en SP-574 : hero sur aplat bleu nuit
 * avec titre sur deux lignes, en-tete du simulateur reduit a une ligne, liste
 * des inclus posee a droite du titre plutot qu'en dessous.
 *
 * @ticket SP-358
 * @see SP-571 - Tarifs, a-propos et pages legales
 * @see SP-574 - Mise en page du prototype
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, MessageSquare } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { FaqAccordion } from '@/components/public/FaqAccordion'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import { PricingSimulator } from '@/components/pricing/PricingSimulator'
import { PRICING, INCLUDED_FEATURES } from '@/lib/config/pricing'
import { PRICING_FAQS } from './StructuredData'

const LARGE_TEAM_THRESHOLD = 50

export function PricingPageContent() {
  const [employees, setEmployees] = useState<number>(PRICING.DEFAULT_EMPLOYEES)

  return (
    <PublicPageShell breadcrumb={[{ label: 'Tarifs' }]}>
      {/* Hero prix.
          Aplat bleu nuit et titre sur deux lignes, comme le prototype : le
          fond creme et le titre sur une ligne ne posaient aucun contraste a
          l'entree de page. */}
      <section
        aria-labelledby="pricing-hero-title"
        className="bg-public-surface-dark py-20 lg:py-28"
      >
        <div className="container-custom">
          <SectionLabel index={1} tone="onDark">
            Tarification
          </SectionLabel>

          <h1
            id="pricing-hero-title"
            className="mt-8 max-w-3xl font-geist text-4xl font-bold leading-[0.95] tracking-[-0.045em] text-public-content-on-dark sm:text-5xl lg:text-7xl"
          >
            Un tarif unique.
            <span className="mt-1 block font-editorial italic text-public-accent-on-dark">
              Aucune petite ligne.
            </span>
          </h1>

          <p
            data-testid="pricing-hero-description"
            className="mt-8 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-dark/80"
          >
            SmartPlanning coûte 2,90&nbsp;&euro; HT par employé par mois. Toutes
            les fonctionnalités sont incluses. Sans engagement. Essai gratuit{' '}
            {PRICING.TRIAL_DAYS} jours sans carte bancaire.
          </p>
        </div>
      </section>

      {/* Simulateur */}
      <section
        aria-labelledby="simulator-title"
        className="bg-public-surface-subtle py-16 lg:py-24"
      >
        <div className="container-custom">
          {/*
            En-tete reduit a une ligne, comme le prototype, qui va droit au
            curseur. Un titre display et un chapo au-dessus du simulateur
            repoussaient l'element interactif hors du premier ecran, et
            expliquaient un mecanisme que le curseur montre de lui-meme.

            `#simulator-title` est conserve, le page object E2E le cible.
          */}
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <SectionLabel index={2}>Calculez votre tarif</SectionLabel>

            <h2
              id="simulator-title"
              className="font-geist text-sm uppercase tracking-[0.1em] text-public-content-muted"
            >
              Simulateur interactif
            </h2>
          </div>

          <div className="mt-10">
            <PricingSimulator size="full" onEmployeesChange={setEmployees} />

            {/* Message au-dela du seuil, toujours dans le DOM */}
            <div
              data-testid="large-team-message"
              inert={employees <= LARGE_TEAM_THRESHOLD}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                employees > LARGE_TEAM_THRESHOLD
                  ? 'grid-rows-[1fr]'
                  : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-8 flex items-start gap-3 border-l-2 border-public-accent bg-public-surface p-4">
                  <MessageSquare
                    className="mt-0.5 h-5 w-5 shrink-0 text-public-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-geist text-sm font-semibold text-public-content">
                      Équipe de plus de {LARGE_TEAM_THRESHOLD} employés ?
                    </p>
                    <p className="mt-1 font-geist text-sm text-public-content-muted">
                      Contactez-nous pour un accompagnement personnalisé.
                    </p>
                    <Link
                      href="/contact"
                      className="mt-2 inline-flex min-h-[2.75rem] items-center gap-2 font-geist text-sm font-semibold text-public-accent underline underline-offset-4 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-subtle"
                    >
                      Nous contacter
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ce qui est inclus */}
      <section
        aria-labelledby="features-title"
        className="bg-public-surface py-16 lg:py-24"
      >
        <div className="container-custom">
          {/* Titre a gauche, liste a droite, disposition du prototype. Le
              chapo est retire : « toutes les fonctionnalites sont comprises »
              redit le titre, et la liste qui suit le prouve. */}
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
            <div>
              <SectionLabel index={3}>Tout inclus</SectionLabel>

              <DisplayTitle
                as="h2"
                id="features-title"
                accent="Aucun supplément."
                className="mt-8 text-public-content"
              >
                Un seul tarif.
              </DisplayTitle>
            </div>

            {/*
              Liste numerotee sur deux colonnes, dans la colonne de droite.

              `PricingCard` a ete retiree d'ici, puis de la landing en SP-574 :
              elle repetait le prix porte par le simulateur et redonnait cette
              liste dans le meme ecran. Plus aucun appelant.

              Le filet est porte en haut de chaque entree et non en bas : avec
              13 entrees, une colonne en compte 7 et l'autre 6, un filet bas
              laissait un trait orphelin sous la colonne courte.

              `min-h` uniforme, calee sur l'entree la plus longue qui tient
              sur deux lignes : sans hauteur commune les filets des deux
              colonnes se decalent progressivement et la grille se lit de
              travers.
            */}
            <ul
              className="grid gap-x-16 sm:grid-cols-2"
              aria-label="Fonctionnalités incluses"
            >
              {INCLUDED_FEATURES.map((feature, index) => (
                <li
                  key={feature}
                  className="flex min-h-[4.5rem] items-center gap-5 border-t border-public-border py-3"
                >
                  <span
                    aria-hidden="true"
                    className="font-geist text-[0.625rem] font-bold tabular-nums text-public-accent"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-geist text-base text-public-content">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ tarifs */}
      <section
        aria-labelledby="faq-title"
        className="bg-public-surface-subtle py-16 lg:py-24"
      >
        <div className="container-custom">
          <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-32">
              <SectionLabel index={4}>Questions fréquentes</SectionLabel>

              <DisplayTitle
                as="h2"
                id="faq-title"
                accent="sur les tarifs."
                className="mt-8 text-public-content"
              >
                Vos questions
              </DisplayTitle>
            </div>

            <FaqAccordion items={[...PRICING_FAQS]} idPrefix="pricing-faq" />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section
        aria-labelledby="cta-title"
        className="bg-public-accent-surface py-16 lg:py-24"
      >
        <div className="container-custom">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <DisplayTitle
              as="h2"
              id="cta-title"
              accent="vos plannings ?"
              tone="onVivid"
              className="max-w-2xl text-public-content-on-vivid"
            >
              Prêt à simplifier
            </DisplayTitle>

            <div className="lg:shrink-0">
              <Link
                href="/register"
                aria-label="Démarrer l'essai gratuit de 21 jours sans carte bancaire"
                data-testid="cta-register"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-3 bg-public-surface-dark px-8 font-geist text-base font-semibold text-public-content-on-dark transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-surface-dark focus-visible:ring-offset-2 focus-visible:ring-offset-public-accent-surface"
              >
                Démarrer l&rsquo;essai gratuit
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>

              <p className="mt-4 max-w-xs font-geist text-sm text-public-content-on-vivid">
                {PRICING.TRIAL_DAYS} jours sans carte bancaire. Inscription en 2
                minutes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}
