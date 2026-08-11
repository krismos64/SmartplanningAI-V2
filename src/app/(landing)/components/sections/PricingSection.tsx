'use client'

/**
 * PricingSection Component
 *
 * Tarif unique per-seat avec simulateur, direction editoriale SP-568 :
 * aplat bleu franc pleine largeur.
 *
 * Reste un Client Component : le simulateur porte l'effectif saisi.
 *
 * Accessibilite : les liens cyan de la version precedente tombaient sous le
 * seuil AA sur le fond clair (3.64:1 mesure en SP-567). Ils passent au
 * blanc sur l'aplat bleu, et portent une hauteur minimale de 44 px.
 *
 * @ticket SP-358
 * @see SP-568 - Landing, sections basses
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, MessageSquare } from 'lucide-react'
import { PricingSimulator } from '@/components/pricing/PricingSimulator'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PRICING } from '@/lib/config/pricing'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'

const LARGE_TEAM_THRESHOLD = 50

export function PricingSection() {
  const [employees, setEmployees] = useState<number>(PRICING.DEFAULT_EMPLOYEES)

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="bg-public-brand-surface py-24 lg:py-32"
    >
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-16">
          <SectionLabel index={7} tone="onBrand">
            Tarif simple
          </SectionLabel>

          <div>
            <DisplayTitle as="h2" id="pricing-title" className="text-white">
              2,90 &euro; HT par employé et par mois
            </DisplayTitle>

            <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-white/80">
              Toutes les fonctionnalités, sans engagement. La facture suit
              votre effectif réel.
            </p>
          </div>
        </div>

        {/* Simulateur et carte tarif.

            Panneau clair : PricingSimulator et PricingCard sont concus pour
            un fond clair, avec des fonds translucides et des bordures cyan.
            Les poser a meme l'aplat bleu ferait tomber leur texte sous
            1.27:1. Ils servent aussi /tarifs, les modifier ici deborderait
            sur SP-571. */}
        <div className="public-scope mt-16 grid items-start gap-8 bg-public-surface p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
          <div>
            <PricingSimulator
              size="compact"
              animated={false}
              onEmployeesChange={setEmployees}
            />

            {/* Message au-dela du seuil.
                Toujours dans le DOM, masque par la hauteur : meme principe
                que les reponses de FAQ. */}
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
                <div className="mt-6 flex items-start gap-3 border-l-2 border-public-accent bg-public-surface-subtle p-4">
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
                      className="mt-2 inline-flex min-h-[2.75rem] items-center gap-2 font-geist text-sm font-semibold text-public-accent underline underline-offset-4 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface"
                    >
                      Nous contacter
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-start">
            <PricingCard animated={false} />
          </div>
        </div>

        <div className="mt-12">
          <Link
            href="/tarifs"
            className="inline-flex min-h-[2.75rem] items-center gap-2 font-geist text-base font-semibold text-white underline underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-brand-surface"
          >
            Voir le détail des tarifs
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
