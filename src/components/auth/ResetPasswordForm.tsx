/**
 * ResetPasswordForm - Formulaire de réinitialisation de mot de passe
 *
 * @description Client Component pour la réinitialisation avec :
 * - React Hook Form + zodResolver pour validation
 * - resetPasswordAction Server Action
 * - Gestion des erreurs (token invalide/expiré)
 * - Redirection automatique après succès
 * - Support variant dark pour design landing page
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface ResetPasswordFormProps {
  /** Token de réinitialisation reçu par email */
  token: string
  /** Design variant - 'light' for dashboard, 'dark' for landing/auth */
  variant?: 'light' | 'dark'
}

/**
 * ResetPasswordForm Component
 *
 * Formulaire de réinitialisation du mot de passe.
 * Gère les erreurs de token invalide/expiré et redirige après succès.
 */
export function ResetPasswordForm({
  token,
  variant = 'light',
}: ResetPasswordFormProps) {
  const isDark = variant === 'dark'
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

  // Classes conditionnelles pour le mode dark
  const labelClass = cn(isDark && 'text-white/80')
  const inputClass = cn(
    isDark &&
      'border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20'
  )
  const textMutedClass = cn(isDark ? 'text-white/60' : 'text-muted-foreground')
  const iconClass = cn(isDark ? 'text-white/50' : 'text-muted-foreground')
  const linkClass = cn(
    'inline-flex items-center gap-1 text-sm font-medium transition-colors',
    isDark
      ? 'text-cyan-400 hover:text-cyan-300'
      : 'text-primary hover:underline'
  )

  // Affichage après succès
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div
          className={cn(
            'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
            isDark ? 'bg-cyan-500/20' : 'bg-primary/10'
          )}
        >
          <CheckCircle2
            className={cn(
              'h-8 w-8',
              isDark ? 'text-cyan-400' : 'text-primary'
            )}
          />
        </div>

        <div className="space-y-2">
          <h2
            className={cn(
              'text-xl font-semibold',
              isDark ? 'text-white' : 'text-foreground'
            )}
          >
            Mot de passe réinitialisé
          </h2>
          <p className={cn('text-sm', textMutedClass)}>
            Votre mot de passe a été modifié avec succès. Vous allez être
            redirigé vers la page de connexion.
          </p>
        </div>

        <div className="space-y-3">
          <p className={cn('text-sm', textMutedClass)}>
            Redirection dans{' '}
            <span
              className={cn(
                'font-semibold',
                isDark ? 'text-cyan-400' : 'text-primary'
              )}
            >
              {countdown}
            </span>{' '}
            secondes...
          </p>
          <Link href="/login">
            <Button
              className={cn(
                'w-full',
                isDark &&
                  'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500'
              )}
            >
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
              <FormLabel className={labelClass}>Nouveau mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={inputClass}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent',
                      isDark && 'hover:text-white'
                    )}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className={cn('h-4 w-4', iconClass)} />
                    ) : (
                      <Eye className={cn('h-4 w-4', iconClass)} />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
              <p className={cn('text-xs', textMutedClass)}>
                Minimum 8 caractères avec majuscule, minuscule, chiffre et
                caractère spécial.
              </p>
            </FormItem>
          )}
        />

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                Confirmer le mot de passe
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={inputClass}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent',
                      isDark && 'hover:text-white'
                    )}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className={cn('h-4 w-4', iconClass)} />
                    ) : (
                      <Eye className={cn('h-4 w-4', iconClass)} />
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
          className={cn(
            'w-full',
            isDark &&
              'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500'
          )}
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
          <Link href="/login" className={linkClass}>
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </form>
    </Form>
  )
}
