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
  /** Container background classes (e.g. "bg-blue-600" or "bg-emerald-500") */
  background: string
  /** Shadow color classes (e.g. "shadow-blue-600/30") */
  shadowColor: string
}

function FloatingElement({
  icon: Icon,
  position,
  background,
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
      className={`absolute ${positionClasses} rounded-2xl ${background} p-4 shadow-xl ${shadowColor}`}
    >
      <Icon className="h-6 w-6 text-white" />
    </motion.div>
  )
}

// Vert sémantique conservé : ✓ = validation/succès, signal UX-justifié
export function FloatingCheck() {
  return (
    <FloatingElement
      icon={Check}
      position="top-right"
      background="bg-emerald-500"
      shadowColor="shadow-emerald-500/30"
    />
  )
}

export function FloatingBell() {
  return (
    <FloatingElement
      icon={Bell}
      position="bottom-left"
      background="bg-blue-600"
      shadowColor="shadow-blue-600/30"
    />
  )
}
