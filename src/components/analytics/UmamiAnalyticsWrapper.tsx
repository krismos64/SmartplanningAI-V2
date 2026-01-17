/**
 * Wrapper Server Component pour UmamiAnalytics
 *
 * @description Ce composant serveur lit les variables d'environnement
 * au runtime et les passe au composant client UmamiAnalytics.
 *
 * Cela permet d'utiliser les variables d'environnement même quand
 * elles ne sont pas disponibles au build-time (cas Docker).
 *
 * @see SP-345 - Intégration Umami Analytics
 */

import { UmamiAnalytics } from './UmamiAnalytics'

/**
 * Configuration Umami par défaut (hardcodée pour production)
 * Utilisée si les variables d'environnement ne sont pas définies
 */
const UMAMI_CONFIG = {
  websiteId: '3a177239-31b0-4201-a1cb-e9938326d52b',
  scriptUrl: 'https://analytics.smartplanning.fr/script.js',
  domains: 'smartplanning.fr',
}

interface UmamiAnalyticsWrapperProps {
  /** Désactive le tracking */
  disabled?: boolean
}

/**
 * Server Component wrapper pour UmamiAnalytics
 *
 * Lit les variables d'environnement côté serveur (runtime)
 * et les passe au composant client.
 */
export function UmamiAnalyticsWrapper({
  disabled = false,
}: UmamiAnalyticsWrapperProps) {
  // Lecture des variables d'environnement côté serveur (runtime)
  const websiteId =
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || UMAMI_CONFIG.websiteId
  const scriptUrl =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || UMAMI_CONFIG.scriptUrl
  const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS || UMAMI_CONFIG.domains

  return (
    <UmamiAnalytics
      disabled={disabled}
      websiteId={websiteId}
      scriptUrl={scriptUrl}
      domains={domains}
    />
  )
}

export default UmamiAnalyticsWrapper
