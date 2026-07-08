'use client'

/**
 * EmailLogsDataTable — Journal des emails cross-company
 *
 * Données fournies par le Server Component (pattern audit-logs) :
 * pagination via searchParams URL, modal de détail des métadonnées
 * (message d'erreur SMTP, messageId).
 * Vue responsive : Table desktop (md+) / Cards mobile (<md).
 *
 * @ticket SP-545
 */

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Building2, Eye, Mail } from 'lucide-react'

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
import {
  getEmailTypeLabel,
  getEmailTypeCategory,
  EMAIL_CATEGORY_LABELS,
} from '@/lib/validations/email-logs'
import type {
  AdminEmailLogRow,
  GetEmailLogsAdminResult,
} from '@/lib/actions/admin-email-logs'

// ============================================================================
// Constants & helpers
// ============================================================================

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'destructive' | 'warning' }
> = {
  SENT: { label: 'Envoyé', variant: 'success' },
  FAILED: { label: 'Échoué', variant: 'destructive' },
  BOUNCED: { label: 'Rejeté', variant: 'warning' },
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function statusConfig(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, variant: 'warning' as const }
}

// ============================================================================
// Detail modal
// ============================================================================

function EmailLogDetailModal({
  log,
  onClose,
}: {
  log: AdminEmailLogRow | null
  onClose: () => void
}) {
  const category = log ? getEmailTypeCategory(log.emailType) : null

  return (
    <Dialog open={log !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="email-log-detail-modal">
        <DialogHeader>
          <DialogTitle>
            {log ? getEmailTypeLabel(log.emailType) : ''}
          </DialogTitle>
          <DialogDescription>
            {log ? `Envoyé le ${formatDateTime(log.sentAt)}` : ''}
          </DialogDescription>
        </DialogHeader>
        {log && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Destinataire</span>
              <span className="break-all">{log.recipientEmail}</span>
              <span className="text-muted-foreground">Entreprise</span>
              <span>{log.companyName}</span>
              <span className="text-muted-foreground">Type technique</span>
              <span className="break-all font-mono text-xs">
                {log.emailType}
              </span>
              {category && (
                <>
                  <span className="text-muted-foreground">Catégorie</span>
                  <span>{EMAIL_CATEGORY_LABELS[category]}</span>
                </>
              )}
              <span className="text-muted-foreground">Statut</span>
              <span>
                <Badge variant={statusConfig(log.status).variant} size="sm">
                  {statusConfig(log.status).label}
                </Badge>
              </span>
            </div>

            {/* Métadonnées (messageId, erreur SMTP…) */}
            {log.metadata !== null && log.metadata !== undefined && (
              <div>
                <p className="mb-1 text-muted-foreground">Métadonnées</p>
                <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Component
// ============================================================================

export interface EmailLogsDataTableProps {
  data: GetEmailLogsAdminResult
}

export function EmailLogsDataTable({ data }: EmailLogsDataTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selectedLog, setSelectedLog] = useState<AdminEmailLogRow | null>(null)

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page <= 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const { logs, total, page, totalPages } = data

  return (
    <div className="space-y-4" data-testid="email-logs-table">
      {/* Compteur */}
      <p className="text-sm text-muted-foreground">
        {total} email{total > 1 ? 's' : ''} tracé{total > 1 ? 's' : ''}
      </p>

      {/* Table desktop (md+) */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Détail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun email tracé pour ces filtres
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const config = statusConfig(log.status)
                return (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(log.sentAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getEmailTypeLabel(log.emailType)}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {log.recipientEmail}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/app/admin/companies/${log.companyId}`}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Building2 className="h-3 w-3" aria-hidden="true" />
                        {log.companyName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} size="sm">
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="touch-icon"
                        onClick={() => setSelectedLog(log)}
                        data-testid="email-log-detail-btn"
                        aria-label={`Détail de l'email ${getEmailTypeLabel(log.emailType)} à ${log.recipientEmail}`}
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards mobile (<md) */}
      <div className="space-y-3 md:hidden">
        {logs.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Aucun email tracé pour ces filtres
          </p>
        ) : (
          logs.map((log) => {
            const config = statusConfig(log.status)
            return (
              <Card
                key={log.id}
                className="cursor-pointer transition-all hover:border-primary/50"
                data-testid="email-log-card"
                onClick={() => setSelectedLog(log)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                        <Mail
                          className="h-4 w-4 flex-shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {getEmailTypeLabel(log.emailType)}
                        </span>
                      </span>
                      <Badge variant={config.variant} size="sm">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {log.recipientEmail}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{log.companyName}</span>
                      <span className="flex-shrink-0">
                        {formatDateTime(log.sentAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination URL (composant partagé SP-547) */}
      <ServerPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPrevious={() => goToPage(page - 1)}
        onNext={() => goToPage(page + 1)}
      />

      {/* Modal détail */}
      <EmailLogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  )
}
