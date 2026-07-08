/**
 * CompanyUsersTab — Liste des utilisateurs de l'entreprise
 *
 * Server Component (async, appelé dans un Suspense boundary depuis page.tsx).
 * Réutilise getAllUsersAdmin filtré par companyId (SP-546).
 *
 * @ticket SP-546
 */

import Link from 'next/link'
import { BadgeCheck, BadgeX } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAllUsersAdmin } from '@/lib/actions/admin-users'
import { ROLE_LABELS_SHORT, ROLE_BADGE_VARIANTS } from '@/lib/permissions'

export interface CompanyUsersTabProps {
  companyId: string
}

export async function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
  const result = await getAllUsersAdmin({ companyId, pageSize: 50 })

  return (
    <Card data-testid="company-users-tab">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          Utilisateurs ({result.total})
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/admin/users">Voir tous les utilisateurs</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {result.users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun utilisateur pour cette entreprise
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Vérifié</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_BADGE_VARIANTS[user.role]} size="sm">
                        {ROLE_LABELS_SHORT[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <BadgeCheck
                          className="h-4 w-4 text-emerald-600"
                          aria-label="Email vérifié"
                        />
                      ) : (
                        <BadgeX
                          className="h-4 w-4 text-amber-600"
                          aria-label="Email non vérifié"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="success" size="sm">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="destructive" size="sm">
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR')
                        : '—'}
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
