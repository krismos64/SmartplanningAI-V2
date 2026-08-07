/**
 * Service de changement d'adresse email d'un collaborateur
 *
 * @description Un responsable (DIRECTOR, MANAGER, SYSTEM_ADMIN) peut corriger
 * l'adresse email d'un collaborateur depuis la fiche employé. Deux cas :
 *
 * 1. Compte jamais activé : l'adresse est remplacée immédiatement, l'ancien
 *    token d'activation est révoqué et une nouvelle invitation part vers la
 *    nouvelle adresse. Rien n'est perdu, personne n'est verrouillé dehors.
 *
 * 2. Compte déjà activé : l'adresse de connexion reste inchangée tant que le
 *    collaborateur n'a pas cliqué le lien envoyé à la nouvelle adresse. Sans
 *    cette double confirmation, un responsable pourrait rediriger un compte
 *    vers une adresse qu'il contrôle et prendre la main dessus.
 *
 * Ce fichier n'a PAS de directive 'use server' : il est importé depuis des
 * Server Actions et doit rester une bibliothèque de fonctions ordinaires.
 */

import { prisma } from '@/lib/prisma'
import { sendInvitationEmail } from '@/lib/email/templates/invitation'
import {
  sendEmailChangeAlertEmail,
  sendEmailChangeConfirmEmail,
} from '@/lib/email/templates/email-change'

/** Préfixe d'identifier des tokens de changement d'adresse */
export const EMAIL_CHANGE_IDENTIFIER_PREFIX = 'email-change:'

/** Préfixe d'identifier des tokens d'activation de compte */
const ACTIVATION_IDENTIFIER_PREFIX = 'activate:'

/** Durée de validité des liens (48 heures, aligné sur l'invitation) */
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000

/** Libellés de rôle pour l'email d'invitation */
const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: 'Employé',
  MANAGER: 'Manager',
  DIRECTOR: 'Directeur',
  SYSTEM_ADMIN: 'Admin',
}

export type EmailChangeOutcome =
  /** Aucun compte User rattaché : seul l'email professionnel a changé */
  | { kind: 'NO_ACCOUNT' }
  /** Compte non activé : adresse remplacée, invitation renvoyée */
  | { kind: 'REINVITED'; newEmail: string }
  /** Compte activé : en attente du clic sur le lien de confirmation */
  | { kind: 'CONFIRMATION_SENT'; newEmail: string }

export type EmailChangeResult =
  | { success: true; outcome: EmailChangeOutcome }
  | { success: false; error: string }

/**
 * Message prêt à afficher au responsable qui vient de modifier l'adresse.
 * Retourne null quand il n'y a rien à signaler.
 */
export function describeEmailChangeOutcome(
  outcome: EmailChangeOutcome
): string | null {
  if (outcome.kind === 'REINVITED') {
    return `Une nouvelle invitation a été envoyée à ${outcome.newEmail}. L'ancienne adresse ne permet plus d'activer le compte.`
  }

  if (outcome.kind === 'CONFIRMATION_SENT') {
    return `Un email de confirmation a été envoyé à ${outcome.newEmail}. Le collaborateur devra cliquer sur le lien pour se connecter avec cette adresse ; d'ici là son ancienne adresse reste active.`
  }

  return null
}

/**
 * Construit l'identifier d'un token de changement d'adresse.
 * Le userId et l'adresse cible y sont encodés : la confirmation n'a alors
 * besoin que du token pour retrouver quoi appliquer, sans table dédiée.
 */
function buildEmailChangeIdentifier(userId: string, newEmail: string): string {
  return `${EMAIL_CHANGE_IDENTIFIER_PREFIX}${userId}:${newEmail}`
}

/**
 * Décode un identifier de token de changement d'adresse.
 * L'email pouvant théoriquement contenir « : », on ne découpe qu'une fois
 * après le userId.
 */
export function parseEmailChangeIdentifier(
  identifier: string
): { userId: string; newEmail: string } | null {
  if (!identifier.startsWith(EMAIL_CHANGE_IDENTIFIER_PREFIX)) return null

  const payload = identifier.slice(EMAIL_CHANGE_IDENTIFIER_PREFIX.length)
  const separatorIndex = payload.indexOf(':')
  if (separatorIndex <= 0) return null

  const userId = payload.slice(0, separatorIndex)
  const newEmail = payload.slice(separatorIndex + 1)
  if (!userId || !newEmail) return null

  return { userId, newEmail }
}

/**
 * Déclenche le changement d'adresse email du compte d'un collaborateur.
 *
 * @param employeeId - ID de l'Employee dont l'email a été modifié
 * @param newEmail - Nouvelle adresse, déjà normalisée en minuscules
 * @returns Le déroulé effectif, à restituer au responsable qui a fait la modification
 */
export async function requestEmployeeEmailChange(
  employeeId: string,
  newEmail: string
): Promise<EmailChangeResult> {
  const normalizedEmail = newEmail.toLowerCase().trim()

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      firstName: true,
      company: { select: { name: true } },
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
        },
      },
    },
  })

  if (!employee) {
    return { success: false, error: 'Employé non trouvé' }
  }

  // Employé sans compte de connexion : rien à propager
  if (!employee.user) {
    return { success: true, outcome: { kind: 'NO_ACCOUNT' } }
  }

  const { user } = employee
  const companyName = employee.company?.name || 'SmartPlanning'

  // Adresse inchangée : ne rien envoyer
  if (user.email.toLowerCase() === normalizedEmail) {
    return { success: true, outcome: { kind: 'NO_ACCOUNT' } }
  }

  // L'adresse doit rester unique parmi tous les comptes
  const emailTaken = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (emailTaken && emailTaken.id !== user.id) {
    return {
      success: false,
      error: 'Cet email est déjà associé à un compte',
    }
  }

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + TOKEN_TTL_MS)

  // ---------------------------------------------------------------------------
  // Cas 1 : compte jamais activé, on remplace l'adresse et on réinvite
  // ---------------------------------------------------------------------------
  if (!user.isEmailVerified) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { email: normalizedEmail },
      }),
      // Révoquer les anciens tokens d'activation : l'ancienne adresse (souvent
      // une faute de frappe, potentiellement celle d'un tiers) ne doit plus
      // pouvoir activer le compte.
      prisma.verificationToken.deleteMany({
        where: { identifier: `${ACTIVATION_IDENTIFIER_PREFIX}${user.id}` },
      }),
      prisma.verificationToken.create({
        data: {
          identifier: `${ACTIVATION_IDENTIFIER_PREFIX}${user.id}`,
          token,
          expires,
        },
      }),
    ])

    sendInvitationEmail({
      firstName: employee.firstName,
      email: normalizedEmail,
      token,
      companyName,
      roleName: ROLE_LABELS[user.role] || 'Employé',
    }).catch((err) => {
      console.error(
        '[requestEmployeeEmailChange] Invitation email failed:',
        err
      )
    })

    return {
      success: true,
      outcome: { kind: 'REINVITED', newEmail: normalizedEmail },
    }
  }

  // ---------------------------------------------------------------------------
  // Cas 2 : compte activé, double confirmation par le collaborateur
  // ---------------------------------------------------------------------------
  const previousEmail = user.email

  await prisma.$transaction([
    // Une seule demande de changement en cours par utilisateur
    prisma.verificationToken.deleteMany({
      where: {
        identifier: {
          startsWith: `${EMAIL_CHANGE_IDENTIFIER_PREFIX}${user.id}:`,
        },
      },
    }),
    prisma.verificationToken.create({
      data: {
        identifier: buildEmailChangeIdentifier(user.id, normalizedEmail),
        token,
        expires,
      },
    }),
  ])

  sendEmailChangeConfirmEmail({
    firstName: employee.firstName,
    newEmail: normalizedEmail,
    oldEmail: previousEmail,
    companyName,
    token,
  }).catch((err) => {
    console.error('[requestEmployeeEmailChange] Confirm email failed:', err)
  })

  // Alerte à l'ancienne adresse : le collaborateur doit pouvoir réagir si la
  // demande ne vient pas de lui.
  sendEmailChangeAlertEmail({
    firstName: employee.firstName,
    oldEmail: previousEmail,
    newEmail: normalizedEmail,
    companyName,
  }).catch((err) => {
    console.error('[requestEmployeeEmailChange] Alert email failed:', err)
  })

  return {
    success: true,
    outcome: { kind: 'CONFIRMATION_SENT', newEmail: normalizedEmail },
  }
}

export type ConfirmEmailChangeResult =
  | { success: true; newEmail: string }
  | { success: false; error: string }

/**
 * Applique un changement d'adresse email après clic du collaborateur sur le
 * lien reçu à la nouvelle adresse.
 *
 * @param token - Token issu du lien de confirmation
 */
export async function confirmEmailChange(
  token: string
): Promise<ConfirmEmailChangeResult> {
  if (!token) {
    return { success: false, error: 'Ce lien de confirmation est invalide.' }
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return {
      success: false,
      error: 'Ce lien de confirmation est invalide ou a déjà été utilisé.',
    }
  }

  const parsed = parseEmailChangeIdentifier(verificationToken.identifier)
  if (!parsed) {
    return {
      success: false,
      error: "Ce lien n'est pas un lien de changement d'adresse.",
    }
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return {
      success: false,
      error:
        'Ce lien de confirmation a expiré. Demandez à votre responsable de renouveler la modification.',
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true, email: true },
  })

  if (!user) {
    await prisma.verificationToken.delete({ where: { token } })
    return { success: false, error: 'Utilisateur introuvable.' }
  }

  // Entre l'envoi et le clic, l'adresse a pu être prise par un autre compte
  const emailTaken = await prisma.user.findUnique({
    where: { email: parsed.newEmail },
    select: { id: true },
  })

  if (emailTaken && emailTaken.id !== user.id) {
    await prisma.verificationToken.delete({ where: { token } })
    return {
      success: false,
      error: 'Cette adresse email est déjà utilisée par un autre compte.',
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        email: parsed.newEmail,
        // L'adresse vient d'être prouvée par le clic sur le lien
        emailVerified: new Date(),
        isEmailVerified: true,
      },
    }),
    // Garder l'email professionnel de la fiche RH aligné sur l'adresse de connexion
    prisma.employee.updateMany({
      where: { userId: user.id },
      data: { email: parsed.newEmail },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ])

  return { success: true, newEmail: parsed.newEmail }
}
