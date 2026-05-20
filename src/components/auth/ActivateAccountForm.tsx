/**
 * ActivateAccountForm - Formulaire d'activation de compte invite
 *
 * @description Client Component pour l'activation avec :
 * - React Hook Form + zodResolver pour validation
 * - activateAccount Server Action
 * - Gestion token expire avec bouton "Renvoyer l'invitation"
 * - Redirection automatique apres succes
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validations'
import { activateAccount, resendInvitation } from '@/lib/actions/employees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { PRIMARY_BUTTON_CLASSES } from '@/app/(landing)/components'

interface ActivateAccountFormProps {
  /** Token d'activation recu par email */
  token: string
}

export function ActivateAccountForm({ token }: ActivateAccountFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTokenExpired, setIsTokenExpired] = useState(false)
  const [isResendSuccess, setIsResendSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  })

  // Countdown et redirection apres succes
  useEffect(() => {
    if (!isSuccess) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isSuccess, router])

  async function onSubmit(data: ResetPasswordFormData) {
    setIsLoading(true)

    try {
      const result = await activateAccount(data)

      if (result.success) {
        setIsSuccess(true)
        toast.success('Compte activé !', {
          description: 'Vous pouvez maintenant vous connecter.',
        })
      } else {
        if (result.error === 'TOKEN_EXPIRED') {
          setIsTokenExpired(true)
        } else if (result.field) {
          form.setError(result.field as keyof ResetPasswordFormData, {
            message: result.error,
          })
        } else {
          toast.error('Erreur', {
            description: result.error,
          })
        }
      }
    } catch {
      toast.error('Erreur', {
        description: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    setIsResending(true)

    try {
      const result = await resendInvitation({ token })

      if (result.success) {
        setIsResendSuccess(true)
        toast.success('Nouveau lien envoyé !', {
          description: 'Vérifiez votre boîte mail.',
        })
      } else {
        toast.error('Erreur', {
          description: result.error,
        })
      }
    } catch {
      toast.error('Erreur', {
        description: "Impossible de renvoyer l'invitation.",
      })
    } finally {
      setIsResending(false)
    }
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void form.handleSubmit(onSubmit)(e)
  }

  // Affichage apres succes
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
          <CheckCircle2 className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Compte activé !
          </h2>
          <p className="text-sm text-muted-foreground">
            Votre compte a été activé avec succès. Vous allez être redirigé vers
            la page de connexion.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Redirection dans{' '}
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
              {countdown}
            </span>{' '}
            secondes...
          </p>
          <Link href="/login">
            <Button className={cn('w-full', PRIMARY_BUTTON_CLASSES)}>
              Se connecter maintenant
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Affichage token expire
  if (isTokenExpired) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
          <RefreshCw className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Lien expiré</h2>
          <p className="text-sm text-muted-foreground">
            Ce lien d&apos;activation a expiré. Vous pouvez demander un nouveau
            lien d&apos;activation.
          </p>
        </div>

        {isResendSuccess ? (
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nouveau lien envoyé ! Vérifiez votre boîte mail.
            </p>
          </div>
        ) : (
          <Button
            onClick={() => void handleResend()}
            disabled={isResending}
            className={cn('w-full', PRIMARY_BUTTON_CLASSES)}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Renvoyer l&apos;invitation
              </>
            )}
          </Button>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        {/* Hidden token field */}
        <input type="hidden" {...form.register('token')} />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
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
              <FormDescription>
                Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1
                caractère spécial
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className={cn('w-full', PRIMARY_BUTTON_CLASSES)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activation...
            </>
          ) : (
            'Activer mon compte'
          )}
        </Button>

        {/* Link back to login */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </form>
    </Form>
  )
}
