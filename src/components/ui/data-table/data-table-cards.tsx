/**
 * DataTableCards - Layout cards pour mobile
 *
 * ✅ Source : Responsive patterns + Shadcn Card (Context7)
 *
 * OBJECTIF :
 * Affichage en cards verticales pour écrans < 768px
 * Alternative au tableau pour une meilleure UX mobile
 *
 * FONCTIONNALITÉS :
 * - Card par ligne avec toutes les données
 * - Checkbox + Actions dans le header
 * - Badges pour Role et Status
 * - Date formatée lisiblement
 * - Même logique de tri/filtres/pagination
 */

'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DataTableRowActions } from './data-table-row-actions'
import type { DataTableCardsProps } from './data-table-types'

export function DataTableCards<TData>({
  table,
  onView,
  onEdit,
  onDelete,
}: DataTableCardsProps<TData>) {
  const rows = table.getRowModel().rows

  if (rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const data = row.original as any // eslint-disable-line @typescript-eslint/no-explicit-any

        return (
          <Card key={row.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-start gap-3">
                {/* Checkbox de sélection */}
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Sélectionner la ligne"
                  className="mt-1"
                />

                <div>
                  {/* Titre : Name */}
                  <CardTitle className="text-base">
                    {data.name || 'Sans nom'}
                  </CardTitle>

                  {/* Description : Email */}
                  <CardDescription className="mt-1">
                    {data.email || 'Pas d\'email'}
                  </CardDescription>
                </div>
              </div>

              {/* Actions dropdown */}
              <DataTableRowActions
                row={row}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Badges Role et Status */}
              <div className="flex flex-wrap gap-2">
                {data.role && (
                  <Badge variant="secondary" className="text-xs">
                    {data.role}
                  </Badge>
                )}

                {data.status && (
                  <Badge
                    variant={
                      data.status === 'active' || data.status === 'actif'
                        ? 'default'
                        : 'destructive'
                    }
                    className="text-xs"
                  >
                    {data.status}
                  </Badge>
                )}
              </div>

              {/* Date de création */}
              {data.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Créé le{' '}
                  {new Date(data.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}

              {/* ID (si présent) */}
              {data.id && (
                <p className="text-xs text-muted-foreground">ID : {data.id}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
