/**
 * Tests unitaires pour ConfirmDialog
 *
 * ConfirmDialog est une modal de confirmation avec variants (danger, warning, info),
 * icônes adaptées, focus sur Cancel par défaut, et callbacks onConfirm/onCancel.
 *
 * @ticket SP-126
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Confirmer la suppression',
    message: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    onConfirm: vi.fn(),
  }

  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders dialog when open=true', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render dialog when open=false', () => {
      render(<ConfirmDialog {...defaultProps} open={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders title', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument()
    })

    it('renders message', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(
        screen.getByText('Êtes-vous sûr de vouloir supprimer cet élément ?')
      ).toBeInTheDocument()
    })

    it('renders confirm button with default label', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByText('Confirmer')).toBeInTheDocument()
    })

    it('renders cancel button with default label', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByText('Annuler')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // CUSTOM LABELS
  // ===========================================================================

  describe('Custom labels', () => {
    it('renders custom confirm label', () => {
      render(<ConfirmDialog {...defaultProps} confirmLabel="Supprimer" />)

      expect(screen.getByText('Supprimer')).toBeInTheDocument()
    })

    it('renders custom cancel label', () => {
      render(<ConfirmDialog {...defaultProps} cancelLabel="Non, revenir" />)

      expect(screen.getByText('Non, revenir')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // VARIANTS
  // ===========================================================================

  describe('Variants', () => {
    it('renders with default info variant', () => {
      render(<ConfirmDialog {...defaultProps} />)

      // Info variant uses CheckCircle icon - verify dialog renders
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('renders danger variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="danger" />)

      // Verify the dialog opens with danger variant
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('renders warning variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="warning" />)

      // Verify the dialog opens with warning variant
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // INTERACTIONS
  // ===========================================================================

  describe('Interactions', () => {
    it('calls onConfirm when confirm button clicked', async () => {
      const user = setupUser()
      const onConfirm = vi.fn()
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

      await user.click(screen.getByText('Confirmer'))

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when cancel button clicked', async () => {
      const user = setupUser()
      const onCancel = vi.fn()
      const onOpenChange = vi.fn()
      render(
        <ConfirmDialog
          {...defaultProps}
          onCancel={onCancel}
          onOpenChange={onOpenChange}
        />
      )

      await user.click(screen.getByText('Annuler'))

      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange(false) when cancel clicked even without onCancel', async () => {
      const user = setupUser()
      const onOpenChange = vi.fn()
      render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />)

      await user.click(screen.getByText('Annuler'))

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  // ===========================================================================
  // ÉTAT LOADING
  // ===========================================================================

  describe('État loading', () => {
    it('disables confirm button when isLoading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />)

      expect(screen.getByText('Chargement...')).toBeInTheDocument()
      expect(screen.getByText('Chargement...').closest('button')).toBeDisabled()
    })

    it('disables cancel button when isLoading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />)

      expect(screen.getByText('Annuler').closest('button')).toBeDisabled()
    })

    it('shows "Chargement..." instead of confirm label when loading', () => {
      render(
        <ConfirmDialog {...defaultProps} isLoading confirmLabel="Supprimer" />
      )

      expect(screen.queryByText('Supprimer')).not.toBeInTheDocument()
      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ACCESSIBILITÉ
  // ===========================================================================

  describe('Accessibilité', () => {
    it('has accessible dialog role', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has accessible title', () => {
      render(<ConfirmDialog {...defaultProps} />)

      // DialogTitle provides accessible name
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAccessibleName('Confirmer la suppression')
    })

    it('has accessible description', () => {
      render(<ConfirmDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAccessibleDescription(
        'Êtes-vous sûr de vouloir supprimer cet élément ?'
      )
    })
  })
})
