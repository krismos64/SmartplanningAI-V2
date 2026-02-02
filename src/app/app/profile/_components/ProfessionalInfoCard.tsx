/**
 * ProfessionalInfoCard - Carte des informations professionnelles
 *
 * Affiche poste, département, équipe, date d'embauche et heures contractuelles.
 * Design Cyber Glass avec effet hover-lift.
 *
 * @ticket SP-270
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Building2, Users, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { InfoRow } from './InfoRow'

interface ProfessionalInfoCardProps {
  jobTitle: string | null
  department: string | null
  team: { id: string; name: string } | null
  hireDate: Date | null
  weeklyHours: number
}

export function ProfessionalInfoCard({
  jobTitle,
  department,
  team,
  hireDate,
  weeklyHours,
}: ProfessionalInfoCardProps) {
  return (
    <Card className="glass hover-lift h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Informations professionnelles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoRow
          icon={<Briefcase className="h-4 w-4" />}
          label="Poste"
          value={jobTitle || 'Non renseigné'}
          testId="pro-jobtitle"
        />
        <InfoRow
          icon={<Building2 className="h-4 w-4" />}
          label="Département"
          value={department || 'Non renseigné'}
          testId="pro-department"
        />
        <InfoRow
          icon={<Users className="h-4 w-4" />}
          label="Équipe"
          value={team?.name || 'Aucune équipe'}
          testId="pro-team"
        />
        <InfoRow
          icon={<Calendar className="h-4 w-4" />}
          label="Date d'embauche"
          value={
            hireDate
              ? format(new Date(hireDate), 'dd MMMM yyyy', { locale: fr })
              : 'Non renseignée'
          }
          testId="pro-hiredate"
        />
        <InfoRow
          icon={<Clock className="h-4 w-4" />}
          label="Heures hebdomadaires"
          value={`${weeklyHours}h`}
          testId="pro-hours"
        />
      </CardContent>
    </Card>
  )
}
