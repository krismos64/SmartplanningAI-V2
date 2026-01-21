'use client'

/**
 * EmptyState Component
 *
 * @see SP-378 - Empty States - États vides pour listes, tableaux et recherches
 *
 * Composant réutilisable pour afficher des états vides avec animations
 * Variants disponibles : default, search, error, no-permission
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion, fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import {
  EmptyBoxIllustration,
  SearchNotFoundIllustration,
  ErrorIllustration,
  NoPermissionIllustration,
} from '@/components/illustrations'

// =============================================================================
// VARIANTS
// =============================================================================

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center',
  {
    variants: {
      variant: {
        default: '',
        search: '',
        error: '',
        'no-permission': '',
      },
      size: {
        sm: 'gap-3 py-8',
        default: 'gap-4 py-12',
        lg: 'gap-6 py-16',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const illustrationSizeMap = {
  sm: { width: 120, height: 120 },
  default: { width: 160, height: 160 },
  lg: { width: 200, height: 200 },
} as const

const titleVariants = cva('font-semibold text-foreground', {
  variants: {
    size: {
      sm: 'text-base',
      default: 'text-lg',
      lg: 'text-xl',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

const descriptionVariants = cva('text-muted-foreground max-w-md', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

// =============================================================================
// TYPES
// =============================================================================

export interface EmptyStateProps
  extends VariantProps<typeof emptyStateVariants> {
  /** Title text displayed below the illustration */
  title: string
  /** Description text providing more context */
  description?: string
  /** Custom illustration component - overrides variant illustration */
  illustration?: React.ReactNode
  /** Action button configuration */
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'secondary' | 'outline'
  }
  /** Whether to animate the component */
  animated?: boolean
  /** Hide the illustration */
  hideIllustration?: boolean
  /** ARIA live region politeness */
  'aria-live'?: 'polite' | 'assertive' | 'off'
  /** Additional CSS classes */
  className?: string
  /** Test ID for testing */
  'data-testid'?: string
}

// =============================================================================
// ILLUSTRATION MAPPING
// =============================================================================

const getDefaultIllustration = (
  variant: EmptyStateProps['variant'],
  size: EmptyStateProps['size']
) => {
  const dimensions = illustrationSizeMap[size || 'default']

  switch (variant) {
    case 'search':
      return <SearchNotFoundIllustration {...dimensions} />
    case 'error':
      return <ErrorIllustration {...dimensions} />
    case 'no-permission':
      return <NoPermissionIllustration {...dimensions} />
    default:
      return <EmptyBoxIllustration {...dimensions} />
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      title,
      description,
      illustration,
      action,
      animated = true,
      hideIllustration = false,
      'aria-live': ariaLive = 'polite',
      'data-testid': dataTestId,
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()
    const shouldAnimate = animated && !prefersReducedMotion

    const content = (
      <>
        {/* Illustration */}
        {!hideIllustration && (
          <div className="flex items-center justify-center" aria-hidden="true">
            {illustration || getDefaultIllustration(variant, size)}
          </div>
        )}

        {/* Text content */}
        <div className="space-y-2">
          <h3 className={cn(titleVariants({ size }))}>{title}</h3>
          {description && (
            <p className={cn(descriptionVariants({ size }))}>{description}</p>
          )}
        </div>

        {/* Action button */}
        {action && (
          <Button
            variant={action.variant || 'default'}
            size={size === 'sm' ? 'sm' : 'default'}
            onClick={action.onClick}
            className="mt-2"
          >
            {action.label}
          </Button>
        )}
      </>
    )

    if (shouldAnimate) {
      return (
        <motion.div
          ref={ref}
          variants={fadeSlideUpVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(emptyStateVariants({ variant, size }), className)}
          role="status"
          aria-live={ariaLive}
          data-testid={dataTestId}
        >
          {content}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant, size }), className)}
        role="status"
        aria-live={ariaLive}
        data-testid={dataTestId}
      >
        {content}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

export { EmptyState, emptyStateVariants }
