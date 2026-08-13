/**
 * TargetCard Component
 *
 * Segment d'audience de la page A propos, direction editoriale SP-571 :
 * filets plutot que carte arrondie a pastille coloree.
 *
 * Server Component depuis SP-571, pour les memes raisons que ValueCard.
 *
 * @see SP-571 - Tarifs, a-propos et pages legales
 */

import { LucideIcon } from 'lucide-react'

interface TargetCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function TargetCard({
  icon: Icon,
  title,
  description,
}: TargetCardProps) {
  return (
    <div className="flex items-start gap-4 border-t border-public-border py-6">
      <Icon
        className="mt-1 h-5 w-5 shrink-0 text-public-accent"
        aria-hidden="true"
      />
      <div>
        <h3 className="font-geist font-semibold text-public-content">
          {title}
        </h3>
        <p className="mt-1 font-geist text-sm leading-relaxed text-public-content-muted">
          {description}
        </p>
      </div>
    </div>
  )
}
