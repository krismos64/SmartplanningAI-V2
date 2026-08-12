'use client'

/**
 * PricingSimulator Component
 *
 * Simulateur interactif de tarification per-seat, curseur et calcul en
 * temps reel.
 *
 * Deux mises en page. En `full`, celle du prototype (SP-574) : curseur a
 * gauche sur la plus grande part de la largeur, resultat a droite sur un
 * aplat bleu franc avec son CTA. Le prix devient le point focal de la page
 * plutot qu'un chiffre parmi d'autres sur du creme.
 *
 * En `compact`, la colonne unique est conservee : la section tarifs de la
 * landing pose le simulateur dans une grille deja a deux colonnes, un second
 * niveau de scission y serait illisible.
 *
 * Le curseur utilise `accent-color`, comme le prototype, plutot que des
 * pseudo-elements par moteur : une declaration au lieu de huit, et le rendu
 * natif reste coherent sur Firefox comme sur les navigateurs WebKit.
 *
 * @ticket SP-355
 * @see SP-574 - Mise en page du prototype
 */

import { useState, useId } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Gift, ShieldCheck, Users } from 'lucide-react'
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

/** Reassurances affichees sous le curseur. */
const BADGES = [
  {
    icon: Gift,
    rule: 'border-public-highlight',
    label: `${PRICING.TRIAL_DAYS} jours gratuits, sans carte bancaire`,
  },
  {
    icon: ShieldCheck,
    rule: 'border-public-accent',
    label: 'Sans engagement · Résiliation en 1 clic',
  },
] as const

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

  /** Colonne de reglage : intitule, curseur, bornes et reassurances. */
  const control = (
    <div className={isCompact ? '' : 'lg:pr-8'}>
      <label
        htmlFor={sliderId}
        className="flex flex-wrap items-baseline justify-between gap-3"
      >
        <span className="flex items-center gap-2 font-geist text-base font-medium text-public-content">
          <Users className="h-5 w-5 text-public-accent" aria-hidden="true" />
          Taille de votre équipe
        </span>
        <span
          className={cn(
            'font-geist font-bold text-public-content',
            isCompact ? 'text-xl' : 'text-2xl lg:text-3xl'
          )}
        >
          {employees} employé{employees > 1 ? 's' : ''}
        </span>
      </label>

      {/*
        `accent-color` colore le rail rempli et la poignee d'un seul coup, et
        laisse le navigateur gerer les etats de survol et de focus.
      */}
      <input
        id={sliderId}
        type="range"
        min={PRICING.MIN_EMPLOYEES}
        max={PRICING.MAX_EMPLOYEES}
        value={employees}
        onChange={handleSliderChange}
        aria-label={`Nombre d'employés : ${employees}`}
        aria-describedby={priceId}
        className={cn(
          'mt-6 h-2 w-full cursor-pointer accent-public-accent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface'
        )}
      />

      <div className="mt-2 flex justify-between font-geist text-xs text-public-content-muted">
        <span>{PRICING.MIN_EMPLOYEES}</span>
        <span>{PRICING.MAX_EMPLOYEES}</span>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {BADGES.map((badge) => (
          <p
            key={badge.label}
            className={cn(
              'flex items-center gap-1.5 border-l-2 bg-public-surface px-3 py-1.5 font-geist text-xs font-medium text-public-content',
              badge.rule
            )}
          >
            <badge.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {badge.label}
          </p>
        ))}
      </div>
    </div>
  )

  /**
   * Colonne de resultat, aplat bleu franc.
   *
   * Ombre bleu nuit decalee de 14 px sans flou, relevee sur le prototype.
   *
   * Texte en blanc pur et non en `content-on-dark` : le creme sur ce bleu ne
   * donne que 4,14:1, mesure par axe-core, quand le blanc tient 4,88:1. Meme
   * choix que le ton `brand` de BentoCard.
   */
  const result = (
    <div
      id={priceId}
      aria-live="polite"
      className={cn(
        'bg-public-brand-surface p-8 text-white',
        !isCompact && 'shadow-[14px_14px_0_0_hsl(var(--public-surface-dark))]'
      )}
    >
      <p className="font-geist text-xs uppercase tracking-[0.14em] text-white">
        Votre abonnement mensuel
      </p>

      <p className="mt-4 flex items-baseline gap-2">
        <span
          className={cn(
            'font-geist font-extrabold tracking-[-0.03em]',
            isCompact ? 'text-4xl' : 'text-5xl lg:text-6xl'
          )}
        >
          {formatPrice(monthlyPrice)}
        </span>
        <span className="font-geist text-sm font-semibold">HT</span>
      </p>

      <p className="mt-2 font-geist text-base text-white">
        {employees} × {formatPrice(PRICING.PRICE_PER_EMPLOYEE)} / mois
      </p>

      {/*
        Aplat lime a texte bleu nuit : sur le bleu franc c'est le seul aplat
        de la palette qui detache le CTA sans perdre le contraste.
      */}
      <Link
        href="/register"
        className="mt-8 inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-[2px] bg-public-highlight-surface px-6 font-geist text-base font-semibold text-public-content-on-vivid transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-brand-surface"
      >
        Essayer {PRICING.TRIAL_DAYS} jours
        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
      </Link>
    </div>
  )

  const content = isCompact ? (
    <div
      className={cn(
        'w-full border-t-2 border-public-accent bg-public-surface-subtle p-6',
        className
      )}
    >
      {control}
      <div className="mt-8">{result}</div>
    </div>
  ) : (
    // 3fr / 2fr reprend le rapport du prototype, 730 px contre 393.
    <div
      className={cn(
        'grid w-full items-center gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16',
        className
      )}
    >
      {control}
      {result}
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
