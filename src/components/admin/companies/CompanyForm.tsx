/**
 * Formulaire création/édition Company
 *
 * @description Formulaire React Hook Form + Zod pour CRUD Companies.
 * Utilise les composants forms existants (SP-119) et hooks CRUD (SP-150).
 *
 * @ticket SP-151
 * @see Context7 - React Hook Form + Zod validation patterns
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Building2, Mail, Phone, MapPin, Globe, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useIsImpersonating } from '@/hooks'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import {
  subscriptionPlanLabels,
  subscriptionStatusLabels,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from '@/lib/validations/company'
import {
  createCompany,
  updateCompany,
  type CompanyDetail,
} from '@/lib/actions/companies'

// ============================================================================
// Types
// ============================================================================

interface CompanyFormProps {
  /** Company existante pour édition (undefined = création) */
  company?: CompanyDetail
  /** Callback après succès */
  onSuccess?: () => void
  /** Callback après annulation */
  onCancel?: () => void
}

// Schéma simplifié pour le formulaire
const companyFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  timezone: z.string(),
  subscriptionPlan: z.enum(['FREE', 'PER_SEAT']),
  subscriptionStatus: z.enum([
    'TRIAL',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'EXPIRED',
    'INCOMPLETE',
  ]),
  isActive: z.boolean(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

// ============================================================================
// Composant
// ============================================================================

export function CompanyForm({
  company,
  onSuccess,
  onCancel,
}: CompanyFormProps) {
  const router = useRouter()
  const isImpersonating = useIsImpersonating()
  const isEditing = !!company

  // Hook mutation pour create
  const createMutation = useCrudMutation(createCompany, {
    successMessage: 'Entreprise créée avec succès',
    onSuccess: () => {
      onSuccess?.()
      router.push('/admin/companies')
      router.refresh()
    },
  })

  // Hook mutation pour update
  const updateMutation = useCrudMutation(updateCompany, {
    successMessage: 'Entreprise modifiée avec succès',
    onSuccess: () => {
      onSuccess?.()
      router.push('/admin/companies')
      router.refresh()
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  // Initialisation du formulaire
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: isEditing
      ? {
          name: company.name,
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || '',
          timezone: company.timezone,
          subscriptionPlan: (company.subscription?.plan ??
            'FREE') as SubscriptionPlan,
          subscriptionStatus: (company.subscription?.status ??
            'TRIAL') as SubscriptionStatus,
          isActive: company.isActive,
        }
      : {
          name: '',
          email: '',
          phone: '',
          address: '',
          timezone: 'Europe/Paris',
          subscriptionPlan: 'FREE',
          subscriptionStatus: 'TRIAL',
          isActive: true,
        },
  })

  // Soumission du formulaire
  const onSubmit = (data: CompanyFormValues) => {
    if (isEditing && company) {
      void updateMutation.mutate({ id: company.id, ...data })
    } else {
      void createMutation.mutate(data)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="space-y-8"
      >
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nom */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;entreprise *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Corporation"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Le nom sera utilisé pour générer un slug unique (URL)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de contact</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="contact@acme.com"
                        className="pl-10"
                        {...field}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Téléphone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+33 1 23 45 67 89"
                        className="pl-10"
                        {...field}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adresse */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        placeholder="123 Rue de la Paix&#10;75001 Paris"
                        className="min-h-[80px] pl-10"
                        {...field}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fuseau horaire */}
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuseau horaire</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Sélectionner un fuseau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Paris">
                            Europe/Paris (UTC+1/+2)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            Europe/London (UTC+0/+1)
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            America/New_York (UTC-5/-4)
                          </SelectItem>
                          <SelectItem value="Asia/Tokyo">
                            Asia/Tokyo (UTC+9)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Abonnement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan */}
            <FormField
              control={form.control}
              name="subscriptionPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan d&apos;abonnement</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(
                            subscriptionPlanLabels
                          ) as SubscriptionPlan[]
                        ).map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            {subscriptionPlanLabels[plan]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    FREE : gratuit | PER_SEAT : 2,90€/employé/mois
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statut */}
            <FormField
              control={form.control}
              name="subscriptionStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut de l&apos;abonnement</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(
                            subscriptionStatusLabels
                          ) as SubscriptionStatus[]
                        ).map((status) => (
                          <SelectItem key={status} value={status}>
                            {subscriptionStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statut actif */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Entreprise active
                    </FormLabel>
                    <FormDescription>
                      Désactiver l&apos;entreprise bloque l&apos;accès de tous
                      ses utilisateurs
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel ?? (() => router.back())}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isPending || isImpersonating}
            data-testid="company-form-submit"
            title={
              isImpersonating ? 'Non disponible en mode support' : undefined
            }
          >
            {isPending
              ? isEditing
                ? 'Modification...'
                : 'Création...'
              : isEditing
                ? 'Modifier'
                : "Créer l'entreprise"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
