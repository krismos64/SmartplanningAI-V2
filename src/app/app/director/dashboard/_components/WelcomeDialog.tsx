/**
 * WelcomeDialog - Écran de bienvenue à la première connexion (DIRECTOR)
 *
 * Affiché une seule fois, juste après l'inscription : le dashboard director
 * atterrit sur des widgets vides (aucune équipe, aucun planning) et les CTA
 * utiles sont noyés en bas de page. Ce dialog raccourcit le chemin vers la
 * première action utile au lieu de laisser l'utilisateur deviner.
 *
 * CTA vers la création d'employé (pas d'équipe) : le formulaire de création
 * d'équipe propose d'assigner un manager, ce qui n'a pas de sens tant
 * qu'aucun employé n'existe. L'ordre logique métier est employé → équipe
 * (avec manager assignable une fois qu'il y a du monde à assigner).
 *
 * Volontairement minimal : pas de tunnel multi-étapes, pas de récap de
 * fonctionnalités. Un message + une action.
 */
'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { markWelcomeSeen } from '@/lib/actions/onboarding'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

export interface WelcomeDialogProps {
  /** Le dialog est-il ouvert (contrôlé par le parent selon hasSeenWelcome) */
  open: boolean
  /** Prénom (ou nom complet) à afficher dans le message de bienvenue */
  userName: string
}

export function WelcomeDialog({ open, userName }: WelcomeDialogProps) {
  const router = useRouter()

  const dismissAction = useCallback(() => markWelcomeSeen(), [])
  const { mutate, isPending } = useCrudMutation(dismissAction, {
    showToasts: false,
  })

  const handleAddEmployee = useCallback(async () => {
    await mutate(undefined)
    router.push('/app/dashboard/employees/new')
  }, [mutate, router])

  const handleDismiss = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        void mutate(undefined)
      }
    },
    [mutate]
  )

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent className="glass-strong border-none sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
            <UserPlus
              className="h-6 w-6 text-neon-primary"
              aria-hidden="true"
            />
          </div>
          <DialogTitle className="text-xl">
            Bienvenue, {userName} !
          </DialogTitle>
          <DialogDescription>
            Pour commencer, ajoutons votre premier employé. Vous pourrez
            ensuite créer des équipes et leur assigner un manager.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => void handleAddEmployee()}
            disabled={isPending}
            className="w-full"
          >
            Ajouter un employé
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleDismiss(false)}
            disabled={isPending}
            className="w-full"
          >
            Plus tard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default WelcomeDialog
