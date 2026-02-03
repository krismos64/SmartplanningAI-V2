/**
 * API Route SSE - Stream de notifications temps réel
 *
 * @ticket SP-327
 * @description Endpoint SSE pour recevoir les notifications en temps réel
 */

import { NextRequest } from 'next/server'

import { auth } from '@/lib/auth'
import { sseManager } from '@/lib/notifications/sse-emitter'

/**
 * GET /api/notifications/stream
 *
 * Établit une connexion SSE pour recevoir les notifications en temps réel
 *
 * Headers requis :
 * - Accept: text/event-stream
 *
 * Réponse :
 * - Stream SSE avec events de type :
 *   - "notification" : Nouvelle notification
 *   - "ping" : Keep-alive heartbeat
 */
export async function GET(request: NextRequest) {
  // Vérifier l'authentification
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id

  // Vérifier que le client accepte SSE
  const accept = request.headers.get('accept')
  if (!accept?.includes('text/event-stream')) {
    return new Response('Accept header must include text/event-stream', {
      status: 406,
    })
  }

  // Créer le stream SSE
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Envoyer un message de connexion initial
      const encoder = new TextEncoder()
      const connectMessage = encoder.encode(
        `data: ${JSON.stringify({ type: 'connected', userId })}\n\n`
      )
      controller.enqueue(connectMessage)

      // Enregistrer la connexion
      sseManager.addConnection(userId, controller)
    },
    cancel() {
      // La connexion sera nettoyée par le heartbeat
    },
  })

  // Retourner la réponse SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Désactiver le buffering nginx
    },
  })
}

/**
 * Configuration pour Next.js
 * - Force le runtime Edge pour de meilleures performances SSE
 * - Désactive la génération statique
 */
export const runtime = 'nodejs' // ou 'edge' selon l'hébergement
export const dynamic = 'force-dynamic'
