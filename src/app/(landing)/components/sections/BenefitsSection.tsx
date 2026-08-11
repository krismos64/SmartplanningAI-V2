/**
 * BenefitsSection Component
 *
 * Section « le changement », direction editoriale SP-567 : aplat clair, titre
 * a deux registres, liste de benefices en filets plutot qu'en cartes.
 *
 * Server Component depuis SP-567.
 *
 * L'illustration « AVANT / AVEC SmartPlanning » est retiree. C'etait le
 * marqueur « contenu genere » le plus visible du site, et elle pesait 2,6 Mo
 * en source. Le texte porte desormais seul la comparaison, ce qui est aussi
 * ce que lisent les moteurs et les assistants.
 *
 * Les donnees viennent du registre `benefits` : leur contenu n'est pas
 * modifie, seul le rendu change.
 *
 * @see SP-567 - Landing, hero et sections hautes
 */

import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { benefits } from '../../data'

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      aria-labelledby="benefits-title"
      className="bg-public-surface-subtle py-24 lg:py-32"
    >
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Colonne titre */}
          <div>
            <SectionLabel index={5}>Le changement</SectionLabel>

            <DisplayTitle
              as="h2"
              id="benefits-title"
              accent="au planning maîtrisé."
              className="mt-8 text-public-content"
            >
              Du planning subi
            </DisplayTitle>

            <p className="mt-8 max-w-xl font-geist text-lg leading-relaxed text-public-content-muted">
              Une seule vue remplace les tableaux dispersés, les messages de
              dernière minute et les versions imprimées qui ne sont déjà plus à
              jour.
            </p>
          </div>

          {/* Colonne benefices */}
          <ul className="divide-y divide-public-border border-y border-public-border">
            {benefits.map((benefit) => (
              <li key={benefit.id} className="py-6">
                <div className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2 w-2 shrink-0 bg-public-accent"
                  />
                  <div>
                    <h3 className="font-geist text-lg font-semibold text-public-content">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 font-geist text-base leading-relaxed text-public-content-muted">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
