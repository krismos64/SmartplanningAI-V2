import { UsersRound } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface EmptyTeamsProps {
  /** Si true, l'utilisateur peut créer des équipes */
  canCreate?: boolean
}

/**
 * Empty state pour la liste des équipes (DIRECTOR)
 *
 * Affiché quand aucune équipe n'existe dans l'entreprise.
 * Le CTA est conditionné par les permissions de l'utilisateur.
 */
export function EmptyTeams({ canCreate = true }: EmptyTeamsProps) {
  return (
    <EmptyState
      icon={<UsersRound className="h-12 w-12" />}
      title="Aucune équipe"
      description={
        canCreate
          ? 'Organisez vos collaborateurs en équipes pour faciliter la gestion des plannings. Créez votre première équipe pour commencer.'
          : "Aucune équipe n'a été trouvée avec les filtres sélectionnés."
      }
      action={
        canCreate
          ? {
              label: 'Créer une équipe',
              href: '/app/director/teams/new',
            }
          : undefined
      }
    />
  )
}
