'use client'

/**
 * SectionHeader Component
 * Reusable header for landing page sections
 * Reduces code duplication across 7+ sections
 */

import { cn } from '@/lib/utils'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'

export const SECTION_VARIANT = {
  border: 'border-blue-600/20 dark:border-blue-400/20',
  bg: 'bg-blue-600/10 dark:bg-blue-400/10',
  text: 'text-blue-600 dark:text-blue-400',
} as const

interface SectionHeaderProps {
  badge: string
  badgeIcon?: React.ReactNode
  title: string
  titleHighlight: string
  description?: string
  className?: string
  marginBottom?: string
  /** ID for accessibility (aria-labelledby) */
  titleId?: string
}

export function SectionHeader({
  badge,
  badgeIcon,
  title,
  titleHighlight,
  description,
  className,
  marginBottom = 'mb-16',
  titleId,
}: SectionHeaderProps) {
  const colors = SECTION_VARIANT

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
        id={titleId}
        variants={fadeInUp}
        className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
      >
        {title}{' '}
        <span className="text-blue-600 dark:text-blue-400">
          {titleHighlight}
        </span>
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p
          variants={fadeInUp}
          className="mx-auto max-w-2xl text-lg text-muted-foreground"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
