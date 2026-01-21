'use client'

/**
 * EmptyBoxIllustration Component
 * SVG illustration for default empty state
 *
 * @see SP-378 - Empty States
 */

import { cn } from '@/lib/utils'

export interface EmptyBoxIllustrationProps {
  /** Additional CSS classes */
  className?: string
  /** Width of the illustration */
  width?: number
  /** Height of the illustration */
  height?: number
  /** Accessible title for the illustration */
  title?: string
}

export function EmptyBoxIllustration({
  className,
  width = 200,
  height = 200,
  title = 'Boîte vide',
}: EmptyBoxIllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={width}
      height={height}
      className={cn('text-muted-foreground', className)}
      role="img"
      aria-labelledby="empty-box-title"
    >
      <title id="empty-box-title">{title}</title>

      {/* Background circle */}
      <circle cx="100" cy="100" r="80" className="fill-muted/30" />

      {/* Box - main body */}
      <path
        d="M60 85 L100 65 L140 85 L140 135 L100 155 L60 135 Z"
        className="fill-muted stroke-muted-foreground"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Box - left side */}
      <path
        d="M60 85 L60 135 L100 155 L100 105 Z"
        className="fill-muted-foreground/10 stroke-muted-foreground"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Box - right side */}
      <path
        d="M140 85 L140 135 L100 155 L100 105 Z"
        className="fill-muted-foreground/20 stroke-muted-foreground"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Box - top face */}
      <path
        d="M60 85 L100 65 L140 85 L100 105 Z"
        className="fill-background stroke-muted-foreground"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Box opening - flaps */}
      <path
        d="M60 85 L75 70 L100 85"
        className="fill-none stroke-muted-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M140 85 L125 70 L100 85"
        className="fill-none stroke-muted-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Decorative dots */}
      <circle cx="80" cy="55" r="3" className="fill-muted-foreground/30" />
      <circle cx="120" cy="50" r="2" className="fill-muted-foreground/20" />
      <circle cx="150" cy="75" r="2.5" className="fill-muted-foreground/25" />
    </svg>
  )
}
