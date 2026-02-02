'use server'

/**
 * Server Actions pour le module Profil Utilisateur
 *
 * @description Actions serveur pour récupérer et gérer le profil utilisateur.
 * Combine les données User (compte) et Employee (profil RH) si disponible.
 *
 * @ticket SP-270, SP-271, SP-273, SP-277
 */

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
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
import type { CrudActionResult } from '@/types'

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

    const { firstName, lastName, phone } = validation.data

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
