/**
 * Barrel export pour tous les hooks personnalisés
 * Import unique : import { useCrudMutation, useMediaQuery } from '@/hooks'
 *
 * @ticket SP-150, SP-264
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

// Keyboard shortcuts hooks (SP-264)
export {
  useKeyboardShortcuts,
  useKeyboardShortcut,
  type ShortcutHandler,
  type ShortcutMap,
  type ShortcutOptions,
  type UseKeyboardShortcutsOptions,
} from './use-keyboard-shortcuts'

// Impersonation hook (SP-454)
export { useIsImpersonating } from './use-is-impersonating'
export { useImpersonate } from './use-impersonate'
