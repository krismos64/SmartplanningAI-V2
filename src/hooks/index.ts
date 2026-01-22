/**
 * Barrel export pour tous les hooks personnalisés
 * Import unique : import { useCrudMutation, useMediaQuery, useLoading } from '@/hooks'
 *
 * @ticket SP-150, SP-266, SP-264
 */

// Media query hook
export * from './use-media-query'

// Toast hook (re-export from components/toast)
export { useToast } from '@/components/toast/use-toast'

// CRUD mutation hooks (SP-150)
export {
  useCrudMutation,
  useDeleteMutation,
  useRefreshList,
} from './use-crud-mutation'

// Loading hooks (SP-266)
export {
  useLoading,
  type UseLoadingOptions,
  type UseLoadingResult,
} from './use-loading'

export {
  useProgressLoading,
  type UseProgressLoadingOptions,
  type UseProgressLoadingResult,
} from './use-progress-loading'

// Keyboard shortcuts hooks (SP-264)
export {
  useKeyboardShortcuts,
  useKeyboardShortcut,
  type ShortcutHandler,
  type ShortcutMap,
  type ShortcutOptions,
  type UseKeyboardShortcutsOptions,
} from './use-keyboard-shortcuts'

// Breadcrumb resolver hooks (SP-264)
export {
  useBreadcrumbResolver,
  useBreadcrumbsFromPathname,
  isIdSegment,
  getEntityTypeFromPreviousSegment,
  type UseBreadcrumbResolverOptions,
  type UseBreadcrumbResolverResult,
  type ResolvedBreadcrumbSegment,
} from './use-breadcrumb-resolver'
