'use client'

/**
 * SearchNotFoundIllustration Component
 * SVG illustration for search with no results
 *
 * @see SP-378 - Empty States
 */

import { cn } from '@/lib/utils'

export interface SearchNotFoundIllustrationProps {
  /** Additional CSS classes */
  className?: string
  /** Width of the illustration */
  width?: number
  /** Height of the illustration */
  height?: number
  /** Accessible title for the illustration */
  title?: string
}

export function SearchNotFoundIllustration({
  className,
  width = 200,
  height = 200,
  title = 'Aucun résultat trouvé',
}: SearchNotFoundIllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={width}
      height={height}
      className={cn('text-muted-foreground', className)}
      role="img"
      aria-labelledby="search-not-found-title"
    >
      <title id="search-not-found-title">{title}</title>

      {/* Background circle */}
      <circle cx="100" cy="100" r="80" className="fill-muted/30" />

      {/* Magnifying glass - circle */}
      <circle
        cx="90"
        cy="85"
        r="35"
        className="fill-background stroke-muted-foreground"
        strokeWidth="4"
      />

      {/* Magnifying glass - inner circle */}
      <circle
        cx="90"
        cy="85"
        r="25"
        className="fill-muted/50 stroke-muted-foreground/50"
        strokeWidth="2"
      />

      {/* Magnifying glass - handle */}
      <line
        x1="115"
        y1="110"
        x2="145"
        y2="140"
        className="stroke-muted-foreground"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* X mark inside magnifying glass */}
      <path
        d="M78 73 L102 97 M102 73 L78 97"
        className="stroke-muted-foreground/70"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Question marks */}
      <text
        x="50"
        y="55"
        className="fill-muted-foreground/30"
        fontSize="20"
        fontWeight="bold"
      >
        ?
      </text>
      <text
        x="140"
        y="70"
        className="fill-muted-foreground/20"
        fontSize="16"
        fontWeight="bold"
      >
        ?
      </text>
      <text
        x="155"
        y="120"
        className="fill-muted-foreground/25"
        fontSize="14"
        fontWeight="bold"
      >
        ?
      </text>
    </svg>
  )
}
