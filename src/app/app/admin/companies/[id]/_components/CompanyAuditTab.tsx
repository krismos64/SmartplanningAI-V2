/**
 * CompanyAuditTab — Journal d'audit filtré sur l'entreprise
 *
 * Server Component (async, appelé dans un Suspense boundary depuis page.tsx).
 * Réutilise getAuditLogs filtré par companyId (SP-546), affichage compact
 * (10 dernières entrées) avec lien vers la vue complète pré-filtrée.
 *
 * @ticket SP-546
 */

import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAuditLogs } from '@/lib/actions/audit-logs'
import { AuditActionBadge } from '../../../logs/_components/audit-action-badge'

export interface CompanyAuditTabProps {
  companyId: string
}

export async function CompanyAuditTab({ companyId }: CompanyAuditTabProps) {
  const result = await getAuditLogs({ companyId, pageSize: 10 })

  const logs = result.success ? result.data.data : []
  const total = result.success ? result.data.total : 0

  return (
    <Card data-testid="company-audit-tab">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          Activité récente {total > 0 && `(${total})`}
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/app/admin/logs?companyId=${companyId}`}>
            Voir tout le journal
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!result.success ? (
          <p className="text-sm text-destructive">{result.error}</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune activité enregistrée pour cette entreprise
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Utilisateur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>
                      <AuditActionBadge action={log.action} />
                    </TableCell>
                    <TableCell className="text-sm">{log.entityType}</TableCell>
                    <TableCell className="text-sm">
                      {log.user.name ?? log.user.email}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
