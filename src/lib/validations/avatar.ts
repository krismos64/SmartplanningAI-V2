/**
 * Schémas de validation Zod pour l'upload d'avatar
 *
 * @ticket SP-272
 */

import { z } from 'zod'
import { AVATAR_CONFIG, type AllowedMimeType } from '@/lib/avatar-config'

// Validation du fichier avatar
export const avatarFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= AVATAR_CONFIG.maxFileSize,
      `La taille du fichier ne doit pas dépasser ${AVATAR_CONFIG.maxFileSize / 1024 / 1024}MB`
    )
    .refine(
      (file) =>
        AVATAR_CONFIG.allowedMimeTypes.includes(file.type as AllowedMimeType),
      `Format non supporté. Formats acceptés: ${AVATAR_CONFIG.allowedMimeTypes.map((t) => t.split('/')[1]).join(', ')}`
    ),
})

// Type inféré
export type AvatarFileInput = z.infer<typeof avatarFileSchema>

// Messages d'erreur localisés
export const AVATAR_ERRORS = {
  FILE_REQUIRED: 'Veuillez sélectionner un fichier',
  FILE_TOO_LARGE: `Le fichier est trop volumineux (max ${AVATAR_CONFIG.maxFileSize / 1024 / 1024}MB)`,
  INVALID_FORMAT: 'Format de fichier non supporté',
  UPLOAD_FAILED: "Erreur lors de l'upload de l'image",
  DELETE_FAILED: "Erreur lors de la suppression de l'image",
} as const
