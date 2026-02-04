'use client'

/**
 * Composant d'upload d'avatar avec drag & drop
 *
 * @ticket SP-272
 */

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AVATAR_CONFIG, type AllowedMimeType } from '@/lib/avatar-config'
import { AVATAR_ERRORS } from '@/lib/validations/avatar'
import { toast } from 'sonner'

// Types pour les réponses API
interface AvatarUploadResponse {
  success: boolean
  url?: string
  error?: string
}

interface AvatarDeleteResponse {
  success: boolean
  message?: string
  error?: string
}

interface AvatarUploadProps {
  currentImage?: string | null
  name?: string
  onUploadSuccess?: (url: string) => void
  onDeleteSuccess?: () => void
  className?: string
}

export function AvatarUpload({
  currentImage,
  name,
  onUploadSuccess,
  onDeleteSuccess,
  className,
}: AvatarUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (inputName?: string): string => {
    if (!inputName) return '?'
    const parts = inputName.trim().split(' ')
    if (parts.length >= 2) {
      const first = parts[0]?.[0] ?? ''
      const last = parts[parts.length - 1]?.[0] ?? ''
      return `${first}${last}`.toUpperCase()
    }
    return (parts[0] ?? '').substring(0, 2).toUpperCase()
  }

  const validateFile = useCallback((file: File): string | null => {
    if (
      !AVATAR_CONFIG.allowedMimeTypes.includes(file.type as AllowedMimeType)
    ) {
      return AVATAR_ERRORS.INVALID_FORMAT
    }
    if (file.size > AVATAR_CONFIG.maxFileSize) {
      return AVATAR_ERRORS.FILE_TOO_LARGE
    }
    return null
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return
      }

      // Créer un aperçu
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/avatar', {
          method: 'POST',
          body: formData,
        })

        const data = (await response.json()) as AvatarUploadResponse

        if (!response.ok) {
          throw new Error(data.error ?? AVATAR_ERRORS.UPLOAD_FAILED)
        }

        // Rafraîchir la page pour obtenir les nouvelles données
        router.refresh()

        toast.success('Photo de profil mise à jour')
        if (data.url) {
          onUploadSuccess?.(data.url)
        }
      } catch (err) {
        setPreview(null)
        toast.error(
          err instanceof Error ? err.message : AVATAR_ERRORS.UPLOAD_FAILED
        )
      } finally {
        setIsUploading(false)
        URL.revokeObjectURL(previewUrl)
      }
    },
    [validateFile, router, onUploadSuccess]
  )

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/avatar', {
        method: 'DELETE',
      })

      const data = (await response.json()) as AvatarDeleteResponse

      if (!response.ok) {
        throw new Error(data.error ?? AVATAR_ERRORS.DELETE_FAILED)
      }

      // Rafraîchir la page pour obtenir les nouvelles données
      router.refresh()

      setPreview(null)
      toast.success('Photo de profil supprimée')
      onDeleteSuccess?.()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : AVATAR_ERRORS.DELETE_FAILED
      )
    } finally {
      setIsDeleting(false)
    }
  }, [router, onDeleteSuccess])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        void uploadFile(file)
      }
    },
    [uploadFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        void uploadFile(file)
      }
      // Reset input pour permettre de re-sélectionner le même fichier
      e.target.value = ''
    },
    [uploadFile]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const displayImage = preview || currentImage
  const isLoading = isUploading || isDeleting

  return (
    <div
      className={cn('flex flex-col items-center gap-4', className)}
      data-testid="avatar-upload"
    >
      {/* Zone de drop */}
      <div
        className={cn(
          'relative cursor-pointer rounded-full transition-all',
          isDragging && 'ring-4 ring-primary ring-offset-2',
          isLoading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        data-testid="avatar-drop-zone"
      >
        <Avatar className="h-32 w-32" data-testid="avatar-preview">
          {displayImage && (
            <AvatarImage src={displayImage} alt={name || 'Avatar'} />
          )}
          <AvatarFallback className="text-2xl">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {/* Overlay au hover */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity',
            'hover:opacity-100',
            isDragging && 'opacity-100'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept={AVATAR_CONFIG.allowedMimeTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
        data-testid="avatar-file-input"
      />

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="touch-sm"
          onClick={handleClick}
          disabled={isLoading}
          data-testid="avatar-upload-button"
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Changer
        </Button>

        {displayImage && (
          <Button
            type="button"
            variant="ghost"
            size="touch-sm"
            onClick={() => void handleDelete()}
            disabled={isLoading}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            data-testid="avatar-delete-button"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Supprimer
          </Button>
        )}
      </div>

      {/* Instructions */}
      <p
        className="text-center text-xs text-muted-foreground"
        data-testid="avatar-instructions"
      >
        Glissez une image ou cliquez pour sélectionner
        <br />
        JPG, PNG, WebP ou GIF • Max 5MB
      </p>
    </div>
  )
}
