'use client'

/**
 * TargetCard Component
 * Displays a target audience segment with icon and description
 * Reusable card component following the landing page design system
 */

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { fadeInUp } from '@/app/(landing)/animations/variants'
import { cn } from '@/lib/utils'

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
      className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/10 hover:bg-white/[0.04]"
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
        <h4 className="mb-1 font-semibold">{title}</h4>
        <p className="text-sm text-white/60">{description}</p>
      </div>
    </motion.div>
  )
}
