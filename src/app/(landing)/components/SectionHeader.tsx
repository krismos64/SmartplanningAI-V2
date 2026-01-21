'use client'

/**
 * SectionHeader Component
 * Reusable header for landing page sections
 * Reduces code duplication across 7+ sections
 */

import { cn } from '@/lib/utils'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'

// Color variants for badges and gradients
export const SECTION_COLORS = {
  blue: {
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    gradient: 'from-blue-400 to-cyan-400',
  },
  purple: {
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    gradient: 'from-purple-400 to-pink-400',
  },
  emerald: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    gradient: 'from-emerald-400 to-cyan-400',
  },
  red: {
    border: 'border-red-500/20',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    gradient: 'from-red-400 to-pink-400',
  },
  amber: {
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    gradient: 'from-amber-400 to-orange-400',
  },
  cyan: {
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    gradient: 'from-cyan-400 to-blue-400',
  },
} as const

export type SectionColor = keyof typeof SECTION_COLORS

interface SectionHeaderProps {
  badge: string
  badgeIcon?: React.ReactNode
  color: SectionColor
  title: string
  titleHighlight: string
  description?: string
  className?: string
  marginBottom?: string
}

export function SectionHeader({
  badge,
  badgeIcon,
  color,
  title,
  titleHighlight,
  description,
  className,
  marginBottom = 'mb-16',
}: SectionHeaderProps) {
  const colors = SECTION_COLORS[color]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn('text-center', marginBottom, className)}
    >
      {/* Badge */}
      <motion.span
        variants={fadeInUp}
        className={cn(
          'mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm',
          colors.border,
          colors.bg,
          colors.text
        )}
      >
        {badgeIcon}
        {badge}
      </motion.span>

      {/* Title */}
      <motion.h2
        variants={fadeInUp}
        className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
      >
        {title}{' '}
        <span
          className={cn(
            'bg-gradient-to-r bg-clip-text text-transparent',
            colors.gradient
          )}
        >
          {titleHighlight}
        </span>
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p
          variants={fadeInUp}
          className="mx-auto max-w-2xl text-lg text-white/60"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
