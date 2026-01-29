/**
 * Schémas de validation Zod pour les tâches personnelles (Todolist)
 *
 * @ticket SP-417
 * @description Validation des tâches personnelles privées avec support drag & drop
 */

import { z } from 'zod'

// ─── Schéma de création de tâche ────────────────────────────────────

export const personalTaskCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères'),
  description: z
    .string()
    .max(2000, 'La description ne doit pas dépasser 2000 caractères')
    .optional(),
  dueDate: z.coerce.date().optional().nullable(),
})

export type PersonalTaskCreateInput = z.infer<typeof personalTaskCreateSchema>

// ─── Schéma de mise à jour (tous optionnels) ────────────────────────

export const personalTaskUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre ne peut pas être vide')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères')
    .optional(),
  description: z
    .string()
    .max(2000, 'La description ne doit pas dépasser 2000 caractères')
    .optional()
    .nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  completed: z.boolean().optional(),
})

export type PersonalTaskUpdateInput = z.infer<typeof personalTaskUpdateSchema>

// ─── Schéma pour le reorder (drag & drop) ───────────────────────────

export const personalTaskReorderSchema = z.object({
  orderedIds: z
    .array(z.string().cuid('ID de tâche invalide'))
    .min(1, 'Au moins une tâche requise'),
})

export type PersonalTaskReorderInput = z.infer<typeof personalTaskReorderSchema>

// ─── Schéma pour toggle completed ───────────────────────────────────

export const personalTaskToggleSchema = z.object({
  id: z.string().cuid('ID de tâche invalide'),
  completed: z.boolean(),
})

export type PersonalTaskToggleInput = z.infer<typeof personalTaskToggleSchema>

// ─── Schéma de filtrage (pour future pagination) ────────────────────

export const personalTaskFiltersSchema = z.object({
  completed: z.boolean().optional(),
  search: z.string().optional(),
})

export type PersonalTaskFilters = z.infer<typeof personalTaskFiltersSchema>
