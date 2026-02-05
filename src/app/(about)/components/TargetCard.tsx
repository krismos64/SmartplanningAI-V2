'use client'

/**
 * TargetCard Component
 * Displays a target audience segment with icon and description
 * Reusable card component following the landing page design system
 * Supports light/dark mode via CSS variables
 */

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, fadeInUp } from '@/lib/animations'

interface TargetCardProps {
  icon: LucideIcon
  title: string
  description: string
  color: string
}

export function TargetCard({
  icon: Icon,
  title,
  description,
  color,
}: TargetCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-border/80 hover:bg-accent/50"
    >
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          color
        )}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h4 className="mb-1 font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}
