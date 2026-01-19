/**
 * Server Actions pour la vérification d'adresse email
 *
 * @description Actions serveur pour :
 * - sendVerificationEmailAction : Envoie/renvoie un email de vérification
 * - verifyEmailAction : Vérifie l'email avec un token valide
 *
 * @ticket SP-299
 * @security
 * - Tokens sécurisés avec crypto.randomUUID
 * - Expiration des tokens après 24 heures
 * - Un seul token actif par utilisateur
 * - Suppression du token après utilisation
 */

'use server'

import crypto from 'crypto'

import { sendVerificationEmail } from '@/lib/email/templates/verification-email'
import { prisma } from '@/lib/prisma'

// =============================================================================
// TYPES
// =============================================================================

export type SendVerificationEmailActionResult =
  | { success: true }
  | { success: false; error: string }

export type VerifyEmailActionResult =
  | { success: true }
  | { success: false; error: string }

// =============================================================================
// CONSTANTES
// =============================================================================

/** Durée de validité du token en millisecondes (24 heures) */
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

/** Durée de validité en texte pour l'email */
const TOKEN_EXPIRY_TEXT = '24 heures'

/** Préfixe pour distinguer les tokens de vérification des tokens de reset */
const VERIFICATION_TOKEN_PREFIX = 'verify_'

// =============================================================================
// SEND VERIFICATION EMAIL ACTION
// =============================================================================

/**
 * Server Action pour envoyer un email de vérification
 *
 * @param data - Objet contenant l'email (et optionnellement le userId pour un utilisateur connecté)
 * @returns SendVerificationEmailActionResult - Succès ou erreur
 *
 * @security
 * - Vérifie que l'utilisateur existe
 * - Ne révèle pas si l'email est déjà vérifié (protection énumération)
 * - Génère un token sécurisé avec crypto.randomUUID
 * - Supprime les anciens tokens avant d'en créer un nouveau
 */
export async function sendVerificationEmailAction(data: {
  email: string
}): Promise<SendVerificationEmailActionResult> {
  try {
    const { email } = data
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, emailVerified: true },
    })

    // Si l'utilisateur n'existe pas, on retourne succès quand même
    // pour ne pas révéler l'existence du compte
    if (!user) {
      return { success: true }
    }

    // Si l'email est déjà vérifié, on retourne succès silencieusement
    if (user.emailVerified) {
      return { success: true }
    }

    // 2. Supprimer les anciens tokens de vérification pour cet email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        token: { startsWith: VERIFICATION_TOKEN_PREFIX },
      },
    })

    // 3. Générer un nouveau token sécurisé
    const token = `${VERIFICATION_TOKEN_PREFIX}${crypto.randomUUID()}`
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MS)

    // 4. Sauvegarder le token en base
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    })

    // 5. Envoyer l'email de vérification
    const firstName = user.name?.split(' ')[0] || undefined

    try {
      await sendVerificationEmail({
        firstName,
        email: normalizedEmail,
        token,
        expiresIn: TOKEN_EXPIRY_TEXT,
      })
    } catch (emailError) {
      // Log l'erreur mais ne pas bloquer le flow
      if (process.env.NODE_ENV === 'development') {
        console.error(
          '[sendVerificationEmailAction] Email send failed:',
          emailError
        )
      }
    }

    return { success: true }
  } catch (error) {
    // Log l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendVerificationEmailAction] Error:', error)
    }

    // Retourne succès même en cas d'erreur pour ne pas leak d'info
    return { success: true }
  }
}

// =============================================================================
// VERIFY EMAIL ACTION
// =============================================================================

/**
 * Server Action pour vérifier l'adresse email avec un token
 *
 * @param data - Token de vérification
 * @returns VerifyEmailActionResult - Succès ou erreur
 *
 * @security
 * - Vérifie la validité et l'expiration du token
 * - Met à jour emailVerified avec la date courante
 * - Supprime le token après utilisation (one-time use)
 */
export async function verifyEmailAction(data: {
  token: string
}): Promise<VerifyEmailActionResult> {
  try {
    const { token } = data

    // 1. Valider le format du token
    if (!token || !token.startsWith(VERIFICATION_TOKEN_PREFIX)) {
      return {
        success: false,
        error: 'Ce lien de vérification est invalide.',
      }
    }

    // 2. Chercher le token en base
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return {
        success: false,
        error: 'Ce lien de vérification est invalide ou a déjà été utilisé.',
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
          'Ce lien de vérification a expiré. Veuillez en demander un nouveau.',
      }
    }

    // 4. Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: { id: true, emailVerified: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'Utilisateur introuvable.',
      }
    }

    // 5. Si déjà vérifié, supprimer le token et retourner succès
    if (user.emailVerified) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      return { success: true }
    }

    // 6. Mettre à jour emailVerified et supprimer le token (transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ])

    return { success: true }
  } catch (error) {
    // Log l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[verifyEmailAction] Error:', error)
    }

    return {
      success: false,
      error: 'Une erreur est survenue. Veuillez réessayer.',
    }
  }
}

// =============================================================================
// RESEND VERIFICATION EMAIL ACTION
// =============================================================================

/**
 * Server Action pour renvoyer l'email de vérification
 * Alias de sendVerificationEmailAction pour plus de clarté sémantique
 *
 * @param data - Objet contenant l'email
 * @returns SendVerificationEmailActionResult - Succès ou erreur
 */
export async function resendVerificationEmailAction(data: {
  email: string
}): Promise<SendVerificationEmailActionResult> {
  return sendVerificationEmailAction(data)
}
