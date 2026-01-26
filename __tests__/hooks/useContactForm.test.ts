/**
 * Tests unitaires pour le hook useContactForm
 *
 * @ticket SP-289
 * @description Tests de la machine d'état du formulaire de contact
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useContactForm } from '@/hooks/useContactForm'
import type { ContactFormData } from '@/lib/validations/contact'

const validFormData: ContactFormData = {
  name: 'Jean Dupont',
  email: 'jean@test.com',
  subject: 'Test sujet',
  message: 'Ceci est un message de test valide avec plus de 20 caractères.',
}

describe('useContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // ÉTAT INITIAL
  // ==========================================================================
  describe('État initial', () => {
    it('devrait retourner state=idle par défaut', () => {
      const { result } = renderHook(() => useContactForm())

      expect(result.current.state).toBe('idle')
    })

    it('devrait retourner error=null par défaut', () => {
      const { result } = renderHook(() => useContactForm())

      expect(result.current.error).toBeNull()
    })

    it('devrait retourner submittedName=null par défaut', () => {
      const { result } = renderHook(() => useContactForm())

      expect(result.current.submittedName).toBeNull()
    })

    it('devrait retourner lastSubmittedData=null par défaut', () => {
      const { result } = renderHook(() => useContactForm())

      expect(result.current.lastSubmittedData).toBeNull()
    })
  })

  // ==========================================================================
  // TRANSITION : idle → submitting → success
  // ==========================================================================
  describe('Transition idle → submitting → success', () => {
    it('devrait passer à submitting lors du submit', async () => {
      const mockOnSubmit = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ success: true }), 50)
            )
        )
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      act(() => {
        void result.current.submit(validFormData)
      })

      expect(result.current.state).toBe('submitting')
    })

    it('devrait passer à success après un envoi réussi', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })

      expect(result.current.state).toBe('success')
    })

    it('devrait stocker le nom soumis après succès', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })

      expect(result.current.submittedName).toBe('Jean Dupont')
    })

    it("devrait effacer l'erreur lors de la soumission", async () => {
      const mockOnSubmit = vi
        .fn()
        .mockRejectedValueOnce(new Error('Erreur'))
        .mockResolvedValueOnce({ success: true })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      // Premier envoi échoue
      await act(async () => {
        await result.current.submit(validFormData)
      })
      expect(result.current.error).toBeTruthy()

      // Deuxième envoi
      await act(async () => {
        await result.current.submit(validFormData)
      })
      expect(result.current.error).toBeNull()
    })
  })

  // ==========================================================================
  // TRANSITION : idle → submitting → error
  // ==========================================================================
  describe('Transition idle → submitting → error', () => {
    it('devrait passer à error si onSubmit retourne success=false', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: false,
        error: 'Erreur serveur',
      })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })

      expect(result.current.state).toBe('error')
    })

    it("devrait stocker le message d'erreur de la réponse", async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: false,
        error: 'Adresse email invalide',
      })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })

      expect(result.current.error).toBe('Adresse email invalide')
    })

    it("devrait utiliser message si error n'est pas défini", async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: false,
        message: "Message d'erreur alternatif",
      })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })

      expect(result.current.error).toBe("Message d'erreur alternatif")
    })

    it('devrait passer à error si onSubmit throw', async () => {
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })

      expect(result.current.state).toBe('error')
      expect(result.current.error).toBe('Network error')
    })

    it("devrait avoir un message par défaut si error n'est pas une Error", async () => {
      const mockOnSubmit = vi.fn().mockRejectedValue('String error')
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })

      expect(result.current.error).toBe('Une erreur inattendue est survenue.')
    })
  })

  // ==========================================================================
  // RESET
  // ==========================================================================
  describe('Reset', () => {
    it('devrait réinitialiser state à idle', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })
      expect(result.current.state).toBe('success')

      act(() => {
        result.current.reset()
      })
      expect(result.current.state).toBe('idle')
    })

    it('devrait réinitialiser error à null', async () => {
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Erreur'))
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })
      expect(result.current.error).toBeTruthy()

      act(() => {
        result.current.reset()
      })
      expect(result.current.error).toBeNull()
    })

    it('devrait réinitialiser submittedName à null', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })
      expect(result.current.submittedName).toBe('Jean Dupont')

      act(() => {
        result.current.reset()
      })
      expect(result.current.submittedName).toBeNull()
    })
  })

  // ==========================================================================
  // RETRY
  // ==========================================================================
  describe('Retry', () => {
    it('devrait stocker les données soumises pour retry', async () => {
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Erreur'))
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.submit(validFormData)
      })

      expect(result.current.lastSubmittedData).toEqual(validFormData)
    })

    it('devrait appeler submit avec les dernières données lors du retry', async () => {
      const mockOnSubmit = vi
        .fn()
        .mockRejectedValueOnce(new Error('Erreur'))
        .mockResolvedValueOnce({ success: true })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      // Premier envoi échoue
      await act(async () => {
        await result.current.submit(validFormData)
      })
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)

      // Retry
      await act(async () => {
        await result.current.retry()
      })
      expect(mockOnSubmit).toHaveBeenCalledTimes(2)
      expect(mockOnSubmit).toHaveBeenLastCalledWith(validFormData)
    })

    it('devrait passer à success après un retry réussi', async () => {
      const mockOnSubmit = vi
        .fn()
        .mockRejectedValueOnce(new Error('Erreur'))
        .mockResolvedValueOnce({ success: true })
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      // Premier envoi échoue
      await act(async () => {
        await result.current.submit(validFormData)
      })
      expect(result.current.state).toBe('error')

      // Retry réussit
      await act(async () => {
        await result.current.retry()
      })
      expect(result.current.state).toBe('success')
    })

    it('devrait ne rien faire si pas de données précédentes', async () => {
      const mockOnSubmit = vi.fn()
      const { result } = renderHook(() => useContactForm(mockOnSubmit))

      await act(async () => {
        await result.current.retry()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // MODE MOCK (SANS onSubmit)
  // ==========================================================================
  describe('Mode mock (sans onSubmit)', () => {
    it('devrait simuler un succès après délai', async () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useContactForm())

      act(() => {
        void result.current.submit(validFormData)
      })

      expect(result.current.state).toBe('submitting')

      // Avancer le timer de 1500ms (délai mock)
      await act(async () => {
        vi.advanceTimersByTime(1500)
      })

      expect(result.current.state).toBe('success')
      expect(result.current.submittedName).toBe('Jean Dupont')

      vi.useRealTimers()
    })
  })
})
