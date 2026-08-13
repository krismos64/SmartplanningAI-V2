/**
 * PricingSection Component
 *
 * Tarif unique per-seat, direction editoriale SP-568 : aplat bleu franc
 * pleine largeur.
 *
 * Server Component depuis SP-574. La section etait `'use client'` pour la
 * seule raison qu'elle portait l'effectif saisi dans le simulateur ; celui-ci
 * parti, plus aucun etat ne subsiste.
 *
 * Le simulateur et `PricingCard` ont ete retires, decision prise avec
 * Christophe apres comparaison au prototype, qui n'en porte aucun ici :
 *
 * - le prix apparaissait trois fois dans le meme ecran, dans le titre, dans
 *   le simulateur et dans la carte, ce qui dilue au lieu d'appuyer ;
 * - deux CTA concurrents menaient au meme endroit, « Essayer 21 jours » et
 *   « Demarrer l'essai gratuit » ;
 * - la landing dupliquait `/tarifs`, refaite en SP-574 precisement pour
 *   porter le simulateur. `PricingCard` en avait deja ete retiree pour ce
 *   meme motif de repetition du prix.
 *
 * Rien ne se perd. Le JSON-LD `Offer` vit dans `StructuredData.tsx` et
 * declare le prix aux moteurs independamment de cette section. Le message
 * destine aux equipes de plus de 50 employes, qui pousse vers `/contact`,
 * existe a l'identique sur `/tarifs`.
 *
 * Accessibilite : les liens cyan de la version precedente tombaient sous le
 * seuil AA sur le fond clair (3.64:1 mesure en SP-567). Ils passent au
 * blanc sur l'aplat bleu, et portent une hauteur minimale de 44 px.
 *
 * @ticket SP-358
 * @see SP-568 - Landing, sections basses
 * @see SP-574 - Section tarifs a la mise en page du prototype
 */

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PRICING } from '@/lib/config/pricing'
import { DisplayTitle } from '@/components/public/DisplayTitle'
import { SectionLabel } from '@/components/public/SectionLabel'

/**
 * Ce que le tarif comprend. Liste courte et concrete : elle remplace la
 * colonne de quatorze lignes de `PricingCard`, qui detaillait ce que
 * `/tarifs` dit deja mieux.
 */
const INCLUDED = [
  'Plannings glisser-déposer',
  'Congés avec workflow',
  'Tâches et incidents',
  'Exports PDF et Excel',
  'Notifications et messagerie',
  'Import CSV et Excel',
] as const

export function PricingSection() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="bg-public-brand-surface py-20 lg:py-28"
    >
      <div className="container-custom">
        <SectionLabel index={8} tone="onBrand" className="mb-10">
          Tarif simple
        </SectionLabel>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-20">
          <div>
            <DisplayTitle as="h2" id="pricing-title" className="text-white">
              {PRICING.PRICE_PER_EMPLOYEE.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
              })}
              &nbsp;&euro;{' '}
              <span className="font-geist text-lg font-normal tracking-normal sm:text-xl">
                HT / employé / mois
              </span>
            </DisplayTitle>

            <p className="mt-6 max-w-md font-geist text-lg leading-relaxed text-white">
              Toutes les fonctionnalités, sans engagement. La facture suit
              votre effectif réel.
            </p>

            {/* CTA unique, vers la page qui porte le simulateur */}
            <Link
              href="/tarifs"
              className="mt-8 inline-flex min-h-[3.5rem] items-center gap-3 bg-public-accent-surface px-8 font-geist text-base font-semibold text-public-content-on-vivid transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-brand-surface"
            >
              Calculer mon tarif
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Ce que le tarif comprend, en filets plutot qu'en carte */}
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 border-b border-white/25 py-4 font-geist text-base text-white"
              >
                <span aria-hidden="true" className="text-sm">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
