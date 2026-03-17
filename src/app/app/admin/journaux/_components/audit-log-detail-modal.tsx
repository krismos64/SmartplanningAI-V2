'use client'

/**
 * Modal de détail d'un log d'audit (affiche le JSON details)
 *
 * @ticket SP-445
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AuditActionBadge, ENTITY_TYPE_LABELS } from './audit-action-badge'
import type { AuditLogEntry } from '@/types/audit'

interface AuditLogDetailModalProps {
  log: AuditLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailModal({
  log,
  open,
  onOpenChange,
}: AuditLogDetailModalProps) {
  if (!log) return null

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(new Date(log.createdAt))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Détail du log d&apos;audit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Infos principales */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Date</p>
              <p>{formattedDate}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Action</p>
              <AuditActionBadge action={log.action} />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Utilisateur</p>
              <p>{log.user.name ?? log.user.email}</p>
              <p className="text-xs text-muted-foreground">{log.user.email}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Entité</p>
              <p>
                {ENTITY_TYPE_LABELS[log.entityType] ?? log.entityType}
                {log.entityId && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({log.entityId.slice(0, 8)}...)
                  </span>
                )}
              </p>
            </div>
            {log.company && (
              <div className="col-span-2">
                <p className="font-medium text-muted-foreground">Entreprise</p>
                <p>{log.company.name}</p>
              </div>
            )}
          </div>

          {/* Détails JSON */}
          {log.details && Object.keys(log.details).length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Détails
              </p>
              <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
