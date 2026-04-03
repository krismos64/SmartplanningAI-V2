/**
 * Schémas de validation Zod pour la messagerie interne
 *
 * @description Validation des messages, conversations et membres.
 * Importable côté client (pas de 'use server').
 *
 * @ticket SP-502
 */

import { z } from 'zod'

// ============================================================================
// Pièces jointes
// ============================================================================

export const attachmentDataSchema = z.object({
  url: z.string().url('URL invalide'),
  name: z.string().min(1, 'Nom de fichier requis').max(255),
  mimeType: z.string().min(1, 'Type MIME requis'),
  size: z
    .number()
    .min(1)
    .max(10 * 1024 * 1024, 'Fichier trop volumineux (max 10 Mo)'),
})

export type AttachmentDataInput = z.infer<typeof attachmentDataSchema>

// ============================================================================
// Envoi de message
// ============================================================================

export const sendMessageSchema = z
  .object({
    conversationId: z.string().cuid('ID de conversation invalide'),
    content: z
      .string()
      .max(5000, 'Le message ne peut pas dépasser 5 000 caractères')
      .trim()
      .optional()
      .nullable(),
    attachments: z
      .array(attachmentDataSchema)
      .max(5, 'Maximum 5 pièces jointes')
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    const hasContent = data.content && data.content.trim().length > 0
    const hasAttachments = data.attachments && data.attachments.length > 0
    if (!hasContent && !hasAttachments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Le message doit contenir du texte ou au moins une pièce jointe',
        path: ['content'],
      })
    }
  })

export type SendMessageInput = z.infer<typeof sendMessageSchema>

// ============================================================================
// Création de conversations
// ============================================================================

export const createDirectConversationSchema = z.object({
  targetUserId: z.string().cuid('ID utilisateur invalide'),
})

export type CreateDirectConversationInput = z.infer<
  typeof createDirectConversationSchema
>

export const createGroupConversationSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  memberUserIds: z
    .array(z.string().cuid('ID utilisateur invalide'))
    .min(1, 'Au moins un membre requis'),
})

export type CreateGroupConversationInput = z.infer<
  typeof createGroupConversationSchema
>

// ============================================================================
// Gestion des membres
// ============================================================================

export const addGroupMemberSchema = z.object({
  conversationId: z.string().cuid('ID de conversation invalide'),
  userId: z.string().cuid('ID utilisateur invalide'),
})

export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>

export const removeGroupMemberSchema = z.object({
  conversationId: z.string().cuid('ID de conversation invalide'),
  userId: z.string().cuid('ID utilisateur invalide'),
})

export type RemoveGroupMemberInput = z.infer<typeof removeGroupMemberSchema>

// ============================================================================
// Filtres et pagination
// ============================================================================

export const messageFiltersSchema = z.object({
  conversationId: z.string().cuid('ID de conversation invalide'),
  cursor: z.string().cuid('Curseur invalide').optional(),
  take: z.number().min(1).max(50).default(30),
})

export type MessageFiltersInput = z.infer<typeof messageFiltersSchema>

export const conversationFiltersSchema = z.object({
  search: z.string().optional(),
})

export type ConversationFiltersInput = z.infer<typeof conversationFiltersSchema>
