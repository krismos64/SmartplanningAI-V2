/**
 * API Route — Upload avatar de groupe
 *
 * @route POST /api/messages/group-avatar
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getEffectiveSessionData } from '@/lib/impersonation'
import { prisma } from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export async function POST(request: NextRequest) {
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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 2 Mo)' },
        { status: 400 }
      )
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      )
    }

    // Vérifier que c'est un GROUP et que l'utilisateur est membre
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true, members: { select: { userId: true } } },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation introuvable' },
        { status: 404 }
      )
    }

    if (conversation.type !== 'GROUP') {
      return NextResponse.json(
        { error: 'Seuls les groupes peuvent avoir un avatar personnalisé' },
        { status: 400 }
      )
    }

    const isMember = conversation.members.some((m) => m.userId === userId)
    if (!isMember) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de ce groupe" },
        { status: 403 }
      )
    }

    // Upload vers Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'smartplanning/group-avatars',
            public_id: `group-${conversationId}`,
            overwrite: true,
            transformation: [
              { width: 200, height: 200, crop: 'fill', gravity: 'auto' },
              { quality: 'auto', format: 'webp' },
            ],
          },
          (err, result) => {
            if (err) reject(new Error('Upload failed'))
            else if (result) resolve(result)
            else reject(new Error('No result'))
          }
        )
        uploadStream.end(buffer)
      }
    )

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { avatarUrl: result.secure_url },
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error('[group-avatar] Error:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    )
  }
}
