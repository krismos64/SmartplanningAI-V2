/**
 * Hook React pour les mutations CRUD avec Server Actions
 *
 * @description Hook generique pour gerer les appels Server Actions avec :
 * - Gestion de l'etat pending via useTransition
 * - Notifications toast automatiques
 * - Gestion des erreurs centralisee
 * - Callbacks onSuccess/onError
 *
 * @ticket SP-150
 * @see Context7 - React 19 useTransition with Server Actions
 */

'use client'

import { useState, useCallback, useTransition } from 'react'
import { useToast } from '@/components/toast/use-toast'
import type { CrudActionResult, DeleteActionResult } from '@/types'

// ============================================================================
// Types
// ============================================================================

/**
 * Options du hook useCrudMutation
 */
interface UseCrudMutationOptions<TOutput> {
  /** Callback apres succes */
  onSuccess?: (data: TOutput) => void
  /** Callback apres erreur */
  onError?: (error: string, field?: string) => void
  /** Message de succes personnalise */
  successMessage?: string
  /** Message d'erreur par defaut */
  errorMessage?: string
  /** Afficher les toasts automatiquement (defaut: true) */
  showToasts?: boolean
}

/**
 * Retour du hook useCrudMutation
 */
interface UseCrudMutationReturn<TInput, TOutput> {
  /** Fonction pour executer la mutation */
  mutate: (data: TInput) => Promise<CrudActionResult<TOutput>>
  /** Mutation en cours */
  isPending: boolean
  /** Derniere erreur */
  error: string | null
  /** Champ en erreur */
  errorField: string | null
  /** Reset l'etat d'erreur */
  reset: () => void
}

// ============================================================================
// Hook principal
// ============================================================================

/**
 * Hook pour les mutations CRUD avec Server Actions
 *
 * Gere automatiquement :
 * - L'etat de chargement (isPending)
 * - Les notifications toast
 * - Les callbacks onSuccess/onError
 * - Le stockage de la derniere erreur
 *
 * @param action - Server Action a executer
 * @param options - Options de configuration
 * @returns Objet avec mutate, isPending, error, reset
 *
 * @example
 * const { mutate, isPending, error } = useCrudMutation(createCompany, {
 *   successMessage: 'Entreprise créée avec succès',
 *   onSuccess: (company) => router.push(`/admin/companies/${company.id}`),
 * })
 *
 * const handleSubmit = async (data: CompanyFormData) => {
 *   await mutate(data)
 * }
 */
export function useCrudMutation<TInput, TOutput>(
  action: (data: TInput) => Promise<CrudActionResult<TOutput>>,
  options: UseCrudMutationOptions<TOutput> = {}
): UseCrudMutationReturn<TInput, TOutput> {
  const {
    onSuccess,
    onError,
    successMessage = 'Opération réussie',
    errorMessage = 'Une erreur est survenue',
    showToasts = true,
  } = options

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errorField, setErrorField] = useState<string | null>(null)
  const toastHelpers = useToast()

  const reset = useCallback(() => {
    setError(null)
    setErrorField(null)
  }, [])

  const mutate = useCallback(
    async (data: TInput): Promise<CrudActionResult<TOutput>> => {
      // Reset les erreurs precedentes
      reset()

      // Variable pour stocker le resultat
      let result: CrudActionResult<TOutput> | null = null

      // Utilise startTransition pour marquer la mutation comme non-urgente
      // et permettre a React de garder l'UI responsive
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            result = await action(data)

            if (result.success) {
              if (showToasts) {
                toastHelpers.success(successMessage)
              }
              onSuccess?.(result.data)
            } else {
              setError(result.error)
              setErrorField(result.field ?? null)

              if (showToasts) {
                toastHelpers.error(result.error || errorMessage)
              }
              onError?.(result.error, result.field)
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : errorMessage
            setError(message)

            if (showToasts) {
              toastHelpers.error(message)
            }
            onError?.(message)

            result = { success: false, error: message }
          }
          resolve()
        })
      })

      return result!
    },
    [
      action,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showToasts,
      toastHelpers,
      reset,
    ]
  )

  return {
    mutate,
    isPending,
    error,
    errorField,
    reset,
  }
}

// ============================================================================
// Hook pour suppression
// ============================================================================

/**
 * Options du hook useDeleteMutation
 */
interface UseDeleteMutationOptions {
  /** Callback apres succes */
  onSuccess?: () => void
  /** Callback apres erreur */
  onError?: (error: string) => void
  /** Message de succes personnalise */
  successMessage?: string
  /** Message d'erreur par defaut */
  errorMessage?: string
  /** Afficher les toasts automatiquement */
  showToasts?: boolean
}

/**
 * Retour du hook useDeleteMutation
 */
interface UseDeleteMutationReturn {
  /** Fonction pour executer la suppression */
  mutate: (id: string) => Promise<DeleteActionResult>
  /** Suppression en cours */
  isPending: boolean
  /** Derniere erreur */
  error: string | null
  /** Reset l'etat d'erreur */
  reset: () => void
}

/**
 * Hook specialise pour les suppressions
 *
 * Variante simplifiee de useCrudMutation pour les operations DELETE.
 *
 * @param action - Server Action de suppression
 * @param options - Options de configuration
 * @returns Objet avec mutate, isPending, error, reset
 *
 * @example
 * const { mutate: deleteCompany, isPending } = useDeleteMutation(deleteCompanyAction, {
 *   successMessage: 'Entreprise supprimée',
 *   onSuccess: () => router.refresh(),
 * })
 */
export function useDeleteMutation(
  action: (id: string) => Promise<DeleteActionResult>,
  options: UseDeleteMutationOptions = {}
): UseDeleteMutationReturn {
  const {
    onSuccess,
    onError,
    successMessage = 'Élément supprimé',
    errorMessage = 'Impossible de supprimer cet élément',
    showToasts = true,
  } = options

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const toastHelpers = useToast()

  const reset = useCallback(() => {
    setError(null)
  }, [])

  const mutate = useCallback(
    async (id: string): Promise<DeleteActionResult> => {
      reset()

      let result: DeleteActionResult | null = null

      await new Promise<void>((resolve) => {
        startTransition(async () => {
          try {
            result = await action(id)

            if (result.success) {
              if (showToasts) {
                toastHelpers.success(successMessage)
              }
              onSuccess?.()
            } else {
              setError(result.error)

              if (showToasts) {
                toastHelpers.error(result.error || errorMessage)
              }
              onError?.(result.error)
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : errorMessage
            setError(message)

            if (showToasts) {
              toastHelpers.error(message)
            }
            onError?.(message)

            result = { success: false, error: message }
          }
          resolve()
        })
      })

      return result!
    },
    [
      action,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showToasts,
      toastHelpers,
      reset,
    ]
  )

  return {
    mutate,
    isPending,
    error,
    reset,
  }
}

// ============================================================================
// Hook pour listes avec refresh
// ============================================================================

/**
 * Hook pour rafraichir une liste apres mutation
 *
 * @param refreshAction - Server Action de refresh
 * @returns Objet avec refresh, isRefreshing, data
 *
 * @example
 * const { refresh, isRefreshing } = useRefreshList(fetchCompanies)
 */
export function useRefreshList<T>(refreshAction: () => Promise<T>) {
  const [isRefreshing, startTransition] = useTransition()
  const [data, setData] = useState<T | null>(null)

  const refresh = useCallback(() => {
    startTransition(() => {
      void refreshAction().then(setData)
    })
  }, [refreshAction])

  return {
    refresh,
    isRefreshing,
    data,
  }
}
