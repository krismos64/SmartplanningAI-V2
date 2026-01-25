'use client'

/**
 * SkipLink - Lien d'accessibilité "Aller au contenu principal"
 *
 * WCAG 2.4.1 - Bypass Blocks (Level A)
 * Permet aux utilisateurs de clavier de sauter directement au contenu principal
 * sans avoir à naviguer à travers la navigation répétitive.
 *
 * Comportement :
 * - Invisible par défaut (sr-only)
 * - Devient visible au focus (Tab)
 * - Positionné en haut à gauche de l'écran
 * - Redirige vers #main-content
 *
 * @ticket SP-269
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html
 */

import { cn } from '@/lib/utils'

export interface SkipLinkProps {
  /** Texte du lien (par défaut: "Aller au contenu principal") */
  label?: string
  /** ID de la cible (par défaut: "main-content") */
  targetId?: string
  /** Classes CSS additionnelles */
  className?: string
}

export function SkipLink({
  label = 'Aller au contenu principal',
  targetId = 'main-content',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Invisible par défaut
        'sr-only',
        // Visible au focus
        'focus:not-sr-only',
        'focus:absolute',
        'focus:top-4',
        'focus:left-4',
        'focus:z-[100]',
        // Style du bouton
        'focus:px-4',
        'focus:py-2',
        'focus:bg-primary',
        'focus:text-primary-foreground',
        'focus:rounded-md',
        'focus:font-medium',
        // Focus ring
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2',
        // Transition
        'transition-all',
        className
      )}
      data-testid="skip-link"
    >
      {label}
    </a>
  )
}

SkipLink.displayName = 'SkipLink'
