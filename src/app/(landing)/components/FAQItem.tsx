'use client'

/**
 * FAQItem Component
 *
 * Element d'accordeon de FAQ, direction editoriale SP-568 : filets plutot
 * que cartes arrondies.
 *
 * Deux contraintes structurantes :
 *
 * 1. La reponse reste TOUJOURS presente dans le DOM. Elle est masquee par
 *    une hauteur animee et `aria-hidden`, jamais par un montage
 *    conditionnel, qui la rendrait invisible aux crawlers et aux assistants
 *    et annulerait l'interet du schema FAQPage (SP-552).
 *
 * 2. Le declencheur est un <button>, pas une <div> cliquable. La version
 *    precedente posait `onClick` sur une div : l'element n'etait ni
 *    focusable ni actionnable au clavier, ce qui excluait toute navigation
 *    sans souris. Corrige en SP-568.
 *
 * @see SP-568 - Landing, sections basses
 */

import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
  /**
   * Identifiant stable reliant le bouton a sa reponse. Facultatif : un
   * identifiant genere prend le relais. Le fournir reste preferable quand
   * l'appelant dispose d'une cle stable, un identifiant genere changeant
   * entre le rendu serveur et une eventuelle rehydratation partielle.
   */
  id?: string
}

export function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
  id,
}: FAQItemProps) {
  const generatedId = useId()
  const itemId = id ?? generatedId
  const panelId = `faq-panel-${itemId}`
  const buttonId = `faq-button-${itemId}`

  return (
    <div className="border-b border-public-border">
      <h3>
        <button
          type="button"
          id={buttonId}
          onClick={onClick}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex min-h-[3.5rem] w-full items-center justify-between gap-4 py-5 text-left font-geist text-base font-semibold text-public-content transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface sm:text-lg"
        >
          {question}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-5 w-5 shrink-0 text-public-accent transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </h3>

      {/* Reponse toujours dans le DOM. `grid-template-rows` anime la hauteur
          sans valeur fixe et sans JavaScript, la ou l'ancienne version
          passait par Framer Motion. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-6 font-geist text-base leading-relaxed text-public-content-muted">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}
