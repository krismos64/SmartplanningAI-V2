'use client'

/**
 * SwipeableDrawer - Composant drawer mobile avec gestes tactiles
 *
 * ✅ Source : Context7 - Framer Motion drag gestures + React createPortal
 *
 * OBJECTIF (SP-383) :
 * Drawer mobile avec support swipe natif pour fermeture intuitive.
 * Remplace Sheet de Radix sur mobile pour une meilleure UX tactile.
 *
 * FONCTIONNALITÉS :
 * - Swipe horizontal pour fermer (gauche ou droite selon côté)
 * - Détection vélocité et seuil de déplacement
 * - Animation spring fluide
 * - Portal rendering (z-index correct)
 * - Focus trap et accessibilité (aria-modal, role="dialog")
 * - Body scroll lock quand ouvert
 * - Support iOS safe-area
 * - Respect prefers-reduced-motion
 *
 * @ticket SP-383
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SwipeableDrawerProps {
  /** Contrôle l'état ouvert/fermé du drawer */
  open: boolean
  /** Callback appelé lors de la fermeture */
  onClose: () => void
  /** Callback optionnel appelé lors de l'ouverture */
  onOpen?: () => void
  /** Côté d'apparition du drawer */
  side?: 'left' | 'right'
  /** Largeur du drawer en pixels */
  width?: number
  /** Activer/désactiver le swipe pour fermer */
  swipeToClose?: boolean
  /** Seuil de déplacement pour déclencher la fermeture (px) */
  swipeThreshold?: number
  /** Seuil de vélocité pour déclencher la fermeture (px/s) */
  velocityThreshold?: number
  /** Contenu du drawer */
  children: React.ReactNode
  /** Classes CSS additionnelles */
  className?: string
  /** Afficher le bouton de fermeture */
  showCloseButton?: boolean
  /** Label accessible pour le drawer */
  ariaLabel?: string
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_WIDTH = 280
const DEFAULT_SWIPE_THRESHOLD = 100
const DEFAULT_VELOCITY_THRESHOLD = 500

// Animation spring optimisée pour les gestes tactiles
const SPRING_CONFIG = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 400,
  mass: 0.8,
}

// Animation réduite pour prefers-reduced-motion
const REDUCED_MOTION_CONFIG = {
  type: 'tween' as const,
  duration: 0.15,
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook pour verrouiller le scroll du body
 */
function useBodyScrollLock(locked: boolean) {
  React.useEffect(() => {
    if (!locked) return

    const originalStyle = window.getComputedStyle(document.body).overflow
    const originalPaddingRight = window.getComputedStyle(
      document.body
    ).paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalStyle
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [locked])
}

/**
 * Hook pour détecter prefers-reduced-motion
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook pour le focus trap basique
 */
function useFocusTrap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  isActive: boolean
) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus le premier élément au montage
    firstElement?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, isActive])
}

// ============================================================================
// Component
// ============================================================================

export function SwipeableDrawer({
  open,
  onClose,
  onOpen,
  side = 'left',
  width = DEFAULT_WIDTH,
  swipeToClose = true,
  swipeThreshold = DEFAULT_SWIPE_THRESHOLD,
  velocityThreshold = DEFAULT_VELOCITY_THRESHOLD,
  children,
  className,
  showCloseButton = true,
  ariaLabel = 'Navigation drawer',
}: SwipeableDrawerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [mounted, setMounted] = React.useState(false)

  // Montage client-side pour createPortal
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Callback onOpen
  React.useEffect(() => {
    if (open && onOpen) {
      onOpen()
    }
  }, [open, onOpen])

  // Body scroll lock
  useBodyScrollLock(open)

  // Focus trap
  useFocusTrap(containerRef, open)

  // Escape key handler
  React.useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  // Gestion du drag end
  const handleDragEnd = React.useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!swipeToClose) return

      const { offset, velocity } = info
      const isSwipingToClose =
        side === 'left'
          ? offset.x < -swipeThreshold || velocity.x < -velocityThreshold
          : offset.x > swipeThreshold || velocity.x > velocityThreshold

      if (isSwipingToClose) {
        onClose()
      }
    },
    [side, swipeToClose, swipeThreshold, velocityThreshold, onClose]
  )

  // Calcul des positions initiales et finales
  const getInitialX = () => (side === 'left' ? -width : width)
  const getAnimateX = () => 0
  const getExitX = () => (side === 'left' ? -width : width)

  // Configuration de l'animation
  const transitionConfig = prefersReducedMotion
    ? REDUCED_MOTION_CONFIG
    : SPRING_CONFIG

  // Variants pour les animations
  const drawerVariants = {
    initial: { x: getInitialX(), opacity: 0 },
    animate: { x: getAnimateX(), opacity: 1 },
    exit: { x: getExitX(), opacity: 0 },
  }

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  // Ne pas rendre côté serveur
  if (!mounted) return null

  const drawerContent = (
    <AnimatePresence mode="wait">
      {open && (
        <div
          className="fixed inset-0 z-50"
          role="presentation"
          data-testid="swipeable-drawer-container"
        >
          {/* Overlay backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            data-testid="swipeable-drawer-overlay"
          />

          {/* Drawer panel */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className={cn(
              'absolute bottom-0 top-0 flex flex-col',
              'bg-background shadow-2xl',
              // iOS safe-area support
              'pb-[env(safe-area-inset-bottom)]',
              side === 'left'
                ? 'left-0 rounded-r-2xl pl-[env(safe-area-inset-left)]'
                : 'right-0 rounded-l-2xl pr-[env(safe-area-inset-right)]',
              className
            )}
            style={{ width }}
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionConfig}
            // Drag configuration
            drag={swipeToClose ? 'x' : false}
            dragConstraints={{
              left: side === 'left' ? -width : 0,
              right: side === 'left' ? 0 : width,
            }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            data-testid="swipeable-drawer-panel"
            data-side={side}
          >
            {/* Close button - WCAG 2.5.5: 44px minimum touch target */}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'absolute top-4 z-10 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full',
                  'touch-manipulation bg-muted/80 transition-colors hover:bg-muted',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  side === 'left' ? 'right-4' : 'left-4'
                )}
                aria-label="Fermer le menu"
                data-testid="swipeable-drawer-close"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Swipe indicator */}
            {swipeToClose && (
              <div
                className={cn(
                  'absolute top-1/2 h-12 w-1 -translate-y-1/2 rounded-full bg-muted-foreground/30',
                  side === 'left' ? 'right-2' : 'left-2'
                )}
                aria-hidden="true"
                data-testid="swipeable-drawer-indicator"
              />
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-14">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // Render dans un portal
  return createPortal(drawerContent, document.body)
}

SwipeableDrawer.displayName = 'SwipeableDrawer'
