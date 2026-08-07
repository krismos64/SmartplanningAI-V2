/**
 * Validations et labels pour le journal EmailLog admin (SP-545)
 *
 * Fichier séparé de l'action ('use server' strict : les schémas Zod et
 * constantes ne doivent pas être exportés depuis un fichier 'use server').
 *
 * @ticket SP-545
 */

import { z } from 'zod'

// ============================================================================
// SCHÉMA DE FILTRES
// ============================================================================

/** Statuts possibles d'un EmailLog (colonne String en base) */
export const EMAIL_LOG_STATUSES = ['SENT', 'FAILED', 'BOUNCED'] as const

/**
 * Valide qu'une chaîne YYYY-MM-DD est une date calendaire réelle
 * (le regex seul laisse passer '2026-13-45').
 *
 * Comparaison sur les composantes locales (pas toISOString, qui convertit
 * en UTC et décale la date selon le fuseau horaire du serveur).
 */
function isValidCalendarDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number)
  if (year === undefined || month === undefined || day === undefined) {
    return false
  }
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isValidCalendarDate, { message: 'Date invalide' })
  .optional()

export const emailLogFiltersSchema = z
  .object({
    /** Filtre par type — matche aussi les types suffixés `TYPE:dedupe` */
    emailType: z.string().max(100).optional(),
    companyId: z.string().cuid().optional(),
    status: z.enum(EMAIL_LOG_STATUSES).optional(),
    /** Bornes de dates au format YYYY-MM-DD */
    dateFrom: dateStringSchema,
    dateTo: dateStringSchema,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
  })
  .refine(
    (data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo,
    {
      message: 'dateFrom doit être antérieure ou égale à dateTo',
      path: ['dateTo'],
    }
  )

export type EmailLogFiltersInput = z.input<typeof emailLogFiltersSchema>
export type EmailLogFilters = z.output<typeof emailLogFiltersSchema>

// ============================================================================
// LABELS & CATÉGORIES
// ============================================================================

export type EmailCategory = 'BILLING' | 'AUTH' | 'ADMIN'

export const EMAIL_CATEGORY_LABELS: Record<EmailCategory, string> = {
  BILLING: 'Facturation',
  AUTH: 'Authentification',
  ADMIN: 'Admin',
}

interface EmailTypeMeta {
  label: string
  category: EmailCategory
}

/**
 * Types d'emails actuellement tracés dans EmailLog.
 *
 * ⚠️ Couverture partielle : seuls billing (send-billing.ts, avec
 * déduplication), auth (log-auth-email.ts) et admin (admin-contact.ts)
 * écrivent dans EmailLog. Les emails métier (congés, planning, équipe,
 * sécurité, RGPD) partent en fire-and-forget sans trace — extension
 * suivie dans SP-547.
 */
export const EMAIL_TYPE_META: Record<string, EmailTypeMeta> = {
  // Billing (send-billing.ts — idempotence par (subscriptionId, emailType))
  PAYMENT_CONFIRMED: { label: 'Paiement confirmé', category: 'BILLING' },
  PAYMENT_FAILED: { label: 'Paiement échoué', category: 'BILLING' },
  SUBSCRIPTION_ACTIVATED: { label: 'Abonnement activé', category: 'BILLING' },
  SUBSCRIPTION_CANCELED: { label: 'Abonnement annulé', category: 'BILLING' },
  TRIAL_REMINDER_14: { label: 'Rappel essai J-14', category: 'BILLING' },
  TRIAL_REMINDER_7: { label: 'Rappel essai J-7', category: 'BILLING' },
  TRIAL_REMINDER_3: { label: 'Rappel essai J-3', category: 'BILLING' },
  TRIAL_REMINDER_1: { label: 'Rappel essai J-1', category: 'BILLING' },
  TRIAL_EXPIRED: { label: 'Essai expiré', category: 'BILLING' },
  QUANTITY_UPDATED: { label: 'Quantité mise à jour', category: 'BILLING' },
  // Auth (log-auth-email.ts)
  WELCOME: { label: 'Bienvenue', category: 'AUTH' },
  EMAIL_VERIFICATION: { label: 'Vérification email', category: 'AUTH' },
  // Admin (admin-contact.ts)
  ADMIN_MESSAGE: { label: 'Message admin', category: 'ADMIN' },
  ADMIN_BROADCAST: { label: 'Diffusion générale', category: 'ADMIN' },
}

/**
 * Label lisible d'un emailType, en ignorant un éventuel suffixe de
 * déduplication `TYPE:suffix` (pattern send-billing pour les emails
 * récurrents). Fallback : le type brut.
 */
export function getEmailTypeLabel(emailType: string): string {
  const baseType = emailType.split(':')[0] ?? emailType
  return EMAIL_TYPE_META[baseType]?.label ?? emailType
}

/** Catégorie d'un emailType (suffixe de dédup ignoré), null si inconnue */
export function getEmailTypeCategory(emailType: string): EmailCategory | null {
  const baseType = emailType.split(':')[0] ?? emailType
  return EMAIL_TYPE_META[baseType]?.category ?? null
}
