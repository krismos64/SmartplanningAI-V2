/**
 * API Route — Upload de pièces jointes pour la messagerie
 *
 * @route POST /api/messages/upload
 * @ticket SP-504
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getEffectiveSessionData } from '@/lib/impersonation'
import { prisma } from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
])

export async function POST(request: NextRequest) {
  // Auth
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const effective = await getEffectiveSessionData(session)
  const userId = effective.userId

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conversationId = formData.get('conversationId') as string | null

    if (!file || !conversationId) {
      return NextResponse.json(
        { error: 'Fichier et conversationId requis' },
        { status: 400 }
      )
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10 Mo)' },
        { status: 400 }
      )
    }

    // Vérifier le type MIME
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est membre de la conversation
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de cette conversation" },
        { status: 403 }
      )
    }

    // Upload vers Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const isImage = file.type.startsWith('image/')

    // Nettoyer le nom de fichier pour l'utiliser comme public_id
    // Supprimer l'extension (Cloudinary l'ajoute automatiquement)
    const originalName = file.name
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    const safeName = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Caractères sûrs uniquement
      .slice(0, 100) // Limiter la longueur
    const uniqueName = `${safeName}_${Date.now()}`

    const result = await new Promise<{
      secure_url: string
      public_id: string
      bytes: number
      format: string
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'smartplanning/messages',
          public_id: uniqueName,
          resource_type: isImage ? 'image' : 'raw',
          ...(isImage
            ? {
                transformation: [
                  { width: 1920, crop: 'limit' },
                  { quality: 'auto', format: 'webp' },
                ],
              }
            : {}),
        },
        (err, result) => {
          if (err) reject(new Error('Cloudinary upload failed'))
          else if (result) resolve(result)
          else reject(new Error('Upload returned no result'))
        }
      )
      uploadStream.end(buffer)
    })

    // Pour les fichiers non-image, ajouter fl_attachment au lien
    // pour forcer le téléchargement avec le nom original
    let downloadUrl = result.secure_url
    if (!isImage) {
      // Cloudinary : ajouter fl_attachment:nom_fichier dans l'URL
      // Format : .../upload/fl_attachment:nom_fichier/...
      downloadUrl = result.secure_url.replace(
        '/upload/',
        `/upload/fl_attachment:${encodeURIComponent(originalName)}/`
      )
    }

    return NextResponse.json({
      url: downloadUrl,
      name: originalName,
      mimeType: file.type,
      size: file.size,
    })
  } catch (error) {
    console.error('[messages/upload] Error:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    )
  }
}
