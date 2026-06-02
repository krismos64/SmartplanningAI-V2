/**
 * LoginForm - Formulaire de connexion
 *
 * @description Client Component pour l'authentification avec :
 * - React Hook Form + zodResolver pour validation
 * - NextAuth signIn avec redirect: false
 * - Gestion des erreurs avec getAuthErrorMessage()
 * - Toast notification (Sonner)
 * - Redirect vers le dashboard approprié selon le rôle après succès
 * - Support light/dark mode via CSS variables
 *
 * @ticket SP-137
 * @see Context7 - NextAuth v5 signIn pattern, React Hook Form
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, MailWarning } from 'lucide-react'
import { toast } from 'sonner'

import {
  loginSchema,
  type LoginFormData,
  getAuthErrorMessage,
} from '@/lib/validations'
import {
  checkEmailVerificationStatus,
  resendVerificationEmailAction,
} from '@/lib/actions/verification-actions'
import { getDefaultDashboardForRole } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { PRIMARY_BUTTON_CLASSES } from '@/app/(landing)/components'

/**
 * LoginForm Component
 *
 * Formulaire de connexion avec validation côté client et gestion NextAuth.
 * Utilise signIn('credentials', { redirect: false }) pour gérer les erreurs manuellement.
 */
export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // SP-526 : affichage de l'alerte « email non vérifié » + renvoi du lien
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  /**
   * Submit handler
   *
   * 1. Appelle signIn('credentials') avec redirect: false
   * 2. Gère les erreurs avec getAuthErrorMessage()
   * 3. Affiche toast success/error
   * 4. Redirige vers /app/dashboard si succès
   */
  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    // Reset de l'alerte à chaque tentative
    setEmailNotVerified(false)

    try {
      // SP-526 : pré-check de l'état de vérification email.
      // NextAuth v5 normalise les Error de authorize() en 'CredentialsSignin',
      // donc on ne peut pas distinguer « email non vérifié » côté signIn().
      // Ce pré-check oriente l'UX ; authorize() reste la vraie barrière.
      const verificationStatus = await checkEmailVerificationStatus({
        email: data.email,
        password: data.password,
      })

      if (verificationStatus.status === 'NOT_VERIFIED') {
        // Credentials valides mais email non vérifié : on affiche l'alerte
        // dédiée avec le bouton « Renvoyer » et on n'appelle PAS signIn().
        setEmailNotVerified(true)
        return
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        // Erreur d'authentification (credentials invalides, compte désactivé, etc.)
        const errorMessage = getAuthErrorMessage(result.error)
        toast.error('Erreur de connexion', {
          description: errorMessage,
        })
        return
      }

      if (result?.ok) {
        // Succès : afficher toast et rediriger vers le bon dashboard selon le rôle
        toast.success('Connexion réussie', {
          description: 'Redirection vers le tableau de bord...',
        })

        // Récupérer la session pour obtenir le rôle de l'utilisateur
        const session = await getSession()
        const userRole = session?.user?.role
        const dashboardUrl = getDefaultDashboardForRole(userRole)

        // Utiliser router.push pour la redirection côté client vers le bon dashboard
        router.push(dashboardUrl)
        router.refresh() // Force le rafraîchissement pour mettre à jour la session
      }
    } catch {
      // Erreur réseau ou autre erreur inattendue
      toast.error('Erreur de connexion', {
        description: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Renvoi de l'email de vérification (SP-526)
   *
   * Utilise l'email saisi dans le formulaire. Le message de confirmation
   * reste neutre : on ne révèle jamais si l'email existe ou est déjà vérifié
   * (resendVerificationEmailAction renvoie toujours un succès silencieux).
   */
  async function onResendVerification() {
    const email = form.getValues('email')
    setIsResending(true)
    try {
      await resendVerificationEmailAction({ email })
      toast.success('Email envoyé', {
        description:
          'Si un compte existe pour cette adresse, un nouvel email de vérification vient de vous être envoyé.',
      })
    } catch {
      toast.error('Erreur', {
        description: "Impossible d'envoyer l'email. Veuillez réessayer.",
      })
    } finally {
      setIsResending(false)
    }
  }

  /**
   * Handle form submit without async promise warning
   */
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void form.handleSubmit(onSubmit)(e)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        {/* Alerte email non vérifié (SP-526) */}
        {emailNotVerified && (
          <Alert>
            <MailWarning className="h-4 w-4" />
            <AlertTitle>Email non vérifié</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>
                Votre email n&apos;est pas encore vérifié. Consultez votre
                boîte mail pour activer votre compte.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onResendVerification()}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Renvoyer l'email de vérification"
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="vous@entreprise.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Mot de passe</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                  tabIndex={-1}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me */}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel className="cursor-pointer text-sm font-normal">
                Se souvenir de moi
              </FormLabel>
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
              Connexion en cours...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>
    </Form>
  )
}
