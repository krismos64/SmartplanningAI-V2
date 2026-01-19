import { z } from 'zod'
import { emailSchema } from './common'

/**
 * Schémas de validation pour le formulaire de contact
 *
 * @ticket SP-287
 * @description Validation Zod pour le formulaire de contact public
 */

// ============================================
// CONTACT FORM
// ============================================
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  email: emailSchema,
  subject: z
    .string()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères')
    .trim(),
  message: z
    .string()
    .min(20, 'Le message doit contenir au moins 20 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères')
    .trim(),
})

export type ContactFormData = z.infer<typeof contactSchema>

// ============================================
// VALEURS PAR DÉFAUT
// ============================================
export const contactDefaultValues: ContactFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
}
