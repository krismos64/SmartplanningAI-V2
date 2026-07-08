/**
 * Page détail d'une Company (SUPER_ADMIN)
 *
 * @description Fiche entreprise en onglets : Informations / Abonnement /
 * Utilisateurs / Audit. Chaque onglet est un Suspense boundary indépendant
 * (chargement parallèle, pas de re-fetch au changement d'onglet). L'onglet
 * actif est piloté par `?tab=` (deep-link bookmarkable).
 *
 * @ticket SP-151, SP-546
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CompanyForm } from '@/components/admin/companies'
import { ContactModal } from './_components/ContactModal'
import { CompanyDetailTabs } from './_components/CompanyDetailTabs'
import { CompanySubscriptionTab } from './_components/CompanySubscriptionTab'
import { CompanyUsersTab } from './_components/CompanyUsersTab'
import { CompanyAuditTab } from './_components/CompanyAuditTab'
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

function TabSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Chargement">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
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

      {/* Contact admin (SP-474) */}
      <div className="flex justify-end">
        <ContactModal companyId={company.id} companyName={company.name} />
      </div>

      {/* Onglets (SP-546) */}
      <CompanyDetailTabs
        infos={
          <div className="max-w-2xl">
            <CompanyForm company={company} />
          </div>
        }
        subscription={
          <Suspense fallback={<TabSkeleton />}>
            <CompanySubscriptionTab companyId={company.id} />
          </Suspense>
        }
        users={
          <Suspense fallback={<TabSkeleton />}>
            <CompanyUsersTab companyId={company.id} />
          </Suspense>
        }
        audit={
          <Suspense fallback={<TabSkeleton />}>
            <CompanyAuditTab companyId={company.id} />
          </Suspense>
        }
      />
    </div>
  )
}
