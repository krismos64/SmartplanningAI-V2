/**
 * MobileSection - « SmartPlanning vous suit, sans application a installer »
 *
 * Porte un argument commercial que la landing ne faisait nulle part : il n'y
 * a rien a installer, l'employe ouvre le navigateur de son telephone. C'est
 * une objection frequente cote terrain, ou faire installer une application a
 * une equipe de vingt personnes est le premier point de friction.
 *
 * Server Component : aucune interactivite. L'illustration est construite en
 * DOM par `MobileMockup`, donc sans requete image.
 *
 * @see SP-574 - Section mobile de la landing
 */

import { Fragment } from 'react'
import { Smartphone, BellRing, RefreshCw } from 'lucide-react'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'
import { MobileMockup } from '@/components/public/mockups/MobileMockup'

/** Les trois arguments, tenus courts : la maquette porte la demonstration. */
const BENEFITS = [
  {
    icon: Smartphone,
    title: 'Accès mobile',
    description: 'Une interface adaptée aux écrans tactiles.',
  },
  {
    icon: BellRing,
    title: 'Informations à jour',
    description:
      'Les changements et décisions restent visibles au même endroit.',
  },
  {
    icon: RefreshCw,
    title: 'Un seul espace',
    description: 'Le téléphone et l’ordinateur partagent les mêmes données.',
  },
] as const

export function MobileSection() {
  return (
    <section
      id="mobile"
      aria-labelledby="mobile-title"
      className="bg-public-surface-dark py-24 lg:py-32"
    >
      <div className="container-custom">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Colonne editoriale */}
          <div>
            <SectionLabel index={4} tone="onDark">
              Sur le terrain
            </SectionLabel>

            <DisplayTitle
              as="h2"
              id="mobile-title"
              accent="Sans application à installer."
              className="mt-8 text-public-content-on-dark"
            >
              SmartPlanning vous suit.
            </DisplayTitle>

            <p className="mt-6 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-dark/75">
              Depuis le navigateur de leur téléphone, les employés retrouvent la
              dernière version de leur planning, leurs congés, leurs tâches et
              les échanges de l&rsquo;équipe.
            </p>

            {/*
              Liste de description : <dt> et <dd> doivent etre enfants
              directs du <dl>, un <div> intermediaire n'est pas admis
              (axe-core, regles dlitem et only-dlitems).
            */}
            <dl className="mt-12 border-t border-public-border-on-dark">
              {BENEFITS.map((benefit) => (
                <Fragment key={benefit.title}>
                  <dt className="flex items-center gap-4 pt-5 font-geist text-base font-semibold text-public-content-on-dark">
                    <benefit.icon
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-public-highlight"
                    />
                    {benefit.title}
                  </dt>
                  <dd className="border-b border-public-border-on-dark pb-5 pl-9 pt-1 font-geist text-base leading-relaxed text-public-content-on-dark/75">
                    {benefit.description}
                  </dd>
                </Fragment>
              ))}
            </dl>
          </div>

          {/* Illustration */}
          <div className="flex justify-center lg:justify-end">
            <MobileMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

export default MobileSection
