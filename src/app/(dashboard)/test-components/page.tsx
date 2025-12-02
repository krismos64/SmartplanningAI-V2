'use client'

/**
 * Page de test des composants métier (UserCard, TeamCard)
 *
 * SP-123 : Composants métier SmartPlanning
 *
 * Cette page est accessible uniquement en développement.
 * URL : http://localhost:3000/test-components
 *
 * Sections :
 * 1. UserCard - Variants compact/detailed
 * 2. UserCard - États (loading, selected)
 * 3. TeamCard - Variants compact/detailed
 * 4. TeamCard - États (loading)
 * 5. AvatarStack - Tailles et options
 * 6. Actions dropdown showcase
 */

import React, { useState } from 'react'
import { notFound } from 'next/navigation'
import {
  UserCard,
  UserCardSkeleton,
  TeamCard,
  TeamCardSkeleton,
  AvatarStack,
  UserStatus,
  CardAction,
  TeamMember,
} from '@/components/cards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/toast'
import {
  User,
  Pencil,
  Trash2,
  Eye,
  Mail,
  UserPlus,
  Settings,
  Users,
} from 'lucide-react'

// Guard : page accessible uniquement en développement
if (process.env.NODE_ENV !== 'development') {
  notFound()
}

// ============================================================================
// DONNÉES MOCK
// ============================================================================

const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Jean Dupont',
    email: 'jean.dupont@smartplanning.fr',
    image: null,
    role: 'MANAGER' as const,
  },
  {
    id: 'u2',
    name: 'Marie Martin',
    email: 'marie.martin@smartplanning.fr',
    image: 'https://i.pravatar.cc/150?u=marie',
    role: 'DIRECTOR' as const,
  },
  {
    id: 'u3',
    name: 'Pierre Durand',
    email: 'pierre.durand@smartplanning.fr',
    image: 'https://i.pravatar.cc/150?u=pierre',
    role: 'EMPLOYEE' as const,
  },
  {
    id: 'u4',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@smartplanning.fr',
    image: null,
    role: 'SYSTEM_ADMIN' as const,
  },
]

const MOCK_EMPLOYEES = [
  {
    firstName: 'Jean',
    lastName: 'Dupont',
    jobTitle: 'Product Manager',
    department: 'Produit',
    phone: '+33 6 12 34 56 78',
  },
  {
    firstName: 'Marie',
    lastName: 'Martin',
    jobTitle: 'Directrice Technique',
    department: 'IT',
    phone: '+33 6 98 76 54 32',
  },
  {
    firstName: 'Pierre',
    lastName: 'Durand',
    jobTitle: 'Développeur Frontend',
    department: 'Développement',
    phone: null,
  },
]

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'm1',
    name: 'Alice Petit',
    image: 'https://i.pravatar.cc/150?u=alice',
    status: 'active',
  },
  {
    id: 'm2',
    name: 'Bob Grand',
    image: 'https://i.pravatar.cc/150?u=bob',
    status: 'active',
  },
  { id: 'm3', name: 'Claire Moyen', image: null, status: 'on_leave' },
  {
    id: 'm4',
    name: 'David Fort',
    image: 'https://i.pravatar.cc/150?u=david',
    status: 'active',
  },
  {
    id: 'm5',
    name: 'Emma Blanc',
    image: 'https://i.pravatar.cc/150?u=emma',
    status: 'absent',
  },
  { id: 'm6', name: 'François Noir', image: null, status: 'active' },
  {
    id: 'm7',
    name: 'Gabrielle Rouge',
    image: 'https://i.pravatar.cc/150?u=gabrielle',
    status: 'active',
  },
  { id: 'm8', name: 'Henri Vert', image: null, status: 'inactive' },
]

const MOCK_TEAMS = [
  {
    id: 't1',
    name: 'Équipe Frontend',
    description:
      'Développement des interfaces utilisateur avec React et Next.js',
    color: '#3B82F6',
  },
  {
    id: 't2',
    name: 'Équipe Backend',
    description: 'APIs, bases de données et infrastructure',
    color: '#10B981',
  },
  {
    id: 't3',
    name: 'Équipe Design',
    description: null,
    color: '#8B5CF6',
  },
]

const STATUSES: UserStatus[] = ['active', 'on_leave', 'absent', 'inactive']

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function TestComponentsPage() {
  const { success, error } = useToast()
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  // Actions pour UserCard
  const getUserActions = (userId: string): CardAction[] => [
    {
      label: 'Voir profil',
      icon: Eye,
      onClick: () => success(`Voir profil de ${userId}`),
    },
    {
      label: 'Envoyer email',
      icon: Mail,
      onClick: () => success(`Email envoyé à ${userId}`),
    },
    {
      label: 'Modifier',
      icon: Pencil,
      onClick: () => success(`Modification de ${userId}`),
    },
    {
      label: 'Supprimer',
      icon: Trash2,
      onClick: () => error(`Suppression de ${userId}`),
      variant: 'destructive',
      separator: true,
    },
  ]

  // Actions pour TeamCard
  const getTeamActions = (teamId: string): CardAction[] => [
    {
      label: 'Voir équipe',
      icon: Users,
      onClick: () => success(`Voir équipe ${teamId}`),
    },
    {
      label: 'Ajouter membre',
      icon: UserPlus,
      onClick: () => success(`Ajout membre à ${teamId}`),
    },
    {
      label: 'Paramètres',
      icon: Settings,
      onClick: () => success(`Paramètres de ${teamId}`),
    },
    {
      label: 'Supprimer',
      icon: Trash2,
      onClick: () => error(`Suppression de ${teamId}`),
      variant: 'destructive',
      separator: true,
    },
  ]

  // Toggle sélection
  const toggleSelection = (userId: string, selected: boolean) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(userId)
      } else {
        next.delete(userId)
      }
      return next
    })
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Test Composants Métier</h1>
        <p className="text-muted-foreground">
          SP-123 : UserCard et TeamCard avec variants, actions et états
        </p>
        <Badge variant="outline" className="mt-2">
          Dev only - Non visible en production
        </Badge>
      </div>

      {/* ================================================================ */}
      {/* SECTION 1 : UserCard Variants */}
      {/* ================================================================ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            1. UserCard - Variants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Compact */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Variant: compact (défaut)
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {MOCK_USERS.slice(0, 2).map((user, i) => (
                <UserCard
                  key={user.id}
                  user={user}
                  employee={MOCK_EMPLOYEES[i]}
                  status={STATUSES[i]}
                  variant="compact"
                  actions={getUserActions(user.id)}
                  onClick={() => success(`Clic sur ${user.name}`)}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Detailed */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Variant: detailed
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_USERS.slice(0, 3).map((user, i) => (
                <UserCard
                  key={user.id}
                  user={user}
                  employee={MOCK_EMPLOYEES[i]}
                  status={STATUSES[i]}
                  variant="detailed"
                  actions={getUserActions(user.id)}
                  onClick={() => success(`Clic sur ${user.name}`)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* SECTION 2 : UserCard États */}
      {/* ================================================================ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            2. UserCard - États
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              État: Loading (isLoading=true)
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <UserCardSkeleton variant="compact" />
              <UserCardSkeleton variant="detailed" />
            </div>
          </div>

          <Separator />

          {/* Selection */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Mode sélection (onSelect défini) -{' '}
              <span className="text-primary">
                {selectedUsers.size} sélectionné(s)
              </span>
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {MOCK_USERS.map((user, i) => (
                <UserCard
                  key={user.id}
                  user={user}
                  status={STATUSES[i % 4]}
                  variant="compact"
                  isSelected={selectedUsers.has(user.id)}
                  onSelect={(selected) => toggleSelection(user.id, selected)}
                  actions={getUserActions(user.id)}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Tous les statuts */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Tous les statuts
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {STATUSES.map((status, i) => {
                const user = MOCK_USERS[i % MOCK_USERS.length]!
                return (
                  <UserCard
                    key={status}
                    user={user}
                    status={status}
                    variant="compact"
                  />
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* SECTION 3 : TeamCard Variants */}
      {/* ================================================================ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            3. TeamCard - Variants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Compact */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Variant: compact (défaut)
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {MOCK_TEAMS.slice(0, 2).map((team, i) => {
                const user = MOCK_USERS[i % MOCK_USERS.length]!
                return (
                  <TeamCard
                    key={team.id}
                    team={team}
                    manager={{
                      id: user.id,
                      name: user.name,
                      image: user.image,
                    }}
                    members={MOCK_TEAM_MEMBERS.slice(0, 6 + i * 2)}
                    totalMembers={12 + i * 3}
                    variant="compact"
                    actions={getTeamActions(team.id)}
                    onClick={() => success(`Clic sur ${team.name}`)}
                  />
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Detailed */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Variant: detailed
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_TEAMS.map((team, i) => {
                const user = MOCK_USERS[i % MOCK_USERS.length]!
                return (
                  <TeamCard
                    key={team.id}
                    team={team}
                    manager={{
                      id: user.id,
                      name: user.name,
                      image: user.image,
                    }}
                    members={MOCK_TEAM_MEMBERS}
                    totalMembers={12 + i * 5}
                    stats={{
                      activeCount: 8 + i,
                      onLeaveCount: 2 - i > 0 ? 2 - i : 0,
                    }}
                    variant="detailed"
                    actions={getTeamActions(team.id)}
                    onClick={() => success(`Clic sur ${team.name}`)}
                  />
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* SECTION 4 : TeamCard États */}
      {/* ================================================================ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            4. TeamCard - États
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              État: Loading (isLoading=true)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <TeamCardSkeleton variant="compact" />
              <TeamCardSkeleton variant="detailed" />
            </div>
          </div>

          <Separator />

          {/* Sans manager */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Sans manager
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <TeamCard
                team={MOCK_TEAMS[2]!}
                manager={null}
                members={MOCK_TEAM_MEMBERS.slice(0, 3)}
                variant="compact"
              />
              <TeamCard
                team={MOCK_TEAMS[2]!}
                manager={null}
                members={MOCK_TEAM_MEMBERS.slice(0, 3)}
                variant="detailed"
                stats={{ activeCount: 3, onLeaveCount: 0 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* SECTION 5 : AvatarStack */}
      {/* ================================================================ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            5. AvatarStack - Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tailles */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Tailles (sm / md)
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-muted-foreground">sm:</span>
                <AvatarStack members={MOCK_TEAM_MEMBERS} max={5} size="sm" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-muted-foreground">md:</span>
                <AvatarStack members={MOCK_TEAM_MEMBERS} max={5} size="md" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Max différents */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Max (3, 5, 8)
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-muted-foreground">
                  max=3:
                </span>
                <AvatarStack members={MOCK_TEAM_MEMBERS} max={3} />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-muted-foreground">
                  max=5:
                </span>
                <AvatarStack members={MOCK_TEAM_MEMBERS} max={5} />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-muted-foreground">
                  max=8:
                </span>
                <AvatarStack members={MOCK_TEAM_MEMBERS} max={8} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Avec statuts */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Avec indicateurs de statut (showStatus=true)
            </h3>
            <div className="flex items-center gap-4">
              <AvatarStack
                members={MOCK_TEAM_MEMBERS}
                max={5}
                size="md"
                showStatus
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* SECTION 6 : Actions Dropdown */}
      {/* ================================================================ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            6. Actions Dropdown - Showcase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Les actions sont configurables via la prop <code>actions</code>.
            Cliquez sur le menu ⋮ pour voir les options.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <UserCard
              user={MOCK_USERS[0]!}
              employee={MOCK_EMPLOYEES[0]}
              status="active"
              actions={[
                {
                  label: 'Action 1',
                  icon: Eye,
                  onClick: () => success('Action 1'),
                },
                {
                  label: 'Action 2',
                  icon: Pencil,
                  onClick: () => success('Action 2'),
                },
                {
                  label: 'Action désactivée',
                  icon: Settings,
                  onClick: () => {},
                  disabled: true,
                },
                {
                  label: 'Action danger',
                  icon: Trash2,
                  onClick: () => error('Danger!'),
                  variant: 'destructive',
                  separator: true,
                },
              ]}
            />
            <TeamCard
              team={MOCK_TEAMS[0]!}
              manager={{ id: 'm1', name: 'Manager', image: null }}
              members={MOCK_TEAM_MEMBERS.slice(0, 4)}
              actions={[
                { label: 'Voir', icon: Eye, onClick: () => success('Voir') },
                {
                  label: 'Éditer',
                  icon: Pencil,
                  onClick: () => success('Éditer'),
                },
                {
                  label: 'Supprimer',
                  icon: Trash2,
                  onClick: () => error('Supprimer'),
                  variant: 'destructive',
                  separator: true,
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Composants créés pour SP-123 | Pattern Context7 React (forwardRef, CVA
          variants)
        </p>
      </div>
    </div>
  )
}
