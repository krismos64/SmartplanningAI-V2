/**
 * BenefitsSection Component
 *
 * Section « le changement », direction editoriale SP-567 : aplat clair, titre
 * a deux registres, liste de benefices en filets plutot qu'en cartes.
 *
 * Server Component depuis SP-567.
 *
 * L'illustration « AVANT / AVEC SmartPlanning » avait ete retiree en SP-567,
 * jugee marqueur de « contenu genere » et pesant 2,6 Mo en source. Elle est
 * retablie en SP-574 : le prototype de reference la porte, et cette section
 * expose le seul argument du site qui se montre mieux qu'il ne se raconte.
 * Le fichier WebP pese 261 Ko, pas 2,6 Mo, la source PNG ayant ete convertie
 * entre-temps.
 *
 * SP-572 avait supprime le fichier, devenu orphelin apres SP-567. Restaure
 * depuis l'historique git plutot que regenere.
 *
 * Les donnees viennent du registre `benefits` : leur contenu n'est pas
 * modifie, seul le rendu change.
 *
 * @see SP-567 - Landing, hero et sections hautes
 * @see SP-574 - Retablissement de l'illustration
 */

import Image from 'next/image'
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

            {/*
              Comparaison avant/apres. L'illustration existait avant la
              refonte, SP-567 a retire sa reference en reecrivant la section
              et SP-572 a supprime le fichier devenu orphelin. La section
              porte pourtant le seul argument du site qui se montre mieux
              qu'il ne se raconte.

              `sizes` borne le telechargement : sans lui, Next sert le 3840w
              a tout le monde alors que la colonne fait au plus 640 px.
            */}
            <Image
              src="/images/avant-apres-sp.webp"
              alt="À gauche, une organisation dispersée entre tableurs, messages et impressions. À droite, la même équipe sur une vue unique SmartPlanning."
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="mt-10 w-full border border-public-border"
            />
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
