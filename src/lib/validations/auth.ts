/**
 * Schémas de validation pour l'authentification
 *
 * @description Schémas Zod spécifiques aux flows d'authentification
 * - signupSchema : Nouveau client SaaS (crée Company + User DIRECTOR)
 * - loginSchema : Réexporté depuis user.ts pour centralisation
 * - forgotPasswordSchema : Demande de réinitialisation de mot de passe
 * - resetPasswordSchema : Réinitialisation du mot de passe avec token
 *
 * @ticket SP-136, SP-298
 * @see Context7 - Zod validation patterns
 */

import { z } from 'zod'
import { emailSchema, passwordSchema } from './common'

// Réexport du loginSchema pour centralisation des imports auth
export { loginSchema, type LoginFormData } from './user'

/**
 * Schéma de validation pour l'inscription d'un nouveau client SaaS
 *
 * Cas d'usage : Premier utilisateur d'une organisation
 * - Crée une nouvelle Company
 * - Crée un User avec rôle DIRECTOR
 *
 * Différent de registerSchema (user.ts) qui sera utilisé pour
 * les employés invités rejoignant une Company existante
 */
export const signupSchema = z
  .object({
    /**
     * Nom complet de l'utilisateur
     * Sera splitté en firstName/lastName lors du traitement
     */
    name: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
      )
      .trim(),

    /**
     * Email professionnel
     * Sera utilisé comme identifiant de connexion
     */
    email: emailSchema,

    /**
     * Nom de l'organisation/entreprise
     * Sera utilisé pour créer la Company
     */
    companyName: z
      .string()
      .min(2, "Le nom de l'organisation doit contenir au moins 2 caractères")
      .max(100, "Le nom de l'organisation ne peut pas dépasser 100 caractères")
      .trim(),

    /**
     * Mot de passe sécurisé
     * Doit respecter les règles OWASP (8+ chars, majuscule, minuscule, chiffre, spécial)
     */
    password: passwordSchema,

    /**
     * Confirmation du mot de passe
     * Doit correspondre exactement au password
     */
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),

    /**
     * Acceptation des CGU
     * Obligatoire pour créer un compte
     */
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions générales d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

/**
 * Type inféré du schéma signup
 * Utilisé pour typer les formulaires et Server Actions
 */
export type SignupFormData = z.infer<typeof signupSchema>

// =============================================================================
// FORGOT PASSWORD (SP-298)
// =============================================================================

/**
 * Schéma de validation pour la demande de réinitialisation de mot de passe
 *
 * Cas d'usage : Utilisateur ayant oublié son mot de passe
 * - Saisit uniquement son email
 * - Reçoit un lien de réinitialisation par email
 */
export const forgotPasswordSchema = z.object({
  /**
   * Email du compte à réinitialiser
   */
  email: emailSchema,
})

/**
 * Type inféré du schéma forgot password
 */
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// =============================================================================
// RESET PASSWORD (SP-298)
// =============================================================================

/**
 * Schéma de validation pour la réinitialisation du mot de passe
 *
 * Cas d'usage : Utilisateur cliquant sur le lien de réinitialisation
 * - Saisit un nouveau mot de passe
 * - Confirme le nouveau mot de passe
 */
export const resetPasswordSchema = z
  .object({
    /**
     * Token de réinitialisation (reçu par email)
     */
    token: z.string().min(1, 'Token de réinitialisation manquant'),

    /**
     * Nouveau mot de passe sécurisé
     */
    password: passwordSchema,

    /**
     * Confirmation du nouveau mot de passe
     */
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

/**
 * Type inféré du schéma reset password
 */
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// =============================================================================
// MESSAGES D'ERREUR
// =============================================================================

/**
 * Messages d'erreur d'authentification
 *
 * Mapping des codes d'erreur NextAuth vers des messages utilisateur en français
 * Utilisé dans les formulaires pour afficher des erreurs compréhensibles
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Erreurs NextAuth standard
  CredentialsSignin: 'Email ou mot de passe incorrect',
  SessionRequired: 'Vous devez être connecté pour accéder à cette page',
  AccessDenied: "Vous n'avez pas les droits pour accéder à cette ressource",
  Verification: 'Le lien de vérification a expiré ou est invalide',

  // Erreurs custom SmartPlanning (définies dans auth.ts authorize())
  AccountDisabled:
    'Votre compte a été désactivé. Contactez votre administrateur.',
  CompanyInactive: 'Votre organisation a été désactivée. Contactez le support.',

  // Erreurs serveur
  Configuration: 'Erreur de configuration du serveur',
  Default: 'Une erreur est survenue. Veuillez réessayer.',
}

/**
 * Message par défaut si le code d'erreur n'est pas reconnu
 */
const DEFAULT_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.'

/**
 * Récupère le message d'erreur français correspondant à un code d'erreur
 *
 * @param errorCode - Code d'erreur NextAuth ou custom
 * @returns Message d'erreur en français
 */
export function getAuthErrorMessage(
  errorCode: string | null | undefined
): string {
  if (!errorCode) return DEFAULT_ERROR_MESSAGE
  return AUTH_ERROR_MESSAGES[errorCode] ?? DEFAULT_ERROR_MESSAGE
}
