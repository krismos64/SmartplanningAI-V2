/**
 * ValueCard Component
 *
 * Carte de valeur de la page A propos.
 *
 * Mise en page reprise du prototype en SP-575 : la serie de trois cartes
 * alterne les aplats (creme, bleu franc, corail) sous un filet de 5 px,
 * la ou SP-571 les laissait toutes en creme sous un filet corail de 1 px.
 * Le rang et le titre sont poses en grand, sans icone : le prototype n'en
 * porte aucune et l'icone ajoutait un repere de plus a lire.
 *
 * Server Component depuis SP-571 : le composant ne portait que la variante
 * d'apparition `fadeInUp`, qui tirait Framer Motion dans le bundle.
 *
 * @see SP-571 - Tarifs, a-propos et pages legales
 * @see SP-575 - Valeurs en aplats, mise en page du prototype
 */

import { cn } from '@/lib/utils'

/**
 * Une teinte d'aplat par carte, avec la couleur de texte et de filet qui
 * tient le contraste dessus.
 *
 * Sur le bleu franc, seul le blanc pur passe (4,86:1). Le creme de
 * `content-on-dark` y tombe a 4,13:1, sous le seuil AA, et le bleu nuit de
 * `content-on-vivid` bien plus bas encore : cette carte prend donc
 * `text-white`, comme `BentoCard` sur le meme aplat. Le filet reprend le
 * lime, qui est la teinte que le prototype pose sur ce bleu.
 */
const TONES = [
  {
    surface: 'bg-public-surface-subtle',
    text: 'text-public-content',
    rule: 'bg-public-content',
  },
  {
    surface: 'bg-public-brand-surface',
    text: 'text-white',
    rule: 'bg-public-highlight-surface',
  },
  {
    surface: 'bg-public-accent-surface',
    text: 'text-public-content-on-vivid',
    rule: 'bg-public-content',
  },
] as const

interface ValueCardProps {
  title: string
  description: string
  /** Rang affiche en tete de carte, decoratif */
  index?: number
  /** Rang dans la serie, choisit l'aplat. Reprend `index` par defaut. */
  tone?: number
  className?: string
}

export function ValueCard({
  title,
  description,
  index,
  tone,
  className,
}: ValueCardProps) {
  const palette = TONES[((tone ?? index ?? 1) - 1) % TONES.length] ?? TONES[0]

  return (
    <div className={cn('flex h-full flex-col', palette.surface, className)}>
      <span
        aria-hidden="true"
        className={cn('block h-[5px] w-full', palette.rule)}
      />

      <div className="flex h-full flex-col gap-4 p-7 sm:p-9">
        {typeof index === 'number' ? (
          <span
            aria-hidden="true"
            className={cn(
              'font-geist text-sm font-bold tabular-nums',
              palette.text
            )}
          >
            {String(index).padStart(2, '0')}
          </span>
        ) : null}

        <h3
          className={cn(
            'font-geist text-3xl font-bold leading-[1.05] tracking-[-0.035em]',
            palette.text
          )}
        >
          {title}
        </h3>

        <p className={cn('font-geist leading-relaxed', palette.text)}>
          {description}
        </p>
      </div>
    </div>
  )
}
