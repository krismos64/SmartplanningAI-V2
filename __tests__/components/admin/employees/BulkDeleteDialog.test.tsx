/**
 * Tests unitaires pour BulkDeleteDialog
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BulkDeleteDialog } from '@/components/admin/employees/BulkDeleteDialog'

// ============================================================================
// Mocks
// ============================================================================

const mockBulkDeleteEmployees = vi.fn()

vi.mock('@/lib/actions/employees', () => ({
  bulkDeleteEmployees: (...args: unknown[]) => mockBulkDeleteEmployees(...args),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

// ============================================================================
// Tests
// ============================================================================

describe('BulkDeleteDialog', () => {
  const defaultProps = {
    selectedCount: 3,
    selectedIds: ['id-1', 'id-2', 'id-3'],
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockBulkDeleteEmployees.mockResolvedValue({
      success: true,
      data: { deletedCount: 3, skippedNames: [] },
    })
  })

  describe('Affichage', () => {
    it('affiche le titre avec le nombre d employés', () => {
      render(<BulkDeleteDialog {...defaultProps} />)
      expect(
        screen.getByText('Supprimer 3 employes')
      ).toBeInTheDocument()
    })

    it('affiche le titre au singulier pour 1 employé', () => {
      render(
        <BulkDeleteDialog {...defaultProps} selectedCount={1} selectedIds={['id-1']} />
      )
      expect(
        screen.getByText('Supprimer 1 employe')
      ).toBeInTheDocument()
    })

    it('affiche le nombre d employés dans la description', () => {
      render(<BulkDeleteDialog {...defaultProps} />)
      expect(screen.getByText('3 employes')).toBeInTheDocument()
    })

    it('affiche l avertissement sur les données cascade', () => {
      render(<BulkDeleteDialog {...defaultProps} />)
      expect(
        screen.getByText(
          /Les plannings et demandes de conge associes seront egalement supprimes/
        )
      ).toBeInTheDocument()
    })

    it('affiche le message d action irréversible', () => {
      render(<BulkDeleteDialog {...defaultProps} />)
      expect(
        screen.getByText('Cette action est irreversible.')
      ).toBeInTheDocument()
    })

    it('affiche les boutons Annuler et Supprimer', () => {
      render(<BulkDeleteDialog {...defaultProps} />)
      expect(screen.getByText('Annuler')).toBeInTheDocument()
      expect(screen.getByText('Supprimer')).toBeInTheDocument()
    })
  })

  describe('Suppression', () => {
    it('appelle bulkDeleteEmployees au clic sur Supprimer', async () => {
      render(<BulkDeleteDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Supprimer'))

      await waitFor(() => {
        expect(mockBulkDeleteEmployees).toHaveBeenCalledWith([
          'id-1',
          'id-2',
          'id-3',
        ])
      })
    })

    it('ferme le dialog et appelle onSuccess après suppression réussie', async () => {
      render(<BulkDeleteDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Supprimer'))

      await waitFor(() => {
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })
    })

    it('gère les employés ignorés', async () => {
      const { toast } = await import('sonner')
      mockBulkDeleteEmployees.mockResolvedValue({
        success: true,
        data: { deletedCount: 2, skippedNames: ['Jean Dupont'] },
      })

      render(<BulkDeleteDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Supprimer'))

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith(
          expect.stringContaining('Jean Dupont')
        )
      })
    })

    it('gère les erreurs de l API', async () => {
      const { toast } = await import('sonner')
      mockBulkDeleteEmployees.mockResolvedValue({
        success: false,
        error: 'Erreur serveur',
      })

      render(<BulkDeleteDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Supprimer'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur serveur')
      })
    })

    it('gère les exceptions', async () => {
      const { toast } = await import('sonner')
      mockBulkDeleteEmployees.mockRejectedValue(new Error('Network error'))

      render(<BulkDeleteDialog {...defaultProps} />)

      fireEvent.click(screen.getByText('Supprimer'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Erreur lors de la suppression'
        )
      })
    })
  })
})
