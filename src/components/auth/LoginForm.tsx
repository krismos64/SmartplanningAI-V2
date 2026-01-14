/**
 * LoginForm - Formulaire de connexion
 *
 * @description Client Component pour l'authentification avec :
 * - React Hook Form + zodResolver pour validation
 * - NextAuth signIn avec redirect: false
 * - Gestion des erreurs avec getAuthErrorMessage()
 * - Toast notification (Sonner)
 * - Redirect vers le dashboard approprié selon le rôle après succès
 * - Support variant dark pour design landing page
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
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import {
  loginSchema,
  type LoginFormData,
  getAuthErrorMessage,
} from '@/lib/validations'
import { getDefaultDashboardForRole } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  /** Design variant - 'light' for dashboard, 'dark' for landing/auth */
  variant?: 'light' | 'dark'
}

/**
 * LoginForm Component
 *
 * Formulaire de connexion avec validation côté client et gestion NextAuth.
 * Utilise signIn('credentials', { redirect: false }) pour gérer les erreurs manuellement.
 */
export function LoginForm({ variant = 'light' }: LoginFormProps) {
  const isDark = variant === 'dark'
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

    try {
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
  const linkClass = cn(
    'text-xs',
    isDark
      ? 'text-cyan-400 hover:text-cyan-300'
      : 'text-primary hover:underline'
  )
  const iconClass = cn(isDark ? 'text-white/50' : 'text-muted-foreground')

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="vous@entreprise.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className={inputClass}
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
                <FormLabel className={labelClass}>Mot de passe</FormLabel>
                <Link
                  href="/reset-password"
                  className={linkClass}
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
                  className={cn(
                    isDark && 'border-white/30 data-[state=checked]:bg-cyan-500'
                  )}
                />
              </FormControl>
              <FormLabel
                className={cn('cursor-pointer text-sm font-normal', labelClass)}
              >
                Se souvenir de moi
              </FormLabel>
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
