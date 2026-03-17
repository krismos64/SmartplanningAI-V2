/**
 * Route Handler pour l'upload et la suppression d'avatar
 *
 * @ticket SP-272
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  uploadAvatarToCloudinary,
  deleteCloudinaryImage,
  extractPublicIdFromUrl,
  AVATAR_CONFIG,
  type AllowedMimeType,
} from '@/lib/cloudinary'
import { AVATAR_ERRORS } from '@/lib/validations/avatar'

// POST /api/avatar - Upload d'avatar
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: AVATAR_ERRORS.FILE_REQUIRED },
        { status: 400 }
      )
    }

    // Validation du type de fichier
    if (
      !AVATAR_CONFIG.allowedMimeTypes.includes(file.type as AllowedMimeType)
    ) {
      return NextResponse.json(
        { error: AVATAR_ERRORS.INVALID_FORMAT },
        { status: 400 }
      )
    }

    // Validation de la taille
    if (file.size > AVATAR_CONFIG.maxFileSize) {
      return NextResponse.json(
        { error: AVATAR_ERRORS.FILE_TOO_LARGE },
        { status: 400 }
      )
    }

    // Récupérer l'ancienne image pour suppression
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    })

    // Supprimer l'ancienne image si elle existe
    if (user?.image) {
      const oldPublicId = extractPublicIdFromUrl(user.image)
      if (oldPublicId) {
        await deleteCloudinaryImage(oldPublicId)
      }
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary
    const result = await uploadAvatarToCloudinary(buffer, session.user.id)

    // Mettre à jour l'utilisateur en base
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.secure_url },
    })

    // Invalider le cache pour rafraîchir les données
    revalidatePath('/app/profile')
    revalidatePath('/app', 'layout')
    revalidatePath('/app/schedules')

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: AVATAR_ERRORS.UPLOAD_FAILED },
      { status: 500 }
    )
  }
}

// DELETE /api/avatar - Suppression d'avatar
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'image actuelle
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    })

    if (!user?.image) {
      return NextResponse.json({
        success: true,
        message: 'Aucune image à supprimer',
      })
    }

    // Supprimer de Cloudinary
    const publicId = extractPublicIdFromUrl(user.image)
    if (publicId) {
      await deleteCloudinaryImage(publicId)
    }

    // Mettre à jour l'utilisateur en base
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    })

    // Invalider le cache pour rafraîchir les données
    revalidatePath('/app/profile')
    revalidatePath('/app', 'layout')
    revalidatePath('/app/schedules')

    return NextResponse.json({
      success: true,
      message: 'Image supprimée avec succès',
    })
  } catch (error) {
    console.error('Avatar delete error:', error)
    return NextResponse.json(
      { error: AVATAR_ERRORS.DELETE_FAILED },
      { status: 500 }
    )
  }
}
