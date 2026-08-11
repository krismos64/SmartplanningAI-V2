/**
 * ValueCard Component
 *
 * Carte de valeur de la page A propos, direction editoriale SP-571 :
 * filet colore en tete, angles francs, pas de degrade ni de halo.
 *
 * Server Component depuis SP-571 : le composant ne portait que la variante
 * d'apparition `fadeInUp`, qui tirait Framer Motion dans le bundle.
 *
 * @see SP-571 - Tarifs, a-propos et pages legales
 */

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValueCardProps {
  icon: LucideIcon
  title: string
  description: string
  /** Rang affiche en tete de carte, decoratif */
  index?: number
  className?: string
}

export function ValueCard({
  icon: Icon,
  title,
  description,
  index,
  className,
}: ValueCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col bg-public-surface-subtle',
        className
      )}
    >
      <span aria-hidden="true" className="block h-1 w-full bg-public-accent" />

      <div className="flex h-full flex-col gap-3 p-6 sm:p-8">
        {typeof index === 'number' ? (
          <span
            aria-hidden="true"
            className="font-geist text-xs font-semibold tabular-nums text-public-accent"
          >
            {String(index).padStart(2, '0')}
          </span>
        ) : null}

        <h3 className="flex items-center gap-3 font-geist text-xl font-semibold text-public-content">
          <Icon
            className="h-5 w-5 shrink-0 text-public-accent"
            aria-hidden="true"
          />
          {title}
        </h3>

        <p className="font-geist leading-relaxed text-public-content-muted">
          {description}
        </p>
      </div>
    </div>
  )
}
