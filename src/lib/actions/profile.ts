'use server'

/**
 * Server Actions pour le module Profil Utilisateur
 *
 * @description Actions serveur pour récupérer et gérer le profil utilisateur.
 * Combine les données User (compte) et Employee (profil RH) si disponible.
 *
 * @ticket SP-270, SP-271, SP-273, SP-277, SP-278
 */

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
import { logAuditAction } from '@/lib/services/audit'
import { assertNotImpersonating } from '@/lib/impersonation'
import {
  editProfileSchema,
  type EditProfileInput,
} from '@/lib/validations/profile'
import {
  changePasswordSchema,
  deleteAccountSchema,
  type ChangePasswordFormData,
  type DeleteAccountInput,
} from '@/lib/validations/user'
import type {
  CrudActionResult,
  ExportAccount,
  ExportProfile,
  ExportSchedule,
  ExportLeaveRequest,
  ExportLeaveBalance,
  ExportAvailability,
  ExportPersonalTask,
  ExportNotification,
  ExportIncidentNote,
  UserDataExport,
} from '@/types'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Données complètes du profil utilisateur
 *
 * Combine les informations du compte (User) et du profil RH (Employee)
 */
export interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    image: string | null
    emailVerified: Date | null
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date
  }
  employee: {
    id: string
    firstName: string
    lastName: string
    jobTitle: string | null
    department: string | null
    phone: string | null
    email: string | null
    hireDate: Date | null
    weeklyHours: number
    team: { id: string; name: string } | null
  } | null
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Récupère le profil complet de l'utilisateur connecté
 *
 * Retourne les données User + Employee (si lié).
 * SYSTEM_ADMIN peut ne pas avoir d'Employee associé.
 *
 * @returns Profil utilisateur ou erreur
 *
 * @example
 * const result = await getProfile()
 * if (result.success) {
 *   console.log(result.data.user.email)
 *   console.log(result.data.employee?.firstName)
 * }
 */
export async function getProfile(): Promise<CrudActionResult<ProfileData>> {
  try {
    // 1. Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // 2. Récupérer l'utilisateur avec son profil employé
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            department: true,
            phone: true,
            email: true,
            hireDate: true,
            weeklyHours: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // 3. Vérifier que l'utilisateur existe
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // 4. Formater et retourner les données
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        },
        employee: user.employee,
      },
    }
  } catch (error) {
    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[getProfile] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la récupération du profil',
    }
  }
}

/**
 * Met à jour le profil de l'utilisateur connecté
 *
 * Logique :
 * 1. Si Employee existe → Met à jour Employee.firstName, lastName, phone
 * 2. Si pas d'Employee (SYSTEM_ADMIN) → Met à jour uniquement User.name
 *
 * @param input - Données du formulaire d'édition
 * @returns CrudActionResult avec les données mises à jour
 *
 * @example
 * const result = await updateProfile({ firstName: 'Jean', lastName: 'Dupont', phone: '0612345678' })
 * if (result.success) {
 *   console.log('Profil mis à jour')
 * }
 *
 * @ticket SP-271
 */
export async function updateProfile(
  input: EditProfileInput
): Promise<CrudActionResult<ProfileData>> {
  try {
    // 1. Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const impersonationBlock = await assertNotImpersonating()
    if (impersonationBlock) return impersonationBlock

    // 2. Valider les données entrantes
    const validation = editProfileSchema.safeParse(input)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Données invalides',
        field: (firstError?.path[0] as string) ?? undefined,
      }
    }

    const { firstName, lastName, phone, jobTitle, hireDate } = validation.data

    // 3. Récupérer l'utilisateur avec son Employee
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    })

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // 4. Mettre à jour selon le cas
    if (user.employee) {
      // Cas normal : mettre à jour Employee
      await prisma.employee.update({
        where: { id: user.employee.id },
        data: {
          firstName,
          lastName,
          phone: phone || null,
          jobTitle: jobTitle || null,
          hireDate: hireDate || null,
        },
      })

      // Synchroniser User.name pour l'affichage
      await prisma.user.update({
        where: { id: user.id },
        data: { name: `${firstName} ${lastName}` },
      })
    } else {
      // Cas SYSTEM_ADMIN sans Employee : mettre à jour uniquement User.name
      await prisma.user.update({
        where: { id: user.id },
        data: { name: `${firstName} ${lastName}` },
      })
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'USER',
      entityId: session.user.id,
      userId: session.user.id,
      details: {
        firstName,
        lastName,
        phone: phone || null,
        jobTitle: jobTitle || null,
      },
    }).catch(console.error)

    // 5. Revalidate le cache
    revalidatePath('/app/profile')
    revalidatePath('/app/profile/edit')

    // 6. Retourner les données mises à jour
    return await getProfile()
  } catch (error) {
    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[updateProfile] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la mise à jour du profil',
    }
  }
}

/**
 * Change le mot de passe de l'utilisateur connecté
 *
 * Sécurité :
 * 1. Vérifie l'authentification
 * 2. Valide les données entrantes (Zod)
 * 3. Vérifie l'ancien mot de passe (bcrypt.compare)
 * 4. Hash le nouveau mot de passe (bcrypt.hash)
 * 5. Met à jour en base de données
 *
 * @param input - Données du formulaire de changement de mot de passe
 * @returns CrudActionResult avec message de succès
 *
 * @security
 * - Messages d'erreur génériques pour éviter information leak
 * - Vérification timing-safe avec bcrypt.compare
 * - Ne pas logger les mots de passe
 *
 * @ticket SP-273
 */
export async function changePassword(
  input: ChangePasswordFormData
): Promise<CrudActionResult<{ message: string }>> {
  try {
    // 1. Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const impersonationBlock = await assertNotImpersonating()
    if (impersonationBlock) return impersonationBlock

    // 2. Valider les données entrantes (double validation)
    const validation = changePasswordSchema.safeParse(input)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Données invalides',
        field: (firstError?.path[0] as string) ?? undefined,
      }
    }

    const { currentPassword, newPassword } = validation.data

    // 3. Récupérer l'utilisateur avec son mot de passe hashé
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })

    if (!user || !user.password) {
      // Message générique pour ne pas révéler si l'utilisateur existe
      return { success: false, error: 'Impossible de modifier le mot de passe' }
    }

    // 4. Vérifier l'ancien mot de passe (timing-safe avec bcrypt.compare)
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.password
    )
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Mot de passe actuel incorrect',
        field: 'currentPassword',
      }
    }

    // 5. Hasher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword)

    // 6. Mettre à jour en base de données
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'PASSWORD_CHANGE',
      entityType: 'USER',
      entityId: session.user.id,
      userId: session.user.id,
      details: { method: 'change-password' },
    }).catch(console.error)

    // 7. Revalidate (même si pas de données affichées, pour cohérence)
    revalidatePath('/app/profile')
    revalidatePath('/app/profile/password')

    return {
      success: true,
      data: { message: 'Mot de passe modifié avec succès' },
    }
  } catch (error) {
    // Log en développement (sans le mot de passe !)
    if (process.env.NODE_ENV === 'development') {
      console.error('[changePassword] Error:', error)
    }

    return {
      success: false,
      error: 'Une erreur est survenue lors de la modification du mot de passe',
    }
  }
}

/**
 * Supprime définitivement le compte utilisateur et toutes ses données
 *
 * RGPD Article 17 - Droit à l'effacement
 *
 * Sécurité :
 * 1. Vérifie l'authentification
 * 2. Vérifie que l'email saisi correspond à l'utilisateur
 * 3. Vérifie le mot de passe (timing-safe avec bcrypt)
 * 4. Transaction Prisma pour intégrité des données
 *
 * Cascade automatique Prisma :
 * - Account (OAuth)
 * - Session
 * - Employee → Schedules, LeaveRequests, LeaveBalances, Availabilities
 * - Notifications
 * - PersonalTasks
 * - IncidentNotes (authored)
 *
 * Traitement manuel :
 * - LeaveBalance.updatedById → mis à null avant suppression
 *
 * @param input - Données de confirmation (email + password + checkbox)
 * @returns CrudActionResult avec message de succès
 *
 * @ticket SP-277
 */
export async function deleteAccount(
  input: DeleteAccountInput
): Promise<CrudActionResult<{ message: string }>> {
  try {
    // 1. Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour supprimer votre compte',
      }
    }

    const impersonationBlock = await assertNotImpersonating()
    if (impersonationBlock) return impersonationBlock

    // 2. Valider les données d'entrée
    const validation = deleteAccountSchema.safeParse(input)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Données invalides',
        field: (firstError?.path[0] as string) ?? undefined,
      }
    }

    const { confirmEmail, password } = validation.data

    // 3. Récupérer l'utilisateur avec email et mot de passe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'Compte introuvable',
      }
    }

    // 4. Vérifier que l'email saisi correspond (case-insensitive)
    if (user.email.toLowerCase() !== confirmEmail.toLowerCase()) {
      return {
        success: false,
        error: "L'email saisi ne correspond pas à votre compte",
        field: 'confirmEmail',
      }
    }

    // 5. Vérifier le mot de passe (timing-safe)
    if (!user.password) {
      return {
        success: false,
        error: 'Impossible de supprimer ce compte (authentification externe)',
      }
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Mot de passe incorrect',
        field: 'password',
      }
    }

    // 6. Log avant suppression (traçabilité RGPD Article 30)
    // Note: utilisation de console.warn pour la traçabilité (autorisé par ESLint)
    console.warn(
      `[deleteAccount] User ${user.id} (${user.email}) requested account deletion at ${new Date().toISOString()}`
    )

    // SP-444 : Audit trail avant suppression (fire-and-forget)
    logAuditAction({
      action: 'DELETE',
      entityType: 'USER',
      entityId: user.id,
      userId: user.id,
      details: { email: user.email, selfDeletion: true },
    }).catch(console.error)

    // 7. Transaction : Nettoyer les FK puis supprimer
    await prisma.$transaction(async (tx) => {
      // Mettre à null les références updatedById dans LeaveBalance
      // (pas de cascade configurée sur cette relation)
      await tx.leaveBalance.updateMany({
        where: { updatedById: user.id },
        data: { updatedById: null },
      })

      // Supprimer l'utilisateur (cascade automatique pour le reste)
      await tx.user.delete({
        where: { id: user.id },
      })
    })

    // 8. Log après suppression
    console.warn(
      `[deleteAccount] User ${user.id} account successfully deleted at ${new Date().toISOString()}`
    )

    // Pas de revalidatePath car l'utilisateur sera déconnecté
    return {
      success: true,
      data: {
        message: 'Votre compte a été supprimé définitivement',
      },
    }
  } catch (error) {
    console.error('[deleteAccount] Error:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la suppression',
    }
  }
}

// ============================================================================
// EXPORT DONNÉES RGPD (SP-278)
// ============================================================================

/**
 * Résultat de l'export des données
 */
export interface ExportDataResult {
  filename: string
  data: string
  mimeType: string
}

/**
 * Exporte toutes les données personnelles de l'utilisateur
 *
 * RGPD Article 20 - Droit à la portabilité des données
 *
 * Format : JSON structuré, lisible par machine
 *
 * Contenu :
 * - Données compte (User)
 * - Profil employé (Employee)
 * - Plannings (Schedule)
 * - Demandes de congés (LeaveRequest)
 * - Soldes de congés (LeaveBalance)
 * - Disponibilités (Availability)
 * - Tâches personnelles (PersonalTask)
 * - Notifications (Notification)
 * - Notes d'incident rédigées (IncidentNote)
 *
 * Exclusions :
 * - Mot de passe (même hashé)
 * - IDs internes techniques
 * - Tokens OAuth
 * - Sessions
 * - Notes d'incident où l'utilisateur est le sujet (données tierces)
 *
 * @returns CrudActionResult avec les données à télécharger
 *
 * @ticket SP-278
 */
export async function exportUserData(): Promise<
  CrudActionResult<ExportDataResult>
> {
  try {
    // 1. Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour exporter vos données',
      }
    }

    const userId = session.user.id

    // 2. Récupérer toutes les données en parallèle
    const [
      user,
      employee,
      schedules,
      leaveRequests,
      leaveBalances,
      availabilities,
      personalTasks,
      notifications,
      incidentNotesAuthored,
    ] = await Promise.all([
      // Données User
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          image: true,
          role: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),

      // Données Employee
      prisma.employee.findFirst({
        where: { userId },
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          jobTitle: true,
          department: true,
          hireDate: true,
          weeklyHours: true,
          skills: true,
          preferences: true,
          isActive: true,
          createdAt: true,
          team: {
            select: { name: true },
          },
        },
      }),

      // Plannings
      prisma.schedule.findMany({
        where: { employee: { userId } },
        select: {
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          type: true,
          status: true,
          title: true,
          description: true,
          location: true,
        },
        orderBy: { startDate: 'desc' },
      }),

      // Demandes de congés
      prisma.leaveRequest.findMany({
        where: { employee: { userId } },
        select: {
          startDate: true,
          endDate: true,
          days: true,
          type: true,
          status: true,
          halfDay: true,
          halfDayPeriod: true,
          reason: true,
          comment: true,
          reviewedAt: true,
          reviewComment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Soldes de congés
      prisma.leaveBalance.findMany({
        where: { employee: { userId } },
        select: {
          year: true,
          paidLeaveTotal: true,
          paidLeaveUsed: true,
          rttTotal: true,
          rttUsed: true,
        },
        orderBy: { year: 'desc' },
      }),

      // Disponibilités
      prisma.availability.findMany({
        where: { employee: { userId } },
        select: {
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          type: true,
          reason: true,
          isRecurring: true,
        },
        orderBy: { startDate: 'desc' },
      }),

      // Tâches personnelles
      prisma.personalTask.findMany({
        where: { userId },
        select: {
          title: true,
          description: true,
          dueDate: true,
          completed: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Notifications
      prisma.notification.findMany({
        where: { userId },
        select: {
          title: true,
          message: true,
          type: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Notes d'incident rédigées par l'utilisateur
      prisma.incidentNote.findMany({
        where: { authorId: userId },
        select: {
          title: true,
          content: true,
          date: true,
          visibility: true,
          createdAt: true,
        },
        orderBy: { date: 'desc' },
      }),
    ])

    // 3. Vérifier que l'utilisateur existe
    if (!user) {
      return {
        success: false,
        error: 'Compte introuvable',
      }
    }

    // 3b. Données billing (DIRECTOR uniquement)
    let subscription = null
    let payments: { amount: number; currency: string; status: string; paidAt: Date | null; createdAt: Date; paymentMethod: string | null }[] = []
    if (user.role === 'DIRECTOR') {
      const userWithCompany = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      })
      if (userWithCompany?.companyId) {
        const [sub, pay] = await Promise.all([
          prisma.subscription.findUnique({
            where: { companyId: userWithCompany.companyId },
            select: {
              plan: true,
              status: true,
              quantity: true,
              pricePerEmployee: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              cancelAtPeriodEnd: true,
              canceledAt: true,
              createdAt: true,
            },
          }),
          prisma.payment.findMany({
            where: { companyId: userWithCompany.companyId },
            select: {
              amount: true,
              currency: true,
              status: true,
              paidAt: true,
              createdAt: true,
              paymentMethod: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
        ])
        subscription = sub
        payments = pay
      }
    }

    // 4. Formater les données pour l'export
    const exportData: UserDataExport = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        format: 'RGPD Article 20 - Portabilité des données',
        version: '1.0',
      },

      account: formatAccount(user),
      profile: employee ? formatProfile(employee) : null,
      schedules: schedules.map(formatSchedule),
      leaveRequests: leaveRequests.map(formatLeaveRequest),
      leaveBalances: leaveBalances.map(formatLeaveBalance),
      availabilities: availabilities.map(formatAvailability),
      personalTasks: personalTasks.map(formatPersonalTask),
      notifications: notifications.map(formatNotification),
      incidentNotesAuthored: incidentNotesAuthored.map(formatIncidentNote),
      ...(user.role === 'DIRECTOR' && {
        subscription: subscription
          ? {
              plan: subscription.plan,
              status: subscription.status,
              quantity: subscription.quantity,
              pricePerEmployee: subscription.pricePerEmployee,
              currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
              currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              canceledAt: subscription.canceledAt?.toISOString() ?? null,
              createdAt: subscription.createdAt.toISOString(),
            }
          : null,
        payments: payments.map((p) => ({
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          paidAt: p.paidAt?.toISOString() ?? null,
          createdAt: p.createdAt.toISOString(),
          paymentMethod: p.paymentMethod ?? null,
        })),
      }),
    }

    // 5. Générer le JSON avec indentation pour lisibilité
    const jsonData = JSON.stringify(exportData, null, 2)

    // 6. Générer le nom de fichier
    const dateStr = new Date().toISOString().split('T')[0]
    const emailSlug = user.email?.split('@')[0] || 'user'
    const filename = `smartplanning-export-${emailSlug}-${dateStr}.json`

    // 7. Log de traçabilité RGPD
    console.warn(
      `[exportUserData] User ${userId} exported their data at ${new Date().toISOString()}`
    )

    // SP-444 : Audit trail export RGPD (fire-and-forget)
    logAuditAction({
      action: 'EXPORT',
      entityType: 'USER',
      entityId: userId,
      userId,
      details: { format: 'json', filename },
    }).catch(console.error)

    return {
      success: true,
      data: {
        filename,
        data: jsonData,
        mimeType: 'application/json',
      },
    }
  } catch (error) {
    console.error('[exportUserData] Error:', error)
    return {
      success: false,
      error: "Une erreur est survenue lors de l'export",
    }
  }
}

// ============================================================================
// FONCTIONS DE FORMATAGE POUR L'EXPORT
// ============================================================================

/**
 * Extrait la partie date (YYYY-MM-DD) d'une Date
 */
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''
}

function formatAccount(user: {
  email: string
  name: string | null
  image: string | null
  role: string
  emailVerified: Date | null
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date | null
}): ExportAccount {
  return {
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified?.toISOString() || null,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
  }
}

function formatProfile(employee: {
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
  jobTitle: string | null
  department: string | null
  hireDate: Date | null
  weeklyHours: number
  skills: string[]
  preferences: unknown
  isActive: boolean
  createdAt: Date
  team: { name: string } | null
}): ExportProfile {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    phone: employee.phone,
    email: employee.email,
    jobTitle: employee.jobTitle,
    department: employee.department,
    hireDate: employee.hireDate ? toDateString(employee.hireDate) : null,
    weeklyHours: employee.weeklyHours,
    skills: employee.skills,
    preferences: employee.preferences as Record<string, unknown> | null,
    team: employee.team?.name || null,
    isActive: employee.isActive,
    createdAt: employee.createdAt.toISOString(),
  }
}

function formatSchedule(schedule: {
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  type: string
  status: string
  title: string | null
  description: string | null
  location: string | null
}): ExportSchedule {
  return {
    date: toDateString(schedule.startDate),
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    type: schedule.type,
    status: schedule.status,
    title: schedule.title,
    description: schedule.description,
    location: schedule.location,
  }
}

function formatLeaveRequest(request: {
  startDate: Date
  endDate: Date
  days: number
  type: string
  status: string
  halfDay: boolean
  halfDayPeriod: string | null
  reason: string | null
  comment: string | null
  reviewedAt: Date | null
  reviewComment: string | null
}): ExportLeaveRequest {
  return {
    startDate: toDateString(request.startDate),
    endDate: toDateString(request.endDate),
    days: request.days,
    type: request.type,
    status: request.status,
    halfDay: request.halfDay,
    halfDayPeriod: request.halfDayPeriod,
    reason: request.reason,
    comment: request.comment,
    reviewedAt: request.reviewedAt?.toISOString() || null,
    reviewComment: request.reviewComment,
  }
}

function formatLeaveBalance(balance: {
  year: number
  paidLeaveTotal: number
  paidLeaveUsed: number
  rttTotal: number
  rttUsed: number
}): ExportLeaveBalance {
  return {
    year: balance.year,
    paidLeave: {
      total: balance.paidLeaveTotal,
      used: balance.paidLeaveUsed,
      remaining: balance.paidLeaveTotal - balance.paidLeaveUsed,
    },
    rtt: {
      total: balance.rttTotal,
      used: balance.rttUsed,
      remaining: balance.rttTotal - balance.rttUsed,
    },
  }
}

function formatAvailability(availability: {
  startDate: Date
  endDate: Date
  startTime: string | null
  endTime: string | null
  type: string
  reason: string | null
  isRecurring: boolean
}): ExportAvailability {
  return {
    startDate: toDateString(availability.startDate),
    endDate: toDateString(availability.endDate),
    startTime: availability.startTime,
    endTime: availability.endTime,
    type: availability.type,
    reason: availability.reason,
    isRecurring: availability.isRecurring,
  }
}

function formatPersonalTask(task: {
  title: string
  description: string | null
  dueDate: Date | null
  completed: boolean
  createdAt: Date
}): ExportPersonalTask {
  return {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ? toDateString(task.dueDate) : null,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
  }
}

function formatNotification(notification: {
  title: string
  message: string
  type: string
  isRead: boolean
  readAt: Date | null
  createdAt: Date
}): ExportNotification {
  return {
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    readAt: notification.readAt?.toISOString() || null,
    createdAt: notification.createdAt.toISOString(),
  }
}

function formatIncidentNote(note: {
  title: string
  content: string
  date: Date
  visibility: string
  createdAt: Date
}): ExportIncidentNote {
  return {
    title: note.title,
    content: note.content,
    date: toDateString(note.date),
    visibility: note.visibility,
    createdAt: note.createdAt.toISOString(),
  }
}
