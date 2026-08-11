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
 * @see SP-567 - Landing, hero et sections hautes
 */

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
 * Teintes des cellules. Volontairement en valeurs Tailwind fixes plutot
 * qu'en tokens publics : ce sont les couleurs de l'application reelle que
 * le mockup represente, pas celles de l'identite editoriale.
 */
const SLOT_TONE: Record<MockupSlot['tone'], string> = {
  blue: 'border-l-blue-500 bg-blue-50',
  amber: 'border-l-amber-400 bg-amber-50',
  green: 'border-l-emerald-500 bg-emerald-50',
  grey: 'border-l-slate-400 bg-slate-100',
}

const AVATAR_TONE: Record<MockupRow['avatarTone'], string> = {
  rose: 'bg-rose-100 text-rose-700',
  lime: 'bg-lime-100 text-lime-800',
  blue: 'bg-blue-100 text-blue-700',
}

export function PlanningMockup({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('relative select-none', className)}>
      {/* Bloc decale, effet de profondeur du prototype */}
      <div className="absolute inset-0 translate-x-3 translate-y-4 rounded-lg bg-public-brand-surface sm:translate-x-4 sm:translate-y-6" />

      <div className="relative overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5">
        {/* Barre de titre */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <p className="text-sm font-semibold text-slate-900">Planning équipe</p>
          <p className="hidden text-xs text-slate-500 sm:block">12 - 18 août</p>
          <span className="rounded bg-slate-900 px-2 py-1 text-[0.65rem] font-medium text-white">
            + Créneau
          </span>
        </div>

        {/* Lignes du planning */}
        <div className="divide-y divide-slate-100">
          {ROWS.map((row) => (
            <div
              key={row.initials}
              className="grid grid-cols-[7.5rem_1fr] items-stretch gap-px sm:grid-cols-[10rem_1fr]"
            >
              {/* Colonne employe */}
              <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold',
                    AVATAR_TONE[row.avatarTone]
                  )}
                >
                  {row.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-slate-900">
                    {row.name}
                  </span>
                  <span className="block truncate text-[0.65rem] text-slate-500">
                    {row.role}
                  </span>
                </span>
              </div>

              {/* Creneaux */}
              <div className="grid grid-cols-3 gap-px bg-slate-100">
                {row.slots.map((slot, index) => (
                  <div
                    key={`${row.initials}-${index}`}
                    className={cn(
                      'border-l-2 px-2 py-3 sm:px-3',
                      SLOT_TONE[slot.tone]
                    )}
                  >
                    <span className="block truncate text-[0.65rem] font-semibold text-slate-900">
                      {slot.time}
                    </span>
                    <span className="block truncate text-[0.6rem] text-slate-600">
                      {slot.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge flottant, repris du prototype */}
      <div className="absolute -bottom-4 right-2 flex items-center gap-2 rounded bg-public-accent-surface px-3 py-2 shadow-lg sm:right-4">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[0.6rem] text-white">
          ✓
        </span>
        <span className="text-[0.65rem] font-semibold leading-tight text-slate-900">
          Planning publié
          <span className="block font-normal">3 personnes notifiées</span>
        </span>
      </div>
    </div>
  )
}
