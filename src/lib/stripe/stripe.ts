/**
 * Client Stripe singleton — server-only
 *
 * Initialise une instance unique du SDK Stripe pour toute l'application.
 * Ce fichier ne doit JAMAIS être importé côté client ("use client").
 *
 * L'initialisation est lazy (au premier appel de getStripe()) pour éviter
 * un crash si STRIPE_SECRET_KEY est absente dans les environnements
 * qui n'utilisent pas Stripe directement (tests unitaires, CI).
 *
 * @ticket SP-349
 */

import Stripe from 'stripe'

const globalForStripe = globalThis as typeof globalThis & {
  stripe?: Stripe
}

function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      '[Stripe] STRIPE_SECRET_KEY manquante. Ajoutez-la dans .env.local'
    )
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
    appInfo: {
      name: 'SmartPlanning',
      version: '2.0.0',
      url: 'https://smartplanning.fr',
    },
  })
}

/**
 * Retourne l'instance Stripe singleton (lazy init).
 *
 * En développement, stockée sur globalThis pour survivre au HMR.
 * En production, instanciée une seule fois.
 */
export function getStripe(): Stripe {
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = createStripeClient()
  }
  return globalForStripe.stripe
}

/**
 * Instance Stripe singleton — accès par propriété pour rétro-compatibilité.
 *
 * Utilise un Proxy pour différer l'initialisation au premier accès réel
 * (appel de méthode / lecture de propriété), évitant ainsi le crash si
 * STRIPE_SECRET_KEY est absente à l'import.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target: Stripe, prop: string | symbol, receiver: unknown): unknown {
    const instance = getStripe()
    const value: unknown = Reflect.get(instance, prop, receiver)
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(instance)
    }
    return value
  },
})
