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
  Briefcase,
  Users,
  Calendar,
  Clock,
  Building2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getEmployee } from '@/lib/actions/employees'
import { departmentLabels, type Department } from '@/lib/validations/employee'

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: EmployeeDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getEmployee(id)

  if (!result.success || !result.data) {
    return { title: 'Employe non trouve | SmartPlanning' }
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
    redirect('/dashboard')
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
            <Link href="/dashboard/employees">
              <ArrowLeft className="h-4 w-4 mr-2" />
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
              <p className="text-sm text-muted-foreground">
                {employee.jobTitle || 'Poste non defini'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={employee.isActive ? 'default' : 'secondary'}>
            {employee.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <Button asChild>
            <Link href={`/dashboard/employees/${employee.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
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

            {employee.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{employee.phone}</span>
              </div>
            )}

            {employee.user?.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{employee.user.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations professionnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.jobTitle && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{employee.jobTitle}</span>
              </div>
            )}

            {employee.department && (
              <div>
                <p className="text-sm text-muted-foreground">Departement</p>
                <Badge variant="outline">
                  {departmentLabels[employee.department as Department]}
                </Badge>
              </div>
            )}

            {employee.team && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{employee.team.name}</span>
              </div>
            )}

            {employee.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{employee.company.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contrat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Contrat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.hireDate && (
              <div>
                <p className="text-sm text-muted-foreground">Date d&apos;embauche</p>
                <p className="font-medium">
                  {format(new Date(employee.hireDate), 'dd MMMM yyyy', {
                    locale: fr,
                  })}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{employee.weeklyHours}h/semaine</span>
            </div>
          </CardContent>
        </Card>

        {/* Competences */}
        {employee.skills && employee.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Competences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
