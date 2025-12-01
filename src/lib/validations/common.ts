import { z } from "zod";

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
  .email("Email invalide")
  .toLowerCase()
  .trim();

// ============================================
// TÉLÉPHONE (Format français)
// ============================================
export const phoneSchema = z
  .string()
  .regex(
    /^(\+33|0)[1-9](\d{2}){4}$/,
    "Numéro invalide (format: 0612345678 ou +33612345678)"
  )
  .or(z.literal(""))
  .optional();

// ============================================
// MOT DE PASSE SÉCURISÉ
// ============================================
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(
    /[^A-Za-z0-9]/,
    "Le mot de passe doit contenir au moins un caractère spécial"
  );

// ============================================
// URL
// ============================================
export const urlSchema = z
  .string()
  .url("URL invalide (ex: https://example.com)")
  .or(z.literal(""))
  .optional();

// ============================================
// DATE (String ISO)
// ============================================
export const dateSchema = z
  .string()
  .min(1, "La date est requise")
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Date invalide",
  });

// ============================================
// DATE OPTIONNELLE
// ============================================
export const optionalDateSchema = z
  .string()
  .refine((val) => val === "" || !isNaN(Date.parse(val)), {
    message: "Date invalide",
  })
  .optional()
  .or(z.literal(""));

// ============================================
// NOM / PRÉNOM
// ============================================
export const nameSchema = z
  .string()
  .min(2, "Minimum 2 caractères")
  .max(50, "Maximum 50 caractères")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Caractères invalides détectés")
  .trim();

// ============================================
// CODE POSTAL FRANÇAIS
// ============================================
export const zipCodeSchema = z
  .string()
  .regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres)")
  .or(z.literal(""))
  .optional();

// ============================================
// SIRET
// ============================================
export const siretSchema = z
  .string()
  .regex(/^[0-9]{14}$/, "SIRET invalide (14 chiffres)")
  .or(z.literal(""))
  .optional();

// ============================================
// MONTANT / SALAIRE
// ============================================
export const amountSchema = z
  .number({
    invalid_type_error: "Montant invalide",
    required_error: "Le montant est requis",
  })
  .min(0, "Le montant doit être positif");

export const optionalAmountSchema = z
  .number({
    invalid_type_error: "Montant invalide",
  })
  .min(0, "Le montant doit être positif")
  .optional();

// ============================================
// TEXTE COURT (Bio, Description)
// ============================================
export const shortTextSchema = z
  .string()
  .max(500, "Maximum 500 caractères")
  .trim()
  .or(z.literal(""))
  .optional();

// ============================================
// TEXTE LONG (Commentaire, Notes)
// ============================================
export const longTextSchema = z
  .string()
  .max(2000, "Maximum 2000 caractères")
  .trim()
  .or(z.literal(""))
  .optional();
