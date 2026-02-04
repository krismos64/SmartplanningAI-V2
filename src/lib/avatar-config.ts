/**
 * Configuration des avatars (client-safe, pas de dépendance cloudinary)
 *
 * @ticket SP-272
 */

// Types MIME autorisés pour les avatars
export type AllowedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'

// Constantes pour l'upload d'avatars (utilisable côté client)
export const AVATAR_CONFIG = {
  folder: 'smartplanning/avatars',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as AllowedMimeType[],
} as const
