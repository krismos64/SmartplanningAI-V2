'use server'

/**
 * Server Actions pour le module Profil Utilisateur
 *
 * @description Actions serveur pour récupérer et gérer le profil utilisateur.
 * Combine les données User (compte) et Employee (profil RH) si disponible.
 *
 * @ticket SP-270, SP-271
 */

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  editProfileSchema,
  type EditProfileInput,
} from '@/lib/validations/profile'
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
