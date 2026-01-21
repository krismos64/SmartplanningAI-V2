'use client'

/**
 * NoPermissionIllustration Component
 * SVG illustration for permission denied states
 *
 * @see SP-378 - Empty States
 */

import { cn } from '@/lib/utils'

export interface NoPermissionIllustrationProps {
  /** Additional CSS classes */
  className?: string
  /** Width of the illustration */
  width?: number
  /** Height of the illustration */
  height?: number
  /** Accessible title for the illustration */
  title?: string
}

export function NoPermissionIllustration({
  className,
  width = 200,
  height = 200,
  title = 'Accès non autorisé',
}: NoPermissionIllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={width}
      height={height}
      className={cn('text-muted-foreground', className)}
      role="img"
      aria-labelledby="no-permission-title"
    >
      <title id="no-permission-title">{title}</title>

      {/* Background circle */}
      <circle cx="100" cy="100" r="80" className="fill-warning/10" />

      {/* Lock body */}
      <rect
        x="70"
        y="90"
        width="60"
        height="50"
        rx="6"
        className="fill-background stroke-warning/70"
        strokeWidth="4"
      />

      {/* Lock inner fill */}
      <rect
        x="75"
        y="95"
        width="50"
        height="40"
        rx="4"
        className="fill-warning/20"
      />

      {/* Lock shackle */}
      <path
        d="M80 90 L80 70 C80 55 90 45 100 45 C110 45 120 55 120 70 L120 90"
        className="fill-none stroke-warning/70"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Keyhole */}
      <circle cx="100" cy="110" r="8" className="fill-warning/50" />
      <rect
        x="97"
        y="115"
        width="6"
        height="12"
        rx="2"
        className="fill-warning/50"
      />

      {/* Shield overlay */}
      <path
        d="M100 155 C75 145 65 125 65 105 L100 95 L135 105 C135 125 125 145 100 155 Z"
        className="fill-none stroke-warning/30"
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      {/* Decorative crosses */}
      <g className="stroke-warning/25" strokeWidth="2" strokeLinecap="round">
        <line x1="45" y1="65" x2="55" y2="75" />
        <line x1="55" y1="65" x2="45" y2="75" />
      </g>
      <g className="stroke-warning/20" strokeWidth="2" strokeLinecap="round">
        <line x1="150" y1="80" x2="158" y2="88" />
        <line x1="158" y1="80" x2="150" y2="88" />
      </g>

      {/* Decorative dots */}
      <circle cx="50" cy="130" r="2.5" className="fill-warning/20" />
      <circle cx="155" cy="125" r="2" className="fill-warning/15" />
    </svg>
  )
}
