/**
 * Formulaire creation/edition Team
 *
 * @description Formulaire React Hook Form + Zod pour CRUD Teams.
 * Utilise les composants forms existants et hooks CRUD.
 * Permet la selection d'un manager parmi les employes de la company.
 *
 * @ticket SP-153
 * @see Context7 - React Hook Form + Zod validation patterns
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Users, Palette, User, FileText } from 'lucide-react'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useIsImpersonating } from '@/hooks'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import {
  DEFAULT_TEAM_COLOR,
  TEAM_COLOR_PALETTE,
  type TeamWithCounts,
  type TeamMemberInfo,
} from '@/lib/validations/team'
import { createTeam, updateTeam } from '@/lib/actions/teams'

// ============================================================================
// Types
// ============================================================================

interface TeamFormProps {
  /** Team existante pour edition (undefined = creation) */
  team?: TeamWithCounts
  /** ID de l'entreprise (requis pour creation) */
  companyId: string
  /** Liste des managers potentiels */
  managers?: TeamMemberInfo[]
  /** Callback apres succes */
  onSuccess?: () => void
  /** Callback apres annulation */
  onCancel?: () => void
}

// Schema simplifie pour le formulaire
const teamFormSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom de l'équipe doit contenir au moins 2 caractères")
    .max(100, "Le nom de l'équipe ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format de couleur invalide'),
  managerId: z.string().optional().or(z.literal('')),
})

type TeamFormValues = z.infer<typeof teamFormSchema>

// ============================================================================
// Composant
// ============================================================================

export function TeamForm({
  team,
  companyId,
  managers = [],
  onSuccess,
  onCancel,
}: TeamFormProps) {
  const router = useRouter()
  const isImpersonating = useIsImpersonating()
  const isEditing = !!team

  // Hook mutation pour create
  const createMutation = useCrudMutation(createTeam, {
    successMessage: 'Équipe créée avec succès',
    onSuccess: () => {
      onSuccess?.()
      router.push('/app/directeur/equipes')
      router.refresh()
    },
  })

  // Hook mutation pour update
  const updateMutation = useCrudMutation(updateTeam, {
    successMessage: 'Équipe modifiée avec succès',
    onSuccess: () => {
      onSuccess?.()
      router.push('/app/directeur/equipes')
      router.refresh()
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  // Initialisation du formulaire
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: isEditing
      ? {
          name: team.name,
          description: team.description || '',
          color: team.color || DEFAULT_TEAM_COLOR,
          managerId: team.managerId || '',
        }
      : {
          name: '',
          description: '',
          color: DEFAULT_TEAM_COLOR,
          managerId: '',
        },
  })

  // Reset form when team changes
  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description || '',
        color: team.color || DEFAULT_TEAM_COLOR,
        managerId: team.managerId || '',
      })
    }
  }, [team, form])

  // Soumission du formulaire
  const onSubmit = (data: TeamFormValues) => {
    const cleanedData = {
      name: data.name,
      description: data.description || null,
      color: data.color,
      managerId: data.managerId || null,
    }

    if (isEditing && team) {
      void updateMutation.mutate({ id: team.id, ...cleanedData })
    } else {
      void createMutation.mutate({ companyId, ...cleanedData })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="space-y-8"
      >
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informations de l&apos;équipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nom */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;équipe *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Équipe Marketing"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Description de l'équipe..."
                        className="min-h-[100px] pl-10"
                        {...field}
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Décrivez brièvement le rôle et les objectifs de
                    l&apos;équipe
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Couleur et Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Personnalisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Couleur */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur de l&apos;équipe</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {TEAM_COLOR_PALETTE.map((colorOption) => (
                        <button
                          key={colorOption.value}
                          type="button"
                          onClick={() => field.onChange(colorOption.value)}
                          disabled={isPending}
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            field.value === colorOption.value
                              ? 'scale-110 border-primary ring-2 ring-primary ring-offset-2'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: colorOption.value }}
                          title={colorOption.label}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Cette couleur sera utilisée pour identifier l&apos;équipe
                    dans les plannings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Manager */}
            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager de l&apos;équipe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val === '__none__' ? '' : val)
                        }
                        value={field.value || '__none__'}
                        disabled={isPending}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Sélectionner un manager (optionnel)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">
                            Aucun manager
                          </SelectItem>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.firstName} {manager.lastName}
                              {manager.jobTitle && ` - ${manager.jobTitle}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Le manager pourra gérer les membres et les plannings de
                    l&apos;équipe
                  </FormDescription>
                  <FormMessage />
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
                : "Créer l'équipe"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
