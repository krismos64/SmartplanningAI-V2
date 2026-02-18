/**
 * ProfileActions - Carte des actions disponibles
 *
 * Affiche les boutons d'action : modifier profil, changer mot de passe,
 * exporter données, supprimer compte.
 * Design Cyber Glass avec effet hover-lift.
 *
 * @ticket SP-270
 */

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Settings,
  Pencil,
  Lock,
  Download,
  Trash2,
  Activity,
} from 'lucide-react'

export function ProfileActions() {
  return (
    <Card className="glass hover-lift h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          asChild
          variant="default"
          className="w-full justify-start gap-2"
          data-testid="action-edit-profile"
        >
          <Link href="/app/profile/edit">
            <Pencil className="h-4 w-4" />
            Modifier mon profil
          </Link>
        </Button>

        <Button
          asChild
          variant="secondary"
          className="w-full justify-start gap-2"
          data-testid="action-change-password"
        >
          <Link href="/app/profile/password">
            <Lock className="h-4 w-4" />
            Changer mon mot de passe
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full justify-start gap-2"
          data-testid="action-export-data"
        >
          <Link href="/app/profile/export">
            <Download className="h-4 w-4" />
            Exporter mes données
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full justify-start gap-2"
          data-testid="action-view-activity"
        >
          <Link href="/app/profile/activity">
            <Activity className="h-4 w-4" />
            Mon activité récente
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          data-testid="action-delete-account"
        >
          <Link href="/app/profile/delete">
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
