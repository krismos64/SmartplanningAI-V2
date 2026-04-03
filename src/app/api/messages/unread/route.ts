/**
 * API Route — Compteurs de messages non-lus
 *
 * @route GET /api/messages/unread
 * @ticket SP-504
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getEffectiveSessionData } from '@/lib/impersonation'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId
  const companyId = effective.companyId

  if (!companyId) {
    return NextResponse.json({ total: 0, byConversation: {} })
  }

  try {
    // Récupérer toutes les conversations de l'utilisateur avec leur lastReadAt
    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    })

    if (memberships.length === 0) {
      return NextResponse.json({ total: 0, byConversation: {} })
    }

    // Compter les messages non-lus par conversation
    const byConversation: Record<string, number> = {}
    let total = 0

    for (const m of memberships) {
      try {
        const count = await prisma.message.count({
          where: {
            conversationId: m.conversationId,
            isDeleted: false,
            OR: [
              { senderId: { not: userId } },
              { senderId: null },
            ],
            ...(m.lastReadAt ? { createdAt: { gt: m.lastReadAt } } : {}),
          },
        })

        if (count > 0) {
          byConversation[m.conversationId] = count
          total += count
        }
      } catch {
        // Skip cette conversation en cas d'erreur
      }
    }

    return NextResponse.json({ total, byConversation })
  } catch (error) {
    console.error('[messages/unread] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
