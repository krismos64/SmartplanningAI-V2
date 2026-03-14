/**
 * Page liste des Employees (RBAC multi-role)
 *
 * @description Liste paginee des employes avec filtres, tri et actions CRUD.
 * Accessible a SYSTEM_ADMIN, DIRECTOR et MANAGER avec acces differencies.
 *
 * @ticket SP-152
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { EmployeesDataTable } from './_components/EmployeesDataTable'

export const metadata: Metadata = {
  title: 'Gestion des employés | SmartPlanning',
  description: 'Administration des employés et ressources humaines',
}

export default async function EmployeesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Seuls SYSTEM_ADMIN, DIRECTOR et MANAGER ont acces
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER'].includes(role)) {
    redirect('/app/dashboard')
  }

  // Determiner le role pour le RBAC
  const userRole = role as 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER'

  return (
    <div className="space-y-6">
      <EmployeesDataTable userRole={userRole} />
    </div>
  )
}
