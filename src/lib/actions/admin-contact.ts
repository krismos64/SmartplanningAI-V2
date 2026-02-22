'use server'

/**
 * Server Action pour l'envoi de messages admin aux directeurs d'une entreprise.
 * Tracé dans EmailLog avec type ADMIN_MESSAGE.
 * Réservé SYSTEM_ADMIN.
 *
 * @ticket SP-474
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
