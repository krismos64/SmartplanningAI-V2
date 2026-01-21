'use client'

/**
 * ErrorIllustration Component
 * SVG illustration for error states
 *
 * @see SP-378 - Empty States
 */

import { cn } from '@/lib/utils'

export interface ErrorIllustrationProps {
  /** Additional CSS classes */
  className?: string
  /** Width of the illustration */
  width?: number
  /** Height of the illustration */
  height?: number
  /** Accessible title for the illustration */
  title?: string
}

export function ErrorIllustration({
  className,
  width = 200,
  height = 200,
  title = 'Une erreur est survenue',
}: ErrorIllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={width}
      height={height}
      className={cn('text-muted-foreground', className)}
      role="img"
      aria-labelledby="error-illustration-title"
    >
      <title id="error-illustration-title">{title}</title>

      {/* Background circle */}
      <circle cx="100" cy="100" r="80" className="fill-destructive/10" />

      {/* Warning triangle */}
      <path
        d="M100 45 L145 135 L55 135 Z"
        className="fill-background stroke-destructive/70"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Inner triangle fill */}
      <path d="M100 60 L135 125 L65 125 Z" className="fill-destructive/20" />

      {/* Exclamation mark - line */}
      <line
        x1="100"
        y1="80"
        x2="100"
        y2="105"
        className="stroke-destructive/70"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Exclamation mark - dot */}
      <circle cx="100" cy="118" r="4" className="fill-destructive/70" />

      {/* Decorative elements */}
      <circle cx="60" cy="55" r="3" className="fill-destructive/20" />
      <circle cx="145" cy="70" r="2.5" className="fill-destructive/15" />
      <circle cx="50" cy="130" r="2" className="fill-destructive/20" />
      <circle cx="155" cy="125" r="3" className="fill-destructive/10" />

      {/* Lightning bolt decorations */}
      <path
        d="M45 80 L50 75 L48 82 L53 78"
        className="stroke-destructive/30"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M155 90 L160 85 L158 92 L163 88"
        className="stroke-destructive/25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
