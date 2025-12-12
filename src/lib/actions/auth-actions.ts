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

import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { signupSchema, type SignupFormData } from '@/lib/validations'

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

    const { name, email, companyName, password } = validationResult.data

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
          // Plan FREE par défaut avec période d'essai
          subscriptionPlan: 'FREE',
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
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

      return { user, company }
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
