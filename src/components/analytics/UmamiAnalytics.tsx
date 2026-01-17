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
 * // Avec props explicites (pour runtime injection)
 * <UmamiAnalytics
 *   websiteId="xxx-xxx"
 *   scriptUrl="https://analytics.example.com/script.js"
 * />
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
 * Défaut : https://analytics.smartplanning.fr/script.js
 */
const DEFAULT_SCRIPT_URL =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ||
  'https://analytics.smartplanning.fr/script.js'

/**
 * Website ID Umami (à récupérer dans le dashboard après configuration)
 * Format : UUID (ex: 3f2e1d4c-5b6a-7c8d-9e0f-1a2b3c4d5e6f)
 */
const DEFAULT_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || ''

/**
 * Domaines autorisés pour le tracking (évite le tracking en dev/staging)
 */
const DEFAULT_DOMAINS =
  process.env.NEXT_PUBLIC_UMAMI_DOMAINS || 'smartplanning.fr'

interface UmamiAnalyticsProps {
  /** Désactive le tracking (utile pour les previews ou environnements de test) */
  disabled?: boolean
  /** Website ID Umami (override pour injection runtime) */
  websiteId?: string
  /** URL du script Umami (override pour injection runtime) */
  scriptUrl?: string
  /** Domaines autorisés (override pour injection runtime) */
  domains?: string
}

/**
 * Composant UmamiAnalytics
 *
 * Gère le chargement conditionnel du script Umami basé sur :
 * 1. Le consentement cookies (catégorie analytics)
 * 2. La configuration (websiteId présent)
 * 3. L'état disabled
 *
 * Écoute également les changements de consentement pour réagir
 * dynamiquement si l'utilisateur modifie ses préférences.
 *
 * NOTE: Les props permettent d'injecter les valeurs au runtime
 * (utile quand les env vars ne sont pas disponibles au build-time Docker)
 */
export function UmamiAnalytics({
  disabled = false,
  websiteId = DEFAULT_WEBSITE_ID,
  scriptUrl = DEFAULT_SCRIPT_URL,
  domains = DEFAULT_DOMAINS,
}: UmamiAnalyticsProps) {
  const [shouldLoad, setShouldLoad] = useState(false)

  // Vérifie les conditions de chargement au montage
  useEffect(() => {
    const checkConsent = () => {
      const hasConsent = isCategoryAccepted('analytics')
      const hasConfig = !!websiteId
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
  }, [disabled, websiteId])

  // Ne rend rien si les conditions ne sont pas remplies
  if (!shouldLoad) {
    return null
  }

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      data-domains={domains}
      strategy="afterInteractive"
    />
  )
}

export default UmamiAnalytics
