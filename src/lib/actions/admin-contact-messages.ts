'use server'

/**
 * Server Actions - Messages du formulaire de contact public (SP-577)
 *
 * Reserve au SYSTEM_ADMIN. `contact_messages` ne porte pas de `companyId` :
 * l'expediteur est un visiteur anonyme qui n'appartient a aucune entreprise.
 * Il n'y a donc pas de filtre d'isolation a poser ici, et c'est precisement
 * pour ca que le controle de role doit etre strict. SYSTEM_ADMIN est le seul
 * role non borne a une company.
 *
 * L'ecran existe surtout pour les messages en `emailStatus FAILED` : la
 * demande est arrivee en base mais aucun email n'a prevenu l'equipe. Sans
 * cette page, elle resterait invisible.
 *
 * @ticket SP-577
 */

import { revalidatePath } from 'next/cache'

import { checkPermission } from '@/lib/actions/crud-utils'
import { prisma } from '@/lib/prisma'
import {
  contactMessageFiltersSchema,
  markContactMessageSchema,
  type ContactMessageFiltersInput,
  type MarkContactMessageInput,
} from '@/lib/validations/contact-messages'
import type { Prisma } from '@prisma/client'
import type { CrudActionResult } from '@/types'

// ============================================================================
// Types
// ============================================================================

export interface AdminContactMessageRow {
  id: string
  name: string
  email: string
  subject: string
  message: string
  emailStatus: string
  /** Presence d'une erreur d'envoi, sans son contenu technique */
  hasEmailError: boolean
  isRead: boolean
  handledAt: Date | null
  createdAt: Date
}

export interface GetContactMessagesAdminResult {
  messages: AdminContactMessageRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ContactMessagesKpis {
  /** Demandes jamais ouvertes */
  unread: number
  /** Demandes dont la notification n'est jamais partie */
  failed: number
  /** Volume sur les 30 derniers jours */
  last30Days: number
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * `emailError` stocke le message brut de Nodemailer, qui peut contenir
 * l'hote, le port et l'utilisateur d'authentification SMTP. Il n'est jamais
 * expose a l'interface : seule sa presence l'est, ce qui suffit a signaler
 * une notification en echec.
 *
 * Meme raisonnement que la whitelist de metadata du journal EmailLog.
 */
function buildWhereClause(
  filters: Omit<
    ReturnType<typeof contactMessageFiltersSchema.parse>,
    'page' | 'pageSize'
  >
): Prisma.ContactMessageWhereInput {
  const where: Prisma.ContactMessageWhereInput = {}

  if (filters.emailStatus) {
    where.emailStatus = filters.emailStatus
  }

  if (filters.readState) {
    where.isRead = filters.readState === 'read'
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { subject: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  return where
}

// ============================================================================
// Lecture
// ============================================================================

export async function getContactMessagesAdmin(
  input: ContactMessageFiltersInput = {}
): Promise<CrudActionResult<GetContactMessagesAdminResult>> {
  const authResult = await checkPermission('SYSTEM_ADMIN')
  if (!authResult.success) return authResult

  const validation = contactMessageFiltersSchema.safeParse(input)
  if (!validation.success) {
    return { success: false, error: 'Filtres invalides' }
  }

  const { page, pageSize, ...filters } = validation.data
  const where = buildWhereClause(filters)

  try {
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.count({ where }),
    ])

    return {
      success: true,
      data: {
        messages: messages.map((message) => ({
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message,
          emailStatus: message.emailStatus,
          hasEmailError: message.emailError !== null,
          isRead: message.isRead,
          handledAt: message.handledAt,
          createdAt: message.createdAt,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error('[getContactMessagesAdmin] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la recuperation des messages de contact',
    }
  }
}

/**
 * Compteurs de synthese affiches en tete de page.
 */
export async function getContactMessagesKpisAdmin(): Promise<
  CrudActionResult<ContactMessagesKpis>
> {
  const authResult = await checkPermission('SYSTEM_ADMIN')
  if (!authResult.success) return authResult

  try {
    const trenteJours = new Date()
    trenteJours.setDate(trenteJours.getDate() - 30)

    const [unread, failed, last30Days] = await Promise.all([
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.contactMessage.count({ where: { emailStatus: 'FAILED' } }),
      prisma.contactMessage.count({
        where: { createdAt: { gte: trenteJours } },
      }),
    ])

    return { success: true, data: { unread, failed, last30Days } }
  } catch (error) {
    console.error('[getContactMessagesKpisAdmin] Error:', error)
    return {
      success: false,
      error: 'Erreur lors du calcul des compteurs',
    }
  }
}

// ============================================================================
// Mutation
// ============================================================================

/**
 * Marque une demande comme traitee ou non traitee.
 *
 * `handledAt` porte la date du premier traitement et n'est efface qu'en
 * repassant explicitement le message en non lu.
 */
export async function markContactMessageRead(
  input: MarkContactMessageInput
): Promise<CrudActionResult<{ id: string; isRead: boolean }>> {
  const authResult = await checkPermission('SYSTEM_ADMIN')
  if (!authResult.success) return authResult

  const validation = markContactMessageSchema.safeParse(input)
  if (!validation.success) {
    return { success: false, error: 'Donnees invalides' }
  }

  const { id, isRead } = validation.data

  try {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        isRead,
        handledAt: isRead ? new Date() : null,
      },
      select: { id: true, isRead: true },
    })

    revalidatePath('/app/admin/messages-contact')

    return { success: true, data: updated }
  } catch (error) {
    console.error('[markContactMessageRead] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la mise a jour du message',
    }
  }
}
