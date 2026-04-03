/**
 * Preview d'une pièce jointe dans un message
 *
 * @ticket SP-506
 */

'use client'

import { FileText, FileSpreadsheet, Download } from 'lucide-react'
import type { AttachmentData } from '@/types/messaging'

interface AttachmentPreviewProps {
  attachment: AttachmentData
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  if (isImage(attachment.mimeType)) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-[240px] overflow-hidden rounded-lg border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="h-auto max-h-[200px] w-full object-cover"
          loading="lazy"
        />
      </a>
    )
  }

  const isSpreadsheet =
    attachment.mimeType.includes('spreadsheet') ||
    attachment.name.endsWith('.xlsx') ||
    attachment.name.endsWith('.xls')

  const Icon = isSpreadsheet ? FileSpreadsheet : FileText

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/60"
    >
      <Icon className="h-8 w-8 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachment.size)}
        </p>
      </div>
      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  )
}
