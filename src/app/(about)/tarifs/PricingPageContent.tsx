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
 * PricingSimulator et PricingCard sont concus pour un fond clair et servent
 * aussi la landing : ils gardent leur habillage, pose sur les aplats clairs
 * de la page.
 *
 * @ticket SP-358
 * @see SP-571 - Tarifs, a-propos et pages legales
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, MessageSquare } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { FaqAccordion } from '@/components/public/FaqAccordion'
import { PublicPageShell } from '@/components/public/PublicPageShell'
import { PricingSimulator } from '@/components/pricing/PricingSimulator'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PRICING, INCLUDED_FEATURES } from '@/lib/config/pricing'
import { PRICING_FAQS } from './StructuredData'

const LARGE_TEAM_THRESHOLD = 50

export function PricingPageContent() {
  const [employees, setEmployees] = useState<number>(PRICING.DEFAULT_EMPLOYEES)

  return (
    <PublicPageShell breadcrumb={[{ label: 'Tarifs' }]}>
      {/* Hero prix */}
      <section aria-labelledby="pricing-hero-title" className="pb-16 pt-10">
        <div className="container-custom">
          <SectionLabel index={1}>Tarification</SectionLabel>

          <h1
            id="pricing-hero-title"
            className="mt-8 max-w-4xl font-geist text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-public-content sm:text-5xl lg:text-6xl"
          >
            Un tarif unique,{' '}
            <span className="font-editorial italic text-public-accent">
              simple et transparent
            </span>
          </h1>

          <p
            data-testid="pricing-hero-description"
            className="mt-8 max-w-3xl font-geist text-lg leading-relaxed text-public-content-muted"
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
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
            <SectionLabel index={2}>Calculez votre tarif</SectionLabel>

            <div>
              <DisplayTitle
                as="h2"
                id="simulator-title"
                accent="interactif."
                className="text-public-content"
              >
                Simulateur
              </DisplayTitle>

              <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-muted">
                Ajustez le nombre d&rsquo;employés pour découvrir votre tarif
                mensuel.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <PricingSimulator size="full" onEmployeesChange={setEmployees} />

            {/* Message au-dela du seuil, toujours dans le DOM */}
            <div
              data-testid="large-team-message"
              aria-hidden={employees <= LARGE_TEAM_THRESHOLD}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                employees > LARGE_TEAM_THRESHOLD
                  ? 'grid-rows-[1fr]'
                  : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-6 flex items-start gap-3 border-l-2 border-public-accent bg-public-surface p-4">
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
                      href="/#contact"
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
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
            <SectionLabel index={3}>Tout inclus</SectionLabel>

            <div>
              <DisplayTitle
                as="h2"
                id="features-title"
                accent="Aucun supplément."
                className="text-public-content"
              >
                Un seul tarif.
              </DisplayTitle>

              <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-muted">
                Toutes les fonctionnalités sont comprises, quel que soit votre
                effectif.
              </p>
            </div>
          </div>

          <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <ul
              className="border-t border-public-border"
              aria-label="Fonctionnalités incluses"
            >
              {INCLUDED_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 border-b border-public-border py-4"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-public-accent"
                    aria-hidden="true"
                  />
                  <span className="font-geist text-sm font-medium text-public-content">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-center lg:sticky lg:top-32">
              <PricingCard animated={false} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ tarifs */}
      <section
        aria-labelledby="faq-title"
        className="bg-public-surface-subtle py-16 lg:py-24"
      >
        <div className="container-custom">
          <div className="grid items-start gap-12 lg:grid-cols-[24rem_1fr] lg:gap-20">
            <div className="lg:sticky lg:top-32">
              <SectionLabel index={4}>Questions fréquentes</SectionLabel>

              <DisplayTitle
                as="h2"
                id="faq-title"
                accent="les tarifs."
                className="mt-8 text-public-content"
              >
                Vos questions sur
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

              <p className="mt-4 max-w-xs font-geist text-sm text-public-content-on-vivid/80">
                {PRICING.TRIAL_DAYS} jours sans carte bancaire. Inscription en
                2 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}
