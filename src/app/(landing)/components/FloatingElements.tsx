'use client'

/**
 * FloatingElements Component
 * Animated floating icons around content
 */

import { Check, Bell, type LucideIcon } from 'lucide-react'
import { motion, floatingElement1, floatingElement2 } from '@/lib/animations'

interface FloatingElementProps {
  icon: LucideIcon
  position: 'top-right' | 'bottom-left'
  colorFrom: string
  colorTo: string
  shadowColor: string
}

function FloatingElement({
  icon: Icon,
  position,
  colorFrom,
  colorTo,
  shadowColor,
}: FloatingElementProps) {
  const animation =
    position === 'top-right' ? floatingElement1 : floatingElement2
  const positionClasses =
    position === 'top-right' ? '-right-2 top-4' : '-left-2 bottom-4'

  return (
    <motion.div
      animate={animation.animate}
      transition={animation.transition}
      className={`absolute ${positionClasses} rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo} p-4 shadow-xl ${shadowColor}`}
    >
      <Icon className="h-6 w-6 text-white" />
    </motion.div>
  )
}

export function FloatingCheck() {
  return (
    <FloatingElement
      icon={Check}
      position="top-right"
      colorFrom="from-emerald-500"
      colorTo="to-emerald-600"
      shadowColor="shadow-emerald-500/30"
    />
  )
}

export function FloatingBell() {
  return (
    <FloatingElement
      icon={Bell}
      position="bottom-left"
      colorFrom="from-blue-500"
      colorTo="to-cyan-500"
      shadowColor="shadow-blue-500/30"
    />
  )
}
