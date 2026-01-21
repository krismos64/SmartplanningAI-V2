'use client'

/**
 * Badge Component - SmartPlanning V2
 *
 * Badge avec variants étendus, support d'icône et animation pulse.
 *
 * @see SP-260 - Extension composants UI
 * Extensions : icon prop, dot variant, pulse animation, success/warning/info variants
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        // SP-260: Nouveaux variants sémantiques
        success:
          'border-transparent bg-success text-success-foreground shadow hover:bg-success/80',
        warning:
          'border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80',
        info: 'border-transparent bg-info text-info-foreground shadow hover:bg-info/80',
        // SP-260: Variant dot (petit point coloré sans texte)
        dot: 'h-2 w-2 rounded-full border-0 p-0',
      },
      size: {
        default: 'px-2.5 py-0.5',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    compoundVariants: [
      // Dot variant ignore les sizes
      { variant: 'dot', size: 'default', class: 'px-0 py-0' },
      { variant: 'dot', size: 'sm', class: 'px-0 py-0 h-1.5 w-1.5' },
      { variant: 'dot', size: 'lg', class: 'px-0 py-0 h-2.5 w-2.5' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Couleurs pour le dot variant
const dotColors = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  outline: 'bg-foreground',
} as const

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Icône à afficher avant le texte */
  icon?: React.ReactNode
  /** Couleur du dot (utilisé uniquement avec variant="dot") */
  dotColor?: keyof typeof dotColors
  /** Active l'animation pulse (pour notifications) */
  pulse?: boolean
}

function Badge({
  className,
  variant,
  size,
  icon,
  dotColor,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  // Variant dot : affiche juste un point coloré
  if (variant === 'dot') {
    const colorClass = dotColors[dotColor || 'default']
    return (
      <span
        className={cn(
          badgeVariants({ variant, size }),
          colorClass,
          pulse && 'animate-pulse',
          className
        )}
        role="status"
        aria-label="Notification indicator"
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        pulse && 'animate-pulse',
        icon && 'gap-1',
        className
      )}
      {...props}
    >
      {icon && (
        <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
