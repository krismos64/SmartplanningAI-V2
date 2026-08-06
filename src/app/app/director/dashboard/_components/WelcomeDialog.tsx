/**
 * WelcomeDialog - Écran de bienvenue à la première connexion (DIRECTOR)
 *
 * Affiché une seule fois, juste après l'inscription : le dashboard director
 * atterrit sur des widgets vides (aucune équipe, aucun planning) et les CTA
 * utiles sont noyés en bas de page. Ce dialog raccourcit le chemin vers la
 * première action utile au lieu de laisser l'utilisateur deviner.
 *
 * CTA vers la création d'équipe : le formulaire employé propose d'affecter une
 * équipe, impossible tant qu'aucune n'existe. Le manager d'une équipe est lui
 * optionnel et s'assigne après coup, donc l'ordre équipe → employé est le seul
 * qui ne met pas l'utilisateur dans une impasse. Même ordre que la checklist
 * du dashboard (OnboardingChecklist), les deux doivent rester alignées.
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
import { Users } from 'lucide-react'

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

  const handleCreateTeam = useCallback(async () => {
    await mutate(undefined)
    router.push('/app/director/teams/new')
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
            <Users className="text-neon-primary h-6 w-6" aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl">Bienvenue, {userName} !</DialogTitle>
          <DialogDescription>
            Pour commencer, créons votre première équipe. Vous pourrez ensuite y
            ajouter vos employés et désigner un manager.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => void handleCreateTeam()}
            disabled={isPending}
            className="w-full"
          >
            Créer une équipe
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
