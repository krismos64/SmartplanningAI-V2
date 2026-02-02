/**
 * DeleteAccountForm - Formulaire de suppression de compte
 *
 * Formulaire sécurisé avec :
 * - Double confirmation (email + mot de passe)
 * - Checkbox de consentement explicite
 * - Avertissement RGPD
 * - Déconnexion automatique après suppression
 *
 * @ticket SP-277 - RGPD Article 17
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signOut } from 'next-auth/react'
import { AlertTriangle, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import { deleteAccount } from '@/lib/actions/profile'
import {
  deleteAccountSchema,
  type DeleteAccountInput,
} from '@/lib/validations/user'

interface DeleteAccountFormProps {
  userEmail: string
}

export function DeleteAccountForm({ userEmail }: DeleteAccountFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmEmail: '',
      password: '',
      confirmDeletion: false,
    },
  })

  const confirmDeletion = form.watch('confirmDeletion')

  const { mutate, isPending } = useCrudMutation(deleteAccount, {
    successMessage: 'Compte supprimé avec succès',
    errorMessage: 'Erreur lors de la suppression du compte',
    onSuccess: () => {
      // Déconnecter l'utilisateur après suppression
      void signOut({ callbackUrl: '/login?deleted=true' })
    },
    onError: (error, field) => {
      // Si l'erreur concerne un champ spécifique, l'afficher sur le champ
      if (field) {
        form.setError(field as keyof DeleteAccountInput, {
          message: error,
        })
      }
    },
  })

  const onSubmit = (data: DeleteAccountInput) => {
    void mutate(data)
  }

  /**
   * Handle form submit without async promise warning
   */
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void form.handleSubmit(onSubmit)(e)
  }

  return (
    <Card className="glass hover-lift border-destructive/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-destructive/10 p-2">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">
            Supprimer mon compte
          </CardTitle>
        </div>
        <CardDescription>
          Cette action est irréversible. Toutes vos données seront supprimées
          définitivement.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={handleFormSubmit} noValidate>
          <CardContent className="space-y-6">
            {/* Avertissement RGPD */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Attention - Suppression définitive</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>En supprimant votre compte, vous perdrez définitivement :</p>
                <ul className="ml-2 list-inside list-disc space-y-1 text-sm">
                  <li>Votre profil et informations personnelles</li>
                  <li>Vos plannings et historique de présence</li>
                  <li>Vos demandes de congés et soldes</li>
                  <li>Vos notes et tâches personnelles</li>
                  <li>Toutes vos notifications</li>
                </ul>
                <p className="mt-2 font-medium">
                  Conformément au RGPD (Article 17), cette action est immédiate
                  et irréversible.
                </p>
              </AlertDescription>
            </Alert>

            {/* Champ Email de confirmation */}
            <FormField
              control={form.control}
              name="confirmEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirmez votre email
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({userEmail})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Saisissez votre email pour confirmer"
                      autoComplete="off"
                      data-testid="confirm-email-input"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage data-testid="confirm-email-error" />
                </FormItem>
              )}
            />

            {/* Champ Mot de passe */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmez votre mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Saisissez votre mot de passe"
                        autoComplete="current-password"
                        data-testid="password-input"
                        disabled={isPending}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        data-testid="toggle-password-visibility"
                        aria-label={
                          showPassword
                            ? 'Masquer le mot de passe'
                            : 'Afficher le mot de passe'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage data-testid="password-error" />
                </FormItem>
              )}
            />

            {/* Checkbox de confirmation */}
            <FormField
              control={form.control}
              name="confirmDeletion"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start space-x-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="confirm-deletion-checkbox"
                        disabled={isPending}
                        className="mt-0.5 border-destructive data-[state=checked]:bg-destructive"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer text-sm font-medium leading-none">
                        Je comprends que cette action est irréversible
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Je confirme vouloir supprimer définitivement mon compte
                        et toutes mes données associées, conformément à mon
                        droit à l&apos;effacement (RGPD Article 17).
                      </p>
                    </div>
                  </div>
                  <FormMessage data-testid="confirm-deletion-error" />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between gap-4 border-t pt-6">
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
              variant="destructive"
              disabled={
                !form.formState.isDirty || isPending || !confirmDeletion
              }
              data-testid="delete-account-button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression en cours...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
