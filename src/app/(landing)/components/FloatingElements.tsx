'use client'

/**
 * FloatingElements Component
 * Badges décoratifs (Check ✓ + Bell 🔔) positionnés autour de l'image hero.
 * Apparition one-shot au mount (fade + slide), pas d'animation en boucle.
 */

import { Check, Bell, type LucideIcon } from 'lucide-react'
import { motion } from '@/lib/animations'

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
  const positionClasses =
    position === 'top-right' ? '-right-2 top-4' : '-left-2 bottom-4'

  // Apparition one-shot : depuis sa position originale (decalée + rotation)
  // vers son état final stable. Pas de répétition.
  const initial =
    position === 'top-right'
      ? { opacity: 0, y: -10, rotate: 5 }
      : { opacity: 0, y: 10, rotate: -5 }

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{
        duration: 0.6,
        delay: position === 'top-right' ? 0.5 : 1,
        ease: 'easeOut',
      }}
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
