/**
 * Schemas de validation Zod pour Company
 *
 * @description Validation des formulaires de creation et modification d'entreprise.
 * Utilise les schemas communs pour la coherence (email, phone, siret, url).
 *
 * @ticket SP-150
 * @see Context7 - Zod safeParse refine validation patterns
 */

import { z } from 'zod'
import { phoneSchema, siretSchema, urlSchema } from './common'

// ============================================================================
// Enums synchronises avec Prisma
// ============================================================================

/**
 * Plans d'abonnement disponibles
 * Synchronisé avec enum SubscriptionPlan Prisma (SP-350 per-seat)
 */
export const subscriptionPlanEnum = z.enum(['FREE', 'PER_SEAT'])

export type SubscriptionPlan = z.infer<typeof subscriptionPlanEnum>

/**
 * Statuts d'abonnement
 * Synchronisé avec enum SubscriptionStatus Prisma
 */
export const subscriptionStatusEnum = z.enum([
  'TRIAL',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'EXPIRED',
  'INCOMPLETE',
])

export type SubscriptionStatus = z.infer<typeof subscriptionStatusEnum>

// ============================================================================
// Schema de base Company
// ============================================================================

/**
 * Schema de base pour les champs Company
 *
 * Valide les donnees communes a la creation et la modification
 */
export const companyBaseSchema = z.object({
  /** Nom de l'entreprise (2-100 caracteres) */
  name: z
    .string()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères")
    .max(100, "Le nom de l'entreprise ne peut pas dépasser 100 caractères")
    .trim(),

  /** Numero SIRET (14 chiffres, optionnel) */
  siret: siretSchema,

  /** Adresse postale (optionnel) */
  address: z
    .string()
    .max(255, "L'adresse ne peut pas dépasser 255 caractères")
    .trim()
    .optional()
    .or(z.literal('')),

  /** Telephone de contact */
  phone: phoneSchema,

  /** Email de contact */
  email: z
    .string()
    .email('Email invalide')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),

  /** Site web */
  website: urlSchema,

  /** Fuseau horaire */
  timezone: z.string().default('Europe/Paris'),
})

// ============================================================================
// Schema de creation Company
// ============================================================================

/**
 * Schema pour la creation d'une Company
 *
 * Herite du schema de base avec valeurs par defaut
 */
export const createCompanySchema = companyBaseSchema.extend({
  /** Entreprise active par defaut */
  isActive: z.boolean().default(true),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>

// ============================================================================
// Schema de modification Company
// ============================================================================

/**
 * Schema pour la modification d'une Company
 *
 * Tous les champs sont optionnels sauf l'ID
 */
export const updateCompanySchema = companyBaseSchema.partial().extend({
  /** ID de la Company a modifier (requis) */
  id: z.string().cuid('ID de company invalide'),

  /** Statut actif/inactif */
  isActive: z.boolean().optional(),
})

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>

// ============================================================================
// Schema de filtrage Company (pour les listes)
// ============================================================================

/**
 * Schema pour les filtres de recherche Company
 *
 * Utilise dans les Server Actions de listing
 */
export const companyFiltersSchema = z.object({
  /** Recherche textuelle (nom, siret) */
  search: z.string().optional(),

  /** Filtrer par plan d'abonnement */
  subscriptionPlan: subscriptionPlanEnum.optional(),

  /** Filtrer par statut d'abonnement */
  subscriptionStatus: subscriptionStatusEnum.optional(),

  /** Filtrer par statut actif */
  isActive: z.boolean().optional(),
})

export type CompanyFilters = z.infer<typeof companyFiltersSchema>

// ============================================================================
// Labels traduits pour les enums
// ============================================================================

/**
 * Labels francais pour les plans d'abonnement
 */
export const subscriptionPlanLabels: Record<SubscriptionPlan, string> = {
  FREE: 'Gratuit',
  PER_SEAT: 'Per-seat (2,90€/employé)',
}

/**
 * Labels francais pour les statuts d'abonnement
 */
export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  TRIAL: "Période d'essai",
  ACTIVE: 'Actif',
  PAST_DUE: 'Paiement en retard',
  CANCELED: 'Annulé',
  EXPIRED: 'Expiré',
  INCOMPLETE: 'Paiement incomplet',
}
