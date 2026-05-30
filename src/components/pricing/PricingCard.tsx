'use client'

/**
 * PricingCard Component
 *
 * Carte tarif unique affichant le prix per-seat, les features incluses
 * et un CTA vers l'inscription.
 *
 * @ticket SP-355
 */

import Link from 'next/link'
import { Check, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PRICING, INCLUDED_FEATURES, formatPrice } from '@/lib/config/pricing'
import {
  motion,
  useReducedMotion,
  fadeSlideUpVariants,
  staggerContainer,
  staggerItem,
} from '@/lib/animations'

export interface PricingCardProps {
  showCTA?: boolean
  showFeatures?: boolean
  className?: string
  animated?: boolean
}

export function PricingCard({
  showCTA = true,
  showFeatures = true,
  className,
  animated = true,
}: PricingCardProps) {
  const prefersReducedMotion = useReducedMotion()

  const content = (
    <div
      className={cn(
        'relative w-full max-w-md rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-transparent p-8',
        className
      )}
    >
      {/* Badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1 text-sm font-semibold text-white">
          <Gift className="h-3.5 w-3.5" aria-hidden="true" />
          {PRICING.TRIAL_DAYS} jours d&apos;essai gratuit
        </span>
      </div>

      {/* Price */}
      <div className="mb-6 mt-4 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-5xl font-extrabold text-transparent">
            {formatPrice(PRICING.PRICE_PER_EMPLOYEE)}
          </span>
        </div>
        <p className="mt-1 text-muted-foreground">par employé / mois</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Sans engagement · Sans carte bancaire
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Facturé au nombre exact d&apos;employés actifs
        </p>
      </div>

      {/* Features */}
      {showFeatures && (
        <ul className="mb-8 space-y-3">
          {INCLUDED_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <Check
                className="h-4 w-4 shrink-0 text-cyan-400"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {showCTA && (
        <Button
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
          asChild
        >
          <Link href="/register">Démarrer l&apos;essai gratuit</Link>
        </Button>
      )}
    </div>
  )

  if (!animated || prefersReducedMotion) {
    return content
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={staggerItem}>
        <motion.div variants={fadeSlideUpVariants}>{content}</motion.div>
      </motion.div>
    </motion.div>
  )
}
