/**
 * Page creation d'un Employee
 *
 * @description Formulaire de creation d'employe avec RBAC.
 * Accessible a SYSTEM_ADMIN, DIRECTOR et MANAGER.
 *
 * @ticket SP-152
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmployeeForm } from '@/components/admin/employees'
import { getTeamsForSelect } from '@/lib/actions/employees'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Nouvel employé | SmartPlanning',
  description: 'Créer un nouvel employé',
}

export default async function NewEmployeePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Seuls SYSTEM_ADMIN, DIRECTOR et MANAGER ont acces
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER'].includes(role)) {
    redirect('/app/dashboard')
  }

  // Charger les equipes disponibles
  const teamsResult = await getTeamsForSelect()
  const teams = teamsResult.success ? teamsResult.data || [] : []

  // CompanyId pour la creation
  const companyId = session.user.companyId || ''

  // SYSTEM_ADMIN n'a pas de companyId, il doit en choisir un
  if (role === 'SYSTEM_ADMIN' && !companyId) {
    // Pour l'instant, rediriger vers la liste
    // Hors scope CDA — ajout select entreprise post-soutenance
    redirect('/app/dashboard/employees')
  }

  // Pour le DIRECTOR : récupérer les infos billing pour l'avertissement prorata
  let billingInfo:
    | {
        employeeCount: number
        monthlyAmount: number
        hasActiveSubscription: boolean
      }
    | undefined

  if (role === 'DIRECTOR' && companyId) {
    const [subscription, employeeCount] = await Promise.all([
      prisma.subscription.findUnique({
        where: { companyId },
        select: { status: true, quantity: true, pricePerEmployee: true },
      }),
      prisma.employee.count({
        where: { companyId, isActive: true },
      }),
    ])

    const hasActiveSubscription =
      !!subscription && ['ACTIVE', 'PAST_DUE'].includes(subscription.status)

    if (hasActiveSubscription && subscription) {
      billingInfo = {
        employeeCount,
        monthlyAmount:
          (subscription.quantity * subscription.pricePerEmployee) / 100,
        hasActiveSubscription: true,
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/dashboard/employees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Nouvel employé
              </h1>
              <p className="text-sm text-muted-foreground">
                Créer un nouveau profil employé
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="mx-auto max-w-3xl">
        <EmployeeForm
          companyId={companyId}
          teams={teams}
          userRole={role as 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER'}
          billingInfo={billingInfo}
        />
      </div>
    </div>
  )
}
