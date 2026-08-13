/**
 * SecuritySection Component
 *
 * Bande securite en aplat lime, reprise du prototype (SP-574) ou elle
 * occupe le rang 07, entre le changement et les tarifs.
 *
 * Server Component : aucune interactivite.
 *
 * Le visuel du prototype est repris tel quel, deux colonnes 1,05 / 0,95,
 * grand titre a gauche et trois lignes en filets a droite. **Le contenu est
 * reecrit**, decision de Christophe : celui du prototype s'adresse a un
 * developpeur, « chiffrement HTTPS/TLS », « mots de passe haches avec
 * bcrypt », « isolation par entreprise ». Le lecteur de cette page dirige
 * une TPE et se demande si ses donnees RH sont en securite, pas quel
 * algorithme les protege.
 *
 * Chaque affirmation reste verifiable et deja engagee ailleurs :
 * l'hebergement OVHcloud en France et la certification ISO 27001 figurent
 * dans la FAQ et les mentions legales, les garanties d'acces support dans
 * les CGU (article 9). Une page publique engage, on n'y promet rien que le
 * produit ne tienne.
 *
 * @see SP-574 - Bande securite du prototype, contenu reecrit pour le client
 */

import { SectionLabel } from '@/components/public/SectionLabel'

/**
 * Les trois garanties, formulees du point de vue du dirigeant.
 *
 * L'etiquette dit ce qui est protege, la phrase dit ce que cela change
 * concretement pour lui.
 */
const GUARANTEES = [
  {
    label: 'Vos données',
    text: "Les informations de votre entreprise ne sont jamais visibles par une autre entreprise. Elles restent les vôtres, exportables ou supprimables à tout moment.",
  },
  {
    label: 'Qui voit quoi',
    text: 'Un employé consulte son planning, un manager gère son équipe, la direction voit l’ensemble. Chacun accède à ce qui le concerne, et rien de plus.',
  },
  {
    label: 'En cas de doute',
    text: 'Chaque action sensible est enregistrée. Si notre support doit intervenir sur votre compte, l’accès est limité, sans modification possible, et vous pouvez en demander l’historique.',
  },
] as const

export function SecuritySection() {
  return (
    <section
      id="security"
      aria-labelledby="security-title"
      className="bg-public-highlight-surface py-20 lg:py-28"
    >
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-24">
          <div>
            <SectionLabel index={7} tone="onAccent" className="mb-8">
              Sécurité des données
            </SectionLabel>

            <h2
              id="security-title"
              className="font-geist text-4xl font-bold leading-[0.98] tracking-[-0.05em] text-public-content-on-vivid sm:text-5xl lg:text-6xl"
            >
              Vos données RH restent chez vous.
            </h2>

            <p className="mt-8 max-w-xl font-geist text-lg leading-relaxed text-public-content-on-vivid">
              Plannings, congés, coordonnées de vos salariés : ces
              informations sont sensibles. Elles sont hébergées en France
              chez OVHcloud, dans des centres de données certifiés ISO 27001,
              et traitées conformément au RGPD.
            </p>
          </div>

          <ul>
            {GUARANTEES.map(({ label, text }) => (
              <li
                key={label}
                className="grid gap-2 border-t border-public-content-on-vivid/30 py-5 sm:grid-cols-[8rem_1fr] sm:gap-5"
              >
                <span className="font-geist text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-public-content-on-vivid">
                  {label}
                </span>
                <span className="font-geist text-base leading-relaxed text-public-content-on-vivid">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
