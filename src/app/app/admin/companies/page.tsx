/**
 * Page liste des Companies (SUPER_ADMIN)
 *
 * @description Liste paginée des entreprises avec filtres, tri et actions CRUD.
 * Server Component avec DataTable TanStack.
 *
 * @ticket SP-151
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'

import { CompaniesDataTable } from './_components/CompaniesDataTable'

export const metadata: Metadata = {
  title: 'Gestion des entreprises | SmartPlanning',
  description: 'Administration des entreprises et abonnements SaaS',
}

export default async function CompaniesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/connexion')
  }

  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  return (
    <div className="space-y-6">
      <CompaniesDataTable />
    </div>
  )
}
