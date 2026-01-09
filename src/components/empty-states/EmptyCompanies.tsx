import { Building2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface EmptyCompaniesProps {
  /** Si true, l'utilisateur peut créer des entreprises */
  canCreate?: boolean
}

/**
 * Empty state pour la liste des entreprises (SYSTEM_ADMIN)
 *
 * Affiché quand aucune entreprise n'est enregistrée sur la plateforme.
 * Le CTA est conditionné par les permissions de l'utilisateur.
 */
export function EmptyCompanies({ canCreate = true }: EmptyCompaniesProps) {
  return (
    <EmptyState
      icon={<Building2 className="h-12 w-12" />}
      title="Aucune entreprise"
      description={
        canCreate
          ? 'La plateforme ne compte encore aucune entreprise. Créez la première entreprise pour commencer.'
          : "Aucune entreprise n'a été trouvée avec les filtres sélectionnés."
      }
      action={
        canCreate
          ? {
              label: 'Créer une entreprise',
              href: '/app/admin/companies/new',
            }
          : undefined
      }
    />
  )
}
