/**
 * Page Admin — Gestion des utilisateurs cross-company
 *
 * Server Component léger avec RBAC. Délègue l'affichage à UsersDataTable.
 *
 * @ticket SP-472
 */

import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'

import { UsersDataTable } from './_components/UsersDataTable'

export const metadata: Metadata = {
  title: 'Utilisateurs | SmartPlanning',
  description:
    'Administration des utilisateurs de toutes les entreprises clientes',
}

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/connexion')
  }

  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/tableau-de-bord')
  }

  return (
    <div className="space-y-6">
      <UsersDataTable />
    </div>
  )
}
