/**
 * ForgotPasswordForm - Formulaire de demande de réinitialisation
 *
 * @description Client Component pour la demande de réinitialisation avec :
 * - React Hook Form + zodResolver pour validation
 * - forgotPasswordAction Server Action
 * - Message de succès générique (anti-énumération)
 * - Toast notification (Sonner)
 * - Support variant dark pour design landing page
 *
 * @ticket SP-263
 * @see Context7 - React Hook Form patterns, Next.js 15 Server Actions
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations'
import { forgotPasswordAction } from '@/lib/actions/password-actions'
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

interface ForgotPasswordFormProps {
  /** Design variant - 'light' for dashboard, 'dark' for landing/auth */
  variant?: 'light' | 'dark'
}

/**
 * ForgotPasswordForm Component
 *
 * Formulaire de demande de réinitialisation de mot de passe.
 * Affiche un message de succès générique pour ne pas révéler si l'email existe.
 */
export function ForgotPasswordForm({
  variant = 'light',
}: ForgotPasswordFormProps) {
  const isDark = variant === 'dark'
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  /**
   * Submit handler
   *
   * 1. Appelle forgotPasswordAction
   * 2. Affiche toujours un message de succès (anti-énumération)
   * 3. Cache le formulaire après succès
   */
  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true)

    try {
      const result = await forgotPasswordAction(data)

      if (result.success) {
        setIsSuccess(true)
        toast.success('Email envoyé', {
          description: 'Vérifiez votre boîte de réception.',
        })
      } else if (result.field) {
        // Erreur de validation
        form.setError(result.field as keyof ForgotPasswordFormData, {
          message: result.error,
        })
      }
    } catch {
      // Erreur réseau ou autre - on affiche quand même succès (anti-énumération)
      setIsSuccess(true)
      toast.success('Email envoyé', {
        description: 'Vérifiez votre boîte de réception.',
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
            className={cn('h-8 w-8', isDark ? 'text-cyan-400' : 'text-primary')}
          />
        </div>

        <div className="space-y-2">
          <h2
            className={cn(
              'text-xl font-semibold',
              isDark ? 'text-white' : 'text-foreground'
            )}
          >
            Vérifiez votre boîte mail
          </h2>
          <p className={cn('text-sm', textMutedClass)}>
            Si un compte existe avec cet email, vous recevrez un lien de
            réinitialisation dans quelques minutes.
          </p>
        </div>

        <div className="space-y-3">
          <p className={cn('text-xs', textMutedClass)}>
            Vous n&apos;avez pas reçu l&apos;email ? Vérifiez vos spams ou
          </p>
          <Button
            type="button"
            variant={isDark ? 'outline' : 'secondary'}
            onClick={() => {
              setIsSuccess(false)
              form.reset()
            }}
            className={cn(
              isDark &&
                'border-white/20 bg-white/5 text-white hover:bg-white/10'
            )}
          >
            Réessayer avec un autre email
          </Button>
        </div>

        <Link href="/login" className={linkClass}>
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        {/* Description */}
        <p className={cn('text-sm', textMutedClass)}>
          Entrez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </p>

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail
                    className={cn(
                      'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                      isDark ? 'text-white/40' : 'text-muted-foreground'
                    )}
                  />
                  <Input
                    type="email"
                    placeholder="vous@entreprise.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className={cn('pl-10', inputClass)}
                    {...field}
                  />
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
              Envoi en cours...
            </>
          ) : (
            'Envoyer le lien de réinitialisation'
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
