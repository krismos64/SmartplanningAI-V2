/**
 * API Routes pour le mode impersonation SYSTEM_ADMIN
 *
 * POST /api/admin/impersonate — Démarre l'impersonation
 * DELETE /api/admin/impersonate — Arrête l'impersonation
 *
 * Accepte soit { targetUserId } soit { companyId } dans le body.
 * Si companyId est fourni, résout automatiquement le premier
 * DIRECTOR actif de l'entreprise (ou à défaut le premier user actif).
 *
 * @ticket SP-447
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireRole } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/services/audit'
import { getImpersonationContextFromHeaders } from '@/lib/impersonation'
import type { ImpersonationContext } from '@/types/auth'
import { IMPERSONATION_COOKIE_NAME, IMPERSONATION_MAX_AGE } from '@/types/auth'

// ============================================================================
// Validation
// ============================================================================

const startImpersonationSchema = z
  .object({
    targetUserId: z.string().min(1).optional(),
    companyId: z.string().min(1).optional(),
  })
  .refine((data) => data.targetUserId || data.companyId, {
    message: 'targetUserId ou companyId requis',
  })

// ============================================================================
// POST — Démarrer l'impersonation
// ============================================================================

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Vérifier SYSTEM_ADMIN
  const { error, session } = await requireRole('SYSTEM_ADMIN')
  if (error) return error

  // 2. Parser et valider le body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const validation = startImpersonationSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0]?.message ?? 'Données invalides' },
      { status: 400 }
    )
  }

  const { targetUserId, companyId } = validation.data

  // 3. Résoudre l'utilisateur cible
  let resolvedUserId = targetUserId

  if (!resolvedUserId && companyId) {
    // Chercher le premier DIRECTOR actif, sinon le premier user actif
    const companyUser = await prisma.user.findFirst({
      where: {
        companyId,
        isActive: true,
        role: { not: 'SYSTEM_ADMIN' },
      },
      orderBy: [
        // DIRECTOR en premier (poids RBAC le plus élevé)
        { role: 'asc' },
      ],
      select: { id: true, role: true },
    })

    if (!companyUser) {
      return NextResponse.json(
        { error: 'Aucun utilisateur actif trouvé dans cette entreprise' },
        { status: 404 }
      )
    }

    resolvedUserId = companyUser.id
  }

  if (!resolvedUserId) {
    return NextResponse.json(
      { error: 'targetUserId ou companyId requis' },
      { status: 400 }
    )
  }

  // 4. Charger l'utilisateur cible avec sa company
  const targetUser = await prisma.user.findUnique({
    where: { id: resolvedUserId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Utilisateur cible introuvable' },
      { status: 404 }
    )
  }

  // 5. Bloquer l'impersonation d'un autre SYSTEM_ADMIN
  if (targetUser.role === 'SYSTEM_ADMIN') {
    return NextResponse.json(
      { error: "Impossible d'impersonner un autre SYSTEM_ADMIN" },
      { status: 400 }
    )
  }

  // 6. Vérifier que l'utilisateur cible est actif et a une company
  if (!targetUser.isActive) {
    return NextResponse.json(
      { error: "L'utilisateur cible est désactivé" },
      { status: 400 }
    )
  }

  if (!targetUser.company || !targetUser.companyId) {
    return NextResponse.json(
      { error: "L'utilisateur cible n'a pas d'entreprise associée" },
      { status: 400 }
    )
  }

  if (!targetUser.company.isActive) {
    return NextResponse.json(
      { error: "L'entreprise cible est désactivée" },
      { status: 400 }
    )
  }

  // 7. Créer le contexte d'impersonation
  const context: ImpersonationContext = {
    originalAdminId: session.user.id,
    targetUserId: targetUser.id,
    targetCompanyId: targetUser.companyId,
    targetRole: targetUser.role,
    targetEmail: targetUser.email,
    targetCompanyName: targetUser.company.name,
    startedAt: Date.now(),
  }

  // 8. Construire la réponse avec le cookie posé directement dessus
  const response = NextResponse.json({
    success: true,
    redirectTo: '/app/tableau-de-bord',
    impersonation: {
      isImpersonating: true,
      originalAdminId: session.user.id,
      impersonatedUserId: targetUser.id,
      impersonatedCompanyId: targetUser.companyId,
      impersonatedRole: targetUser.role,
      impersonatedUserEmail: targetUser.email,
      impersonatedCompanyName: targetUser.company.name,
    },
  })

  response.cookies.set(IMPERSONATION_COOKIE_NAME, JSON.stringify(context), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: IMPERSONATION_MAX_AGE,
  })

  // 9. Audit log (fire-and-forget)
  logAuditAction({
    action: 'IMPERSONATE',
    entityType: 'USER',
    entityId: targetUser.id,
    userId: session.user.id,
    companyId: targetUser.companyId,
    details: {
      event: 'start',
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      targetRole: targetUser.role,
      targetCompanyId: targetUser.companyId,
      targetCompanyName: targetUser.company.name,
    },
  }).catch(console.error)

  // 10. Notification SYSTEM_ADMIN : impersonation démarrée (fire-and-forget, SP-476)
  import('@/lib/actions/notifications')
    .then(({ createAdminNotification }) =>
      createAdminNotification({
        title: 'Impersonation démarrée',
        message: `${session.user.email} a démarré une impersonation de ${targetUser.email} (${targetUser.company?.name ?? 'N/A'})`,
        type: 'SYSTEM',
        actionUrl: '/app/admin/journaux',
      })
    )
    .catch(console.error)

  return response
}

// ============================================================================
// DELETE — Arrêter l'impersonation
// ============================================================================

export async function DELETE(): Promise<NextResponse> {
  // 1. Vérifier que l'impersonation est active via le cookie
  const context = await getImpersonationContextFromHeaders()

  if (!context) {
    // Fallback : même sans contexte valide, on supprime le cookie au cas où
    // et on redirige vers l'admin (évite le blocage utilisateur)
    const response = NextResponse.json({
      success: true,
      redirectTo: '/app/admin/entreprises',
      warning: 'Aucune impersonation active, cookie nettoyé',
    })
    response.cookies.delete(IMPERSONATION_COOKIE_NAME)
    return response
  }

  // 2. Construire la réponse avec suppression du cookie
  const response = NextResponse.json({
    success: true,
    redirectTo: '/app/admin/entreprises',
  })

  response.cookies.delete(IMPERSONATION_COOKIE_NAME)

  // 3. Audit log (fire-and-forget)
  const duration = Math.round((Date.now() - context.startedAt) / 1000)
  logAuditAction({
    action: 'IMPERSONATE',
    entityType: 'USER',
    entityId: context.targetUserId,
    userId: context.originalAdminId,
    companyId: context.targetCompanyId,
    details: {
      event: 'stop',
      targetUserId: context.targetUserId,
      targetEmail: context.targetEmail,
      duration,
    },
  }).catch(console.error)

  // 4. Notification SYSTEM_ADMIN : impersonation arrêtée (fire-and-forget, SP-476)
  const durationMin = Math.round(duration / 60)
  import('@/lib/actions/notifications')
    .then(({ createAdminNotification }) =>
      createAdminNotification({
        title: 'Impersonation arrêtée',
        message: `Impersonation de ${context.targetEmail} (${context.targetCompanyName ?? 'N/A'}) terminée après ${durationMin} min`,
        type: 'SYSTEM',
        actionUrl: '/app/admin/journaux',
      })
    )
    .catch(console.error)

  return response
}
