import { z } from 'zod'
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
  shortTextSchema,
} from './common'

/**
 * Schémas de validation pour les formulaires User
 * Login, Register, Update Profile, Change Password
 */

// ============================================
// LOGIN FORM
// ============================================
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean(),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ============================================
// REGISTER FORM
// ============================================
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
    firstName: nameSchema,
    lastName: nameSchema,
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions générales d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// ============================================
// UPDATE PROFILE FORM
// ============================================
export const updateProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  bio: shortTextSchema,
  avatar: z.string().url("URL d'avatar invalide").optional().or(z.literal('')),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

// ============================================
// CHANGE PASSWORD FORM
// ============================================
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: passwordSchema,
    confirmNewPassword: z
      .string()
      .min(1, 'Veuillez confirmer le nouveau mot de passe'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Les nouveaux mots de passe ne correspondent pas',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ['newPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// ============================================
// FORGOT PASSWORD & RESET PASSWORD
// ============================================
// Note: forgotPasswordSchema et resetPasswordSchema sont définis dans auth.ts (SP-298)
// pour une meilleure organisation des schémas d'authentification

// ============================================
// DELETE ACCOUNT FORM (RGPD Article 17)
// ============================================
/**
 * Schéma de validation pour la suppression de compte
 * Confirmation renforcée : email + mot de passe + checkbox
 *
 * @ticket SP-277 - RGPD Article 17 - Droit à l'effacement
 */
/**
 * SP-624 : motif de départ, facultatif. Le 3 novembre 2026, un prospect a
 * supprimé son compte après une heure d'usage sans qu'on sache pourquoi.
 */
export const DELETION_REASONS = {
  TOO_COMPLEX: 'Trop compliqué à prendre en main',
  MISSING_FEATURE: 'Il manque une fonctionnalité dont j’ai besoin',
  WRONG_HOURS: 'Les heures ou les plannings calculés ne correspondent pas',
  TOO_EXPENSIVE: 'Trop cher pour mon activité',
  JUST_TESTING: 'Je testais seulement',
  OTHER: 'Autre raison',
} as const

export type DeletionReason = keyof typeof DELETION_REASONS

export const deleteAccountSchema = z.object({
  confirmEmail: z
    .string()
    .min(1, 'Veuillez saisir votre email')
    .email('Format email invalide'),
  password: z.string().min(1, 'Veuillez saisir votre mot de passe'),
  confirmDeletion: z.boolean().refine((val) => val === true, {
    message: 'Vous devez confirmer la suppression définitive',
  }),
  reason: z
    .enum(Object.keys(DELETION_REASONS) as [DeletionReason, ...DeletionReason[]])
    .optional(),
  reasonDetail: z
    .string()
    .trim()
    .max(500, '500 caractères au maximum')
    .optional(),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>

/**
 * SP-624 : ce que la suppression d'un compte entraîne pour son entreprise,
 * affiché avant confirmation et appliqué à l'identique par le serveur
 */
export interface AccountDeletionImpact {
  companyName: string | null
  /** Dernier utilisateur : l'entreprise et ses données partent avec lui */
  willDeleteCompany: boolean
  employeeCount: number
  /** D'autres comptes restent, mais plus aucun dirigeant */
  leavesCompanyWithoutDirector: boolean
  /** Abonnement payant en cours : à résilier avant, sinon Stripe facture */
  blockedByActiveSubscription: boolean
}
