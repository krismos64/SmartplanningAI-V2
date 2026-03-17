/**
 * SubscriptionBanner — Bannière globale d'avertissement abonnement
 *
 * Affichée sur toutes les pages /app/* (sauf billing) quand le trial
 * arrive à expiration ou quand un paiement est en retard (PAST_DUE).
 *
 * Paliers progressifs :
 * - info (bleu) : 7-14 jours restants — discret, dismissable
 * - warning (orange) : 4-6 jours restants — visible, dismissable
 * - urgent (rouge) : 1-3 jours restants — fort, NON dismissable
 * - payment (orange) : PAST_DUE < 7 jours — NON dismissable
 *
 * @ticket SP-441
 * @see SP-440 pour le guard middleware qui bloque après expiration
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Info, AlertTriangle, AlertCircle, CreditCard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getSubscriptionBannerConfig,
  type BannerTier,
} from '@/lib/subscription-banner'

// ============================================================================
// Types
// ============================================================================

/** @ticket SP-441 */
export interface SubscriptionBannerProps {
  /** Statut d'abonnement depuis session.user */
  subscriptionStatus: string | null
  /** Date de fin trial ISO string depuis session.user */
  trialEndsAt: string | null
  /** Date fin période depuis session.user */
  currentPeriodEnd: string | null
  /** Rôle utilisateur depuis session.user */
  role: string
  /** Classes CSS additionnelles */
  className?: string
}

// ============================================================================
// Constantes
// ============================================================================

const STORAGE_KEY = 'sp-banner-dismissed-tier'

const TIER_STYLES: Record<BannerTier, string> = {
  info: 'border-info/30 bg-info/10 text-info-foreground',
  warning: 'border-warning/30 bg-warning/10 text-warning-foreground',
  urgent: 'border-destructive/30 bg-destructive/10 text-destructive',
}

const TIER_ICONS: Record<BannerTier, React.ReactNode> = {
  info: <Info className="h-4 w-4 shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />,
  urgent: <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />,
}

// ============================================================================
// Helpers
// ============================================================================

/** Lit le tier dismissé depuis localStorage (safe SSR/incognito) */
function getDismissedTier(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** Stocke le tier dismissé dans localStorage (safe SSR/incognito) */
function setDismissedTier(tier: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, tier)
  } catch {
    // Ignore — SSR ou mode incognito
  }
}

// ============================================================================
// Component
// ============================================================================

/** @ticket SP-441 */
export function SubscriptionBanner({
  subscriptionStatus,
  trialEndsAt,
  currentPeriodEnd,
  role,
  className,
}: SubscriptionBannerProps) {
  const pathname = usePathname()
  const [dismissed, setDismissed] = useState(false)
  const [dismissedTier, setDismissedTierState] = useState<string | null>(null)

  // Lire le tier dismissé au mount (côté client uniquement)
  useEffect(() => {
    setDismissedTierState(getDismissedTier())
  }, [])

  // Calculer la config en amont (avant les returns conditionnels)
  const config = getSubscriptionBannerConfig({
    role,
    subscriptionStatus,
    trialEndsAt,
    currentPeriodEnd,
  })

  // Tous les hooks DOIVENT être avant tout return conditionnel (règle React)
  const handleDismiss = useCallback(() => {
    setDismissed(true)
    if (config.tier) {
      setDismissedTier(config.tier)
      setDismissedTierState(config.tier)
    }
  }, [config.tier])

  // Ne pas afficher sur la page billing (les alertes contextuelles SP-440 y sont déjà)
  if (
    pathname === '/app/tableau-de-bord/facturation' ||
    pathname.startsWith('/app/tableau-de-bord/facturation/')
  ) {
    return null
  }

  if (!config.show || !config.tier) {
    return null
  }

  // Vérifier si l'utilisateur a déjà dismissé ce palier
  if (config.dismissable && (dismissed || dismissedTier === config.tier)) {
    return null
  }

  const icon =
    config.type === 'payment' ? (
      <CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" />
    ) : (
      TIER_ICONS[config.tier]
    )

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b px-4 py-2.5 text-sm md:px-6',
        TIER_STYLES[config.tier],
        className
      )}
      role={config.tier === 'urgent' ? 'alert' : 'status'}
      data-testid="subscription-banner"
      data-tier={config.tier}
    >
      {/* Icône */}
      {icon}

      {/* Message */}
      <p className="flex-1 font-medium">{config.message}</p>

      {/* CTA */}
      {config.ctaHref && config.ctaLabel && (
        <Button
          variant={
            config.tier === 'urgent'
              ? 'destructive'
              : config.tier === 'warning'
                ? 'default'
                : 'outline'
          }
          size="sm"
          asChild
          className="shrink-0"
          data-testid="subscription-banner-cta"
        >
          <Link href={config.ctaHref}>{config.ctaLabel}</Link>
        </Button>
      )}

      {/* Bouton dismiss */}
      {config.dismissable && (
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Fermer la bannière"
          data-testid="subscription-banner-dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
