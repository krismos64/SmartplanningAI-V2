/**
 * Server Actions pour la réinitialisation de mot de passe
 *
 * @description Actions serveur pour :
 * - forgotPasswordAction : Envoie un email de réinitialisation
 * - resetPasswordAction : Réinitialise le mot de passe avec un token valide
 *
 * @ticket SP-298
 * @security
 * - Tokens sécurisés avec crypto.randomUUID
 * - Expiration des tokens après 1 heure
 * - Hash bcrypt pour les mots de passe
 * - Pas de leak d'information sur l'existence des comptes
 */

'use server'

import crypto from 'crypto'

import { sendResetPasswordEmail } from '@/lib/email/templates/reset-password'
import { hashPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations'

// =============================================================================
// TYPES
// =============================================================================

export type ForgotPasswordActionResult =
  | { success: true }
  | { success: false; error: string; field?: string }

export type ResetPasswordActionResult =
  | { success: true }
  | { success: false; error: string; field?: string }

// =============================================================================
// CONSTANTES
// =============================================================================

/** Durée de validité du token en millisecondes (1 heure) */
const TOKEN_EXPIRY_MS = 60 * 60 * 1000

/** Durée de validité en texte pour l'email */
const TOKEN_EXPIRY_TEXT = '1 heure'

// =============================================================================
// FORGOT PASSWORD ACTION
// =============================================================================

/**
 * Server Action pour demander un email de réinitialisation
 *
 * @param data - Objet contenant l'email
 * @returns ForgotPasswordActionResult - Toujours succès pour ne pas leak l'existence du compte
 *
 * @security
 * - Ne révèle jamais si l'email existe ou non (protection contre l'énumération)
 * - Génère un token sécurisé avec crypto.randomUUID
 * - Supprime les anciens tokens avant d'en créer un nouveau
 */
export async function forgotPasswordAction(data: {
  email: string
}): Promise<ForgotPasswordActionResult> {
  try {
    // 1. Valider l'email
    const validationResult = forgotPasswordSchema.safeParse(data)

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Email invalide',
        field: 'email',
      }
    }

    const { email } = validationResult.data
    const normalizedEmail = email.toLowerCase()

    // 2. Chercher l'utilisateur (silencieusement)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    })

    // Si l'utilisateur n'existe pas, on retourne succès quand même
    // pour ne pas révéler l'existence du compte (protection énumération)
    if (!user) {
      return { success: true }
    }

    // 3. Supprimer les anciens tokens pour cet email
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    })

    // 4. Générer un nouveau token sécurisé
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MS)

    // 5. Sauvegarder le token en base
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    })

    // 6. Envoyer l'email de réinitialisation
    const firstName = user.name?.split(' ')[0] || undefined

    try {
      await sendResetPasswordEmail({
        firstName,
        email: normalizedEmail,
        token,
        expiresIn: TOKEN_EXPIRY_TEXT,
      })
    } catch (emailError) {
      // Log l'erreur mais ne pas bloquer le flow
      if (process.env.NODE_ENV === 'development') {
        console.error('[forgotPasswordAction] Email send failed:', emailError)
      }
    }

    return { success: true }
  } catch (error) {
    // Log l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[forgotPasswordAction] Error:', error)
    }

    // Retourne succès même en cas d'erreur pour ne pas leak d'info
    return { success: true }
  }
}

// =============================================================================
// RESET PASSWORD ACTION
// =============================================================================

/**
 * Server Action pour réinitialiser le mot de passe
 *
 * @param data - Token et nouveau mot de passe
 * @returns ResetPasswordActionResult - Succès ou erreur
 *
 * @security
 * - Vérifie la validité et l'expiration du token
 * - Hash le nouveau mot de passe avec bcrypt
 * - Supprime le token après utilisation (one-time use)
 */
export async function resetPasswordAction(data: {
  token: string
  password: string
  confirmPassword: string
}): Promise<ResetPasswordActionResult> {
  try {
    // 1. Valider les données
    const validationResult = resetPasswordSchema.safeParse(data)

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Données invalides',
        field: firstError?.path[0]?.toString(),
      }
    }

    const { token, password } = validationResult.data

    // 2. Chercher le token en base
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return {
        success: false,
        error:
          'Ce lien de réinitialisation est invalide ou a déjà été utilisé.',
      }
    }

    // 3. Vérifier l'expiration
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token },
      })

      return {
        success: false,
        error:
          'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
      }
    }

    // 4. Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: { id: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'Utilisateur introuvable.',
      }
    }

    // 5. Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(password)

    // 6. Mettre à jour le mot de passe et supprimer le token (transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ])

    return { success: true }
  } catch (error) {
    // Log l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[resetPasswordAction] Error:', error)
    }

    return {
      success: false,
      error: 'Une erreur est survenue. Veuillez réessayer.',
    }
  }
}
