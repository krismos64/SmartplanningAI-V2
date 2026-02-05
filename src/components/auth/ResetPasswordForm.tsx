/**
 * ResetPasswordForm - Formulaire de réinitialisation de mot de passe
 *
 * @description Client Component pour la réinitialisation avec :
 * - React Hook Form + zodResolver pour validation
 * - resetPasswordAction Server Action
 * - Gestion des erreurs (token invalide/expiré)
 * - Redirection automatique après succès
 * - Support light/dark mode via CSS variables
 *
 * @ticket SP-263
 * @see Context7 - React Hook Form patterns, Next.js 15 Server Actions
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validations'
import { resetPasswordAction } from '@/lib/actions/password-actions'
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
import { GRADIENT_BUTTON_CLASSES } from '@/app/(landing)/components'

interface ResetPasswordFormProps {
  /** Token de réinitialisation reçu par email */
  token: string
}

/**
 * ResetPasswordForm Component
 *
 * Formulaire de réinitialisation du mot de passe.
 * Gère les erreurs de token invalide/expiré et redirige après succès.
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  })

  // Countdown et redirection après succès
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

  /**
   * Submit handler
   *
   * 1. Appelle resetPasswordAction avec le token
   * 2. Gère les erreurs spécifiques (token invalide/expiré)
   * 3. Affiche succès et redirige vers login
   */
  async function onSubmit(data: ResetPasswordFormData) {
    setIsLoading(true)

    try {
      const result = await resetPasswordAction(data)

      if (result.success) {
        setIsSuccess(true)
        toast.success('Mot de passe réinitialisé', {
          description: 'Vous pouvez maintenant vous connecter.',
        })
      } else {
        // Erreur spécifique
        if (result.field) {
          form.setError(result.field as keyof ResetPasswordFormData, {
            message: result.error,
          })
        } else {
          // Erreur générale (token invalide, expiré, etc.)
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

  /**
   * Handle form submit without async promise warning
   */
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void form.handleSubmit(onSubmit)(e)
  }

  // Affichage après succès
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
          <CheckCircle2 className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Mot de passe réinitialisé
          </h2>
          <p className="text-sm text-muted-foreground">
            Votre mot de passe a été modifié avec succès. Vous allez être
            redirigé vers la page de connexion.
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
            <Button className={cn('w-full', GRADIENT_BUTTON_CLASSES)}>
              Se connecter maintenant
            </Button>
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
              <FormLabel>Nouveau mot de passe</FormLabel>
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
          className={cn('w-full', GRADIENT_BUTTON_CLASSES)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réinitialisation...
            </>
          ) : (
            'Réinitialiser le mot de passe'
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
