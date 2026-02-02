/**
 * AccountInfoCard - Carte des informations du compte
 *
 * Affiche le statut du compte, vérification email, date de création
 * et dernière connexion.
 * Design Cyber Glass avec effet hover-lift.
 *
 * @ticket SP-270
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { InfoRow } from './InfoRow'

interface AccountInfoCardProps {
  createdAt: Date
  lastLoginAt: Date | null
  emailVerified: Date | null
  isActive: boolean
}

export function AccountInfoCard({
  createdAt,
  lastLoginAt,
  emailVerified,
  isActive,
}: AccountInfoCardProps) {
  return (
    <Card className="glass hover-lift h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Informations du compte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Statut du compte
          </span>
          <Badge
            variant={isActive ? 'default' : 'destructive'}
            data-testid="account-status"
          >
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Email vérifié</span>
          {emailVerified ? (
            <span
              className="flex items-center gap-1 text-green-600"
              data-testid="email-verified"
            >
              <CheckCircle className="h-4 w-4" />
              Oui
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-destructive"
              data-testid="email-not-verified"
            >
              <XCircle className="h-4 w-4" />
              Non
            </span>
          )}
        </div>

        <InfoRow
          icon={<Calendar className="h-4 w-4" />}
          label="Membre depuis"
          value={format(new Date(createdAt), 'dd MMMM yyyy', { locale: fr })}
          testId="account-created"
        />

        <InfoRow
          icon={<Clock className="h-4 w-4" />}
          label="Dernière connexion"
          value={
            lastLoginAt
              ? formatDistanceToNow(new Date(lastLoginAt), {
                  addSuffix: true,
                  locale: fr,
                })
              : 'Jamais'
          }
          testId="account-lastlogin"
        />
      </CardContent>
    </Card>
  )
}
