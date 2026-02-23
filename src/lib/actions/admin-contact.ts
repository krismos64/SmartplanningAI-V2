'use server'

/**
 * Server Actions pour l'envoi de messages admin.
 *
 * - sendAdminMessageToCompany : message ciblé vers une entreprise (SP-474)
 * - sendAdminBroadcast : diffusion à tous les DIRECTOR actifs (SP-477)
 *
 * Tracé dans EmailLog. Réservé SYSTEM_ADMIN.
 *
 * @ticket SP-474, SP-477
 */

import { z } from 'zod'
import { render } from '@react-email/components'

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { AdminContactEmail } from '../../../emails/templates/AdminContactEmail'

// ============================================================================
// Validation
// ============================================================================

export const AdminMessageSchema = z.object({
  companyId: z.string().min(1),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(2000),
  category: z.enum(['information', 'facturation', 'technique', 'autre']),
})

export type AdminMessageInput = z.infer<typeof AdminMessageSchema>

// ============================================================================
// Types
// ============================================================================

export interface SendAdminMessageResult {
  success: boolean
  sentCount: number
  errors: string[]
}

// ============================================================================
// Action
// ============================================================================

/**
 * Envoie un message admin à tous les DIRECTOR d'une entreprise.
 */
export async function sendAdminMessageToCompany(
  input: AdminMessageInput
): Promise<SendAdminMessageResult> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  const parsed = AdminMessageSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.message)
  }

  const { companyId, subject, message, category } = parsed.data

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      users: {
        where: { role: 'DIRECTOR', isActive: true },
        select: { email: true, name: true },
      },
    },
  })

  if (!company) {
    throw new Error('Company not found')
  }

  const directors = company.users
  if (directors.length === 0) {
    return { success: false, sentCount: 0, errors: ['Aucun directeur trouvé'] }
  }

  const result: SendAdminMessageResult = {
    success: true,
    sentCount: 0,
    errors: [],
  }

  for (const director of directors) {
    try {
      const html = await render(
        AdminContactEmail({
          companyName: company.name,
          recipientName: director.name ?? director.email,
          subject,
          message,
          category,
        })
      )

      const emailResult = await sendEmail({
        to: director.email,
        subject: `[SmartPlanning] ${subject}`,
        html,
      })

      await prisma.emailLog.create({
        data: {
          companyId: company.id,
          subscriptionId: null,
          emailType: 'ADMIN_MESSAGE',
          recipientEmail: director.email,
          status: emailResult.success ? 'SENT' : 'FAILED',
          metadata: { subject, category, sentBy: session.user.id },
        },
      })

      if (emailResult.success) {
        result.sentCount++
      } else {
        result.errors.push(director.email)
      }
    } catch {
      result.errors.push(director.email)
    }
  }

  if (result.errors.length === directors.length) {
    result.success = false
  }

  return result
}

// ============================================================================
// Broadcast Validation (SP-477)
// ============================================================================

const BROADCAST_CATEGORIES = [
  'maintenance',
  'product_update',
  'important_info',
  'commercial',
] as const

export type BroadcastCategory = (typeof BROADCAST_CATEGORIES)[number]

export const BroadcastSchema = z.object({
  subject: z.string().min(5, 'Minimum 5 caractères').max(150),
  message: z.string().min(20, 'Minimum 20 caractères').max(5000),
  category: z.enum(BROADCAST_CATEGORIES),
})

export type BroadcastInput = z.infer<typeof BroadcastSchema>

// ============================================================================
// Broadcast Types (SP-477)
// ============================================================================

export interface BroadcastResult {
  success: boolean
  totalSent: number
  totalFailed: number
  failedEmails: string[]
}

export const BROADCAST_CATEGORY_LABELS: Record<BroadcastCategory, string> = {
  maintenance: 'Maintenance',
  product_update: 'Mise à jour produit',
  important_info: 'Information importante',
  commercial: 'Offre commerciale',
}

/** Mapping catégorie broadcast → catégorie template email */
const BROADCAST_TO_CONTACT_CATEGORY: Record<
  BroadcastCategory,
  'information' | 'facturation' | 'technique' | 'autre'
> = {
  maintenance: 'technique',
  product_update: 'information',
  important_info: 'information',
  commercial: 'facturation',
}

// ============================================================================
// Broadcast Action (SP-477)
// ============================================================================

/** Taille de batch pour l'envoi parallèle */
const BATCH_SIZE = 10

/**
 * Envoie un email broadcast à tous les DIRECTOR actifs
 * des entreprises avec abonnement ACTIVE ou TRIAL.
 *
 * @ticket SP-477
 */
export async function sendAdminBroadcast(
  input: BroadcastInput
): Promise<BroadcastResult> {
  // 1. RBAC
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  // 2. Validation
  const parsed = BroadcastSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.message)
  }

  const { subject, message, category } = parsed.data

  // 3. Récupérer toutes les entreprises actives avec abo ACTIVE ou TRIAL
  const companies = await prisma.company.findMany({
    where: {
      isActive: true,
      subscription: {
        is: { status: { in: ['ACTIVE', 'TRIAL'] } },
      },
    },
    select: {
      id: true,
      name: true,
      users: {
        where: { role: 'DIRECTOR', isActive: true },
        select: { email: true, name: true },
      },
    },
  })

  // Aplatir en liste de destinataires
  const directors = companies.flatMap((c) =>
    c.users.map((u) => ({
      email: u.email,
      name: u.name,
      companyId: c.id,
      companyName: c.name,
    }))
  )

  if (directors.length === 0) {
    return { success: true, totalSent: 0, totalFailed: 0, failedEmails: [] }
  }

  // 4. Render le template une seule fois par destinataire (nom personnalisé)
  const contactCategory = BROADCAST_TO_CONTACT_CATEGORY[category]
  const result: BroadcastResult = {
    success: true,
    totalSent: 0,
    totalFailed: 0,
    failedEmails: [],
  }

  // 5. Envoyer par batch de BATCH_SIZE avec Promise.allSettled
  for (let i = 0; i < directors.length; i += BATCH_SIZE) {
    const batch = directors.slice(i, i + BATCH_SIZE)

    const settled = await Promise.allSettled(
      batch.map(async (director) => {
        const html = await render(
          AdminContactEmail({
            companyName: director.companyName,
            recipientName: director.name ?? director.email,
            subject,
            message,
            category: contactCategory,
          })
        )

        const emailResult = await sendEmail({
          to: director.email,
          subject: `[SmartPlanning] ${subject}`,
          html,
        })

        // EmailLog par destinataire
        await prisma.emailLog.create({
          data: {
            companyId: director.companyId,
            subscriptionId: null,
            emailType: 'ADMIN_BROADCAST',
            recipientEmail: director.email,
            status: emailResult.success ? 'SENT' : 'FAILED',
            metadata: {
              subject,
              category,
              broadcastBatch: Math.floor(i / BATCH_SIZE) + 1,
              sentBy: session.user.id,
            },
          },
        })

        if (!emailResult.success) {
          throw new Error(director.email)
        }

        return director.email
      })
    )

    for (const s of settled) {
      if (s.status === 'fulfilled') {
        result.totalSent++
      } else {
        result.totalFailed++
        // Le message d'erreur contient l'email
        const failedEmail =
          s.reason instanceof Error ? s.reason.message : String(s.reason)
        result.failedEmails.push(failedEmail)
      }
    }
  }

  result.success = result.totalSent > 0

  return result
}
