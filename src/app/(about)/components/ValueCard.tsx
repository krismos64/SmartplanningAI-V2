'use client'

/**
 * ValueCard Component
 * Displays a company value with icon, title and description
 * Reusable card component following the landing page design system
 * Supports light/dark mode via CSS variables
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
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-border/80 hover:bg-accent/50"
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
      <h3 className="mb-3 text-xl font-semibold text-foreground">{title}</h3>
      <p className="leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  )
}
