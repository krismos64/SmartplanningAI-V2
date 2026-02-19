/**
 * Gestionnaire de membres d'équipe
 *
 * @description Composant pour ajouter et retirer des membres d'une equipe.
 * Affiche la liste des membres actuels et permet d'ajouter des employes.
 *
 * @ticket SP-153
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, UserMinus, Search, Users, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useIsImpersonating } from '@/hooks'

import {
  type TeamMemberInfo,
  type TeamWithDetails,
  getFullName,
} from '@/lib/validations/team'
import {
  addTeamMember,
  removeTeamMember,
  getAvailableEmployees,
} from '@/lib/actions/teams'

// ============================================================================
// Types
// ============================================================================

interface TeamMembersManagerProps {
  /** Team avec ses membres */
  team: TeamWithDetails
  /** Callback lors d'un changement de membres */
  onMembersChange?: (team: TeamWithDetails) => void
  /** Mode lecture seule */
  readOnly?: boolean
}

// ============================================================================
// Composant Membre
// ============================================================================

function MemberItem({
  member,
  onRemove,
  isRemoving,
  readOnly,
  isImpersonating,
}: {
  member: TeamMemberInfo
  onRemove: () => void
  isRemoving: boolean
  readOnly: boolean
  isImpersonating: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.user?.image || undefined} />
          <AvatarFallback>
            {member.firstName[0]}
            {member.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{getFullName(member)}</div>
          <div className="flex items-center gap-2">
            {member.jobTitle && (
              <span className="text-sm text-muted-foreground">
                {member.jobTitle}
              </span>
            )}
            {!member.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactif
              </Badge>
            )}
          </div>
        </div>
      </div>
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
          disabled={isRemoving || isImpersonating}
          title={isImpersonating ? 'Non disponible en mode support' : undefined}
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserMinus className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// Composant Principal
// ============================================================================

export function TeamMembersManager({
  team,
  onMembersChange,
  readOnly = false,
}: TeamMembersManagerProps) {
  const isImpersonating = useIsImpersonating()
  const [members, setMembers] = useState<TeamMemberInfo[]>(team.employees)
  const [availableEmployees, setAvailableEmployees] = useState<
    TeamMemberInfo[]
  >([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [addingMemberId, setAddingMemberId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<TeamMemberInfo | null>(
    null
  )

  // Charger les employes disponibles quand le dialog s'ouvre
  const loadAvailableEmployees = useCallback(async () => {
    setIsLoadingAvailable(true)
    try {
      const result = await getAvailableEmployees(team.id)
      if (result.success && result.data) {
        setAvailableEmployees(result.data)
      } else if (!result.success) {
        toast.error(
          result.error ?? 'Impossible de charger les employés disponibles'
        )
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoadingAvailable(false)
    }
  }, [team.id])

  useEffect(() => {
    if (isDialogOpen) {
      void loadAvailableEmployees()
    }
  }, [isDialogOpen, loadAvailableEmployees])

  // Synchroniser les membres quand le team change
  useEffect(() => {
    setMembers(team.employees)
  }, [team.employees])

  // Ajouter un membre
  const handleAddMember = async (employeeId: string) => {
    setAddingMemberId(employeeId)
    try {
      const result = await addTeamMember(team.id, employeeId)
      if (result.success && result.data) {
        setMembers(result.data.employees)
        setAvailableEmployees((prev) => prev.filter((e) => e.id !== employeeId))
        onMembersChange?.(result.data)
        toast.success("Membre ajouté à l'équipe")
      } else if (!result.success) {
        toast.error(result.error ?? "Impossible d'ajouter le membre")
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setAddingMemberId(null)
    }
  }

  // Retirer un membre
  const handleRemoveMember = async (employeeId: string) => {
    setRemovingMemberId(employeeId)
    try {
      const result = await removeTeamMember(team.id, employeeId)
      if (result.success && result.data) {
        setMembers(result.data.employees)
        onMembersChange?.(result.data)
        toast.success("Membre retiré de l'équipe")
      } else if (!result.success) {
        toast.error(result.error ?? 'Impossible de retirer le membre')
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setRemovingMemberId(null)
      setConfirmRemove(null)
    }
  }

  // Filtrer les employes disponibles
  const filteredAvailable = availableEmployees.filter((employee) => {
    const fullName = getFullName(employee).toLowerCase()
    const jobTitle = employee.jobTitle?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || jobTitle.includes(query)
  })

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membres de l&apos;équipe
            </CardTitle>
            <CardDescription>
              {members.length} membre{members.length !== 1 ? 's' : ''} dans
              cette équipe
            </CardDescription>
          </div>
          {!readOnly && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={isImpersonating}
                  title={
                    isImpersonating
                      ? 'Non disponible en mode support'
                      : undefined
                  }
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter un membre
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ajouter un membre</DialogTitle>
                  <DialogDescription>
                    Sélectionnez un employé à ajouter à l&apos;équipe
                  </DialogDescription>
                </DialogHeader>

                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un employé..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Liste des employes disponibles */}
                <ScrollArea className="h-[300px] pr-4">
                  {isLoadingAvailable ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredAvailable.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {searchQuery
                          ? 'Aucun employé trouvé'
                          : 'Tous les employés sont déjà dans une équipe'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAvailable.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={employee.user?.image || undefined}
                              />
                              <AvatarFallback>
                                {employee.firstName[0]}
                                {employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {getFullName(employee)}
                              </div>
                              {employee.jobTitle && (
                                <span className="text-sm text-muted-foreground">
                                  {employee.jobTitle}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => void handleAddMember(employee.id)}
                            disabled={
                              addingMemberId === employee.id || isImpersonating
                            }
                            title={
                              isImpersonating
                                ? 'Non disponible en mode support'
                                : undefined
                            }
                          >
                            {addingMemberId === employee.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>

        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucun membre dans cette équipe
              </p>
              {!readOnly && (
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(true)}
                  disabled={isImpersonating}
                  title={
                    isImpersonating
                      ? 'Non disponible en mode support'
                      : undefined
                  }
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter le premier membre
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  onRemove={() => setConfirmRemove(member)}
                  isRemoving={removingMemberId === member.id}
                  readOnly={readOnly}
                  isImpersonating={isImpersonating}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove && (
                <>
                  Voulez-vous vraiment retirer{' '}
                  <strong>{getFullName(confirmRemove)}</strong> de l&apos;équipe
                  ?
                  <br />
                  Cette action peut être annulée en rajoutant le membre.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
              onClick={() =>
                confirmRemove && void handleRemoveMember(confirmRemove.id)
              }
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
