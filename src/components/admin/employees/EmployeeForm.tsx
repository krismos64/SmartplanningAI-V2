/**
 * Formulaire creation/edition Employee
 *
 * @description Formulaire React Hook Form + Zod pour CRUD Employees.
 * Utilise les composants forms existants et hooks CRUD.
 * Adapte au RBAC : equipes filtrees selon le role.
 *
 * @ticket SP-152
 * @see Context7 - React Hook Form + Zod validation patterns
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { User, Phone, Briefcase, Users, Calendar, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useCrudMutation } from '@/hooks/use-crud-mutation'
import {
  departmentLabels,
  weeklyHoursOptions,
  type Department,
  type EmployeeWithCounts,
} from '@/lib/validations/employee'
import { createEmployee, updateEmployee } from '@/lib/actions/employees'

// ============================================================================
// Types
// ============================================================================

interface TeamOption {
  id: string
  name: string
}

interface EmployeeFormProps {
  /** Employee existant pour edition (undefined = creation) */
  employee?: EmployeeWithCounts
  /** ID de l'entreprise (requis pour creation) */
  companyId: string
  /** Liste des equipes disponibles (filtrees selon RBAC) */
  teams?: TeamOption[]
  /** Role de l'utilisateur connecte */
  userRole?: 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER'
  /** Callback apres succes */
  onSuccess?: () => void
  /** Callback apres annulation */
  onCancel?: () => void
}

// Schema simplifie pour le formulaire
const employeeFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prenom doit contenir au moins 2 caracteres')
    .max(50),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(50),
  jobTitle: z.string().max(100).optional().or(z.literal('')),
  department: z
    .enum([
      'DIRECTION',
      'RESSOURCES_HUMAINES',
      'COMMERCIAL',
      'MARKETING',
      'TECHNIQUE',
      'PRODUCTION',
      'LOGISTIQUE',
      'FINANCE',
      'JURIDIQUE',
      'SUPPORT',
      'AUTRE',
    ])
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  hireDate: z.string().optional().or(z.literal('')),
  weeklyHours: z.number().min(1).max(60),
  teamId: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

// ============================================================================
// Composant
// ============================================================================

export function EmployeeForm({
  employee,
  companyId,
  teams = [],
  userRole = 'DIRECTOR',
  onSuccess,
  onCancel,
}: EmployeeFormProps) {
  const router = useRouter()
  const isEditing = !!employee

  // Hook mutation pour create
  const createMutation = useCrudMutation(createEmployee, {
    successMessage: 'Employe cree avec succes',
    onSuccess: () => {
      onSuccess?.()
      router.push('/dashboard/employees')
      router.refresh()
    },
  })

  // Hook mutation pour update
  const updateMutation = useCrudMutation(updateEmployee, {
    successMessage: 'Employe modifie avec succes',
    onSuccess: () => {
      onSuccess?.()
      router.push('/dashboard/employees')
      router.refresh()
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  // Initialisation du formulaire
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: isEditing
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          jobTitle: employee.jobTitle || '',
          department: (employee.department as Department) || '',
          phone: employee.phone || '',
          hireDate: employee.hireDate
            ? new Date(employee.hireDate).toISOString().split('T')[0]
            : '',
          weeklyHours: employee.weeklyHours,
          teamId: employee.teamId || '',
          isActive: employee.isActive,
        }
      : {
          firstName: '',
          lastName: '',
          jobTitle: '',
          department: '',
          phone: '',
          hireDate: '',
          weeklyHours: 35,
          teamId: '',
          isActive: true,
        },
  })

  // Pour MANAGER: pre-selectionner une equipe s'il n'en a qu'une
  useEffect(() => {
    if (
      !isEditing &&
      userRole === 'MANAGER' &&
      teams.length === 1 &&
      teams[0]
    ) {
      form.setValue('teamId', teams[0].id)
    }
  }, [isEditing, userRole, teams, form])

  // Soumission du formulaire
  const onSubmit = (data: EmployeeFormValues) => {
    // Nettoyer les champs vides
    const cleanedData = {
      firstName: data.firstName,
      lastName: data.lastName,
      weeklyHours: data.weeklyHours,
      isActive: data.isActive,
      skills: [] as string[], // Valeur par defaut
      jobTitle: data.jobTitle || undefined,
      department: data.department || undefined,
      phone: data.phone || undefined,
      hireDate: data.hireDate || undefined,
      teamId: data.teamId || undefined,
    }

    if (isEditing && employee) {
      void updateMutation.mutate({ id: employee.id, ...cleanedData })
    } else {
      void createMutation.mutate({ companyId, ...cleanedData })
    }
  }

  // Pour MANAGER: l'equipe est obligatoire
  const isTeamRequired = userRole === 'MANAGER'

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="space-y-8"
      >
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Prenom */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prenom *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jean"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nom */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dupont"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Telephone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telephone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        className="pl-10"
                        {...field}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Format: 0612345678 ou +33612345678
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Poste */}
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intitule du poste</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Developpeur Full-Stack"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Departement */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departement</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectionner un departement" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(departmentLabels) as Department[]).map(
                            (dept) => (
                              <SelectItem key={dept} value={dept}>
                                {departmentLabels[dept]}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Equipe */}
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipe {isTeamRequired && '*'}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={
                          isPending ||
                          (userRole === 'MANAGER' && teams.length === 1)
                        }
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Selectionner une equipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  {isTeamRequired && (
                    <FormDescription>
                      En tant que manager, l&apos;equipe est obligatoire
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Date d'embauche */}
              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d&apos;embauche</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="date"
                          className="pl-10"
                          {...field}
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Heures hebdomadaires */}
              <FormField
                control={form.control}
                name="weeklyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heures hebdomadaires *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Select
                          onValueChange={(v) => field.onChange(Number(v))}
                          value={String(field.value)}
                          disabled={isPending}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Heures/semaine" />
                          </SelectTrigger>
                          <SelectContent>
                            {weeklyHoursOptions.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={String(opt.value)}
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Statut */}
        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Employe actif</FormLabel>
                    <FormDescription>
                      Un employe inactif n&apos;apparait plus dans les plannings
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel ?? (() => router.back())}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? 'Modification...'
                : 'Creation...'
              : isEditing
                ? 'Modifier'
                : "Creer l'employe"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
