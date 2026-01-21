/**
 * Barrel export pour les Higher-Order Components
 * Import unique : import { withLoading } from '@/components/hoc'
 *
 * @see SP-266 - Loading States avancés
 */

export {
  withLoading,
  type WithLoadingInjectedProps,
  type WithLoadingOptions,
} from './with-loading'
