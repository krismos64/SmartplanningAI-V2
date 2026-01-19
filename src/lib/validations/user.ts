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
