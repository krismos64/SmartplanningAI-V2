/**
 * ForgotPasswordForm - Formulaire de demande de réinitialisation
 *
 * @description Client Component pour la demande de réinitialisation avec :
 * - React Hook Form + zodResolver pour validation
 * - forgotPasswordAction Server Action
 * - Message de succès générique (anti-énumération)
 * - Toast notification (Sonner)
 * - Support light/dark mode via CSS variables
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
import { GRADIENT_BUTTON_CLASSES } from '@/app/(landing)/components'

/**
 * ForgotPasswordForm Component
 *
 * Formulaire de demande de réinitialisation de mot de passe.
 * Affiche un message de succès générique pour ne pas révéler si l'email existe.
 */
export function ForgotPasswordForm() {
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

  // Affichage après succès
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20">
          <CheckCircle2 className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Vérifiez votre boîte mail
          </h2>
          <p className="text-sm text-muted-foreground">
            Si un compte existe avec cet email, vous recevrez un lien de
            réinitialisation dans quelques minutes.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Vous n&apos;avez pas reçu l&apos;email ? Vérifiez vos spams ou
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsSuccess(false)
              form.reset()
            }}
          >
            Réessayer avec un autre email
          </Button>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
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
        <p className="text-sm text-muted-foreground">
          Entrez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </p>

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="vous@entreprise.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="pl-10"
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
          className={cn('w-full', GRADIENT_BUTTON_CLASSES)}
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
