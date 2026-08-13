/**
 * Validations et labels pour les messages de contact admin (SP-577)
 *
 * Fichier separe de l'action ('use server' strict : les schemas Zod et
 * constantes ne doivent pas etre exportes depuis un fichier 'use server',
 * un export non-async y provoque un 503 en production).
 *
 * @ticket SP-577
 */

import { z } from 'zod'

// ============================================================================
// SCHEMA DE FILTRES
// ============================================================================

/** Statut de la notification envoyee a l'equipe (colonne String en base) */
export const CONTACT_EMAIL_STATUSES = ['PENDING', 'SENT', 'FAILED'] as const

export type ContactEmailStatus = (typeof CONTACT_EMAIL_STATUSES)[number]

export const contactMessageFiltersSchema = z.object({
  /** Recherche libre sur le nom, l'email ou le sujet */
  search: z.string().max(200).optional(),
  emailStatus: z.enum(CONTACT_EMAIL_STATUSES).optional(),
  /** 'unread' isole les demandes non traitées, 'read' celles déjà vues */
  readState: z.enum(['unread', 'read']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})

export type ContactMessageFiltersInput = z.input<
  typeof contactMessageFiltersSchema
>
export type ContactMessageFilters = z.output<typeof contactMessageFiltersSchema>

/** Marquage lu / non lu d'un message */
export const markContactMessageSchema = z.object({
  id: z.string().cuid(),
  isRead: z.boolean(),
})

export type MarkContactMessageInput = z.input<typeof markContactMessageSchema>

// ============================================================================
// LABELS
// ============================================================================

export const CONTACT_EMAIL_STATUS_LABELS: Record<ContactEmailStatus, string> = {
  PENDING: 'En attente',
  SENT: 'Notifiée',
  FAILED: 'Non notifiée',
}

/**
 * `FAILED` est le statut qui compte : la demande est arrivee en base mais
 * aucun email n'a prevenu l'equipe. Sans cette page, elle resterait
 * invisible. C'est la raison d'etre de l'ecran.
 */
export const CONTACT_EMAIL_STATUS_HINTS: Record<ContactEmailStatus, string> = {
  PENDING: "L'envoi n'a pas encore été tenté",
  SENT: "L'équipe a reçu la notification par email",
  FAILED: "Aucun email n'est parti, demande à traiter à la main",
}
