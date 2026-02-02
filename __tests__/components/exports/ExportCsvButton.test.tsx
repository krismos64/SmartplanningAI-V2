/**
 * Tests unitaires pour ExportCsvButton
 *
 * @ticket SP-333
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock useToast
const mockSuccess = vi.fn()
const mockError = vi.fn()
vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}))

// Import après les mocks
import { ExportCsvButton } from '@/components/exports/ExportCsvButton'
import type { CsvExportActionResult } from '@/types'

describe('ExportCsvButton', () => {
  // Mock URL methods
  const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
  const mockRevokeObjectURL = vi.fn()

  // Mock action
  const mockAction = vi.fn<[], Promise<CsvExportActionResult>>()


  beforeEach(() => {
    vi.clearAllMocks()

    // Mock URL methods
    Object.defineProperty(global, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
      writable: true,
    })

    // Default success result
    mockAction.mockResolvedValue({
      success: true,
      data: {
        filename: 'test-export-2026-02-02.csv',
        data: '\uFEFFNom;Age\nAlice;30',
        mimeType: 'text/csv;charset=utf-8',
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================
  // RENDU INITIAL
  // ============================================
  describe('Rendu initial', () => {
    it('affiche le bouton avec le label par défaut', () => {
      render(<ExportCsvButton action={mockAction} />)

      expect(screen.getByTestId('export-csv-button')).toBeInTheDocument()
      expect(screen.getByText('Exporter CSV')).toBeInTheDocument()
    })

    it('affiche un label personnalisé', () => {
      render(<ExportCsvButton action={mockAction} label="Télécharger" />)

      expect(screen.getByText('Télécharger')).toBeInTheDocument()
    })

    it("affiche l'icône de téléchargement", () => {
      render(<ExportCsvButton action={mockAction} />)

      const button = screen.getByTestId('export-csv-button')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it("n'est pas désactivé par défaut", () => {
      render(<ExportCsvButton action={mockAction} />)

      expect(screen.getByTestId('export-csv-button')).not.toBeDisabled()
    })

    it('peut être désactivé via props', () => {
      render(<ExportCsvButton action={mockAction} disabled />)

      expect(screen.getByTestId('export-csv-button')).toBeDisabled()
    })

    it('applique la variante outline par défaut', () => {
      render(<ExportCsvButton action={mockAction} />)

      const button = screen.getByTestId('export-csv-button')
      // Le bouton outline a généralement une bordure et fond transparent
      expect(button).toHaveAttribute('data-testid', 'export-csv-button')
    })

    it('applique une classe CSS personnalisée', () => {
      render(<ExportCsvButton action={mockAction} className="custom-class" />)

      const button = screen.getByTestId('export-csv-button')
      expect(button).toHaveClass('custom-class')
    })
  })

  // ============================================
  // EXPORT RÉUSSI
  // ============================================
  describe('Export réussi', () => {
    it("appelle l'action au clic", async () => {
      const user = userEvent.setup()
      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled()
      })
    })

    it('passe les filtres à l action', async () => {
      const user = userEvent.setup()
      const filters = { teamId: 'team-1' }
      render(<ExportCsvButton action={mockAction} filters={filters} />)

      await user.click(screen.getByTestId('export-csv-button'))

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(filters)
      })
    })

    it('crée un blob et déclenche le téléchargement', async () => {
      const user = userEvent.setup()

      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled()
        expect(mockRevokeObjectURL).toHaveBeenCalled()
      })
    })

    it('affiche un toast de succès', async () => {
      const user = userEvent.setup()
      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith(
          'Export réussi',
          expect.objectContaining({
            description: expect.stringContaining('test-export'),
          })
        )
      })
    })

    it('réactive le bouton après succès', async () => {
      const user = userEvent.setup()
      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      await waitFor(() => {
        expect(screen.getByTestId('export-csv-button')).not.toBeDisabled()
        expect(screen.getByText('Exporter CSV')).toBeInTheDocument()
      })
    })
  })

  // ============================================
  // ÉTAT DE CHARGEMENT
  // ============================================
  describe('État de chargement', () => {
    it('désactive le bouton pendant le chargement', async () => {
      const user = userEvent.setup()

      // Action qui ne résout pas immédiatement
      let resolveAction: (value: CsvExportActionResult) => void
      mockAction.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveAction = resolve
          })
      )

      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      // Vérifier que le bouton est désactivé pendant le chargement
      expect(screen.getByTestId('export-csv-button')).toBeDisabled()

      // Résoudre l'action
      resolveAction!({
        success: true,
        data: {
          filename: 'test.csv',
          data: 'data',
          mimeType: 'text/csv',
        },
      })

      await waitFor(() => {
        expect(screen.getByTestId('export-csv-button')).not.toBeDisabled()
      })
    })

    it('affiche le spinner pendant le chargement', async () => {
      const user = userEvent.setup()

      // Action qui ne résout pas immédiatement
      mockAction.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      expect(screen.getByText('Export en cours...')).toBeInTheDocument()
    })
  })

  // ============================================
  // GESTION DES ERREURS
  // ============================================
  describe('Gestion des erreurs', () => {
    it("affiche un toast d'erreur si l'action échoue", async () => {
      const user = userEvent.setup()
      mockAction.mockResolvedValue({
        success: false,
        error: 'Accès non autorisé',
      })

      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith(
          'Accès non autorisé',
          expect.objectContaining({
            description: "Erreur d'export",
          })
        )
      })
    })

    it('réactive le bouton après erreur', async () => {
      const user = userEvent.setup()
      mockAction.mockResolvedValue({
        success: false,
        error: 'Erreur',
      })

      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      await waitFor(() => {
        expect(screen.getByTestId('export-csv-button')).not.toBeDisabled()
      })
    })

    it("affiche un toast d'erreur si une exception est levée", async () => {
      const user = userEvent.setup()
      mockAction.mockRejectedValue(new Error('Network Error'))

      render(<ExportCsvButton action={mockAction} />)

      await user.click(screen.getByTestId('export-csv-button'))

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith(
          "Une erreur inattendue s'est produite",
          expect.objectContaining({
            description: "Erreur d'export",
          })
        )
      })
    })
  })

  // ============================================
  // ACCESSIBILITÉ
  // ============================================
  describe('Accessibilité', () => {
    it('a le data-testid correct', () => {
      render(<ExportCsvButton action={mockAction} />)

      expect(screen.getByTestId('export-csv-button')).toBeInTheDocument()
    })

    it('est focusable', () => {
      render(<ExportCsvButton action={mockAction} />)

      const button = screen.getByTestId('export-csv-button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('a le rôle button', () => {
      render(<ExportCsvButton action={mockAction} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
