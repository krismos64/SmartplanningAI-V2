/**
 * Bulle de message individuelle
 *
 * Supporte le groupement de messages consécutifs du même auteur.
 *
 * @ticket SP-506
 */

'use client'

import { Loader2 } from 'lucide-react'
import { AttachmentPreview } from './AttachmentPreview'
import type { MessageWithSender } from '@/types/messaging'

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
  /** Premier message d'un groupe (affiche le nom) */
  isFirstInGroup?: boolean
  /** Message groupé avec le précédent (espacement réduit, pas de nom) */
  isGrouped?: boolean
  /** Dernier message d'un groupe (affiche le timestamp) */
  isLastInGroup?: boolean
}

function formatTime(date: Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({
  message,
  isOwn,
  isFirstInGroup = true,
  isGrouped = false,
  isLastInGroup = true,
}: MessageBubbleProps) {
  const isTempMessage = message.id.startsWith('temp-')
  const attachments = message.attachments ?? []

  // Coins de la bulle selon la position dans le groupe
  const roundedClass = isOwn
    ? isGrouped && !isFirstInGroup
      ? 'rounded-2xl rounded-tr-md' // Suite de groupe, coin TR carré
      : 'rounded-2xl'
    : isGrouped && !isFirstInGroup
      ? 'rounded-2xl rounded-tl-md' // Suite de groupe, coin TL carré
      : 'rounded-2xl'

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] space-y-0.5 sm:max-w-[85%] lg:max-w-[70%] ${isTempMessage ? 'opacity-60' : ''}`}
      >
        {/* Nom du sender (premier message du groupe uniquement) */}
        {!isOwn && isFirstInGroup && !message.isDeleted && (
          <p className="px-1 text-xs text-muted-foreground">
            {message.sender?.name ?? (
              <span className="italic">Utilisateur supprimé</span>
            )}
          </p>
        )}

        {/* Bulle */}
        <div
          className={`${roundedClass} px-4 py-2.5 ${
            isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {message.isDeleted ? (
            <p className="text-sm italic opacity-60">
              Ce message a été supprimé
            </p>
          ) : (
            <>
              {message.content && (
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                  {message.content}
                </p>
              )}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((att, i) => (
                    <AttachmentPreview key={i} attachment={att} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Timestamp — uniquement sur le dernier message du groupe */}
        {isLastInGroup && (
          <div
            className={`flex items-center gap-1 px-1 ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}
          >
            <span className="text-[10px] text-muted-foreground/70">
              {formatTime(message.createdAt)}
            </span>
            {isTempMessage && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
