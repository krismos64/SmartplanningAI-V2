/**
 * Server Actions pour l'authentification
 *
 * @description Actions serveur pour inscription et gestion des comptes :
 * - registerAction : Inscription d'un nouveau client SaaS (Company + User DIRECTOR)
 *
 * @ticket SP-138
 * @see Context7 - Next.js 15 Server Actions with Zod validation
 */

'use server'

import { Prisma } from '@prisma/client'

import { PRICING } from '@/lib/config/pricing'
import { sendNewRegistrationEmail } from '@/lib/email/templates/new-registration'
import { hashPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/services/audit'
import { signupSchema, type SignupFormData } from '@/lib/validations'
import { sendVerificationEmailAction } from '@/lib/actions/verification-actions'

/**
 * Types de retour pour les Server Actions
 *
 * Discriminated union pour typage strict des réponses
 */
export type RegisterActionResult =
  | { success: true; userId: string; companyId: string }
  | { success: false; error: string; field?: string }

/**
 * Génère un slug URL-friendly à partir d'un nom
 *
 * @param name - Nom à convertir en slug
 * @returns Slug en minuscules, sans accents, avec tirets
 *
 * @example
 * generateSlug('Acme Corp') // 'acme-corp'
 * generateSlug('Café de Paris') // 'cafe-de-paris'
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garde uniquement lettres, chiffres, espaces, tirets
    .replace(/\s+/g, '-') // Remplace espaces par tirets
    .replace(/-+/g, '-') // Évite les tirets multiples
    .replace(/^-|-$/g, '') // Supprime tirets en début/fin
}

/**
 * Génère un slug unique pour une Company
 *
 * Si le slug existe déjà, ajoute un suffixe numérique
 *
 * @param baseName - Nom de base pour le slug
 * @returns Slug unique
 */
async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = generateSlug(baseName)

  // Vérifier si le slug existe
  const existing = await prisma.company.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  })

  if (!existing) {
    return baseSlug
  }

  // Chercher le prochain numéro disponible
  let counter = 1
  let uniqueSlug = `${baseSlug}-${counter}`

  while (
    await prisma.company.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true },
    })
  ) {
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }

  return uniqueSlug
}

/**
 * Server Action pour l'inscription d'un nouveau client SaaS
 *
 * Crée une Company et un User DIRECTOR dans une transaction atomique.
 *
 * @param data - Données du formulaire d'inscription (SignupFormData)
 * @returns RegisterActionResult - Succès avec userId/companyId ou erreur
 *
 * @security
 * - Validation Zod côté serveur
 * - Hash bcrypt du mot de passe
 * - Transaction atomique (rollback si erreur)
 * - Gestion des contraintes uniques (email, slug)
 */
export async function registerAction(
  data: SignupFormData
): Promise<RegisterActionResult> {
  try {
    // 1. Valider les données avec Zod (double validation serveur)
    const validationResult = signupSchema.safeParse(data)

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Données invalides',
        field: firstError?.path[0]?.toString(),
      }
    }

    const { name, email, companyName, password, phone } = validationResult.data

    // 2. Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'Un compte existe déjà avec cet email',
        field: 'email',
      }
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await hashPassword(password)

    // 4. Générer un slug unique pour la Company
    const companySlug = await generateUniqueSlug(companyName)

    // 5. Créer Company + User dans une transaction atomique
    const result = await prisma.$transaction(async (tx) => {
      // Créer la Company
      const company = await tx.company.create({
        data: {
          name: companyName.trim(),
          slug: companySlug,
          isActive: true,
          trialEndsAt: new Date(
            Date.now() + PRICING.TRIAL_DAYS * 24 * 60 * 60 * 1000
          ),
        },
      })

      // Créer le User DIRECTOR
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'DIRECTOR',
          companyId: company.id,
          isActive: true,
          isEmailVerified: false, // À implémenter : email de vérification
        },
      })

      // Séparer le nom complet en prénom/nom
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0] || name.trim()
      const lastName = nameParts.slice(1).join(' ') || firstName

      // Créer l'Employee associé au DIRECTOR
      const employee = await tx.employee.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone: phone || null,
          userId: user.id,
          companyId: company.id,
          weeklyHours: 35, // Défaut légal France
          isActive: true,
        },
      })

      // Créer le solde de congés pour l'année en cours
      await tx.leaveBalance.create({
        data: {
          employeeId: employee.id,
          companyId: company.id,
          year: new Date().getFullYear(),
          paidLeaveTotal: 25, // Défaut légal France (2.5 jours/mois)
          paidLeaveUsed: 0,
          rttTotal: 10, // Défaut courant
          rttUsed: 0,
        },
      })

      // Créer la ligne Subscription (plan FREE, statut TRIAL, sans customer Stripe).
      // Le customer Stripe est créé au premier checkout volontaire via
      // createCheckoutSession (qui teste déjà `if (!customerId)` avant de créer).
      // Sans cette ligne, le cron /api/cron/trial-emails (filtre subscription.status
      // = 'TRIAL') est aveugle à cette company et n'envoie aucun rappel de fin d'essai.
      await tx.subscription.create({
        data: {
          company: { connect: { id: company.id } },
          stripeCustomerId: null,
          plan: 'FREE',
          status: 'TRIAL',
        },
      })

      return { user, company, employee }
    })

    // 6. Audit trail : log CREATE pour Company et User (fire-and-forget, SP-443)
    logAuditAction({
      action: 'CREATE',
      entityType: 'COMPANY',
      entityId: result.company.id,
      userId: result.user.id,
      companyId: result.company.id,
      details: { companyName: companyName.trim(), slug: companySlug },
    }).catch(console.error)

    logAuditAction({
      action: 'CREATE',
      entityType: 'USER',
      entityId: result.user.id,
      userId: result.user.id,
      companyId: result.company.id,
      details: { email: email.toLowerCase(), role: 'DIRECTOR' },
    }).catch(console.error)

    // 7. Notification SYSTEM_ADMIN : nouvelle inscription (fire-and-forget, SP-476)
    import('@/lib/services/admin-notification.service')
      .then(({ createAdminNotification }) =>
        createAdminNotification({
          title: 'Nouvelle entreprise inscrite',
          message: `${companyName.trim()} vient de s'inscrire (${email.toLowerCase()})`,
          type: 'INFO',
          actionUrl: '/app/admin/logs',
        })
      )
      .catch(console.error)

    // 8. Envoyer l'email de vérification (SP-299)
    // Seul email envoyé à l'inscription : tant que l'adresse n'est pas validée,
    // la connexion est bloquée (SP-526). L'email de bienvenue part une fois le
    // lien cliqué (verifyEmailAction), sinon il arrivait avant la vérification
    // et accueillait l'utilisateur sur un compte inutilisable.
    // Awaité pour garantir l'ordre d'arrivée dans la boîte de réception.
    try {
      await sendVerificationEmailAction({ email: email.toLowerCase() })
    } catch (err) {
      // L'échec de l'envoi ne doit PAS bloquer l'inscription : l'utilisateur
      // peut demander un renvoi depuis l'écran de connexion.
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error(
          '[registerAction] Failed to send verification email:',
          err
        )
      }
    }

    // 9. Notifier l'admin par email de la nouvelle inscription (fire-and-forget, SP-480)
    sendNewRegistrationEmail({
      companyName: companyName.trim(),
      directorName: name.trim(),
      directorEmail: email.toLowerCase(),
      phone: phone || null,
    }).catch((err) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error(
          '[registerAction] Failed to send admin notification:',
          err
        )
      }
    })

    return {
      success: true,
      userId: result.user.id,
      companyId: result.company.id,
    }
  } catch (error) {
    // Gestion des erreurs Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 : Violation de contrainte unique
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined
        if (target?.includes('email')) {
          return {
            success: false,
            error: 'Un compte existe déjà avec cet email',
            field: 'email',
          }
        }
        if (target?.includes('slug')) {
          return {
            success: false,
            error: "Impossible de créer l'organisation. Veuillez réessayer.",
          }
        }
      }
    }

    // Log l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[registerAction] Error:', error)
    }

    // Erreur générique pour l'utilisateur
    return {
      success: false,
      error:
        "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
    }
  }
}
