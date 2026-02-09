/**
 * Page édition d'une Company (SUPER_ADMIN)
 *
 * @description Formulaire d'édition d'entreprise avec données pré-remplies.
 *
 * @ticket SP-151
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CompanyForm } from '@/components/admin/companies'
import { getCompany } from '@/lib/actions/companies'
import {
  subscriptionPlanLabels,
  subscriptionStatusLabels,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from '@/lib/validations/company'

interface EditCompanyPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: EditCompanyPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getCompany(id)

  if (!result.success || !result.data) {
    return {
      title: 'Entreprise non trouvée | SmartPlanning',
    }
  }

  return {
    title: `${result.data.name} | SmartPlanning`,
    description: `Modifier l'entreprise ${result.data.name}`,
  }
}

export default async function EditCompanyPage({
  params,
}: EditCompanyPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  const { id } = await params
  const result = await getCompany(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const company = result.data

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/admin/companies">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Retour à la liste</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {company.name}
              </h1>
              <p className="text-sm text-muted-foreground">{company.slug}</p>
            </div>
          </div>
        </div>

        {/* Badges statut */}
        <div className="flex items-center gap-2">
          <Badge variant={company.isActive ? 'default' : 'secondary'}>
            {company.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <Badge variant="outline">
            {
              subscriptionPlanLabels[
                (company.subscription?.plan ?? 'FREE') as SubscriptionPlan
              ]
            }
          </Badge>
          <Badge variant="outline">
            {
              subscriptionStatusLabels[
                (company.subscription?.status ?? 'TRIAL') as SubscriptionStatus
              ]
            }
          </Badge>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid max-w-lg grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-2xl font-bold">{company._count.users}</p>
          <p className="text-xs text-muted-foreground">Utilisateurs</p>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-2xl font-bold">{company._count.teams}</p>
          <p className="text-xs text-muted-foreground">Équipes</p>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-2xl font-bold">{company._count.employees}</p>
          <p className="text-xs text-muted-foreground">Employés</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl">
        <CompanyForm company={company} />
      </div>
    </div>
  )
}
