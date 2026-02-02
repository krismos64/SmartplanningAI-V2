'use server'

/**
 * Server Actions pour le module Profil Utilisateur
 *
 * @description Actions serveur pour récupérer et gérer le profil utilisateur.
 * Combine les données User (compte) et Employee (profil RH) si disponible.
 *
 * @ticket SP-270
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
