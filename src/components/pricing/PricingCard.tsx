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
        'relative w-full max-w-md border-t-2 border-public-accent bg-public-surface-subtle p-8',
        className
      )}
    >
      {/* Badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="flex items-center gap-1.5 bg-public-accent-surface px-4 py-1.5 font-geist text-sm font-semibold text-public-content-on-vivid">
          <Gift className="h-3.5 w-3.5" aria-hidden="true" />
          {PRICING.TRIAL_DAYS} jours d&apos;essai gratuit
        </span>
      </div>

      {/* Price */}
      <div className="mb-6 mt-4 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-geist text-5xl font-extrabold text-public-content">
            {formatPrice(PRICING.PRICE_PER_EMPLOYEE)}
          </span>
        </div>
        <p className="mt-1 text-public-content-muted">par employé / mois</p>
        <p className="mt-2 text-xs text-public-content-muted">
          Sans engagement · Sans carte bancaire
        </p>
        <p className="mt-1 text-xs text-public-content-muted">
          Facturé au nombre exact d&apos;employés actifs
        </p>
      </div>

      {/* Features */}
      {showFeatures && (
        <ul className="mb-8 space-y-3">
          {INCLUDED_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <Check
                className="h-4 w-4 shrink-0 text-public-accent"
                aria-hidden="true"
              />
              <span className="text-sm text-public-content-muted">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {showCTA && (
        <Button
          className="min-h-[2.75rem] w-full bg-public-surface-dark text-public-content-on-dark hover:opacity-90"
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
