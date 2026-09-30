/**
 * RegisterForm - Formulaire d'inscription SaaS
 *
 * @description Client Component pour l'inscription avec :
 * - React Hook Form + zodResolver pour validation
 * - Server Action registerAction pour création Company + User
 * - Gestion des erreurs avec toast (Sonner)
 * - Écran « vérifiez votre boîte mail » après succès (SP-605)
 * - Support light/dark mode via CSS variables
 *
 * @ticket SP-139
 * @see Context7 - Next.js 15 Server Actions, React Hook Form
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, Building2, Phone } from 'lucide-react'
import { toast } from 'sonner'

import { signupSchema, type SignupFormData } from '@/lib/validations'
import { registerAction } from '@/lib/actions'
import { useUmamiTrack } from '@/hooks/use-umami-track'
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
import { AUTH_BUTTON_CLASSES } from '@/app/(landing)/components'

import { RegisterCheckEmail } from './RegisterCheckEmail'

/**
 * RegisterForm Component
 *
 * Formulaire d'inscription pour nouveaux clients SaaS.
 * Crée une Company et un User DIRECTOR via Server Action, puis cède la place
 * à l'écran de vérification d'email.
 */
export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  // SP-605 : adresse du compte créé, dont l'email reste à vérifier
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  // SP-591 : instrumentation du tunnel, etapes 2 et 3
  const { track } = useUmamiTrack()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  /**
   * Submit handler
   *
   * 1. Appelle registerAction (Server Action)
   * 2. Si succès : affiche l'écran de vérification d'email
   * 3. Sinon : toast d'erreur et focus sur le champ en cause
   */
  async function onSubmit(data: SignupFormData) {
    setIsLoading(true)

    // SP-591 : etape 2 du tunnel. Emise a la soumission et non au montage de
    // la page : ouvrir /register sans rien remplir n'est pas une intention
    // d'inscription, et compter les deux ensemble ecraserait l'abandon de
    // formulaire, qui est justement ce qu'on cherche a mesurer.
    track('funnel-signup-start', { stepRank: 2, source: 'client' })

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

      // SP-591 : etape 3 du tunnel, le compte est cree. L'ecart avec l'etape 2
      // mesure les echecs de creation, refus de validation compris.
      track('funnel-signup-complete', { stepRank: 3, source: 'client' })

      // 2. Succès. SP-605 : pas de connexion automatique, elle échouerait
      // toujours tant que l'email n'est pas vérifié (SP-526). L'écran qui
      // suit dit où est le lien au lieu de renvoyer vers /login.
      setRegisteredEmail(data.email)
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

  if (registeredEmail) {
    return <RegisterCheckEmail email={registeredEmail} />
  }

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Jean Dupont"
                  autoComplete="name"
                  disabled={isLoading}
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
              <FormLabel>Email professionnel</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="jean@entreprise.com"
                  autoComplete="email"
                  disabled={isLoading}
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
              <FormLabel>Nom de votre organisation</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-public-content-muted" />
                  <Input
                    type="text"
                    placeholder="Mon Entreprise SAS"
                    autoComplete="organization"
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

        {/* Phone Field (optional) */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Téléphone{' '}
                <span className="font-normal text-public-content-muted">
                  (optionnel)
                </span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-public-content-muted" />
                  <Input
                    type="tel"
                    placeholder="0612345678"
                    autoComplete="tel"
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
                      <EyeOff className="h-4 w-4 text-public-content-muted" />
                    ) : (
                      <Eye className="h-4 w-4 text-public-content-muted" />
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
                      <EyeOff className="h-4 w-4 text-public-content-muted" />
                    ) : (
                      <Eye className="h-4 w-4 text-public-content-muted" />
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
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer text-sm font-normal">
                  J&apos;accepte les{' '}
                  <Link
                    href="/cgu"
                    className="font-medium text-public-content underline underline-offset-4 transition-colors hover:text-public-accent"
                    target="_blank"
                  >
                    conditions d&apos;utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link
                    href="/confidentialite"
                    className="font-medium text-public-content underline underline-offset-4 transition-colors hover:text-public-accent"
                    target="_blank"
                  >
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
          className={cn('w-full', AUTH_BUTTON_CLASSES)}
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
