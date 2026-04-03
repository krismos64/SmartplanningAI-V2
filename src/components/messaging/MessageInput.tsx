/**
 * Zone de saisie de message avec support pièces jointes
 *
 * Design intégré : trombone + textarea + envoi dans un seul conteneur arrondi.
 *
 * @ticket SP-506
 */

'use client'

import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Paperclip, X, Loader2, FileText } from 'lucide-react'
import type { AttachmentData } from '@/types/messaging'

interface MessageInputProps {
  onSend: (content?: string, attachments?: AttachmentData[]) => Promise<void>
  conversationId: string
  disabled?: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

export function MessageInput({
  onSend,
  conversationId,
  disabled,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState<AttachmentData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend =
    !disabled &&
    !isSending &&
    (content.trim().length > 0 || attachment !== null)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > MAX_FILE_SIZE) {
        return
      }

      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('conversationId', conversationId)

        const res = await fetch('/api/messages/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const err = (await res.json()) as { error: string }
          console.error('[MessageInput] Upload error:', err.error)
          return
        }

        const data = (await res.json()) as AttachmentData
        setAttachment(data)
      } catch (err) {
        console.error('[MessageInput] Upload failed:', err)
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [conversationId]
  )

  const handleSend = useCallback(async () => {
    if (!canSend) return

    setIsSending(true)

    try {
      await onSend(
        content.trim() || undefined,
        attachment ? [attachment] : undefined
      )
      setContent('')
      setAttachment(null)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      textareaRef.current?.focus()
    } finally {
      setIsSending(false)
    }
  }, [canSend, content, attachment, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void handleSend()
      }
    },
    [handleSend]
  )

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value)
      const el = e.target
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    },
    []
  )

  return (
    <div className="border-t bg-background px-3 py-2.5">
      {/* État d'upload en cours */}
      {isUploading && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Envoi du fichier...</p>
            <p className="text-xs text-muted-foreground">
              Veuillez patienter
            </p>
          </div>
        </div>
      )}

      {/* Preview pièce jointe — riche et actionnable */}
      {attachment && !isUploading && (
        <div className="mb-3 overflow-hidden rounded-xl border bg-muted/30">
          {/* Thumbnail si image */}
          {attachment.mimeType.startsWith('image/') ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-[200px] w-full object-contain bg-black/5"
              />
              <button
                onClick={() => setAttachment(null)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                aria-label="Retirer la pièce jointe"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Preview fichier (PDF, DOCX, etc.) */
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {attachment.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {attachment.size < 1024 * 1024
                    ? `${(attachment.size / 1024).toFixed(0)} Ko`
                    : `${(attachment.size / (1024 * 1024)).toFixed(1)} Mo`}
                </p>
              </div>
              <button
                onClick={() => setAttachment(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Retirer la pièce jointe"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Barre d'action sous la preview */}
          <div className="flex items-center justify-between border-t px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Prêt à envoyer
            </p>
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-full px-4"
              onClick={() => void handleSend()}
              disabled={!canSend}
            >
              <Send className="h-3.5 w-3.5" />
              Envoyer
            </Button>
          </div>
        </div>
      )}

      {/* Barre de saisie intégrée */}
      <div className="flex items-end gap-2">
        <div className="flex min-h-[44px] flex-1 items-end rounded-2xl border bg-muted/30 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          {/* Bouton pièce jointe (dans le conteneur) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            aria-label="Ajouter une pièce jointe"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.docx,.xlsx"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
          />

          {/* Textarea (sans bordure, transparent) */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message..."
            className="max-h-[120px] min-h-[44px] flex-1 resize-none bg-transparent px-1 py-3 text-sm outline-none placeholder:text-muted-foreground"
            rows={1}
            disabled={disabled || isSending}
            aria-label="Message"
          />
        </div>

        {/* Bouton envoi (en dehors, arrondi) */}
        <Button
          size="icon"
          className="h-[44px] w-[44px] shrink-0 rounded-full"
          onClick={() => void handleSend()}
          disabled={!canSend}
          aria-label="Envoyer le message"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  )
}
