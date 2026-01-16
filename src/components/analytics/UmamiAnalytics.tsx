'use client'

/**
 * Composant pour le chargement conditionnel du script Umami Analytics
 *
 * @description Charge le script Umami uniquement si :
 * - L'utilisateur a accepté les cookies analytics (RGPD)
 * - Un website ID est configuré
 * - Le composant n'est pas désactivé
 *
 * @see SP-345 - Intégration Umami Analytics
 * @see SP-283 - Système de consentement cookies
 *
 * @example
 * ```tsx
 * // Dans layout.tsx, à l'intérieur du CookieConsentProvider
 * <UmamiAnalytics />
 *
 * // Désactivé pour les previews
 * <UmamiAnalytics disabled={isPreview} />
 * ```
 */

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { isCategoryAccepted } from '@/lib/cookies'

/**
 * URL du script Umami (self-hosted sur le VPS)
 * Défaut : /analytics/script.js (reverse proxy Nginx)
 */
const UMAMI_SCRIPT_URL =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || '/analytics/script.js'

/**
 * Website ID Umami (à récupérer dans le dashboard après configuration)
 * Format : UUID (ex: 3f2e1d4c-5b6a-7c8d-9e0f-1a2b3c4d5e6f)
 */
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

/**
 * Domaines autorisés pour le tracking (évite le tracking en dev/staging)
 */
const UMAMI_DOMAINS =
  process.env.NEXT_PUBLIC_UMAMI_DOMAINS || 'smartplanning.fr'

interface UmamiAnalyticsProps {
  /** Désactive le tracking (utile pour les previews ou environnements de test) */
  disabled?: boolean
}

/**
 * Composant UmamiAnalytics
 *
 * Gère le chargement conditionnel du script Umami basé sur :
 * 1. Le consentement cookies (catégorie analytics)
 * 2. La configuration (UMAMI_WEBSITE_ID présent)
 * 3. L'état disabled
 *
 * Écoute également les changements de consentement pour réagir
 * dynamiquement si l'utilisateur modifie ses préférences.
 */
export function UmamiAnalytics({ disabled = false }: UmamiAnalyticsProps) {
  const [shouldLoad, setShouldLoad] = useState(false)

  // Vérifie les conditions de chargement au montage
  useEffect(() => {
    const checkConsent = () => {
      const hasConsent = isCategoryAccepted('analytics')
      const hasConfig = !!UMAMI_WEBSITE_ID
      setShouldLoad(hasConsent && hasConfig && !disabled)
    }

    // Vérification initiale
    checkConsent()

    // Écoute les changements de consentement (event dispatché par scripts.ts)
    const handleConsentChange = () => {
      checkConsent()
    }

    window.addEventListener('cookie-consent-changed', handleConsentChange)

    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange)
    }
  }, [disabled])

  // Ne rend rien si les conditions ne sont pas remplies
  if (!shouldLoad) {
    return null
  }

  return (
    <Script
      src={UMAMI_SCRIPT_URL}
      data-website-id={UMAMI_WEBSITE_ID}
      data-domains={UMAMI_DOMAINS}
      strategy="afterInteractive"
    />
  )
}

export default UmamiAnalytics
