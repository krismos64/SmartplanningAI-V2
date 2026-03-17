/**
 * Tests unitaires pour ExportDataButton
 *
 * @ticket SP-278
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @/lib/actions/profile avant l'import du composant
const mockExportUserData = vi.fn()
vi.mock('@/lib/actions/profile', () => ({
  exportUserData: () => mockExportUserData(),
}))

// Mock useCrudMutation
vi.mock('@/hooks/use-crud-mutation', () => ({
  useCrudMutation: <TInput, TOutput>(
    action: (data: TInput) => Promise<{ success: boolean; data?: TOutput }>,
    options: {
      successMessage?: string
      onSuccess?: (data: TOutput) => void
      onError?: () => void
    } = {}
  ) => ({
    mutate: async (data: TInput) => {
      const result = await action(data)
      if (result.success && result.data) {
        options.onSuccess?.(result.data)
      } else {
        options.onError?.()
      }
      return result
    },
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}))

// Import le composant après les mocks
import { ExportDataButton } from '@/app/app/profile/_components/ExportDataButton'

// Mock URL methods globalement
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

describe('ExportDataButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Résultat mock par défaut
    mockExportUserData.mockResolvedValue({
      success: true,
      data: {
        filename: 'smartplanning-export-test-2026-02-02.json',
        data: '{"test": "data"}',
        mimeType: 'application/json',
      },
    })

    // Mock URL methods
    Object.defineProperty(global, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================
  // RENDU INITIAL
  // ============================================
  describe('Rendu initial', () => {
    it('should render button with correct text', () => {
      render(<ExportDataButton />)

      expect(screen.getByTestId('export-data-button')).toBeInTheDocument()
      expect(screen.getByText('Exporter mes données')).toBeInTheDocument()
    })

    it('should render download icon', () => {
      render(<ExportDataButton />)

      const button = screen.getByTestId('export-data-button')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should not be disabled initially', () => {
      render(<ExportDataButton />)

      expect(screen.getByTestId('export-data-button')).not.toBeDisabled()
    })
  })

  // ============================================
  // TÉLÉCHARGEMENT RÉUSSI
  // ============================================
  describe('Téléchargement réussi', () => {
    it('should call exportUserData when clicked', async () => {
      const user = userEvent.setup()
      render(<ExportDataButton />)

      await user.click(screen.getByTestId('export-data-button'))

      await waitFor(() => {
        expect(mockExportUserData).toHaveBeenCalled()
      })
    })

    it('should call URL.createObjectURL on success', async () => {
      const user = userEvent.setup()
      render(<ExportDataButton />)

      await user.click(screen.getByTestId('export-data-button'))

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled()
      })
    })

    it('should call URL.revokeObjectURL to clean up', async () => {
      const user = userEvent.setup()
      render(<ExportDataButton />)

      await user.click(screen.getByTestId('export-data-button'))

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalled()
      })
    })

    it('should re-enable button after success', async () => {
      const user = userEvent.setup()
      render(<ExportDataButton />)

      await user.click(screen.getByTestId('export-data-button'))

      await waitFor(() => {
        expect(screen.getByTestId('export-data-button')).not.toBeDisabled()
        expect(screen.getByText('Exporter mes données')).toBeInTheDocument()
      })
    })
  })

  // ============================================
  // EXPORT ÉCHOUÉ
  // ============================================
  describe('Export échoué', () => {
    it('should re-enable button after error', async () => {
      mockExportUserData.mockResolvedValue({
        success: false,
        error: "Erreur lors de l'export",
      })

      const user = userEvent.setup()
      render(<ExportDataButton />)

      await user.click(screen.getByTestId('export-data-button'))

      await waitFor(() => {
        expect(screen.getByTestId('export-data-button')).not.toBeDisabled()
      })
    })

    it('should not call URL.createObjectURL on error', async () => {
      mockExportUserData.mockResolvedValue({
        success: false,
        error: "Erreur lors de l'export",
      })

      const user = userEvent.setup()
      render(<ExportDataButton />)

      await user.click(screen.getByTestId('export-data-button'))

      // Attendre que le bouton soit réactivé (indique que l'opération est terminée)
      await waitFor(() => {
        expect(screen.getByTestId('export-data-button')).not.toBeDisabled()
      })

      // Vérifier que createObjectURL n'a pas été appelé
      expect(mockCreateObjectURL).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // ACCESSIBILITÉ
  // ============================================
  describe('Accessibilité', () => {
    it('should have correct data-testid', () => {
      render(<ExportDataButton />)

      expect(screen.getByTestId('export-data-button')).toBeInTheDocument()
    })

    it('should be focusable', () => {
      render(<ExportDataButton />)

      const button = screen.getByTestId('export-data-button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('should have button role', () => {
      render(<ExportDataButton />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
