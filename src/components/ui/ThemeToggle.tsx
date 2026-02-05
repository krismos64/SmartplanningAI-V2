'use client'

/**
 * ThemeToggle Component
 *
 * Toggle de thème avec cycle 3 états : System → Light → Dark → System
 * Utilise next-themes pour la gestion du thème et le système d'animation SP-379.
 *
 * @see SP-265 - Dark/Light Mode
 * @see Context7 - next-themes best practices 2025-2026
 *
 * Fonctionnalités :
 * - Détection des préférences système (prefers-color-scheme)
 * - Persistance localStorage automatique
 * - Animation de transition fluide
 * - Accessibilité (aria-label dynamique)
 * - Évite le flash d'hydratation (mounted state)
 */

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { motion, buttonIcon } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  /** Classes CSS additionnelles */
  className?: string
  /** Taille de l'icône (default: 5) */
  iconSize?: number
  /** Afficher le label textuel */
  showLabel?: boolean
}

export function ThemeToggle({
  className,
  iconSize = 5,
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Éviter l'hydratation mismatch - le thème n'est connu que côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Placeholder de même taille pendant l'hydratation - WCAG 2.5.5: 44px touch target
  if (!mounted) {
    return (
      <div
        className={cn(
          'flex h-11 min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg p-2',
          showLabel && 'min-w-[100px]',
          className
        )}
        aria-hidden="true"
      >
        <div className={`h-${iconSize} w-${iconSize}`} />
        {showLabel && <span className="text-sm opacity-0">Thème</span>}
      </div>
    )
  }

  // Cycle : system → light → dark → system
  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  // Sélection de l'icône selon le thème actuel
  const Icon =
    theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun

  // Labels pour l'accessibilité
  const themeLabels: Record<string, string> = {
    system: 'Système',
    light: 'Clair',
    dark: 'Sombre',
  }

  const currentLabel = themeLabels[theme || 'system']
  const nextTheme =
    theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
  const nextLabel = themeLabels[nextTheme]

  return (
    <motion.button
      onClick={cycleTheme}
      className={cn(
        // WCAG 2.5.5: 44px minimum touch target
        'flex h-11 min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg p-2',
        'text-foreground-muted hover:text-foreground',
        'hover:bg-muted/80 dark:hover:bg-muted/50',
        'touch-manipulation transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      aria-label={`Thème actuel : ${currentLabel}. Cliquer pour passer en mode ${nextLabel}.`}
      title={`Mode ${currentLabel} - Cliquer pour ${nextLabel}`}
      data-testid="theme-toggle-button"
      {...buttonIcon}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Icon className={`h-${iconSize} w-${iconSize}`} aria-hidden="true" />
      </motion.div>
      {showLabel && <span className="text-sm font-medium">{currentLabel}</span>}
    </motion.button>
  )
}
