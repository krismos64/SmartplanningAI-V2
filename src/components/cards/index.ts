/**
 * Barrel exports pour les composants métier (cards)
 *
 * SP-123 : Composants métier SmartPlanning
 *
 * @example
 * ```tsx
 * import {
 *   UserCard,
 *   UserCardSkeleton,
 *   TeamCard,
 *   TeamCardSkeleton,
 *   AvatarStack,
 *   USER_STATUS_CONFIG,
 *   USER_ROLE_LABELS,
 * } from "@/components/cards";
 * ```
 */

// Types
export type {
  UserStatus,
  CardAction,
  CardVariant,
  BaseCardProps,
  UserCardUser,
  UserCardEmployee,
  TeamCardTeam,
  TeamMember,
  TeamManager,
  TeamStats,
} from './types'

// Config
export { USER_STATUS_CONFIG, USER_ROLE_LABELS } from './types'

// Composants
export { UserCard, type UserCardProps } from './UserCard'
export {
  UserCardSkeleton,
  type UserCardSkeletonProps,
} from './UserCardSkeleton'
export { TeamCard, type TeamCardProps } from './TeamCard'
export {
  TeamCardSkeleton,
  type TeamCardSkeletonProps,
} from './TeamCardSkeleton'
export { AvatarStack, type AvatarStackProps } from './AvatarStack'
