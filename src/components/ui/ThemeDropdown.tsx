'use client'

/**
 * ThemeDropdown Component
 *
 * Dropdown de sélection de thème avec 3 options explicites.
 * Alternative au ThemeToggle pour une UX plus claire.
 *
 * @see SP-265 - Dark/Light Mode
 *
 * Options :
 * - Clair (Light)
 * - Sombre (Dark)
 * - Système (System) - suit les préférences OS
 */

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react'
import {
  motion,
  FramerAnimatePresence as AnimatePresence,
} from '@/lib/animations'
import { cn } from '@/lib/utils'

interface ThemeOption {
  value: string
  label: string
  icon: typeof Sun
  description: string
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Clair',
    icon: Sun,
    description: 'Thème clair',
  },
  {
    value: 'dark',
    label: 'Sombre',
    icon: Moon,
    description: 'Thème sombre',
  },
  {
    value: 'system',
    label: 'Système',
    icon: Monitor,
    description: 'Suit les préférences système',
  },
]

interface ThemeDropdownProps {
  /** Classes CSS additionnelles */
  className?: string
  /** Position du dropdown */
  align?: 'left' | 'right'
}

export function ThemeDropdown({
  className,
  align = 'right',
}: ThemeDropdownProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-theme-dropdown]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
    return undefined
  }, [isOpen])

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
    return undefined
  }, [isOpen])

  if (!mounted) {
    return (
      <div className={cn('relative', className)} aria-hidden="true">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" />
      </div>
    )
  }

  const currentOption =
    themeOptions.find((opt) => opt.value === theme) ?? themeOptions[2]
  const CurrentIcon = currentOption!.icon

  return (
    <div className={cn('relative', className)} data-theme-dropdown>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-2',
          'text-foreground-muted hover:text-foreground',
          'hover:bg-muted/80 dark:hover:bg-muted/50',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Thème : ${currentOption!.label}`}
      >
        <CurrentIcon className="h-5 w-5" aria-hidden="true" />
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute top-full z-50 mt-2 min-w-[180px]',
              'rounded-lg border border-border bg-popover p-1 shadow-lg',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            role="listbox"
            aria-label="Sélectionner un thème"
          >
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2',
                    'text-left text-sm transition-colors',
                    'hover:bg-muted focus-visible:bg-muted',
                    'focus-visible:outline-none',
                    isSelected && 'bg-muted/50'
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <Icon
                    className="text-foreground-muted h-4 w-4"
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {option.label}
                    </div>
                    <div className="text-foreground-muted text-xs">
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
