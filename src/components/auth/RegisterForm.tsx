/**
 * RegisterForm - Formulaire d'inscription SaaS
 *
 * @description Client Component pour l'inscription avec :
 * - React Hook Form + zodResolver pour validation
 * - Server Action registerAction pour création Company + User
 * - Gestion des erreurs avec toast (Sonner)
 * - Auto-login après inscription réussie
 * - Redirect vers /app/dashboard après succès
 * - Support variant dark pour design landing page
 *
 * @ticket SP-139
 * @see Context7 - Next.js 15 Server Actions, React Hook Form
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, Building2 } from 'lucide-react'
import { toast } from 'sonner'

import { signupSchema, type SignupFormData } from '@/lib/validations'
import { registerAction } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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

interface RegisterFormProps {
  /** Design variant - 'light' for dashboard, 'dark' for landing/auth */
  variant?: 'light' | 'dark'
}

/**
 * RegisterForm Component
 *
 * Formulaire d'inscription pour nouveaux clients SaaS.
 * Crée une Company et un User DIRECTOR via Server Action.
 * Auto-login après inscription réussie.
 */
export function RegisterForm({ variant = 'light' }: RegisterFormProps) {
  const isDark = variant === 'dark'
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  /**
   * Submit handler
   *
   * 1. Appelle registerAction (Server Action)
   * 2. Si succès : auto-login avec signIn('credentials')
   * 3. Affiche toast success/error
   * 4. Redirige vers /app/dashboard
   */
  async function onSubmit(data: SignupFormData) {
    setIsLoading(true)

    try {
      // 1. Appeler la Server Action pour créer Company + User
      const result = await registerAction(data)

      if (!result.success) {
        // Erreur de création : afficher le message
        toast.error("Erreur lors de l'inscription", {
          description: result.error,
        })

        // Focus sur le champ en erreur si spécifié
        if (result.field) {
          form.setFocus(result.field as keyof SignupFormData)
        }
        return
      }

      // 2. Succès : auto-login avec les credentials
      toast.success('Compte créé avec succès !', {
        description: 'Connexion en cours...',
      })

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        // Le compte est créé mais l'auto-login a échoué
        // Rediriger vers la page de login
        toast.info('Veuillez vous connecter', {
          description:
            'Votre compte a été créé. Connectez-vous pour continuer.',
        })
        router.push('/login')
        return
      }

      // 3. Auto-login réussi : rediriger vers le dashboard
      toast.success('Bienvenue sur SmartPlanning !', {
        description: 'Redirection vers votre tableau de bord...',
      })

      router.push('/app/dashboard')
      router.refresh()
    } catch {
      // Erreur inattendue
      toast.error("Erreur lors de l'inscription", {
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
    isDark
      ? 'text-cyan-400 hover:text-cyan-300'
      : 'text-primary hover:underline'
  )
  const iconClass = cn(isDark ? 'text-white/50' : 'text-muted-foreground')
  const descriptionClass = cn(
    isDark ? 'text-white/50' : 'text-muted-foreground'
  )

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Nom complet</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Jean Dupont"
                  autoComplete="name"
                  disabled={isLoading}
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Email professionnel</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="jean@entreprise.com"
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

        {/* Company Name Field */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                Nom de votre organisation
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2
                    className={cn(
                      'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                      iconClass
                    )}
                  />
                  <Input
                    type="text"
                    placeholder="Mon Entreprise SAS"
                    autoComplete="organization"
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

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Mot de passe</FormLabel>
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
              <FormDescription className={descriptionClass}>
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

        {/* Accept Terms Checkbox */}
        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
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
              <div className="space-y-1 leading-none">
                <FormLabel
                  className={cn(
                    'cursor-pointer text-sm font-normal',
                    labelClass
                  )}
                >
                  J&apos;accepte les{' '}
                  <Link href="/terms" className={linkClass} target="_blank">
                    conditions d&apos;utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/privacy" className={linkClass} target="_blank">
                    politique de confidentialité
                  </Link>
                </FormLabel>
                <FormMessage />
              </div>
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
              Création du compte...
            </>
          ) : (
            'Créer mon compte'
          )}
        </Button>
      </form>
    </Form>
  )
}
