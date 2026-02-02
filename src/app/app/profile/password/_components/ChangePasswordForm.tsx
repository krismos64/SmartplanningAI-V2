/**
 * ChangePasswordForm - Formulaire de changement de mot de passe
 *
 * Formulaire sécurisé avec :
 * - 3 champs password avec toggles de visibilité indépendants
 * - Indicateur de force en temps réel
 * - Validation Zod côté client
 * - Intégration useCrudMutation pour la soumission
 *
 * @ticket SP-273
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/lib/validations/user'
import { changePassword } from '@/lib/actions/profile'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

export function ChangePasswordForm() {
  const router = useRouter()

  // États pour les toggles de visibilité (3 champs séparés)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  // Watch pour l'indicateur de force
  const newPassword = form.watch('newPassword')

  const { mutate, isPending } = useCrudMutation(changePassword, {
    successMessage: 'Mot de passe modifié avec succès',
    errorMessage: 'Erreur lors de la modification du mot de passe',
    onSuccess: () => {
      form.reset()
      router.push('/app/profile')
      router.refresh()
    },
    onError: (error, field) => {
      // Si l'erreur concerne un champ spécifique, l'afficher sur le champ
      if (field) {
        form.setError(field as keyof ChangePasswordFormData, {
          message: error,
        })
      }
    },
  })

  const onSubmit = (data: ChangePasswordFormData) => {
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
    <Card className="glass hover-lift">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link href="/app/profile">
            <Button
              variant="ghost"
              size="icon"
              data-testid="back-button"
              aria-label="Retour au profil"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <CardTitle>Changer mon mot de passe</CardTitle>
            <CardDescription>
              Assurez-vous d&apos;utiliser un mot de passe fort et unique
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
            {/* Mot de passe actuel */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Votre mot de passe actuel"
                        data-testid="input-currentPassword"
                        disabled={isPending}
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        data-testid="toggle-currentPassword"
                        tabIndex={-1}
                        aria-label={
                          showCurrentPassword
                            ? 'Masquer le mot de passe actuel'
                            : 'Afficher le mot de passe actuel'
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage data-testid="error-currentPassword" />
                </FormItem>
              )}
            />

            {/* Nouveau mot de passe */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Votre nouveau mot de passe"
                        data-testid="input-newPassword"
                        disabled={isPending}
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        data-testid="toggle-newPassword"
                        tabIndex={-1}
                        aria-label={
                          showNewPassword
                            ? 'Masquer le nouveau mot de passe'
                            : 'Afficher le nouveau mot de passe'
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage data-testid="error-newPassword" />
                  {/* Indicateur de force */}
                  <PasswordStrengthIndicator password={newPassword} />
                </FormItem>
              )}
            />

            {/* Confirmation nouveau mot de passe */}
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirmez votre nouveau mot de passe"
                        data-testid="input-confirmNewPassword"
                        disabled={isPending}
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        data-testid="toggle-confirmNewPassword"
                        tabIndex={-1}
                        aria-label={
                          showConfirmPassword
                            ? 'Masquer la confirmation'
                            : 'Afficher la confirmation'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage data-testid="error-confirmNewPassword" />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/app/profile">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  data-testid="cancel-button"
                >
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                data-testid="submit-button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Modifier le mot de passe
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
