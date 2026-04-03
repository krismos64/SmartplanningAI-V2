/**
 * Service de synchronisation des conversations TEAM
 *
 * @description Synchronise automatiquement les membres des conversations
 * TEAM quand un employé rejoint ou quitte une équipe.
 * Ce fichier n'a PAS de directive 'use server' pour permettre
 * le dynamic import depuis teams.ts.
 *
 * @ticket SP-504
 */

import { prisma } from '@/lib/prisma'

/**
 * Synchronise un membre dans la conversation TEAM d'une équipe
 *
 * - add : ajoute un ConversationMember si la conversation TEAM existe
 * - remove : supprime le ConversationMember
 *
 * Si la conversation TEAM n'existe pas encore (création lazy),
 * l'opération est silencieusement ignorée.
 */
export async function syncTeamConversationMember(
  teamId: string,
  userId: string,
  action: 'add' | 'remove'
): Promise<void> {
  // Chercher la conversation TEAM de cette équipe
  const conversation = await prisma.conversation.findUnique({
    where: { teamId },
    select: { id: true },
  })

  // Si pas de conversation TEAM, ne rien faire (création lazy)
  if (!conversation) return

  if (action === 'add') {
    // Vérifier que le membre n'existe pas déjà
    const existing = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversation.id,
          userId,
        },
      },
    })

    if (!existing) {
      await prisma.conversationMember.create({
        data: {
          conversationId: conversation.id,
          userId,
        },
      })
    }
  } else {
    // Supprimer le membre (silencieux si n'existe pas)
    await prisma.conversationMember.deleteMany({
      where: {
        conversationId: conversation.id,
        userId,
      },
    })
  }
}
