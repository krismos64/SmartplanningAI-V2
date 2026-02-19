'use client'

/**
 * EditProfileForm - Formulaire d'édition du profil
 *
 * @description Client Component pour modifier les informations personnelles
 * de l'utilisateur connecté. Utilise React Hook Form + Zod pour la validation.
 *
 * Fonctionnalités :
 * - Validation côté client avec zodResolver
 * - Gestion des erreurs avec useCrudMutation
 * - Adaptation UI pour SYSTEM_ADMIN sans Employee
 * - Design Cyber Glass avec effets hover-lift
 *
 * @ticket SP-271
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save, Briefcase, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import {
  editProfileSchema,
  type EditProfileInput,
  EDIT_PROFILE_LABELS,
  EDIT_PROFILE_PLACEHOLDERS,
} from '@/lib/validations/profile'
import { updateProfile } from '@/lib/actions/profile'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import { useIsImpersonating } from '@/hooks'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface EditProfileFormProps {
  /** Valeurs par défaut du formulaire */
  defaultValues: {
    firstName: string
    lastName: string
    phone: string
    jobTitle: string
    hireDate: Date | null
  }
  /** Indique si l'utilisateur a un profil Employee associé */
  hasEmployee: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EditProfileForm({
  defaultValues,
  hasEmployee,
}: EditProfileFormProps) {
  const router = useRouter()
  const isImpersonating = useIsImpersonating()

  // Initialiser le formulaire avec React Hook Form + Zod
  const form = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
    mode: 'onBlur', // Valider au blur pour une meilleure UX
  })

  // Hook de mutation avec gestion automatique des toasts
  const { mutate, isPending } = useCrudMutation(updateProfile, {
    successMessage: 'Profil mis à jour avec succès',
    errorMessage: 'Erreur lors de la mise à jour',
    onSuccess: () => {
      router.push('/app/profile')
      router.refresh()
    },
  })

  /**
   * Handler de soumission du formulaire
   */
  const onSubmit = (data: EditProfileInput) => {
    void mutate(data)
  }

  /**
   * Handler pour éviter les warnings de Promise non gérée
   */
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void form.handleSubmit(onSubmit)(e)
  }

  // Vérifier si le formulaire a été modifié
  const isDirty = form.formState.isDirty
  const isSubmitDisabled = isPending || !isDirty || isImpersonating

  return (
    <Card className="glass hover-lift" data-testid="edit-profile-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link
            href="/app/profile"
            className="rounded-md p-1 hover:bg-muted"
            aria-label="Retour au profil"
            data-testid="back-to-profile"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          Modifier mon profil
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={handleFormSubmit}
            className="space-y-6"
            noValidate
            data-testid="edit-profile-form-element"
          >
            {/* Prénom */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{EDIT_PROFILE_LABELS.firstName}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={EDIT_PROFILE_PLACEHOLDERS.firstName}
                      disabled={isPending}
                      data-testid="input-firstName"
                      autoComplete="given-name"
                    />
                  </FormControl>
                  <FormMessage data-testid="error-firstName" />
                </FormItem>
              )}
            />

            {/* Nom */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{EDIT_PROFILE_LABELS.lastName}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={EDIT_PROFILE_PLACEHOLDERS.lastName}
                      disabled={isPending}
                      data-testid="input-lastName"
                      autoComplete="family-name"
                    />
                  </FormControl>
                  <FormMessage data-testid="error-lastName" />
                </FormItem>
              )}
            />

            {/* Téléphone - Uniquement si Employee existe */}
            {hasEmployee && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{EDIT_PROFILE_LABELS.phone}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder={EDIT_PROFILE_PLACEHOLDERS.phone}
                        disabled={isPending}
                        data-testid="input-phone"
                        autoComplete="tel"
                      />
                    </FormControl>
                    <FormDescription>
                      Format français : 0612345678 ou +33612345678
                    </FormDescription>
                    <FormMessage data-testid="error-phone" />
                  </FormItem>
                )}
              />
            )}

            {/* Poste - Uniquement si Employee existe */}
            {hasEmployee && (
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{EDIT_PROFILE_LABELS.jobTitle}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder={EDIT_PROFILE_PLACEHOLDERS.jobTitle}
                          disabled={isPending}
                          data-testid="input-jobTitle"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage data-testid="error-jobTitle" />
                  </FormItem>
                )}
              />
            )}

            {/* Date d'embauche - Uniquement si Employee existe */}
            {hasEmployee && (
              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{EDIT_PROFILE_LABELS.hireDate}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isPending}
                            data-testid="input-hireDate"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(new Date(field.value), 'dd MMMM yyyy', {
                                  locale: fr,
                                })
                              : 'Sélectionner une date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1950-01-01')
                          }
                          autoFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage data-testid="error-hireDate" />
                  </FormItem>
                )}
              />
            )}

            {/* Message pour SYSTEM_ADMIN sans Employee */}
            {!hasEmployee && (
              <Alert variant="default" data-testid="system-admin-notice">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  En tant qu&apos;administrateur système, seuls le prénom et le
                  nom sont modifiables.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isPending}
                data-testid="cancel-button"
              >
                <Link href="/app/profile">Annuler</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                title={
                  isImpersonating ? 'Non disponible en mode support' : undefined
                }
                data-testid="submit-button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
