/**
 * Server Actions pour la messagerie interne
 *
 * @description CRUD conversations et messages avec RBAC multi-tenant.
 * Tous les rôles ont accès à la messagerie (EMPLOYEE, MANAGER, DIRECTOR).
 * Seul MANAGER+ peut créer des groupes.
 * SYSTEM_ADMIN sans companyId n'a pas de conversations métier.
 *
 * @ticket SP-503
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  getEffectiveSessionData,
  assertNotImpersonating,
} from '@/lib/impersonation'
import { validateData, handlePrismaError } from './crud-helpers'
import { logAuditAction } from '@/lib/services/audit'
import { emitNewMessage } from '@/lib/notifications/emit-message'
import {
  sendMessageSchema,
  createDirectConversationSchema,
  createGroupConversationSchema,
  conversationFiltersSchema,
  addGroupMemberSchema,
  removeGroupMemberSchema,
} from '@/lib/validations/messaging'
import type { CrudActionResult } from '@/types'
import type {
  MessageWithSender,
  ConversationListItem,
  ConversationWithDetails,
  MessagesPage,
  AttachmentData,
} from '@/types/messaging'

// ============================================================================
// Helpers internes
// ============================================================================

/** Vérifie que l'utilisateur est membre d'une conversation */
async function checkMembership(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })
  return !!member
}

/** Récupère les userIds de tous les membres d'une conversation */
async function getConversationMemberUserIds(
  conversationId: string
): Promise<string[]> {
  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  })
  return members.map((m) => m.userId)
}

/** Formatte un message Prisma en MessageWithSender */
function formatMessage(msg: {
  id: string
  conversationId: string
  senderId: string | null
  sender: { id: string; name: string | null; image: string | null } | null
  content: string | null
  attachments: unknown
  isDeleted: boolean
  createdAt: Date
}): MessageWithSender {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    sender: msg.sender,
    content: msg.isDeleted ? null : msg.content,
    attachments: msg.isDeleted
      ? null
      : (msg.attachments as AttachmentData[] | null),
    isDeleted: msg.isDeleted,
    createdAt: msg.createdAt,
  }
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Liste les conversations de l'utilisateur connecté
 */
export async function getConversations(filters?: {
  search?: string
}): Promise<CrudActionResult<ConversationListItem[]>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId
  const companyId = effective.companyId

  // SYSTEM_ADMIN sans companyId : pas de conversations métier
  if (!companyId) {
    return { success: true, data: [] }
  }

  try {
    const validFilters = filters
      ? conversationFiltersSchema.safeParse(filters)
      : null

    const conversations = await prisma.conversation.findMany({
      where: {
        companyId,
        members: { some: { userId, isArchived: false } },
        ...(validFilters?.success && validFilters.data.search
          ? {
              OR: [
                {
                  name: {
                    contains: validFilters.data.search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  members: {
                    some: {
                      user: {
                        name: {
                          contains: validFilters.data.search,
                          mode: 'insensitive' as const,
                        },
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    // Calculer les non-lus par conversation
    const result: ConversationListItem[] = await Promise.all(
      conversations.map(async (conv) => {
        const myMembership = conv.members.find((m) => m.userId === userId)
        const unreadCount = myMembership?.lastReadAt
          ? await prisma.message.count({
              where: {
                conversationId: conv.id,
                createdAt: { gt: myMembership.lastReadAt },
                isDeleted: false,
                senderId: { not: userId },
              },
            })
          : await prisma.message.count({
              where: {
                conversationId: conv.id,
                isDeleted: false,
                senderId: { not: userId },
              },
            })

        return {
          id: conv.id,
          type: conv.type,
          name: conv.name,
          teamId: conv.teamId,
          avatarUrl: conv.avatarUrl ?? null,
          lastMessageAt: conv.lastMessageAt,
          lastMessagePreview: conv.lastMessagePreview,
          members: conv.members.map((m) => ({
            userId: m.userId,
            user: m.user,
            role: m.role,
          })),
          unreadCount,
          createdAt: conv.createdAt,
        }
      })
    )

    return { success: true, data: result }
  } catch (error) {
    console.error('[getConversations] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Récupère les messages d'une conversation (pagination cursor-based)
 */
export async function getMessages(
  conversationId: string,
  options?: { cursor?: string; take?: number }
): Promise<CrudActionResult<MessagesPage>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId

  // Vérifier membership
  const isMember = await checkMembership(conversationId, userId)
  if (!isMember) {
    return {
      success: false,
      error: "Vous n'êtes pas membre de cette conversation",
    }
  }

  try {
    const take = Math.min(50, Math.max(1, options?.take ?? 30))

    // Résoudre le cursor (id → createdAt)
    let cursorDate: Date | undefined
    if (options?.cursor) {
      const cursorMsg = await prisma.message.findUnique({
        where: { id: options.cursor },
        select: { createdAt: true },
      })
      cursorDate = cursorMsg?.createdAt
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1, // +1 pour détecter hasMore
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    })

    const hasMore = messages.length > take
    const page = hasMore ? messages.slice(0, take) : messages

    return {
      success: true,
      data: {
        messages: page.map(formatMessage),
        hasMore,
      },
    }
  } catch (error) {
    console.error('[getMessages] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Envoie un message dans une conversation
 */
export async function sendMessage(input: {
  conversationId: string
  content?: string | null
  attachments?: AttachmentData[] | null
}): Promise<CrudActionResult<MessageWithSender>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId

  // Validation Zod
  const validation = validateData(sendMessageSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error }
  }

  const { conversationId, content, attachments } = validation.data

  // Vérifier membership
  const isMember = await checkMembership(conversationId, userId)
  if (!isMember) {
    return {
      success: false,
      error: "Vous n'êtes pas membre de cette conversation",
    }
  }

  try {
    // Récupérer le companyId de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { companyId: true },
    })

    if (!conversation) {
      return { success: false, error: 'Conversation introuvable' }
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content?.trim() || null,
        attachments: attachments ?? undefined,
        companyId: conversation.companyId,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    })

    // Mettre à jour le preview de la conversation (fire-and-forget)
    const senderName = message.sender?.name ?? 'Utilisateur'
    const preview = content?.trim()
      ? `${senderName}: ${content.trim().slice(0, 150)}`
      : `${senderName} a envoyé une pièce jointe`

    prisma.conversation
      .update({
        where: { id: conversationId },
        data: {
          lastMessageAt: message.createdAt,
          lastMessagePreview: preview.slice(0, 200),
        },
      })
      .catch(console.error)

    // Émettre le message via SSE aux autres membres (fire-and-forget)
    getConversationMemberUserIds(conversationId)
      .then((memberIds) => {
        const otherMembers = memberIds.filter((id) => id !== userId)
        if (otherMembers.length > 0) {
          emitNewMessage(otherMembers, conversationId, formatMessage(message))
        }
      })
      .catch(console.error)

    // Désarchiver la conversation pour tous les membres qui l'avaient archivée (fire-and-forget)
    prisma.conversationMember
      .updateMany({
        where: { conversationId, isArchived: true },
        data: { isArchived: false },
      })
      .catch(console.error)

    revalidatePath('/app/dashboard/messages')

    return { success: true, data: formatMessage(message) }
  } catch (error) {
    console.error('[sendMessage] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Marque une conversation comme lue
 */
export async function markAsRead(
  conversationId: string
): Promise<CrudActionResult<true>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId

  try {
    await prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    })

    return { success: true, data: true }
  } catch (error) {
    console.error('[markAsRead] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Crée ou retrouve une conversation DIRECT avec un autre utilisateur
 */
export async function createDirectConversation(
  targetUserId: string
): Promise<CrudActionResult<ConversationWithDetails>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId
  const companyId = effective.companyId

  if (!companyId) {
    return { success: false, error: 'Entreprise non définie' }
  }

  const validation = validateData(createDirectConversationSchema, {
    targetUserId,
  })
  if (!validation.success) {
    return { success: false, error: validation.error }
  }

  // Vérifier que le target est dans la même company
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, companyId: true },
  })

  if (!targetUser || targetUser.companyId !== companyId) {
    return {
      success: false,
      error: 'Utilisateur introuvable dans votre entreprise',
    }
  }

  if (targetUserId === userId) {
    return {
      success: false,
      error: 'Vous ne pouvez pas créer une conversation avec vous-même',
    }
  }

  try {
    // Chercher une conversation DIRECT existante entre les deux users
    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        companyId,
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    if (existing) {
      return {
        success: true,
        data: {
          id: existing.id,
          type: existing.type,
          name: existing.name,
          teamId: existing.teamId,
          avatarUrl: existing.avatarUrl ?? null,
          lastMessageAt: existing.lastMessageAt,
          lastMessagePreview: existing.lastMessagePreview,
          members: existing.members.map((m) => ({
            userId: m.userId,
            user: m.user,
            role: m.role,
          })),
          unreadCount: 0,
          createdAt: existing.createdAt,
          companyId: existing.companyId,
          createdById: existing.createdById,
        },
      }
    }

    // Créer la conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: 'DIRECT',
        companyId,
        createdById: userId,
        members: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    return {
      success: true,
      data: {
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        teamId: conversation.teamId,
        avatarUrl: conversation.avatarUrl ?? null,
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: conversation.lastMessagePreview,
        members: conversation.members.map((m) => ({
          userId: m.userId,
          user: m.user,
          role: m.role,
        })),
        unreadCount: 0,
        createdAt: conversation.createdAt,
        companyId: conversation.companyId,
        createdById: conversation.createdById,
      },
    }
  } catch (error) {
    console.error('[createDirectConversation] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Crée une conversation de groupe (MANAGER+ uniquement)
 */
export async function createGroupConversation(input: {
  name: string
  memberUserIds: string[]
}): Promise<CrudActionResult<ConversationWithDetails>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId
  const companyId = effective.companyId

  if (!companyId) {
    return { success: false, error: 'Entreprise non définie' }
  }

  const validation = validateData(createGroupConversationSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error }
  }

  const { name, memberUserIds } = validation.data

  // Vérifier que tous les membres sont dans la même company
  const members = await prisma.user.findMany({
    where: { id: { in: memberUserIds }, companyId },
    select: { id: true },
  })

  if (members.length !== memberUserIds.length) {
    return {
      success: false,
      error: 'Certains membres ne font pas partie de votre entreprise',
    }
  }

  try {
    // Ajouter le créateur s'il n'est pas dans la liste
    const allMemberIds = new Set([userId, ...memberUserIds])

    const conversation = await prisma.conversation.create({
      data: {
        type: 'GROUP',
        name,
        companyId,
        createdById: userId,
        members: {
          create: Array.from(allMemberIds).map((uid) => ({
            userId: uid,
            role: uid === userId ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    // Audit log (fire-and-forget)
    logAuditAction({
      action: 'CREATE',
      entityType: 'CONVERSATION',
      entityId: conversation.id,
      userId,
      companyId,
      details: { name, type: 'GROUP', memberCount: allMemberIds.size },
    }).catch(console.error)

    revalidatePath('/app/dashboard/messages')

    return {
      success: true,
      data: {
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        teamId: conversation.teamId,
        avatarUrl: conversation.avatarUrl ?? null,
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: conversation.lastMessagePreview,
        members: conversation.members.map((m) => ({
          userId: m.userId,
          user: m.user,
          role: m.role,
        })),
        unreadCount: 0,
        createdAt: conversation.createdAt,
        companyId: conversation.companyId,
        createdById: conversation.createdById,
      },
    }
  } catch (error) {
    console.error('[createGroupConversation] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Crée ou retrouve la conversation TEAM d'une équipe
 */
export async function getOrCreateTeamConversation(
  teamId: string
): Promise<CrudActionResult<ConversationWithDetails>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId

  try {
    // Vérifier que l'utilisateur est dans cette team
    const employee = await prisma.employee.findFirst({
      where: { userId, teamId },
      select: { id: true },
    })

    if (!employee) {
      return {
        success: false,
        error: 'Vous ne faites pas partie de cette équipe',
      }
    }

    // Chercher la conversation TEAM existante
    const existing = await prisma.conversation.findUnique({
      where: { teamId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    if (existing) {
      return {
        success: true,
        data: {
          id: existing.id,
          type: existing.type,
          name: existing.name,
          teamId: existing.teamId,
          avatarUrl: existing.avatarUrl ?? null,
          lastMessageAt: existing.lastMessageAt,
          lastMessagePreview: existing.lastMessagePreview,
          members: existing.members.map((m) => ({
            userId: m.userId,
            user: m.user,
            role: m.role,
          })),
          unreadCount: 0,
          createdAt: existing.createdAt,
          companyId: existing.companyId,
          createdById: existing.createdById,
        },
      }
    }

    // Créer la conversation avec tous les membres actuels de la team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        employees: {
          where: { userId: { not: null }, isActive: true },
          select: { userId: true },
        },
      },
    })

    if (!team) {
      return { success: false, error: 'Équipe introuvable' }
    }

    const memberUserIds = team.employees
      .map((e) => e.userId)
      .filter((id): id is string => id !== null)

    const conversation = await prisma.conversation.create({
      data: {
        type: 'TEAM',
        name: team.name,
        teamId,
        companyId: team.companyId,
        members: {
          create: memberUserIds.map((uid) => ({ userId: uid })),
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    return {
      success: true,
      data: {
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        teamId: conversation.teamId,
        avatarUrl: conversation.avatarUrl ?? null,
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: conversation.lastMessagePreview,
        members: conversation.members.map((m) => ({
          userId: m.userId,
          user: m.user,
          role: m.role,
        })),
        unreadCount: 0,
        createdAt: conversation.createdAt,
        companyId: conversation.companyId,
        createdById: conversation.createdById,
      },
    }
  } catch (error) {
    console.error('[getOrCreateTeamConversation] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Ajoute un membre à une conversation GROUP
 */
export async function addGroupMember(
  conversationId: string,
  newUserId: string
): Promise<CrudActionResult<ConversationWithDetails>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId

  const validation = validateData(addGroupMemberSchema, {
    conversationId,
    userId: newUserId,
  })
  if (!validation.success) {
    return { success: false, error: validation.error }
  }

  try {
    // Vérifier que c'est un GROUP et que l'utilisateur est ADMIN
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    if (!conversation) {
      return { success: false, error: 'Conversation introuvable' }
    }

    if (conversation.type !== 'GROUP') {
      return {
        success: false,
        error: 'Seuls les groupes permettent la gestion des membres',
      }
    }

    const myMembership = conversation.members.find((m) => m.userId === userId)
    if (!myMembership || myMembership.role !== 'ADMIN') {
      return {
        success: false,
        error:
          'Seuls les administrateurs du groupe peuvent ajouter des membres',
      }
    }

    // Vérifier que le nouveau membre est dans la même company
    const newUser = await prisma.user.findUnique({
      where: { id: newUserId },
      select: { companyId: true },
    })

    if (!newUser || newUser.companyId !== conversation.companyId) {
      return {
        success: false,
        error: "L'utilisateur ne fait pas partie de votre entreprise",
      }
    }

    await prisma.conversationMember.create({
      data: { conversationId, userId: newUserId },
    })

    // Recharger la conversation
    const updated = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    if (!updated) {
      return { success: false, error: 'Erreur lors de la mise à jour' }
    }

    revalidatePath('/app/dashboard/messages')

    return {
      success: true,
      data: {
        id: updated.id,
        type: updated.type,
        name: updated.name,
        teamId: updated.teamId,
        avatarUrl: updated.avatarUrl ?? null,
        lastMessageAt: updated.lastMessageAt,
        lastMessagePreview: updated.lastMessagePreview,
        members: updated.members.map((m) => ({
          userId: m.userId,
          user: m.user,
          role: m.role,
        })),
        unreadCount: 0,
        createdAt: updated.createdAt,
        companyId: updated.companyId,
        createdById: updated.createdById,
      },
    }
  } catch (error) {
    console.error('[addGroupMember] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Retire un membre d'une conversation GROUP
 */
export async function removeGroupMember(
  conversationId: string,
  memberUserId: string
): Promise<CrudActionResult<ConversationWithDetails>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId

  const validation = validateData(removeGroupMemberSchema, {
    conversationId,
    userId: memberUserId,
  })
  if (!validation.success) {
    return { success: false, error: validation.error }
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    })

    if (!conversation) {
      return { success: false, error: 'Conversation introuvable' }
    }

    if (conversation.type !== 'GROUP') {
      return {
        success: false,
        error: 'Seuls les groupes permettent la gestion des membres',
      }
    }

    const myMembership = conversation.members.find((m) => m.userId === userId)
    if (!myMembership || myMembership.role !== 'ADMIN') {
      return {
        success: false,
        error:
          'Seuls les administrateurs du groupe peuvent retirer des membres',
      }
    }

    // Supprimer le membre
    await prisma.conversationMember.deleteMany({
      where: { conversationId, userId: memberUserId },
    })

    // Si plus aucun membre, supprimer la conversation
    const remainingMembers = await prisma.conversationMember.count({
      where: { conversationId },
    })

    if (remainingMembers === 0) {
      await prisma.conversation.delete({ where: { id: conversationId } })
      return { success: true, data: {} as ConversationWithDetails }
    }

    // Recharger
    const updated = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    if (!updated) {
      return { success: false, error: 'Erreur lors de la mise à jour' }
    }

    revalidatePath('/app/dashboard/messages')

    return {
      success: true,
      data: {
        id: updated.id,
        type: updated.type,
        name: updated.name,
        teamId: updated.teamId,
        avatarUrl: updated.avatarUrl ?? null,
        lastMessageAt: updated.lastMessageAt,
        lastMessagePreview: updated.lastMessagePreview,
        members: updated.members.map((m) => ({
          userId: m.userId,
          user: m.user,
          role: m.role,
        })),
        unreadCount: 0,
        createdAt: updated.createdAt,
        companyId: updated.companyId,
        createdById: updated.createdById,
      },
    }
  } catch (error) {
    console.error('[removeGroupMember] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Liste les utilisateurs de la même entreprise pour la messagerie
 *
 * Retourne les User actifs de la company, avec uniquement id/name/image.
 * Exclut l'utilisateur courant.
 */
export async function getCompanyUsersForMessaging(): Promise<
  CrudActionResult<{ id: string; name: string | null; image: string | null }[]>
> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId
  const companyId = effective.companyId

  if (!companyId) {
    return { success: true, data: [] }
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        companyId,
        isActive: true,
        id: { not: userId },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: { name: 'asc' },
    })

    return { success: true, data: users }
  } catch (error) {
    console.error('[getCompanyUsersForMessaging] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}

/**
 * Archive une conversation (masque de la liste sans supprimer)
 *
 * La conversation réapparaît automatiquement si un nouveau message arrive.
 */
export async function archiveConversation(
  conversationId: string
): Promise<CrudActionResult<true>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId

  try {
    await prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { isArchived: true },
    })

    revalidatePath('/app/dashboard/messages')
    return { success: true, data: true }
  } catch (error) {
    console.error('[archiveConversation] Error:', error)
    return { success: false, error: handlePrismaError(error).error }
  }
}
