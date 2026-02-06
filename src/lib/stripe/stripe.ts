/**
 * Client Stripe singleton — server-only
 *
 * Initialise une instance unique du SDK Stripe pour toute l'application.
 * Ce fichier ne doit JAMAIS être importé côté client ("use client").
 *
 * @ticket SP-349
 */

import Stripe from 'stripe'

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
 * Instance Stripe singleton.
 *
 * En développement, stockée sur globalThis pour survivre au HMR.
 * En production, instanciée une seule fois.
 */
const globalForStripe = globalThis as typeof globalThis & {
  stripe?: Stripe
}

export const stripe =
  globalForStripe.stripe ?? createStripeClient()

if (process.env.NODE_ENV !== 'production') {
  globalForStripe.stripe = stripe
}
