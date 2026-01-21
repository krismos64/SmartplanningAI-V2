'use client'

/**
 * Avatar Components - SmartPlanning V2
 *
 * Avatar et AvatarGroup avec support de tailles et chevauchement.
 *
 * @see SP-260 - Extension composants UI
 * Extensions : AvatarGroup, size variants, overlap
 */

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Avatar Variants
// ============================================================================

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        default: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// ============================================================================
// Avatar
// ============================================================================

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

// ============================================================================
// AvatarImage
// ============================================================================

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

// ============================================================================
// AvatarFallback
// ============================================================================

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// ============================================================================
// AvatarGroup
// ============================================================================

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nombre maximum d'avatars à afficher */
  max?: number
  /** Taille des avatars du groupe */
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl'
  /** Espacement entre les avatars (négatif = chevauchement) */
  spacing?: 'tight' | 'default' | 'loose'
}

const spacingClasses = {
  tight: {
    xs: '-ml-3',
    sm: '-ml-3.5',
    default: '-ml-4',
    lg: '-ml-5',
    xl: '-ml-6',
  },
  default: {
    xs: '-ml-2',
    sm: '-ml-2.5',
    default: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
  },
  loose: {
    xs: '-ml-1',
    sm: '-ml-1.5',
    default: '-ml-2',
    lg: '-ml-2.5',
    xl: '-ml-3',
  },
}

function AvatarGroup({
  children,
  max = 5,
  size = 'default',
  spacing = 'default',
  className,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children)
  const totalAvatars = childrenArray.length
  const visibleAvatars = childrenArray.slice(0, max)
  const remainingCount = totalAvatars - max

  return (
    <div
      className={cn('flex items-center', className)}
      role="group"
      aria-label={`Groupe de ${totalAvatars} avatars`}
      {...props}
    >
      {visibleAvatars.map((child, index) => {
        // Clone l'enfant pour ajouter la taille et le style de chevauchement
        if (React.isValidElement<AvatarProps>(child)) {
          return React.cloneElement(child, {
            key: index,
            size,
            className: cn(
              child.props.className,
              index > 0 && spacingClasses[spacing][size],
              'ring-2 ring-background'
            ),
            style: {
              ...child.props.style,
              zIndex: totalAvatars - index,
            },
          })
        }
        return child
      })}

      {/* Indicateur du nombre restant */}
      {remainingCount > 0 && (
        <Avatar
          size={size}
          className={cn(
            spacingClasses[spacing][size],
            'ring-2 ring-background'
          )}
          style={{ zIndex: 0 }}
        >
          <AvatarFallback className="bg-muted text-muted-foreground">
            +{remainingCount > 99 ? '99' : remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants }
