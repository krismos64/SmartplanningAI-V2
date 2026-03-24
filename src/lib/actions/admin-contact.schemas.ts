/**
 * Schemas Zod et constantes pour les actions admin-contact.
 *
 * Séparés du fichier 'use server' car Next.js 15 interdit
 * l'export d'objets (non-async functions) depuis un fichier 'use server'.
 *
 * @ticket SP-474, SP-477
 */

import { z } from 'zod'

// ============================================================================
// Admin Message (SP-474)
// ============================================================================

export const AdminMessageSchema = z.object({
  companyId: z.string().min(1),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(2000),
  category: z.enum(['information', 'facturation', 'technique', 'autre']),
})

export type AdminMessageInput = z.infer<typeof AdminMessageSchema>

export interface SendAdminMessageResult {
  success: boolean
  sentCount: number
  errors: string[]
}

// ============================================================================
// Broadcast (SP-477)
// ============================================================================

const BROADCAST_CATEGORIES = [
  'maintenance',
  'product_update',
  'important_info',
  'commercial',
] as const

export type BroadcastCategory = (typeof BROADCAST_CATEGORIES)[number]

export const BroadcastSchema = z.object({
  subject: z.string().min(5, 'Minimum 5 caractères').max(150),
  message: z.string().min(20, 'Minimum 20 caractères').max(5000),
  category: z.enum(BROADCAST_CATEGORIES),
})

export type BroadcastInput = z.infer<typeof BroadcastSchema>

export interface BroadcastResult {
  success: boolean
  totalSent: number
  totalFailed: number
  failedEmails: string[]
}

export const BROADCAST_CATEGORY_LABELS: Record<BroadcastCategory, string> = {
  maintenance: 'Maintenance',
  product_update: 'Mise à jour produit',
  important_info: 'Information importante',
  commercial: 'Offre commerciale',
}

/** Mapping catégorie broadcast → catégorie template email */
export const BROADCAST_TO_CONTACT_CATEGORY: Record<
  BroadcastCategory,
  'information' | 'facturation' | 'technique' | 'autre'
> = {
  maintenance: 'technique',
  product_update: 'information',
  important_info: 'information',
  commercial: 'facturation',
}
