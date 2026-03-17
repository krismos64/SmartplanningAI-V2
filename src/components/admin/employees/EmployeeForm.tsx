/**
 * Formulaire creation/edition Employee
 *
 * @description Formulaire React Hook Form + Zod pour CRUD Employees.
 * Utilise les composants forms existants et hooks CRUD.
 * Adapte au RBAC : equipes filtrees selon le role.
 * Inclut le systeme d'invitation avec selecteur de role et encarts pedagogiques.
 *
 * @ticket SP-152
 * @see Context7 - React Hook Form + Zod validation patterns
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Users,
  Calendar,
  Clock,
  Info,
  Shield,
  UserCog,
  Crown,
  AlertTriangle,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

import { useIsImpersonating } from '@/hooks'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import { type EmployeeWithCounts } from '@/lib/validations/employee'
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
  /** Infos facturation pour avertissement prorata (DIRECTOR uniquement) */
  billingInfo?: {
    employeeCount: number
    monthlyAmount: number
    hasActiveSubscription: boolean
  }
  /** Callback apres succes */
  onSuccess?: () => void
  /** Callback apres annulation */
  onCancel?: () => void
}

// Schema simplifie pour le formulaire
const employeeFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50),
  phone: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .email('Adresse email invalide')
    .optional()
    .or(z.literal('')),
  hireDate: z.string().optional().or(z.literal('')),
  weeklyHours: z.number().min(1, 'Minimum 1h').max(60, 'Maximum 60h'),
  teamId: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'DIRECTOR']).optional(),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

// Labels et descriptions pour les roles
const roleOptions = [
  {
    value: 'EMPLOYEE' as const,
    label: 'Employé',
    description: 'Accès à ses plannings, congés et profil',
    icon: User,
  },
  {
    value: 'MANAGER' as const,
    label: 'Manager',
    description: 'Accès employé + gestion de son équipe',
    icon: UserCog,
  },
  {
    value: 'DIRECTOR' as const,
    label: 'Directeur',
    description: "Accès complet à l'administration de l'entreprise",
    icon: Crown,
  },
]

// ============================================================================
// Composant
// ============================================================================

export function EmployeeForm({
  employee,
  companyId,
  teams = [],
  userRole = 'DIRECTOR',
  billingInfo,
  onSuccess,
  onCancel,
}: EmployeeFormProps) {
  const router = useRouter()
  const isImpersonating = useIsImpersonating()
  const isEditing = !!employee
  const [showBillingConfirm, setShowBillingConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<EmployeeFormValues | null>(
    null
  )

  // Calculs prorata pour le DIRECTOR
  const PRICE_PER_EMPLOYEE = 2.9
  const showBillingWarning =
    !isEditing && billingInfo?.hasActiveSubscription && userRole === 'DIRECTOR'

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate()
  const daysRemaining = daysInMonth - new Date().getDate()
  const prorataEstimate = +(
    PRICE_PER_EMPLOYEE *
    (daysRemaining / daysInMonth)
  ).toFixed(2)
  const newMonthlyAmount = billingInfo
    ? +(billingInfo.monthlyAmount + PRICE_PER_EMPLOYEE).toFixed(2)
    : 0

  // Hook mutation pour create
  const createMutation = useCrudMutation(createEmployee, {
    successMessage: 'Employé créé avec succès',
    onSuccess: () => {
      onSuccess?.()
      router.push('/app/tableau-de-bord/employes')
      router.refresh()
    },
  })

  // Hook mutation pour update
  const updateMutation = useCrudMutation(updateEmployee, {
    successMessage: 'Employé modifié avec succès',
    onSuccess: () => {
      onSuccess?.()
      router.push('/app/tableau-de-bord/employes')
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
          phone: employee.phone || '',
          email: employee.email || employee.user?.email || '',
          hireDate: employee.hireDate
            ? new Date(employee.hireDate).toISOString().split('T')[0]
            : '',
          weeklyHours: employee.weeklyHours,
          teamId: employee.teamId || '',
          isActive: employee.isActive,
          role: 'EMPLOYEE',
        }
      : {
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          hireDate: '',
          weeklyHours: 35,
          teamId: '',
          isActive: true,
          role: 'EMPLOYEE',
        },
  })

  // Watch email et firstName pour les encarts dynamiques
  const watchedEmail = form.watch('email')
  const watchedFirstName = form.watch('firstName')
  const watchedRole = form.watch('role')
  const hasEmail = !!watchedEmail && watchedEmail.length > 0

  // Selecteur de role visible uniquement en creation + email rempli + pas MANAGER
  const showRoleSelector = !isEditing && hasEmail && userRole !== 'MANAGER'

  // Role label pour l'encart
  const roleLabel =
    roleOptions.find((r) => r.value === watchedRole)?.label || 'Employé'

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

  // Execute la creation/mise a jour avec les donnees nettoyees
  const executeSubmit = (data: EmployeeFormValues) => {
    const cleanedData = {
      firstName: data.firstName,
      lastName: data.lastName,
      weeklyHours: data.weeklyHours,
      isActive: data.isActive,
      skills: [] as string[],
      phone: data.phone || undefined,
      email: data.email || undefined,
      hireDate: data.hireDate || undefined,
      teamId: data.teamId || undefined,
      role: data.email ? data.role || 'EMPLOYEE' : ('EMPLOYEE' as const),
    }

    if (isEditing && employee) {
      // En edition : envoyer les chaines vides pour permettre la suppression
      const { role: _role, ...updateData } = cleanedData
      void updateMutation.mutate({
        id: employee.id,
        ...updateData,
        phone: data.phone || '',
        email: data.email || '',
      })
    } else {
      void createMutation.mutate({ companyId, ...cleanedData })
    }
  }

  // Soumission du formulaire — avec confirmation billing pour le DIRECTOR
  const onSubmit = (data: EmployeeFormValues) => {
    if (showBillingWarning) {
      setPendingData(data)
      setShowBillingConfirm(true)
    } else {
      executeSubmit(data)
    }
  }

  // Confirmation du dialog billing
  const handleBillingConfirm = () => {
    if (pendingData) {
      executeSubmit(pendingData)
      setPendingData(null)
    }
    setShowBillingConfirm(false)
  }

  // Pour MANAGER: l'equipe est obligatoire
  const isTeamRequired = userRole === 'MANAGER'

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="space-y-8"
      >
        {/* Bandeau info facturation — DIRECTOR uniquement en creation */}
        {showBillingWarning && (
          <div
            className="flex gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4"
            role="status"
            data-testid="billing-info-banner"
          >
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-300">
                Impact facturation
              </p>
              <p className="mt-1 text-blue-600/90 dark:text-blue-400/90">
                Chaque employé actif coûte{' '}
                <strong>2,90&nbsp;&euro;/mois</strong>. L&apos;ajout sera
                facturé au prorata des jours restants ce mois-ci (environ{' '}
                <strong>
                  {prorataEstimate.toFixed(2).replace('.', ',')}&nbsp;&euro;
                </strong>
                ).
              </p>
              <p className="mt-1 text-blue-600/80 dark:text-blue-400/80">
                Votre facture mensuelle passera de{' '}
                <strong>
                  {billingInfo.monthlyAmount.toFixed(2).replace('.', ',')}
                  &nbsp;&euro;
                </strong>{' '}
                a{' '}
                <strong>
                  {newMonthlyAmount.toFixed(2).replace('.', ',')}&nbsp;&euro;
                </strong>{' '}
                ({billingInfo.employeeCount + 1} employés).
              </p>
            </div>
          </div>
        )}

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
                    <FormLabel>Prénom *</FormLabel>
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
                  <FormLabel>Téléphone</FormLabel>
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

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? 'Email de contact' : 'Email'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="jean.dupont@exemple.fr"
                        className="pl-10"
                        {...field}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  {isEditing && (
                    <FormDescription>
                      Cet email est utilisé comme contact RH. Il ne modifie pas
                      l&apos;adresse de connexion de l&apos;employé.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selecteur de role — visible si email rempli + mode creation + pas MANAGER */}
            {showRoleSelector && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem data-testid="role-selector">
                    <FormLabel>
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Rôle du compte
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'EMPLOYEE'}
                        disabled={isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                <span className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {option.label}
                                </span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {roleOptions.find((r) => r.value === watchedRole)
                        ?.description ||
                        'Accès à ses plannings, congés et profil'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Encarts pedagogiques — mode creation uniquement */}
            {!isEditing && hasEmail && (
              <Alert
                className="border-blue-500/30 bg-blue-500/10"
                data-testid="invitation-info-banner"
              >
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                  Un compte <strong>{roleLabel.toLowerCase()}</strong> sera
                  automatiquement créé. {watchedFirstName || 'Cette personne'}{' '}
                  recevra un email d&apos;activation à cette adresse pour
                  choisir son mot de passe et accéder à SmartPlanning.
                </AlertDescription>
              </Alert>
            )}

            {!isEditing && !hasEmail && (
              <Alert
                className="border-amber-500/30 bg-amber-500/10"
                data-testid="no-email-warning-banner"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
                  Sans adresse email, {watchedFirstName || 'cet employé'}{' '}
                  apparaîtra dans les plannings mais ne pourra pas se connecter
                  à SmartPlanning. Il n&apos;aura pas accès à ses plannings en
                  ligne, ses congés ou les notifications.
                </AlertDescription>
              </Alert>
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
            {/* Equipe */}
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Équipe {isTeamRequired && '*'}</FormLabel>
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
                          <SelectValue placeholder="Sélectionner une équipe" />
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
                      En tant que manager, l&apos;équipe est obligatoire
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
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          min={1}
                          max={60}
                          step={0.25}
                          placeholder="35"
                          className="pl-10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Entre 1 et 60 heures par semaine
                    </FormDescription>
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
                    <FormLabel className="text-base">Employé actif</FormLabel>
                    <FormDescription>
                      Un employé inactif n&apos;apparaît plus dans les plannings
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
          <Button
            type="submit"
            disabled={isPending || isImpersonating}
            title={
              isImpersonating ? 'Non disponible en mode support' : undefined
            }
          >
            {isPending
              ? isEditing
                ? 'Modification...'
                : 'Création...'
              : isEditing
                ? 'Modifier'
                : "Créer l'employé"}
          </Button>
        </div>
      </form>

      {/* Dialog de confirmation facturation — DIRECTOR uniquement */}
      {showBillingWarning && (
        <AlertDialog
          open={showBillingConfirm}
          onOpenChange={setShowBillingConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la création</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Cet employé sera facturé{' '}
                    <span className="font-semibold text-foreground">
                      2,90&nbsp;&euro;/mois
                    </span>{' '}
                    sur l&apos;abonnement de votre entreprise.
                  </p>
                  <div className="rounded-md bg-muted p-3">
                    <p>
                      Prorata ce mois :{' '}
                      <span className="font-semibold">
                        ~{prorataEstimate.toFixed(2).replace('.', ',')}
                        &nbsp;&euro;
                      </span>{' '}
                      ({daysRemaining} jour{daysRemaining > 1 ? 's' : ''}{' '}
                      restant
                      {daysRemaining > 1 ? 's' : ''})
                    </p>
                    <p className="mt-1">
                      Nouvelle facture mensuelle :{' '}
                      <span className="font-semibold">
                        {newMonthlyAmount.toFixed(2).replace('.', ',')}
                        &nbsp;&euro;
                      </span>{' '}
                      ({billingInfo.employeeCount + 1} employés)
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBillingConfirm}
                disabled={isPending}
                data-testid="confirm-create-employee-btn"
              >
                {isPending ? 'Création...' : 'Confirmer la création'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Form>
  )
}
