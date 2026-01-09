import { Users } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface EmptyEmployeesProps {
  /** Si true, l'utilisateur peut créer des employés */
  canCreate?: boolean
}

/**
 * Empty state pour la liste des employés (DIRECTOR, MANAGER)
 *
 * Affiché quand aucun employé n'est trouvé.
 * Le CTA est conditionné par les permissions de l'utilisateur.
 */
export function EmptyEmployees({ canCreate = true }: EmptyEmployeesProps) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="Aucun employé"
      description={
        canCreate
          ? 'Votre entreprise ne compte encore aucun collaborateur. Ajoutez votre premier employé pour commencer.'
          : "Aucun employé n'a été trouvé avec les filtres sélectionnés."
      }
      action={
        canCreate
          ? {
              label: 'Ajouter un employé',
              href: '/app/dashboard/employees/new',
            }
          : undefined
      }
    />
  )
}
