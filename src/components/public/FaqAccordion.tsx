'use client'

/**
 * FaqAccordion - Ilot client des FAQ de pages publiques
 *
 * Seul composant client des pages secteur et guide depuis SP-570 : le reste
 * de ces pages est du contenu statique, rendu cote serveur.
 *
 * Deux contraintes structurantes, heritees de SP-552 et SP-568 :
 *
 * 1. Chaque reponse reste TOUJOURS dans le DOM. Elle est masquee par une
 *    hauteur animee et `aria-hidden`, jamais par un montage conditionnel,
 *    qui la rendrait invisible aux crawlers et aux assistants et annulerait
 *    l'interet du schema FAQPage.
 * 2. Le declencheur est un <button> avec `aria-expanded` et `aria-controls`,
 *    donc focusable et actionnable au clavier.
 *
 * L'animation passe par `grid-template-rows` en CSS plutot que par Framer
 * Motion : la bibliotheque n'a plus a etre chargee sur ces pages.
 *
 * @see SP-570 - Pages secteur et guides
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FaqAccordionItem {
  question: string
  answer: string
}

interface FaqAccordionProps {
  items: FaqAccordionItem[]
  /**
   * Prefixe des identifiants, pour que deux accordeons d'une meme page ne
   * produisent pas d'identifiants en double.
   */
  idPrefix?: string
  className?: string
}

export function FaqAccordion({
  items,
  idPrefix = 'faq',
  className,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={cn('border-t border-public-border', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const buttonId = `${idPrefix}-button-${index}`
        const panelId = `${idPrefix}-panel-${index}`

        return (
          <div key={item.question} className="border-b border-public-border">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex min-h-[3.5rem] w-full items-center justify-between gap-4 py-5 text-left font-geist text-base font-semibold text-public-content transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface sm:text-lg"
              >
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'h-5 w-5 shrink-0 text-public-accent transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
            </h3>

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
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
