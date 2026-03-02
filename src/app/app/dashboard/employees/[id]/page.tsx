/**
 * Page detail d'un Employee
 *
 * @description Affichage des informations detaillees d'un employe.
 * Avec actions edit/delete selon RBAC.
 *
 * @ticket SP-152
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft,
  User,
  Pencil,
  Phone,
  Mail,
  Users,
  Calendar,
  Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getEmployee } from '@/lib/actions/employees'

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: EmployeeDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getEmployee(id)

  if (!result.success || !result.data) {
    return { title: 'Employé non trouvé | SmartPlanning' }
  }

  return {
    title: `${result.data.firstName} ${result.data.lastName} | SmartPlanning`,
    description: `Profil de ${result.data.firstName} ${result.data.lastName}`,
  }
}

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  // Seuls SYSTEM_ADMIN, DIRECTOR et MANAGER ont acces
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER'].includes(role)) {
    redirect('/app/dashboard')
  }

  // Charger l'employe
  const result = await getEmployee(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const employee = result.data

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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {employee.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={employee.user.image}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={employee.isActive ? 'default' : 'secondary'}>
            {employee.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <Button asChild>
            <Link href={`/app/dashboard/employees/${employee.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Prenom</p>
              <p className="font-medium">{employee.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nom</p>
              <p className="font-medium">{employee.lastName}</p>
            </div>
          </div>

          {(employee.email || employee.user?.email) && (
            <a
              href={`mailto:${employee.email || employee.user?.email}`}
              className="flex items-center gap-2 hover:underline"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee.email || employee.user?.email}</span>
            </a>
          )}

          {employee.phone && (
            <a
              href={`tel:${employee.phone}`}
              className="flex items-center gap-2 hover:underline"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{employee.phone}</span>
            </a>
          )}

          {employee.team && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{employee.team.name}</span>
            </div>
          )}

          {employee.hireDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(employee.hireDate), 'dd MMMM yyyy', {
                  locale: fr,
                })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{employee.weeklyHours}h/semaine</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
