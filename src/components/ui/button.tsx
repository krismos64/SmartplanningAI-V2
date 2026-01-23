import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Button variants using CVA (class-variance-authority)
 *
 * @see SP-260 - Extension composants UI
 * @see SP-385 - TouchableButton variants (WCAG 2.5.5 - 44px touch targets)
 *
 * Variants ajoutés :
 * - success, warning, info (SP-260)
 * - touch, touch-sm, touch-icon, touch-lg (SP-385)
 *
 * ✅ Source : Context7 - WCAG 2.5.5 Target Size (44px minimum)
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // SP-260: Nouveaux variants sémantiques
        success:
          'bg-success text-success-foreground shadow-sm hover:bg-success/90',
        warning:
          'bg-warning text-warning-foreground shadow-sm hover:bg-warning/90',
        info: 'bg-info text-info-foreground shadow-sm hover:bg-info/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        // SP-385: Variants tactiles avec zones 44px minimum (WCAG 2.5.5 AAA)
        touch: 'h-11 min-h-[44px] min-w-[44px] px-5 py-3 text-base',
        'touch-sm': 'h-11 min-h-[44px] min-w-[44px] px-4 py-2.5 text-sm',
        'touch-icon': 'h-11 w-11 min-h-[44px] min-w-[44px] [&_svg]:size-5',
        'touch-lg': 'h-12 min-h-[48px] min-w-[48px] px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

// ============================================================================
// SP-385: TouchableButton - Wrapper pour zones tactiles adaptatives
// ============================================================================

/**
 * Hook pour détecter les écrans mobiles (< 768px)
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    setIsMobile(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isMobile
}

/**
 * Mapping des tailles standard vers tailles tactiles
 */
const touchSizeMapping: Record<string, string> = {
  default: 'touch',
  sm: 'touch-sm',
  lg: 'touch-lg',
  icon: 'touch-icon',
}

export interface TouchableButtonProps extends ButtonProps {
  /**
   * Forcer le mode tactile même sur desktop (pour tests ou préférence utilisateur)
   * @default false
   */
  forceTouchMode?: boolean
}

/**
 * TouchableButton - Bouton adaptatif mobile/desktop
 *
 * Sur mobile (< 768px), applique automatiquement les zones tactiles 44px (WCAG 2.5.5).
 * Sur desktop, utilise les tailles standard.
 *
 * @see SP-385 - Mobile Touch Targets
 * @see WCAG 2.5.5 Target Size (Enhanced) - 44x44px minimum
 *
 * @example
 * ```tsx
 * // Auto-adapte: 44px sur mobile, standard sur desktop
 * <TouchableButton variant="primary">Click me</TouchableButton>
 *
 * // Forcer le mode tactile sur desktop
 * <TouchableButton forceTouchMode>Always 44px</TouchableButton>
 *
 * // Icône seule
 * <TouchableButton size="icon"><MenuIcon /></TouchableButton>
 * ```
 */
const TouchableButton = React.forwardRef<
  HTMLButtonElement,
  TouchableButtonProps
>(({ size, forceTouchMode = false, className, ...props }, ref) => {
  const isMobile = useIsMobile()
  const shouldUseTouchSize = isMobile || forceTouchMode

  // Déterminer la taille à utiliser
  const effectiveSize = React.useMemo(() => {
    if (!shouldUseTouchSize) return size

    // Si déjà une taille tactile, la conserver
    if (size && String(size).startsWith('touch')) {
      return size
    }

    // Mapper vers la version tactile
    const sizeKey = size || 'default'
    return (touchSizeMapping[sizeKey] || 'touch') as VariantProps<
      typeof buttonVariants
    >['size']
  }, [size, shouldUseTouchSize])

  return (
    <Button
      ref={ref}
      size={effectiveSize}
      className={cn(
        // Active state amélioré pour le feedback tactile
        shouldUseTouchSize && 'active:scale-95 active:opacity-90',
        className
      )}
      {...props}
    />
  )
})
TouchableButton.displayName = 'TouchableButton'

export { Button, buttonVariants, TouchableButton, useIsMobile }
