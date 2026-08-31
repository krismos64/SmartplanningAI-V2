/**
 * API Route — Cron de relève des bounces
 *
 * Relève la boîte d'expédition en IMAP et bascule en `BOUNCED` les lignes
 * `EmailLog` dont le destinataire a refusé le message.
 *
 * Sécurisé par CRON_SECRET (header Authorization: Bearer <secret>), comme
 * /api/cron/trial-emails. Idempotent : les bounces traités sont marqués lus,
 * et la relève ne lit que les non lus.
 *
 * ENDPOINT : POST /api/cron/bounce-sync
 *
 * @ticket SP-579
 */

import { NextRequest, NextResponse } from 'next/server'

import {
  getImapCredentials,
  syncBounces,
} from '@/lib/email/bounce/bounce-sync.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // 1. Vérifier CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Vérifier la configuration IMAP
  const credentials = getImapCredentials()

  if (!credentials) {
    // Configuration absente : ce n'est pas une erreur, l'environnement de
    // développement n'a pas de boîte. Répondre 200 évite de faire échouer le
    // cron là où la relève n'a simplement pas lieu d'être.
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: 'Configuration IMAP absente',
      timestamp: new Date().toISOString(),
    })
  }

  // 3. Relever la boîte
  try {
    const result = await syncBounces(credentials)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    console.error('[Cron bounce-sync] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la relève des bounces',
      },
      { status: 500 }
    )
  }
}
