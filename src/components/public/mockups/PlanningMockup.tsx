/**
 * PlanningMockup - Apercu de planning en DOM
 *
 * Remplace la capture d'ecran du hero par une representation construite en
 * HTML et CSS. Trois raisons :
 *
 * 1. Poids : l'illustration precedente pesait 2,6 Mo en PNG, 255 Ko meme
 *    apres conversion WebP. Ce mockup ne coute aucune requete.
 * 2. Nettete : rendu vectoriel, net sur tout ecran, sans jeu de tailles.
 * 3. Coherence : les illustrations generees etaient le marqueur « contenu
 *    genere » le plus visible du site.
 *
 * Entierement decoratif : `aria-hidden`, aucun contenu n'y est unique. Les
 * informations que le mockup evoque sont portees par le texte du hero, seul
 * lu par les moteurs et les technologies d'assistance.
 *
 * Server Component, aucun JavaScript envoye au client.
 *
 * Dimensions relevees sur le DOM du prototype en 1440 px (SP-574) : le cadre
 * fait 703 x 347 pour des lignes de 78 px. La premiere version tenait en
 * 560 x 217 avec des lignes de 56 px, soit 37 % de hauteur en moins, et
 * l'illustration flottait au milieu du vide a droite du titre.
 *
 * @see SP-567 - Landing, hero et sections hautes
 * @see SP-574 - Hero, maquette a l'echelle du prototype
 */

import { Fragment } from 'react'

import { cn } from '@/lib/utils'

/** Creneau affiche dans une cellule du planning. */
interface MockupSlot {
  /** Plage horaire, ex : « 09:00 - 17:00 » */
  time: string
  /** Lieu ou statut, ex : « Boutique Pau » */
  detail: string
  /** Teinte de la cellule, reprend le code couleur de l'application */
  tone: 'blue' | 'amber' | 'green' | 'grey'
}

interface MockupRow {
  initials: string
  name: string
  role: string
  /** Teinte de la pastille d'avatar */
  avatarTone: 'rose' | 'lime' | 'blue'
  slots: MockupSlot[]
}

/**
 * Donnees d'illustration. Prenoms et lieux fictifs : aucune donnee reelle
 * d'entreprise cliente ne figure sur une page publique.
 */
const ROWS: MockupRow[] = [
  {
    initials: 'LM',
    name: 'Léa Martin',
    role: 'Manager',
    avatarTone: 'rose',
    slots: [
      { time: '09:00 - 17:00', detail: 'Boutique Pau', tone: 'blue' },
      { time: '10:00 - 18:00', detail: 'Boutique Pau', tone: 'amber' },
      { time: '09:00 - 17:00', detail: 'Boutique Lescar', tone: 'blue' },
    ],
  },
  {
    initials: 'NB',
    name: 'Nassim Benali',
    role: 'Équipe vente',
    avatarTone: 'lime',
    slots: [
      { time: '12:00 - 19:00', detail: 'Boutique Lescar', tone: 'grey' },
      { time: 'Congé validé', detail: '1 jour', tone: 'green' },
      { time: '11:00 - 19:00', detail: 'Boutique Pau', tone: 'amber' },
    ],
  },
  {
    initials: 'CD',
    name: 'Chloé Dubois',
    role: 'Équipe vente',
    avatarTone: 'blue',
    slots: [
      { time: '08:30 - 16:30', detail: 'Boutique Pau', tone: 'amber' },
      { time: '09:30 - 17:30', detail: 'Boutique Pau', tone: 'blue' },
      { time: '12:00 - 19:00', detail: 'Boutique Lescar', tone: 'grey' },
    ],
  },
]

/**
 * Teintes des cellules, relevees sur le prototype et non sur la palette
 * Tailwind : le bleu y vaut #dfe8ff et le jaune #fff0ad, deux pastels plus
 * satures que `blue-50` et `amber-50` qui delavaient la maquette. Le filet
 * de gauche reprend le bleu franc et le corail de l'identite publique.
 *
 * Valeurs fixes assumees plutot que tokens publics : ce sont les couleurs
 * de l'application reelle que le mockup represente, pas celles de la
 * direction editoriale.
 */
const SLOT_TONE: Record<MockupSlot['tone'], string> = {
  blue: 'border-l-[#2670ff] bg-[#dfe8ff]',
  amber: 'border-l-[#ffb020] bg-[#fff0ad]',
  green: 'border-l-[#59c000] bg-[#e4ffc4]',
  grey: 'border-l-[#8890a0] bg-[#eceef2]',
}

const AVATAR_TONE: Record<MockupRow['avatarTone'], string> = {
  rose: 'bg-[#ffd5cc]',
  lime: 'bg-[#ddff9c]',
  blue: 'bg-[#dfe8ff]',
}

export function PlanningMockup({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('relative select-none', className)}>
      {/*
       * Cadre pose sur le creme et non sur du blanc, comme le prototype, avec
       * son ombre bleu franc decalee de 20/30 px sans flou. `shadow-2xl`
       * diffus appartenait a l'identite d'avant la refonte.
       */}
      <div className="relative rounded-lg bg-public-surface p-[1.0625rem] shadow-[20px_30px_0_0_hsl(var(--public-brand-surface))]">
        {/* Barre de titre */}
        <div className="flex items-center justify-between gap-3 px-1 pb-4">
          <p className="font-geist text-[0.8125rem] font-extrabold text-public-content">
            Planning équipe
          </p>
          <p className="hidden items-center gap-2 font-geist text-[0.8125rem] font-bold text-public-content sm:flex">
            <span className="text-public-content-muted">‹</span>
            12 - 18 août
            <span className="text-public-content-muted">›</span>
          </p>
          <span className="rounded-[3px] bg-public-content px-3 py-2 font-geist text-[0.6875rem] text-white">
            + Créneau
          </span>
        </div>

        {/*
         * Grille a quatre colonnes avec un ecart de 6 px : les cellules sont
         * separees et non jointives, ce qui aere la maquette a cette taille.
         *
         * Sous `sm`, la quatrieme colonne est masquee : a 390 px de large,
         * quatre colonnes tronquaient les prenoms et les horaires en
         * « Lea … » et « 09:00 - … », illisibles.
         */}
        <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-[6px] sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {ROWS.map((row) => (
            <Fragment key={row.initials}>
              {/* Colonne employe */}
              <div className="flex min-h-[4.875rem] min-w-0 items-center gap-2.5 border border-public-content/20 px-2.5 py-3">
                <span
                  className={cn(
                    'flex h-[1.9375rem] w-[1.9375rem] shrink-0 items-center justify-center rounded-full font-geist text-[0.5625rem] font-extrabold text-public-content',
                    AVATAR_TONE[row.avatarTone]
                  )}
                >
                  {row.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-geist text-[0.625rem] font-bold text-public-content">
                    {row.name}
                  </span>
                  <span className="block truncate font-geist text-[0.5rem] text-public-content-muted">
                    {row.role}
                  </span>
                </span>
              </div>

              {/* Creneaux */}
              {row.slots.map((slot, index) => (
                <div
                  key={`${row.initials}-${index}`}
                  className={cn(
                    'min-h-[4.875rem] min-w-0 flex-col justify-center border-l-[3px] px-2.5 py-3',
                    // Le troisieme creneau n'apparait qu'a partir de `sm`
                    index === 2 ? 'hidden sm:flex' : 'flex',
                    SLOT_TONE[slot.tone]
                  )}
                >
                  <span className="block truncate font-geist text-[0.625rem] font-bold text-public-content">
                    {slot.time}
                  </span>
                  <span className="block truncate font-geist text-[0.5rem] text-public-content-muted">
                    {slot.detail}
                  </span>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Badge flottant, repris du prototype : aplat corail, angles vifs */}
      <div className="absolute -bottom-8 right-4 flex items-center gap-3 bg-public-accent-surface px-[1.125rem] py-[0.8125rem] sm:-bottom-9 sm:right-8">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-public-content text-[0.75rem] text-white">
          ✓
        </span>
        <span className="font-geist text-[0.6875rem] font-bold leading-tight text-public-content-on-vivid">
          Planning publié
          <span className="block text-[0.5625rem] font-normal">
            3 personnes notifiées
          </span>
        </span>
      </div>
    </div>
  )
}
