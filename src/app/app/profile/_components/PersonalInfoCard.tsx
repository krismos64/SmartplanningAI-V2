/**
 * PersonalInfoCard - Carte des informations personnelles
 *
 * Affiche email, téléphone et nom complet de l'utilisateur.
 * Design Cyber Glass avec effet hover-lift.
 *
 * @ticket SP-270
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone } from 'lucide-react'
import { InfoRow } from './InfoRow'
import { formatPhoneDisplay } from '@/lib/validations/common'

interface PersonalInfoCardProps {
  email: string
  phone: string | null | undefined
  firstName: string | undefined
  lastName: string | undefined
}

export function PersonalInfoCard({
  email,
  phone,
  firstName,
  lastName,
}: PersonalInfoCardProps) {
  return (
    <Card className="glass hover-lift h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {firstName && lastName && (
          <InfoRow
            label="Nom complet"
            value={`${firstName} ${lastName}`}
            testId="personal-fullname"
          />
        )}
        <InfoRow
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={email}
          testId="personal-email"
        />
        <InfoRow
          icon={<Phone className="h-4 w-4" />}
          label="Téléphone"
          value={phone ? formatPhoneDisplay(phone) : 'Non renseigné'}
          testId="personal-phone"
        />
      </CardContent>
    </Card>
  )
}
