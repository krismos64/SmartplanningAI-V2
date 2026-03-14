import { z } from 'zod'

/**
 * Schémas Zod réutilisables pour la validation des formulaires
 * Utilisés dans toute l'application pour garantir la cohérence
 */

// ============================================
// EMAIL
// ============================================
export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email('Email invalide')
  .toLowerCase()
  .trim()

// ============================================
// TÉLÉPHONE (International)
// ============================================
export const phoneSchema = z
  .string()
  .transform((val) => val.replace(/[\s.\-()]/g, ''))
  .pipe(
    z
      .string()
      .regex(
        /^\+?[0-9]{7,15}$/,
        'Numéro invalide (7 à 15 chiffres, indicatif optionnel ex: +33612345678)'
      )
  )
  .or(z.literal(''))
  .optional()

/**
 * Formate un numéro de téléphone pour l'affichage
 * Regroupe les chiffres par paires après l'indicatif
 * Ex: +33612345678 → +33 6 12 34 56 78
 *     0612345678  → 06 12 34 56 78
 *     +447911123456 → +44 79 11 12 34 56
 */
export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '')

  // Numéro français +33
  if (cleaned.startsWith('+33')) {
    const digits = cleaned.slice(3)
    return `+33 ${digits[0]} ${digits
      .slice(1)
      .replace(/(\d{2})/g, '$1 ')
      .trim()}`
  }

  // Numéro français 0X
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return cleaned.replace(/(\d{2})/g, '$1 ').trim()
  }

  // International : +indicatif puis paires de chiffres
  if (cleaned.startsWith('+')) {
    const match = cleaned.match(/^\+(\d{1,3})(\d+)$/)
    if (match) {
      const [, countryCode, digits] = match
      return `+${countryCode} ${digits.replace(/(\d{2})/g, '$1 ').trim()}`
    }
  }

  // Fallback : paires de chiffres
  return cleaned.replace(/(\d{2})/g, '$1 ').trim()
}

// ============================================
// MOT DE PASSE SÉCURISÉ
// ============================================
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(
    /[^A-Za-z0-9]/,
    'Le mot de passe doit contenir au moins un caractère spécial'
  )

// ============================================
// URL
// ============================================
export const urlSchema = z
  .string()
  .url('URL invalide (ex: https://example.com)')
  .or(z.literal(''))
  .optional()

// ============================================
// DATE (String ISO)
// ============================================
export const dateSchema = z
  .string()
  .min(1, 'La date est requise')
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Date invalide',
  })

// ============================================
// DATE OPTIONNELLE
// ============================================
export const optionalDateSchema = z
  .string()
  .refine((val) => val === '' || !isNaN(Date.parse(val)), {
    message: 'Date invalide',
  })
  .optional()
  .or(z.literal(''))

// ============================================
// NOM / PRÉNOM
// ============================================
export const nameSchema = z
  .string()
  .min(2, 'Minimum 2 caractères')
  .max(50, 'Maximum 50 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Caractères invalides détectés')
  .trim()

// ============================================
// CODE POSTAL FRANÇAIS
// ============================================
export const zipCodeSchema = z
  .string()
  .regex(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres)')
  .or(z.literal(''))
  .optional()

// ============================================
// SIRET
// ============================================
export const siretSchema = z
  .string()
  .regex(/^[0-9]{14}$/, 'SIRET invalide (14 chiffres)')
  .or(z.literal(''))
  .optional()

// ============================================
// MONTANT / SALAIRE
// ============================================
export const amountSchema = z
  .number({
    invalid_type_error: 'Montant invalide',
    required_error: 'Le montant est requis',
  })
  .min(0, 'Le montant doit être positif')

export const optionalAmountSchema = z
  .number({
    invalid_type_error: 'Montant invalide',
  })
  .min(0, 'Le montant doit être positif')
  .optional()

// ============================================
// TEXTE COURT (Bio, Description)
// ============================================
export const shortTextSchema = z
  .string()
  .max(500, 'Maximum 500 caractères')
  .trim()
  .or(z.literal(''))
  .optional()

// ============================================
// TEXTE LONG (Commentaire, Notes)
// ============================================
export const longTextSchema = z
  .string()
  .max(2000, 'Maximum 2000 caractères')
  .trim()
  .or(z.literal(''))
  .optional()

// ============================================
// HORAIRE (Format HH:mm)
// ============================================
export const timeSchema = z
  .string()
  .regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Format horaire invalide (ex: 09:00, 14:30)'
  )

// ============================================
// COULEUR HEXADÉCIMALE
// ============================================
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide (ex: #10B981)')
  .optional()
  .nullable()
