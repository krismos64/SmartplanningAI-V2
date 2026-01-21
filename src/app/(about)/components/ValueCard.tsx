'use client'

/**
 * ValueCard Component
 * Displays a company value with icon, title and description
 * Reusable card component following the landing page design system
 */

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, fadeInUp } from '@/lib/animations'

interface ValueCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  delay?: number
}

export function ValueCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay = 0,
}: ValueCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={delay}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
    >
      {/* Gradient glow on hover */}
      <div
        className={cn(
          'absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30',
          gradient
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          'mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br',
          gradient
        )}
      >
        <Icon className="h-7 w-7 text-white" />
      </div>

      {/* Content */}
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <p className="leading-relaxed text-white/60">{description}</p>
    </motion.div>
  )
}
