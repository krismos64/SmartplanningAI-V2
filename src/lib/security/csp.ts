/**
 * Content Security Policy à nonce (SP-598)
 *
 * Avant : `script-src 'self' 'unsafe-eval' 'unsafe-inline'`, posé par
 * `next.config.ts`. `unsafe-inline` laissait s'exécuter n'importe quel script
 * inline injecté, ce que la CSP est précisément censée arrêter.
 *
 * Maintenant : un nonce par requête, généré par le middleware. Next.js le lit
 * dans l'en-tête de la requête et l'appose sur ses propres scripts, inline
 * compris (`self.__next_f.push`). Un script inline sans nonce, donc injecté,
 * n'est plus exécuté.
 *
 * Pas de `'strict-dynamic'` : Next.js 15 émet pour `next/dynamic` des
 * `<link rel="preload" as="script">` sans nonce. Sous `'strict-dynamic'`, qui
 * fait ignorer `'self'`, le navigateur les bloquait (14 violations sur la page
 * d'accueil, mesurées le 13 novembre 2026). `'self'` reste donc la source des
 * fichiers de `/_next/static`, servis par notre seul domaine, et Umami est
 * autorisé par son hôte.
 *
 * `'unsafe-eval'` n'est accordé qu'en développement. En production, le seul
 * appel à `eval` venait de lottie-web, qui évaluait six expressions After
 * Effects inopérantes de `public/animations/planning-animation.json` ; elles
 * ont été retirées, un test empêche d'en réintroduire.
 *
 * `style-src` garde `'unsafe-inline'` : les attributs `style` de React et de
 * Framer Motion ne peuvent pas porter de nonce. Une injection de style ne
 * permet pas d'exécuter du code.
 *
 * Module pur, sans dépendance au runtime : il est appelé par le middleware
 * (Edge) et testé tel quel.
 *
 * @ticket SP-598
 */

/** Nom de l'en-tête par lequel le layout racine lit le nonce */
export const NONCE_HEADER = 'x-nonce'

export interface CspOptions {
  /** Le mode développement de React a besoin d'`eval` pour ses outils */
  isDev: boolean
  /** `upgrade-insecure-requests` n'a de sens que servi en HTTPS */
  isHttps: boolean
}

/** Nonce de 128 bits, encodé en base64 comme l'attend la grammaire CSP. */
export function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function buildCsp(
  nonce: string,
  { isDev, isHttps }: CspOptions
): string {
  const directives = [
    `default-src 'self'`,
    // 'unsafe-eval' en développement seulement, pour les outils de React
    `script-src 'self' 'nonce-${nonce}' https://analytics.smartplanning.fr${isDev ? ` 'unsafe-eval'` : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com`,
    `connect-src 'self' https://*.pusher.com wss://*.pusher.com https://analytics.smartplanning.fr`,
  ]
  if (isHttps) directives.push('upgrade-insecure-requests')
  return directives.join('; ')
}
