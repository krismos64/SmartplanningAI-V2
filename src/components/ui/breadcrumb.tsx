'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'

/**
 * Breadcrumb Components
 *
 * @see SP-388 - Responsive breadcrumbs with horizontal scroll on mobile
 *
 * ✅ Source : Context7 - Tailwind CSS scroll-snap utilities
 */

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = 'Breadcrumb'

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = 'BreadcrumbList'

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-1.5', className)}
    {...props}
  />
))
BreadcrumbItem.displayName = 'BreadcrumbItem'

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'

  return (
    <Comp
      ref={ref}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = 'BreadcrumbLink'

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('font-normal text-foreground', className)}
    {...props}
  />
))
BreadcrumbPage.displayName = 'BreadcrumbPage'

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRightIcon />}
  </li>
)
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <DotsHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis'

// ============================================================================
// SP-388: ResponsiveBreadcrumb - Wrapper avec scroll horizontal mobile
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

export interface ResponsiveBreadcrumbProps {
  /** Breadcrumb items to render */
  children: React.ReactNode
  /** Custom separator between items */
  separator?: React.ReactNode
  /** Show fade edge indicators when content overflows */
  showFadeEdges?: boolean
  /** Additional class names */
  className?: string
  /** Test ID */
  'data-testid'?: string
}

/**
 * ResponsiveBreadcrumb - Breadcrumb adaptatif avec scroll horizontal mobile
 *
 * Sur mobile (< 768px), active le scroll horizontal avec snap-to-item
 * et indicateurs de fade sur les bords pour signaler le débordement.
 *
 * @see SP-388 - Responsive Breadcrumbs
 * @see Context7 - Tailwind CSS scroll-snap utilities
 *
 * @example
 * ```tsx
 * <ResponsiveBreadcrumb>
 *   <BreadcrumbItem>
 *     <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *   </BreadcrumbItem>
 *   <BreadcrumbSeparator />
 *   <BreadcrumbItem>
 *     <BreadcrumbLink href="/products">Products</BreadcrumbLink>
 *   </BreadcrumbItem>
 *   <BreadcrumbSeparator />
 *   <BreadcrumbItem>
 *     <BreadcrumbPage>Current Page</BreadcrumbPage>
 *   </BreadcrumbItem>
 * </ResponsiveBreadcrumb>
 * ```
 */
function ResponsiveBreadcrumb({
  children,
  separator,
  showFadeEdges = true,
  className,
  'data-testid': dataTestId = 'responsive-breadcrumb',
}: ResponsiveBreadcrumbProps) {
  const isMobile = useIsMobile()
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [showLeftFade, setShowLeftFade] = React.useState(false)
  const [showRightFade, setShowRightFade] = React.useState(false)

  // Scroll to end on mobile to show current page
  React.useEffect(() => {
    if (isMobile && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      // Scroll to the right to show the current page
      container.scrollLeft = container.scrollWidth - container.clientWidth
    }
  }, [isMobile, children])

  // Update fade indicators on scroll
  React.useEffect(() => {
    if (!isMobile || !showFadeEdges || !scrollContainerRef.current) return

    const container = scrollContainerRef.current

    const updateFades = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      const canScrollLeft = scrollLeft > 5
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 5

      setShowLeftFade(canScrollLeft)
      setShowRightFade(canScrollRight)
    }

    updateFades()
    container.addEventListener('scroll', updateFades, { passive: true })
    return () => container.removeEventListener('scroll', updateFades)
  }, [isMobile, showFadeEdges])

  // Desktop: render standard breadcrumb
  if (!isMobile) {
    return (
      <Breadcrumb
        separator={separator}
        className={className}
        data-testid={dataTestId}
      >
        <BreadcrumbList>{children}</BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Mobile: render with horizontal scroll
  return (
    <Breadcrumb
      separator={separator}
      className={cn('relative', className)}
      data-testid={dataTestId}
    >
      {/* Left fade indicator */}
      {showFadeEdges && showLeftFade && (
        <div
          className={cn(
            'pointer-events-none absolute left-0 top-0 z-10 h-full w-8',
            'bg-gradient-to-r from-background to-transparent'
          )}
          aria-hidden="true"
          data-testid="breadcrumb-fade-left"
        />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          'overflow-x-auto overflow-y-hidden',
          // Hide scrollbar
          'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Touch behavior
          'touch-pan-x'
        )}
        data-testid="breadcrumb-scroll-container"
      >
        <BreadcrumbList
          className={cn(
            // No wrap on mobile
            'flex-nowrap',
            // Scroll snap
            'snap-x snap-mandatory',
            // Padding for fade edges
            showFadeEdges && 'px-2'
          )}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child

            // Add snap-center to each breadcrumb item
            if (
              child.type === BreadcrumbItem ||
              (child.type as React.ComponentType)?.displayName ===
                'BreadcrumbItem'
            ) {
              return React.cloneElement(
                child as React.ReactElement<{ className?: string }>,
                {
                  className: cn(
                    (child.props as { className?: string }).className,
                    'snap-center shrink-0'
                  ),
                }
              )
            }

            // Separators
            if (
              child.type === BreadcrumbSeparator ||
              (child.type as React.ComponentType)?.displayName ===
                'BreadcrumbSeparator'
            ) {
              return React.cloneElement(
                child as React.ReactElement<{ className?: string }>,
                {
                  className: cn(
                    (child.props as { className?: string }).className,
                    'shrink-0'
                  ),
                }
              )
            }

            return child
          })}
        </BreadcrumbList>
      </div>

      {/* Right fade indicator */}
      {showFadeEdges && showRightFade && (
        <div
          className={cn(
            'pointer-events-none absolute right-0 top-0 z-10 h-full w-8',
            'bg-gradient-to-l from-background to-transparent'
          )}
          aria-hidden="true"
          data-testid="breadcrumb-fade-right"
        />
      )}
    </Breadcrumb>
  )
}
ResponsiveBreadcrumb.displayName = 'ResponsiveBreadcrumb'

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  ResponsiveBreadcrumb,
}
