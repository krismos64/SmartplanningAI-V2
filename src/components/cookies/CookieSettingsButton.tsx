'use client'

/**
 * Bouton d'accès aux paramètres cookies
 *
 * @description Petit bouton discret permettant d'ouvrir le modal de préférences.
 * À intégrer dans le footer ou les paramètres utilisateur.
 * Fonctionne de manière optionnelle avec ou sans CookieConsentProvider.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

import { Button } from '@/components/ui/button'
import { useCookieConsentContextOptional } from './CookieConsentProvider'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CookieSettingsButtonProps {
  /** Variante du bouton */
  variant?: 'default' | 'ghost' | 'link' | 'outline'
  /** Taille du bouton */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** Affiche uniquement l'icône */
  iconOnly?: boolean
  /** Classes CSS supplémentaires */
  className?: string
}

/**
 * Bouton pour accéder aux paramètres de cookies
 *
 * @example
 * ```tsx
 * // Dans le footer
 * <CookieSettingsButton variant="link" />
 *
 * // En mode icône seule
 * <CookieSettingsButton iconOnly size="icon" />
 * ```
 */
export function CookieSettingsButton({
  variant = 'ghost',
  size = 'sm',
  iconOnly = false,
  className,
}: CookieSettingsButtonProps) {
  const context = useCookieConsentContextOptional()

  // Handler qui ouvre les préférences si dans le Provider
  const handleClick = () => {
    context?.openPreferences()
  }

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        className={cn('h-8 w-8', className)}
        aria-label="Paramètres des cookies"
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn('gap-2', className)}
      aria-label="Ouvrir les paramètres des cookies"
    >
      <Settings className="h-4 w-4" aria-hidden="true" />
      <span>Paramètres des cookies</span>
    </Button>
  )
}

export default CookieSettingsButton
