/**
 * SectionLabel - Label numerote des sections publiques
 *
 * Rend le motif « 01 · GESTION D'EQUIPE POUR TPE & PME » : un numero cercle
 * suivi d'un intitule en petites capitales espacees. Marqueur de rythme de
 * la direction editoriale.
 *
 * Server Component : aucune interactivite, aucun JavaScript envoye au client.
 *
 * @see SP-565 - Socle visuel public
 */

import { cn } from '@/lib/utils'

/** Fond sur lequel le label est pose, determine le jeu de couleurs. */
export type SectionLabelTone = 'onLight' | 'onDark' | 'onAccent'

interface SectionLabelProps {
  /**
   * Rang de la section. Formate sur deux chiffres a l'affichage.
   * Purement decoratif : masque aux technologies d'assistance, la
   * hierarchie reelle etant portee par les titres.
   */
  index: number
  /** Intitule, rendu en capitales par CSS et non dans la source */
  children: React.ReactNode
  tone?: SectionLabelTone
  className?: string
}

/**
 * Couleurs par fond.
 *
 * `onLight` utilise coral.700 : le corail 500 ne donne que 2.71:1 sur le
 * creme, sous le seuil AA pour un texte de cette taille.
 */
const TONE_CLASSES: Record<SectionLabelTone, { ring: string; text: string }> = {
  onLight: {
    ring: 'border-public-accent/40',
    text: 'text-public-accent',
  },
  onDark: {
    ring: 'border-public-highlight/50',
    text: 'text-public-highlight',
  },
  onAccent: {
    ring: 'border-public-content/40',
    text: 'text-public-content',
  },
}

export function SectionLabel({
  index,
  children,
  tone = 'onLight',
  className,
}: SectionLabelProps) {
  const colors = TONE_CLASSES[tone]

  return (
    <p
      className={cn(
        'flex items-center gap-4 font-geist text-xs font-semibold uppercase tracking-[0.2em]',
        colors.text,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[0.7rem] tabular-nums',
          colors.ring
        )}
      >
        {String(index).padStart(2, '0')}
      </span>
      <span>{children}</span>
    </p>
  )
}
