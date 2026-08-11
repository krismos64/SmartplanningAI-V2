/**
 * BentoCard - Carte des grilles bento publiques
 *
 * Remplace la grille de cartes reguliere par des blocs d'emprise variable,
 * en aplats francs plutot qu'en degrades. Le filet colore en tete de carte
 * reprend le motif du prototype.
 *
 * Server Component : aucune interactivite. Une carte cliquable s'obtient en
 * l'enveloppant dans un <Link>, plutot qu'en ajoutant un gestionnaire ici.
 *
 * @see SP-565 - Socle visuel public
 */

import { cn } from '@/lib/utils'

/** Aplat de fond de la carte. Determine aussi la couleur du texte. */
export type BentoCardTone = 'light' | 'dark' | 'accent' | 'brand' | 'highlight'

interface BentoCardProps {
  children: React.ReactNode
  tone?: BentoCardTone
  /**
   * Rang affiche en tete de carte. Decoratif, masque aux technologies
   * d'assistance.
   */
  index?: number
  /** Filet colore en tete de carte */
  rule?: boolean
  className?: string
}

/**
 * Chaque combinaison respecte WCAG AA, ratios mesures dans
 * publicContrastReference (brand-public.ts) :
 * - dark      : creme sur bleu nuit, 14.67:1
 * - light     : bleu nuit sur creme, 14.67:1
 * - accent    : bleu nuit sur corail, 5.41:1
 * - highlight : bleu nuit sur lime, 13.90:1
 * - brand     : blanc sur bleu franc, 4.88:1
 *
 * `accent` porte du texte bleu nuit et non blanc : le blanc sur corail
 * tombe a 3.19:1, insuffisant hors grands titres.
 */
const TONE_CLASSES: Record<BentoCardTone, { surface: string; rule: string }> = {
  light: {
    surface: 'bg-public-surface-subtle text-public-content',
    rule: 'bg-public-accent',
  },
  dark: {
    surface: 'bg-public-surface-inverted text-public-content-inverted',
    rule: 'bg-public-highlight',
  },
  accent: {
    surface: 'bg-public-accent-surface text-public-content-on-vivid',
    rule: 'bg-public-surface-inverted',
  },
  brand: {
    surface: 'bg-public-brand-surface text-white',
    rule: 'bg-public-highlight',
  },
  highlight: {
    surface: 'bg-public-highlight-surface text-public-content-on-vivid',
    rule: 'bg-public-surface-inverted',
  },
}

export function BentoCard({
  children,
  tone = 'light',
  index,
  rule = true,
  className,
}: BentoCardProps) {
  const colors = TONE_CLASSES[tone]

  return (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden font-geist',
        colors.surface,
        className
      )}
    >
      {rule ? (
        <span aria-hidden="true" className={cn('block h-1 w-full', colors.rule)} />
      ) : null}

      <div className="flex h-full flex-col gap-3 p-6 sm:p-8">
        {typeof index === 'number' ? (
          <span
            aria-hidden="true"
            className="text-xs font-semibold tabular-nums opacity-70"
          >
            {String(index).padStart(2, '0')}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  )
}
