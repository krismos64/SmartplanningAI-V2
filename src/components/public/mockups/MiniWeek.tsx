/**
 * MiniWeek - Bande de cinq jours en pied de carte
 *
 * Repris du prototype (SP-574), ou il occupe le bas de la carte principale
 * de la section produit. Sans lui, cette carte laisse environ 300 px de vide
 * sous son texte : elle est deux fois plus haute que ses voisines pour
 * equilibrer la grille, et rien ne remplissait cet espace.
 *
 * Purement decoratif, `aria-hidden` : les horaires n'apportent aucune
 * information, ils illustrent le propos de la carte. Construit en DOM comme
 * `PlanningMockup`, donc aucune requete image.
 *
 * Server Component, aucun JavaScript envoye au client.
 *
 * @see SP-574 - Section produit a la mise en page du prototype
 */

import { cn } from '@/lib/utils'

/** Jours affiches, valeurs d'illustration relevees sur le prototype. */
const DAYS = [
  { day: 'Lun', slot: '08 - 16' },
  { day: 'Mar', slot: '10 - 18' },
  { day: 'Mer', slot: 'Repos' },
  { day: 'Jeu', slot: '12 - 19' },
  { day: 'Ven', slot: '09 - 17' },
] as const

export function MiniWeek({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('grid select-none grid-cols-5 gap-1.5', className)}
    >
      {DAYS.map(({ day, slot }) => (
        <div
          key={day}
          className="border-t border-public-content-on-dark/25 pt-2.5 font-geist"
        >
          <span className="block text-[0.5rem] uppercase tracking-[0.1em] text-public-content-on-dark/60">
            {day}
          </span>
          <span className="mt-0.5 block text-[0.6875rem] font-bold text-public-content-on-dark">
            {slot}
          </span>
        </div>
      ))}
    </div>
  )
}
