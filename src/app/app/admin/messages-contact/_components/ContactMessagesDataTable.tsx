'use client'

/**
 * ContactMessagesDataTable - Demandes du formulaire de contact public
 *
 * Donnees fournies par le Server Component, pagination via searchParams URL
 * (meme pattern que le journal des emails, SP-545). Vue responsive :
 * Table desktop (md+) / Cards mobile (<md).
 *
 * Le contenu du message n'est pas tronque dans la modale : c'est la demande
 * elle-meme, et l'ecran existe pour la lire.
 *
 * @ticket SP-577
 */

import { useCallback, useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { AlertTriangle, Eye, Mail, MailOpen } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ServerPagination } from '@/components/ui/server-pagination'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  CONTACT_EMAIL_STATUS_LABELS,
  CONTACT_EMAIL_STATUS_HINTS,
  type ContactEmailStatus,
} from '@/lib/validations/contact-messages'
import { markContactMessageRead } from '@/lib/actions/admin-contact-messages'
import type {
  AdminContactMessageRow,
  GetContactMessagesAdminResult,
} from '@/lib/actions/admin-contact-messages'

// ============================================================================
// Constants & helpers
// ============================================================================

const STATUS_VARIANTS: Record<string, 'success' | 'destructive' | 'warning'> = {
  SENT: 'success',
  FAILED: 'destructive',
  PENDING: 'warning',
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function statusLabel(status: string): string {
  return CONTACT_EMAIL_STATUS_LABELS[status as ContactEmailStatus] ?? status
}

function statusHint(status: string): string | null {
  return CONTACT_EMAIL_STATUS_HINTS[status as ContactEmailStatus] ?? null
}

// ============================================================================
// Detail modal
// ============================================================================

function ContactMessageDetailModal({
  message,
  onClose,
  onToggleRead,
  isPending,
}: {
  message: AdminContactMessageRow | null
  onClose: () => void
  onToggleRead: (message: AdminContactMessageRow) => void
  isPending: boolean
}) {
  if (!message) return null

  const hint = statusHint(message.emailStatus)

  return (
    <Dialog open={message !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
          <DialogDescription>
            {message.name}, {formatDateTime(message.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={STATUS_VARIANTS[message.emailStatus] ?? 'warning'}
              size="sm"
            >
              {statusLabel(message.emailStatus)}
            </Badge>
            {message.isRead && <Badge size="sm">Traitée</Badge>}
          </div>

          {hint && message.emailStatus !== 'SENT' && (
            <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              />
              {hint}
            </p>
          )}

          <div>
            <p className="text-xs text-muted-foreground">Répondre à</p>
            <a
              href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
              className="text-sm text-primary hover:underline"
            >
              {message.email}
            </a>
          </div>

          <div>
            <p className="mb-1 text-xs text-muted-foreground">Message</p>
            <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
              {message.message}
            </p>
          </div>

          <Button
            variant={message.isRead ? 'outline' : 'default'}
            onClick={() => onToggleRead(message)}
            disabled={isPending}
            data-testid="contact-toggle-read"
          >
            {message.isRead ? 'Remettre à traiter' : 'Marquer comme traitée'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Table
// ============================================================================

export interface ContactMessagesDataTableProps {
  data: GetContactMessagesAdminResult
}

export function ContactMessagesDataTable({
  data,
}: ContactMessagesDataTableProps) {
  const { messages, total, page, totalPages } = data

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selected, setSelected] = useState<AdminContactMessageRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const goToPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(nextPage))
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const toggleRead = useCallback(
    (message: AdminContactMessageRow) => {
      startTransition(async () => {
        const result = await markContactMessageRead({
          id: message.id,
          isRead: !message.isRead,
        })

        if (!result.success) {
          toast.error(result.error ?? 'La mise à jour a échoué')
          return
        }

        toast.success(
          message.isRead ? 'Demande remise à traiter' : 'Demande traitée'
        )
        setSelected(null)
        router.refresh()
      })
    },
    [router]
  )

  return (
    <div className="space-y-4">
      {/* Table desktop (md+) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reçue le</TableHead>
              <TableHead>Expéditeur</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Notification</TableHead>
              <TableHead className="text-right">Détail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  Aucune demande pour ces filtres
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow
                  key={message.id}
                  className={cn(!message.isRead && 'font-medium')}
                >
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(message.createdAt)}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <span className="flex items-center gap-1.5">
                      {message.isRead ? (
                        <MailOpen
                          className="h-4 w-4 flex-shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      ) : (
                        <Mail
                          className="h-4 w-4 flex-shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{message.name}</span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {message.email}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate">
                    {message.subject}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        STATUS_VARIANTS[message.emailStatus] ?? 'warning'
                      }
                      size="sm"
                    >
                      {statusLabel(message.emailStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="touch-icon"
                      onClick={() => setSelected(message)}
                      data-testid="contact-message-detail-btn"
                      aria-label={`Lire la demande de ${message.name} : ${message.subject}`}
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards mobile (<md) */}
      <div className="space-y-3 md:hidden">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Aucune demande pour ces filtres
          </p>
        ) : (
          messages.map((message) => (
            <Card
              key={message.id}
              className="cursor-pointer transition-all hover:border-primary/50"
              data-testid="contact-message-card"
              onClick={() => setSelected(message)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                      {message.isRead ? (
                        <MailOpen
                          className="h-4 w-4 flex-shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      ) : (
                        <Mail
                          className="h-4 w-4 flex-shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{message.subject}</span>
                    </span>
                    <Badge
                      variant={
                        STATUS_VARIANTS[message.emailStatus] ?? 'warning'
                      }
                      size="sm"
                    >
                      {statusLabel(message.emailStatus)}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {message.name}, {message.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ServerPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPrevious={() => goToPage(page - 1)}
        onNext={() => goToPage(page + 1)}
      />

      <ContactMessageDetailModal
        message={selected}
        onClose={() => setSelected(null)}
        onToggleRead={toggleRead}
        isPending={isPending}
      />
    </div>
  )
}
