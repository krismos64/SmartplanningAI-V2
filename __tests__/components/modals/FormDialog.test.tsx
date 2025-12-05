/**
 * Tests unitaires pour FormDialog
 *
 * FormDialog est une modal contenant un formulaire avec support react-hook-form,
 * loading state, focus sur premier input, et gestion submit/cancel.
 *
 * @ticket SP-126
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { FormDialog } from '@/components/modals/FormDialog'

describe('FormDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Créer un employé',
    onSubmit: vi.fn((e) => e.preventDefault()),
    children: (
      <>
        <input type="text" placeholder="Nom" data-testid="name-input" />
        <input type="email" placeholder="Email" data-testid="email-input" />
      </>
    ),
  }

  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders dialog when open=true', () => {
      render(<FormDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render dialog when open=false', () => {
      render(<FormDialog {...defaultProps} open={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders title', () => {
      render(<FormDialog {...defaultProps} />)

      expect(screen.getByText('Créer un employé')).toBeInTheDocument()
    })

    it('renders description when provided', () => {
      render(
        <FormDialog
          {...defaultProps}
          description="Remplissez le formulaire ci-dessous"
        />
      )

      expect(
        screen.getByText('Remplissez le formulaire ci-dessous')
      ).toBeInTheDocument()
    })

    it('does not render description when not provided', () => {
      render(<FormDialog {...defaultProps} />)

      // Only title should exist, not description paragraph
      expect(
        screen.queryByText(/Remplissez le formulaire/)
      ).not.toBeInTheDocument()
    })

    it('renders children (form content)', () => {
      render(<FormDialog {...defaultProps} />)

      expect(screen.getByTestId('name-input')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // BOUTONS
  // ===========================================================================

  describe('Boutons', () => {
    it('renders submit button with default label', () => {
      render(<FormDialog {...defaultProps} />)

      expect(screen.getByText('Enregistrer')).toBeInTheDocument()
    })

    it('renders cancel button with default label', () => {
      render(<FormDialog {...defaultProps} />)

      expect(screen.getByText('Annuler')).toBeInTheDocument()
    })

    it('renders custom submit label', () => {
      render(<FormDialog {...defaultProps} submitLabel="Créer" />)

      expect(screen.getByText('Créer')).toBeInTheDocument()
    })

    it('renders custom cancel label', () => {
      render(<FormDialog {...defaultProps} cancelLabel="Fermer" />)

      expect(screen.getByText('Fermer')).toBeInTheDocument()
    })

    it('submit button has type="submit"', () => {
      render(<FormDialog {...defaultProps} />)

      const submitButton = screen.getByText('Enregistrer')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('cancel button has type="button"', () => {
      render(<FormDialog {...defaultProps} />)

      const cancelButton = screen.getByText('Annuler')
      expect(cancelButton).toHaveAttribute('type', 'button')
    })
  })

  // ===========================================================================
  // INTERACTIONS
  // ===========================================================================

  describe('Interactions', () => {
    it('calls onSubmit when form is submitted', async () => {
      const user = setupUser()
      const onSubmit = vi.fn((e) => e.preventDefault())
      render(<FormDialog {...defaultProps} onSubmit={onSubmit} />)

      await user.click(screen.getByText('Enregistrer'))

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when cancel button clicked', async () => {
      const user = setupUser()
      const onCancel = vi.fn()
      const onOpenChange = vi.fn()
      render(
        <FormDialog
          {...defaultProps}
          onCancel={onCancel}
          onOpenChange={onOpenChange}
        />
      )

      await user.click(screen.getByText('Annuler'))

      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange(false) when cancel clicked without onCancel', async () => {
      const user = setupUser()
      const onOpenChange = vi.fn()
      render(<FormDialog {...defaultProps} onOpenChange={onOpenChange} />)

      await user.click(screen.getByText('Annuler'))

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  // ===========================================================================
  // ÉTAT SUBMITTING
  // ===========================================================================

  describe('État submitting', () => {
    it('disables submit button when isSubmitting', () => {
      render(<FormDialog {...defaultProps} isSubmitting />)

      const submitButton = screen.getByText('Chargement...').closest('button')
      expect(submitButton).toBeDisabled()
    })

    it('disables cancel button when isSubmitting', () => {
      render(<FormDialog {...defaultProps} isSubmitting />)

      expect(screen.getByText('Annuler').closest('button')).toBeDisabled()
    })

    it('shows loading spinner when isSubmitting', () => {
      render(<FormDialog {...defaultProps} isSubmitting />)

      // Should show "Chargement..." text indicating spinner state
      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })

    it('shows "Chargement..." instead of submit label when submitting', () => {
      render(<FormDialog {...defaultProps} isSubmitting submitLabel="Créer" />)

      expect(screen.queryByText('Créer')).not.toBeInTheDocument()
      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ERREUR
  // ===========================================================================

  describe('Erreur', () => {
    it('shows error message when provided', () => {
      render(<FormDialog {...defaultProps} error="Une erreur est survenue" />)

      expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument()
    })

    it('error has role="alert"', () => {
      render(<FormDialog {...defaultProps} error="Une erreur est survenue" />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('does not show error container when no error', () => {
      render(<FormDialog {...defaultProps} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // TAILLES
  // ===========================================================================

  describe('Tailles', () => {
    it('renders with default md size', () => {
      render(<FormDialog {...defaultProps} />)

      // Dialog should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders with sm size', () => {
      render(<FormDialog {...defaultProps} size="sm" />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders with lg size', () => {
      render(<FormDialog {...defaultProps} size="lg" />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders with xl size', () => {
      render(<FormDialog {...defaultProps} size="xl" />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ACCESSIBILITÉ
  // ===========================================================================

  describe('Accessibilité', () => {
    it('has accessible dialog role', () => {
      render(<FormDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has accessible title', () => {
      render(<FormDialog {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAccessibleName('Créer un employé')
    })

    it('renders form element', () => {
      render(<FormDialog {...defaultProps} />)

      expect(document.querySelector('form')).toBeInTheDocument()
    })
  })
})
