/**
 * Service d'envoi d'email de vérification — logique cœur partagée
 *
 * Extrait de verification-actions.ts (review PR #50) pour séparer deux besoins :
 * - Le flux public (/login, /register) doit MASQUER les échecs et l'existence
 *   du compte (anti-énumération) → sendVerificationEmailAction wrappe ce
 *   service et retourne toujours success.
 * - Le flux admin (SP-543) doit dire la VÉRITÉ : un échec SMTP silencieux
 *   laisse un utilisateur bloqué avec un toast vert mensonger (leçon de
 *   l'incident Sprint 16) → resendVerificationEmailAdmin lit l'outcome réel.
 *
 * Fichier volontairement SANS 'use server' : exporter la version honnête
 * comme Server Action la rendrait appelable côté client et casserait
 * l'anti-énumération du flux public.
 *
 * @ticket SP-299, SP-543
 */

import crypto from 'crypto'

import { sendVerificationEmail } from '@/lib/email/templates/verification-email'
import { logAuthEmail, AuthEmailType } from '@/lib/email/auth/log-auth-email'
import { prisma } from '@/lib/prisma'

// =============================================================================
// CONSTANTES
// =============================================================================

/** Durée de validité du token en millisecondes (24 heures) */
export const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000

/** Durée de validité en texte pour l'email */
export const TOKEN_EXPIRY_TEXT = '24 heures'

/** Préfixe pour distinguer les tokens de vérification des tokens de reset */
export const VERIFICATION_TOKEN_PREFIX = 'verify_'

// =============================================================================
// TYPES
// =============================================================================

/** Résultat réel de la tentative d'envoi — réservé aux appelants de confiance */
export type VerificationEmailOutcome =
  | { status: 'SENT' }
  | { status: 'USER_NOT_FOUND' }
  | { status: 'ALREADY_VERIFIED' }
  | { status: 'SEND_FAILED' }

// =============================================================================
// SERVICE
// =============================================================================

/**
 * Invalide l'ancien token, en crée un nouveau (24h) et envoie l'email de
 * vérification. Trace l'envoi dans EmailLog.
 *
 * Retourne l'outcome RÉEL — l'appelant décide de le masquer ou non.
 */
export async function sendVerificationEmailCore(
  email: string
): Promise<VerificationEmailOutcome> {
  const normalizedEmail = email.toLowerCase().trim()

  // 1. Chercher l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      companyId: true,
    },
  })

  if (!user) {
    return { status: 'USER_NOT_FOUND' }
  }

  if (user.emailVerified) {
    return { status: 'ALREADY_VERIFIED' }
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
    const verificationResult = await sendVerificationEmail({
      firstName,
      email: normalizedEmail,
      token,
      expiresIn: TOKEN_EXPIRY_TEXT,
    })

    // Tracer l'envoi dans EmailLog (non bloquant).
    // companyId requis (colonne NOT NULL) : on ne logge que si l'utilisateur
    // est rattaché à une entreprise (toujours le cas pour un DIRECTOR inscrit).
    if (user.companyId) {
      await logAuthEmail({
        companyId: user.companyId,
        emailType: AuthEmailType.EMAIL_VERIFICATION,
        recipientEmail: normalizedEmail,
        success: verificationResult.success,
        outcome: verificationResult.outcome,
        messageId: verificationResult.messageId,
        error: verificationResult.error,
        rejected: verificationResult.rejected,
        smtpResponse: verificationResult.smtpResponse,
      })
    }

    return verificationResult.success
      ? { status: 'SENT' }
      : { status: 'SEND_FAILED' }
  } catch (emailError) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '[sendVerificationEmailCore] Email send failed:',
        emailError
      )
    }
    return { status: 'SEND_FAILED' }
  }
}
