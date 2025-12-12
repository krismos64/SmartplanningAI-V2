/**
 * Fixtures Utilisateurs - Données mock pour les tests
 *
 * Ces fixtures simulent les données Prisma User et Employee
 * utilisées dans les composants UserCard, TeamCard, etc.
 *
 * @ticket SP-126
 */

import type { UserRole } from '@prisma/client'
import type {
  UserCardUser,
  UserCardEmployee,
  UserStatus,
  CardAction,
} from '@/components/cards/types'

// ============================================================================
// UTILISATEURS MOCK
// ============================================================================

/**
 * Utilisateur de base (Manager)
 */
export const mockUser: UserCardUser = {
  id: 'user-1',
  name: 'Jean Dupont',
  email: 'jean.dupont@smartplanning.fr',
  image: null,
  role: 'MANAGER' as UserRole,
}

/**
 * Utilisateur avec avatar
 */
export const mockUserWithAvatar: UserCardUser = {
  id: 'user-2',
  name: 'Marie Martin',
  email: 'marie.martin@example.com',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
  role: 'EMPLOYEE' as UserRole,
}

/**
 * Utilisateur Directeur
 */
export const mockDirector: UserCardUser = {
  id: 'user-3',
  name: 'Pierre Bernard',
  email: 'pierre.bernard@example.com',
  image: null,
  role: 'DIRECTOR' as UserRole,
}

/**
 * Utilisateur System Admin
 */
export const mockSystemAdmin: UserCardUser = {
  id: 'user-4',
  name: 'Admin System',
  email: 'admin@smartplanning.fr',
  image: null,
  role: 'SYSTEM_ADMIN' as UserRole,
}

/**
 * Utilisateur sans nom (edge case)
 */
export const mockUserNoName: UserCardUser = {
  id: 'user-5',
  name: null,
  email: 'anonymous@example.com',
  image: null,
  role: 'EMPLOYEE' as UserRole,
}

// ============================================================================
// EMPLOYÉS MOCK
// ============================================================================

/**
 * Employé de base avec toutes les infos
 */
export const mockEmployee: UserCardEmployee = {
  firstName: 'Jean',
  lastName: 'Dupont',
  jobTitle: 'Product Manager',
  department: 'Produit',
  phone: '+33 6 12 34 56 78',
}

/**
 * Employé minimal (sans infos optionnelles)
 */
export const mockEmployeeMinimal: UserCardEmployee = {
  firstName: 'Sophie',
  lastName: 'Leroy',
  jobTitle: null,
  department: null,
  phone: null,
}

/**
 * Employé développeur
 */
export const mockEmployeeDev: UserCardEmployee = {
  firstName: 'Thomas',
  lastName: 'Garcia',
  jobTitle: 'Développeur Full-Stack',
  department: 'Technique',
  phone: '06 98 76 54 32',
}

// ============================================================================
// STATUTS
// ============================================================================

/**
 * Tous les statuts disponibles pour les tests
 */
export const userStatuses: UserStatus[] = [
  'active',
  'on_leave',
  'absent',
  'inactive',
]

// ============================================================================
// ACTIONS MOCK
// ============================================================================

/**
 * Actions de base pour UserCard
 */
export const mockUserActions: CardAction[] = [
  {
    label: 'Voir profil',
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
export function createMockActions(
  onView: () => void,
  onEdit: () => void,
  onDelete: () => void
): CardAction[] {
  return [
    { label: 'Voir profil', onClick: onView },
    { label: 'Modifier', onClick: onEdit },
    {
      label: 'Supprimer',
      onClick: onDelete,
      variant: 'destructive',
      separator: true,
    },
  ]
}

// ============================================================================
// COLLECTIONS
// ============================================================================

/**
 * Liste d'utilisateurs pour tests de listes
 */
export const mockUsers: UserCardUser[] = [
  mockUser,
  mockUserWithAvatar,
  mockDirector,
  mockSystemAdmin,
]

/**
 * Liste d'employés pour tests de listes
 */
export const mockEmployees: UserCardEmployee[] = [
  mockEmployee,
  mockEmployeeMinimal,
  mockEmployeeDev,
]
