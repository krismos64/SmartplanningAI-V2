'use client'

/**
 * useContactForm Hook
 *
 * @ticket SP-289
 * @description Machine d'état pour gérer le formulaire de contact
 *
 * Features:
 * - États : idle, submitting, success, error
 * - Conservation des données en cas d'erreur
 * - Reset complet après succès
 * - Retry sans ressaisir
 */

import { useState, useCallback, useRef } from 'react'
import type { ContactFormData } from '@/lib/validations/contact'

/**
 * États possibles du formulaire de contact
 */
export type ContactFormState = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Type de réponse de l'API contact
 */
export interface ContactApiResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Interface de retour du hook useContactForm
 */
export interface UseContactFormReturn {
  /** État actuel du formulaire */
  state: ContactFormState
  /** Message d'erreur en cas d'échec */
  error: string | null
  /** Nom soumis (pour personnaliser le message de succès) */
  submittedName: string | null
  /** Données du dernier envoi (pour retry) */
  lastSubmittedData: ContactFormData | null
  /** Soumettre le formulaire */
  submit: (data: ContactFormData) => Promise<void>
  /** Réinitialiser le formulaire à l'état initial */
  reset: () => void
  /** Réessayer avec les dernières données */
  retry: () => Promise<void>
}

/**
 * Hook personnalisé pour gérer l'état du formulaire de contact
 *
 * @param onSubmit - Fonction d'envoi à l'API (optionnelle, mock si non fournie)
 * @returns Objet avec l'état et les méthodes de contrôle
 *
 * @example
 * ```tsx
 * const { state, error, submittedName, submit, reset, retry } = useContactForm()
 *
 * // Dans le formulaire
 * await submit(formData)
 *
 * // Afficher l'état de succès
 * if (state === 'success') {
 *   return <ContactSuccessState name={submittedName!} onReset={reset} />
 * }
 * ```
 */
export function useContactForm(
  onSubmit?: (data: ContactFormData) => Promise<ContactApiResponse>
): UseContactFormReturn {
  const [state, setState] = useState<ContactFormState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [submittedName, setSubmittedName] = useState<string | null>(null)
  const lastSubmittedDataRef = useRef<ContactFormData | null>(null)

  /**
   * Soumet les données du formulaire à l'API
   */
  const submit = useCallback(
    async (data: ContactFormData) => {
      setState('submitting')
      setError(null)
      lastSubmittedDataRef.current = data

      try {
        if (onSubmit) {
          // Utiliser la fonction d'envoi fournie
          const response = await onSubmit(data)

          if (response.success) {
            setSubmittedName(data.name)
            setState('success')
          } else {
            setError(
              response.error ||
                response.message ||
                "Une erreur est survenue lors de l'envoi."
            )
            setState('error')
          }
        } else {
          // Aucun envoi fourni : ne jamais afficher un succès, aucun message
          // n'est parti. Un mode démo simulait un succès ici, ce qui a masqué
          // pendant des semaines un formulaire non branché sur /api/contact.
          setError(
            "Le formulaire n'est pas configuré. Écrivez-nous à contact@smartplanning.fr"
          )
          setState('error')
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Une erreur inattendue est survenue.'
        setError(errorMessage)
        setState('error')
      }
    },
    [onSubmit]
  )

  /**
   * Réinitialise le formulaire à l'état initial
   */
  const reset = useCallback(() => {
    setState('idle')
    setError(null)
    setSubmittedName(null)
    lastSubmittedDataRef.current = null
  }, [])

  /**
   * Réessaie avec les dernières données soumises
   */
  const retry = useCallback(async () => {
    if (lastSubmittedDataRef.current) {
      await submit(lastSubmittedDataRef.current)
    }
  }, [submit])

  return {
    state,
    error,
    submittedName,
    lastSubmittedData: lastSubmittedDataRef.current,
    submit,
    reset,
    retry,
  }
}

export default useContactForm
