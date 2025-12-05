/**
 * Fixtures Équipes - Données mock pour les tests
 *
 * Ces fixtures simulent les données Prisma Team
 * utilisées dans les composants TeamCard, AvatarStack, etc.
 *
 * @ticket SP-126
 */

import type {
  TeamCardTeam,
  TeamManager,
  TeamMember,
  TeamStats,
  CardAction,
  UserStatus,
} from '@/components/cards/types'

// ============================================================================
// ÉQUIPES MOCK
// ============================================================================

/**
 * Équipe Frontend
 */
export const mockTeamFrontend: TeamCardTeam = {
  id: 'team-1',
  name: 'Équipe Frontend',
  description: 'Développement des interfaces utilisateur React/Next.js',
  color: '#3B82F6', // blue-500
}

/**
 * Équipe Backend
 */
export const mockTeamBackend: TeamCardTeam = {
  id: 'team-2',
  name: 'Équipe Backend',
  description: 'API et services Node.js/Express',
  color: '#10B981', // green-500
}

/**
 * Équipe sans description
 */
export const mockTeamMinimal: TeamCardTeam = {
  id: 'team-3',
  name: 'Équipe Support',
  description: null,
  color: '#F59E0B', // amber-500
}

/**
 * Équipe Design
 */
export const mockTeamDesign: TeamCardTeam = {
  id: 'team-4',
  name: 'Design & UX',
  description: 'Conception des interfaces et expérience utilisateur',
  color: '#8B5CF6', // violet-500
}

// ============================================================================
// MANAGERS MOCK
// ============================================================================

/**
 * Manager de base
 */
export const mockManager: TeamManager = {
  id: 'manager-1',
  name: 'Marie Martin',
  image: null,
}

/**
 * Manager avec avatar
 */
export const mockManagerWithAvatar: TeamManager = {
  id: 'manager-2',
  name: 'Pierre Bernard',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre',
}

/**
 * Manager sans nom (edge case)
 */
export const mockManagerNoName: TeamManager = {
  id: 'manager-3',
  name: null,
  image: null,
}

// ============================================================================
// MEMBRES D'ÉQUIPE MOCK
// ============================================================================

/**
 * Membre actif
 */
export const mockMemberActive: TeamMember = {
  id: 'member-1',
  name: 'Jean Dupont',
  image: null,
  status: 'active',
}

/**
 * Membre en congé
 */
export const mockMemberOnLeave: TeamMember = {
  id: 'member-2',
  name: 'Sophie Leroy',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  status: 'on_leave',
}

/**
 * Membre absent
 */
export const mockMemberAbsent: TeamMember = {
  id: 'member-3',
  name: 'Thomas Garcia',
  image: null,
  status: 'absent',
}

/**
 * Membre inactif
 */
export const mockMemberInactive: TeamMember = {
  id: 'member-4',
  name: 'Julie Petit',
  image: null,
  status: 'inactive',
}

/**
 * Membre sans statut
 */
export const mockMemberNoStatus: TeamMember = {
  id: 'member-5',
  name: 'Lucas Moreau',
  image: null,
  status: undefined,
}

/**
 * Liste de membres variés
 */
export const mockTeamMembers: TeamMember[] = [
  mockMemberActive,
  mockMemberOnLeave,
  mockMemberAbsent,
  mockMemberInactive,
  mockMemberNoStatus,
]

/**
 * Grande liste de membres (pour tester AvatarStack avec +X)
 */
export const mockLargeTeamMembers: TeamMember[] = [
  { id: 'm1', name: 'Alice Martin', image: null, status: 'active' as UserStatus },
  { id: 'm2', name: 'Bob Dupont', image: null, status: 'active' as UserStatus },
  { id: 'm3', name: 'Claire Leroy', image: null, status: 'on_leave' as UserStatus },
  { id: 'm4', name: 'David Garcia', image: null, status: 'active' as UserStatus },
  { id: 'm5', name: 'Emma Petit', image: null, status: 'active' as UserStatus },
  { id: 'm6', name: 'François Moreau', image: null, status: 'absent' as UserStatus },
  { id: 'm7', name: 'Gaëlle Bernard', image: null, status: 'active' as UserStatus },
  { id: 'm8', name: 'Hugo Rousseau', image: null, status: 'active' as UserStatus },
]

// ============================================================================
// STATISTIQUES MOCK
// ============================================================================

/**
 * Stats équipe complètes
 */
export const mockTeamStats: TeamStats = {
  activeCount: 12,
  onLeaveCount: 3,
}

/**
 * Stats équipe sans congés
 */
export const mockTeamStatsNoLeave: TeamStats = {
  activeCount: 15,
  onLeaveCount: 0,
}

/**
 * Stats équipe partielles
 */
export const mockTeamStatsPartial: TeamStats = {
  activeCount: 8,
  onLeaveCount: undefined,
}

// ============================================================================
// ACTIONS MOCK
// ============================================================================

/**
 * Actions de base pour TeamCard
 */
export const mockTeamActions: CardAction[] = [
  {
    label: 'Voir équipe',
    onClick: () => {},
  },
  {
    label: 'Modifier',
    onClick: () => {},
  },
  {
    label: 'Supprimer',
    onClick: () => {},
    variant: 'destructive',
    separator: true,
  },
]

/**
 * Crée des actions avec des callbacks mockés (pour vi.fn())
 */
export function createMockTeamActions(
  onView: () => void,
  onEdit: () => void,
  onDelete: () => void
): CardAction[] {
  return [
    { label: 'Voir équipe', onClick: onView },
    { label: 'Modifier', onClick: onEdit },
    { label: 'Supprimer', onClick: onDelete, variant: 'destructive', separator: true },
  ]
}

// ============================================================================
// COLLECTIONS
// ============================================================================

/**
 * Liste d'équipes pour tests de listes
 */
export const mockTeams: TeamCardTeam[] = [
  mockTeamFrontend,
  mockTeamBackend,
  mockTeamMinimal,
  mockTeamDesign,
]
