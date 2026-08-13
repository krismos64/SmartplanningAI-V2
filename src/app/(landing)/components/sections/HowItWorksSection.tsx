/**
 * HowItWorksSection Component
 *
 * Mise en route en trois temps, direction editoriale SP-568 : liste
 * numerotee en filets plutot que cercles et degrades.
 *
 * Server Component depuis SP-568 : la section n'a aucune interactivite,
 * les animations d'apparition sont rendues en CSS.
 *
 * Les donnees viennent du registre `steps`, leur contenu n'est pas modifie.
 *
 * @see SP-568 - Landing, sections basses
 */

import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { steps } from '../../data'

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="bg-public-surface py-24 lg:py-32"
    >
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Colonne titre */}
          <div>
            <SectionLabel index={5}>Mise en route</SectionLabel>

            <DisplayTitle
              as="h2"
              id="how-it-works-title"
              accent="trois temps."
              className="mt-8 text-public-content"
            >
              Opérationnel en
            </DisplayTitle>
          </div>

          {/* Colonne etapes */}
          <ol className="divide-y divide-public-border border-y border-public-border">
            {steps.map((step) => (
              <li key={step.number} className="py-8">
                <div className="flex gap-6">
                  <span
                    aria-hidden="true"
                    className="font-geist text-sm font-semibold tabular-nums text-public-accent"
                  >
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-geist text-xl font-semibold text-public-content">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-geist text-base leading-relaxed text-public-content-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
