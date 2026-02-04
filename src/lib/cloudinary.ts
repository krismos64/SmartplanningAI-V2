/**
 * Configuration et utilitaires Cloudinary (serveur uniquement)
 *
 * IMPORTANT: Ce fichier importe cloudinary qui utilise 'fs'.
 * Ne l'importez que dans des Server Components ou Route Handlers.
 * Pour les composants client, utilisez avatar-config.ts
 *
 * @ticket SP-272
 */

import { v2 as cloudinary } from 'cloudinary'
import { AVATAR_CONFIG } from './avatar-config'

// Re-export pour la compatibilité
export { AVATAR_CONFIG }
export type { AllowedMimeType } from './avatar-config'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

// Transformation Cloudinary pour les avatars
export const AVATAR_TRANSFORMATION = {
  width: 200,
  height: 200,
  crop: 'fill',
  gravity: 'face',
  format: 'webp',
  quality: 'auto',
} as const

// Types pour les résultats d'upload
export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  bytes: number
}

// Extraire le public_id depuis une URL Cloudinary
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url) return null

  try {
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    const match = url.match(/\/v\d+\/(.+)\.\w+$/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

// Type pour le résultat de suppression Cloudinary
interface CloudinaryDestroyResult {
  result: string
}

// Supprimer une image de Cloudinary
export async function deleteCloudinaryImage(
  publicId: string
): Promise<boolean> {
  try {
    const result = (await cloudinary.uploader.destroy(
      publicId
    )) as CloudinaryDestroyResult
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting Cloudinary image:', error)
    return false
  }
}

// Uploader une image vers Cloudinary avec transformations
export async function uploadAvatarToCloudinary(
  buffer: Buffer,
  userId: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: AVATAR_CONFIG.folder,
        public_id: `user-${userId}`,
        overwrite: true,
        transformation: AVATAR_TRANSFORMATION,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(error)
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          })
        } else {
          reject(new Error('Upload failed: no result returned'))
        }
      }
    )

    uploadStream.end(buffer)
  })
}
