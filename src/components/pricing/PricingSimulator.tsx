'use client'

/**
 * PricingSimulator Component
 *
 * Simulateur interactif de tarification per-seat.
 * Slider pour ajuster le nombre d'employés avec calcul en temps réel.
 *
 * @ticket SP-355
 */

import { useState, useId } from 'react'
import { Users, Gift, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PRICING,
  calculateMonthlyPrice,
  formatPrice,
} from '@/lib/config/pricing'
import {
  motion,
  useReducedMotion,
  fadeSlideUpVariants,
  staggerContainer,
  staggerItem,
} from '@/lib/animations'

export interface PricingSimulatorProps {
  showYearlyToggle?: boolean
  className?: string
  size?: 'compact' | 'full'
  animated?: boolean
  onEmployeesChange?: (employees: number) => void
}

export function PricingSimulator({
  className,
  size = 'full',
  animated = true,
  onEmployeesChange,
}: PricingSimulatorProps) {
  const [employees, setEmployees] = useState<number>(PRICING.DEFAULT_EMPLOYEES)
  const prefersReducedMotion = useReducedMotion()
  const sliderId = useId()
  const priceId = useId()

  const monthlyPrice = calculateMonthlyPrice(employees)
  const isCompact = size === 'compact'

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setEmployees(value)
    onEmployeesChange?.(value)
  }

  const content = (
    <div
      className={cn(
        'w-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm',
        isCompact ? 'p-6' : 'p-8 lg:p-10',
        className
      )}
    >
      {/* Header */}
      <div className={cn('text-center', isCompact ? 'mb-6' : 'mb-8')}>
        <p
          className={cn(
            'font-bold tracking-tight',
            isCompact ? 'text-xl' : 'text-2xl lg:text-3xl'
          )}
        >
          Simulez votre tarif
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Un prix unique et transparent, basé sur votre effectif
        </p>
      </div>

      {/* Price display */}
      <div className="mb-8 text-center" aria-live="polite" id={priceId}>
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={cn(
              'bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-extrabold text-transparent',
              isCompact ? 'text-4xl' : 'text-5xl lg:text-6xl'
            )}
          >
            {formatPrice(monthlyPrice)}
          </span>
          <span className="text-muted-foreground">/mois</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{employees}</span>{' '}
          employé{employees > 1 ? 's' : ''} ×{' '}
          {formatPrice(PRICING.PRICE_PER_EMPLOYEE)}
        </p>
      </div>

      {/* Slider */}
      <div className={cn(isCompact ? 'mb-6' : 'mb-8')}>
        <label
          htmlFor={sliderId}
          className="mb-3 flex items-center justify-between text-sm"
        >
          <span className="flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 text-public-accent" aria-hidden="true" />
            Nombre d&apos;employés
          </span>
          <span className="font-bold text-public-accent">{employees}</span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={PRICING.MIN_EMPLOYEES}
          max={PRICING.MAX_EMPLOYEES}
          value={employees}
          onChange={handleSliderChange}
          aria-label={`Nombre d'employés : ${employees}`}
          aria-describedby={priceId}
          aria-valuemin={PRICING.MIN_EMPLOYEES}
          aria-valuemax={PRICING.MAX_EMPLOYEES}
          aria-valuenow={employees}
          className="slider-pricing h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 outline-none transition-all focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cyan-400 [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-lg [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-400 [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-lg"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{PRICING.MIN_EMPLOYEES}</span>
          <span>{PRICING.MAX_EMPLOYEES}</span>
        </div>
      </div>

      {/* Badges */}
      <div
        className={cn(
          'flex flex-wrap justify-center gap-3',
          isCompact ? 'gap-2' : 'gap-3'
        )}
      >
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
          <Gift className="h-3.5 w-3.5" aria-hidden="true" />
          {PRICING.TRIAL_DAYS} jours gratuits, sans carte bancaire
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-public-accent/20 bg-public-accent/10 px-3 py-1.5 text-xs font-medium text-public-accent">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Sans engagement · Résiliation en 1 clic
        </div>
      </div>
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
