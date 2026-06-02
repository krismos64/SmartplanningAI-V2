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
import { verifyPassword } from '@/lib/password'
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

/**
 * Résultat du pré-check de vérification email avant connexion (SP-526)
 *
 * - VERIFIED : credentials valides ET email vérifié → on peut appeler signIn()
 * - NOT_VERIFIED : credentials valides MAIS email non vérifié → UX dédiée
 * - INVALID_CREDENTIALS : user inconnu OU mauvais mot de passe (indifférencié
 *   pour ne pas permettre l'énumération de comptes)
 */
export type CheckEmailVerificationStatusResult =
  | { status: 'VERIFIED' }
  | { status: 'NOT_VERIFIED' }
  | { status: 'INVALID_CREDENTIALS' }

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

    // 6. Mettre à jour emailVerified + isEmailVerified et supprimer le token (transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), isEmailVerified: true },
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

// =============================================================================
// CHECK EMAIL VERIFICATION STATUS (SP-526)
// =============================================================================

/**
 * Pré-check de l'état de vérification email avant d'appeler signIn()
 *
 * @description
 * NextAuth v5 normalise toute Error levée dans authorize() en
 * 'CredentialsSignin', ce qui empêche le LoginForm de distinguer un email
 * non vérifié d'un mauvais mot de passe. Cette action sert UNIQUEMENT à
 * orienter l'UX : elle indique si l'utilisateur doit voir le message
 * « email non vérifié » + le bouton « Renvoyer l'email ».
 *
 * Ce n'est PAS la barrière de sécurité : le vrai verrou reste
 * `throw new Error('EmailNotVerified')` dans authorize() (src/lib/auth.ts).
 * Même si ce pré-check était contourné côté client, authorize() refuserait
 * la création de session. Défense en profondeur.
 *
 * @param data - email + password à vérifier
 * @returns Statut VERIFIED / NOT_VERIFIED / INVALID_CREDENTIALS
 *
 * @security
 * - Exige un mot de passe valide avant de révéler NOT_VERIFIED, sinon
 *   un tiers pourrait sonder l'état de vérification d'un email arbitraire
 *   (fuite d'information).
 * - user inexistant et mauvais mot de passe renvoient le même statut
 *   INVALID_CREDENTIALS → pas d'énumération de comptes.
 * - Lecture pure : aucune écriture, aucun envoi d'email, aucun log.
 */
export async function checkEmailVerificationStatus(data: {
  email: string
  password: string
}): Promise<CheckEmailVerificationStatusResult> {
  try {
    const normalizedEmail = data.email.toLowerCase().trim()

    // 1. Chercher l'utilisateur (mêmes primitives que authorize())
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { password: true, emailVerified: true },
    })

    // 2. User inexistant → indifférencié d'un mauvais mot de passe
    if (!user) {
      return { status: 'INVALID_CREDENTIALS' }
    }

    // 3. Vérifier le mot de passe AVANT de révéler quoi que ce soit
    const isPasswordValid = await verifyPassword(data.password, user.password)
    if (!isPasswordValid) {
      return { status: 'INVALID_CREDENTIALS' }
    }

    // 4. Credentials valides : on peut révéler l'état de vérification
    if (!user.emailVerified) {
      return { status: 'NOT_VERIFIED' }
    }

    return { status: 'VERIFIED' }
  } catch (error) {
    // En cas d'erreur inattendue, on ne bloque pas l'UX : on laisse
    // signIn() suivre son cours (authorize() reste la barrière de sécurité).
    if (process.env.NODE_ENV === 'development') {
      console.error('[checkEmailVerificationStatus] Error:', error)
    }
    return { status: 'INVALID_CREDENTIALS' }
  }
}
