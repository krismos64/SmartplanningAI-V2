/**
 * Configuration de l'emission serveur vers Umami
 *
 * @description Separe du service pour rester lisible en test sans declencher
 * de requete, et pour porter en un seul endroit la decision d'activation.
 *
 * Les valeurs par defaut reprennent celles de `UmamiAnalyticsWrapper`, qui
 * embarque deja la configuration de production en repli : les variables
 * d'environnement ne sont pas toujours disponibles au build dans l'image
 * Docker.
 *
 * @ticket SP-591
 */

const DEFAULT_WEBSITE_ID = '3a177239-31b0-4201-a1cb-e9938326d52b'
const DEFAULT_ANALYTICS_ORIGIN = 'https://analytics.smartplanning.fr'
const DEFAULT_HOSTNAME = 'smartplanning.fr'

/**
 * Derive l'URL d'envoi depuis l'URL du script de tracking.
 *
 * `NEXT_PUBLIC_UMAMI_SCRIPT_URL` pointe sur `<origine>/script.js`. L'API
 * d'envoi vit sur la meme origine, en `/api/send`. On derive plutot que
 * d'ajouter une variable d'environnement de plus, qui pourrait diverger.
 */
function resolveSendUrl(scriptUrl: string): string {
  try {
    return new URL('/api/send', scriptUrl).toString()
  } catch {
    return `${DEFAULT_ANALYTICS_ORIGIN}/api/send`
  }
}

const scriptUrl =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ||
  `${DEFAULT_ANALYTICS_ORIGIN}/script.js`

export const UMAMI_SERVER_CONFIG = {
  websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || DEFAULT_WEBSITE_ID,
  sendUrl: resolveSendUrl(scriptUrl),
  hostname: process.env.NEXT_PUBLIC_UMAMI_DOMAINS || DEFAULT_HOSTNAME,
  /**
   * L'emission est coupee hors production : un parcours de developpement ou de
   * test E2E polluerait le tunnel avec des etapes qui ne correspondent a aucun
   * prospect reel, et fausserait precisement la mesure qu'on cherche a obtenir.
   *
   * `UMAMI_SERVER_TRACKING` a `'1'` force l'activation, pour verifier la chaine
   * depuis une machine de developpement.
   */
  enabled:
    process.env.UMAMI_SERVER_TRACKING === '1' ||
    process.env.NODE_ENV === 'production',
} as const
