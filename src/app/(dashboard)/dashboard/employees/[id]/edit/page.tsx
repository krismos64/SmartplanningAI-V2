/**
 * Page edition d'un Employee
 *
 * @description Formulaire d'edition d'employe avec RBAC.
 * Accessible a SYSTEM_ADMIN, DIRECTOR et MANAGER.
 *
 * @ticket SP-152
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCog } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmployeeForm } from '@/components/admin/employees'
import { getEmployee, getTeamsForSelect } from '@/lib/actions/employees'
import type { EmployeeWithCounts } from '@/lib/validations/employee'

interface EditEmployeePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: EditEmployeePageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getEmployee(id)

  if (!result.success || !result.data) {
    return { title: 'Employe non trouve | SmartPlanning' }
  }

  return {
    title: `Modifier ${result.data.firstName} ${result.data.lastName} | SmartPlanning`,
    description: `Modification du profil de ${result.data.firstName} ${result.data.lastName}`,
  }
}

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  // Seuls SYSTEM_ADMIN, DIRECTOR et MANAGER ont acces
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER'].includes(role)) {
    redirect('/dashboard')
  }

  // Charger l'employe
  const result = await getEmployee(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const employee = result.data as EmployeeWithCounts

  // Charger les equipes disponibles
  const teamsResult = await getTeamsForSelect()
  const teams = teamsResult.success ? teamsResult.data || [] : []

  // CompanyId de l'employe
  const companyId = employee.companyId

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/employees/${employee.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Modifier {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Mettre a jour les informations de l&apos;employe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="mx-auto max-w-3xl">
        <EmployeeForm
          employee={employee}
          companyId={companyId}
          teams={teams}
          userRole={role as 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER'}
        />
      </div>
    </div>
  )
}
