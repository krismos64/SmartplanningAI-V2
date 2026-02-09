/**
 * API Route Webhook Stripe
 *
 * Reçoit et traite les événements Stripe (subscriptions, invoices, checkout).
 * Utilise le raw body pour vérifier la signature HMAC.
 *
 * ENDPOINT : POST /api/webhooks/stripe
 *
 * SÉCURITÉ :
 * - Vérification signature via stripe.webhooks.constructEvent()
 * - Raw body obligatoire (pas de JSON parsing)
 * - STRIPE_WEBHOOK_SECRET requis
 *
 * @ticket SP-351
 * @see SP-349 pour la configuration Stripe
 */

import { NextResponse } from 'next/server'

import { stripe } from '@/lib/stripe'
import { handleWebhookEvent } from '@/lib/services/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/stripe
 *
 * 1. Lit le raw body (request.text())
 * 2. Vérifie la signature Stripe (constructEvent)
 * 3. Dispatch vers handleWebhookEvent
 * 4. Retourne 200 (success) ou 400/500 (erreur)
 */
export async function POST(request: Request): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET non configurée')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Lire le raw body pour la vérification de signature
  const rawBody = await request.text()

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  // Vérifier la signature et construire l'événement
  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[Stripe Webhook] Signature invalide: ${message}`)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    )
  }

  // Traiter l'événement
  try {
    const result = await handleWebhookEvent(event)

    return NextResponse.json({ received: true, ...result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(
      `[Stripe Webhook] Erreur traitement ${event.type}: ${message}`
    )
    return NextResponse.json(
      { error: `Webhook handler failed: ${message}` },
      { status: 500 }
    )
  }
}
