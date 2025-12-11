/**
 * Barrel export pour tous les hooks personnalises
 * Import unique : import { useCrudMutation, useMediaQuery } from '@/hooks'
 *
 * @ticket SP-150
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
