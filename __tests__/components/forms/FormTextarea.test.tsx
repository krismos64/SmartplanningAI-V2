/**
 * Tests unitaires pour FormTextarea
 *
 * FormTextarea est un composant textarea avec compteur de caractères,
 * auto-resize, et intégration react-hook-form.
 *
 * @ticket SP-126
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { FormTextarea } from '@/components/forms/FormTextarea'

describe('FormTextarea', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders textarea element', () => {
      render(<FormTextarea />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders label when provided', () => {
      render(<FormTextarea label="Description" />)

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('renders placeholder when provided', () => {
      render(<FormTextarea placeholder="Entrez votre description..." />)

      expect(
        screen.getByPlaceholderText('Entrez votre description...')
      ).toBeInTheDocument()
    })

    it('renders without wrapper when no label/error/helpText', () => {
      const { container } = render(<FormTextarea placeholder="Test" />)

      // Should not have FormField wrapper
      expect(container.querySelector('.flex.flex-col')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // COMPTEUR DE CARACTÈRES
  // ===========================================================================

  describe('Compteur de caractères', () => {
    it('shows character count when showCharCount=true and maxLength set', () => {
      render(<FormTextarea maxLength={500} showCharCount />)

      expect(screen.getByText('0 / 500')).toBeInTheDocument()
    })

    it('updates character count when typing', async () => {
      const user = setupUser()
      render(<FormTextarea maxLength={500} showCharCount />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello')

      expect(screen.getByText('5 / 500')).toBeInTheDocument()
    })

    it('does not show character count by default', () => {
      render(<FormTextarea maxLength={500} />)

      expect(screen.queryByText('0 / 500')).not.toBeInTheDocument()
    })

    it('does not show character count without maxLength', () => {
      render(<FormTextarea showCharCount />)

      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument()
    })

    it('character counter has aria-live for accessibility', () => {
      render(<FormTextarea maxLength={500} showCharCount />)

      const counter = screen.getByText('0 / 500')
      expect(counter).toHaveAttribute('aria-live', 'polite')
    })
  })

  // ===========================================================================
  // ÉTATS VISUELS (VARIANTS)
  // ===========================================================================

  describe('États visuels', () => {
    it('shows error state with error message', () => {
      render(<FormTextarea label="Description" error="Ce champ est requis" />)

      expect(screen.getByText('Ce champ est requis')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has error styling when error is present', () => {
      render(<FormTextarea error="Erreur" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-red-500')
    })

    it('shows success variant styling', () => {
      render(<FormTextarea variant="success" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-green-500')
    })

    it('shows default variant styling by default', () => {
      render(<FormTextarea />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-gray-300')
    })
  })

  // ===========================================================================
  // ÉTAT DISABLED
  // ===========================================================================

  describe('État disabled', () => {
    it('is disabled when disabled=true', () => {
      render(<FormTextarea disabled />)

      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('has disabled styling when disabled', () => {
      render(<FormTextarea disabled />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('disabled:cursor-not-allowed')
    })

    it('does not accept input when disabled', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(<FormTextarea disabled onChange={handleChange} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'test')

      expect(handleChange).not.toHaveBeenCalled()
      expect(textarea).toHaveValue('')
    })
  })

  // ===========================================================================
  // LABEL ET REQUIRED
  // ===========================================================================

  describe('Label et required', () => {
    it('shows required indicator when required=true', () => {
      render(<FormTextarea label="Description" required />)

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('renders without label when not provided', () => {
      render(<FormTextarea />)

      expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // TEXTE D'AIDE
  // ===========================================================================

  describe('Texte d\'aide', () => {
    it('shows help text when provided', () => {
      render(
        <FormTextarea
          label="Description"
          helpText="Maximum 500 caractères"
        />
      )

      expect(screen.getByText('Maximum 500 caractères')).toBeInTheDocument()
    })

    it('hides help text when error is present', () => {
      render(
        <FormTextarea
          label="Description"
          helpText="Texte d'aide"
          error="Erreur présente"
        />
      )

      expect(screen.queryByText("Texte d'aide")).not.toBeInTheDocument()
      expect(screen.getByText('Erreur présente')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // INTERACTIONS UTILISATEUR
  // ===========================================================================

  describe('Interactions utilisateur', () => {
    it('calls onChange when typing', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(<FormTextarea onChange={handleChange} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello')

      expect(handleChange).toHaveBeenCalled()
    })

    it('updates value when typing', async () => {
      const user = setupUser()

      render(<FormTextarea />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello world')

      expect(textarea).toHaveValue('Hello world')
    })

    it('can be focused', async () => {
      const user = setupUser()

      render(<FormTextarea />)

      const textarea = screen.getByRole('textbox')
      await user.click(textarea)

      expect(textarea).toHaveFocus()
    })

    it('respects maxLength constraint', async () => {
      const user = setupUser()

      render(<FormTextarea maxLength={5} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello World')

      // Only first 5 characters should be accepted
      expect(textarea).toHaveValue('Hello')
    })
  })

  // ===========================================================================
  // AUTO-RESIZE
  // ===========================================================================

  describe('Auto-resize', () => {
    it('has resize-y by default', () => {
      render(<FormTextarea />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('resize-y')
    })

    it('has resize-none when autoResize=true', () => {
      render(<FormTextarea autoResize />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('resize-none')
    })

    it('has min-height set', () => {
      render(<FormTextarea />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[100px]')
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to textarea element', () => {
      const ref = { current: null } as React.RefObject<HTMLTextAreaElement>

      render(<FormTextarea ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })
  })

  // ===========================================================================
  // CLASSES CSS CUSTOM
  // ===========================================================================

  describe('Classes CSS custom', () => {
    it('accepts wrapperClassName', () => {
      const { container } = render(
        <FormTextarea label="Test" wrapperClassName="custom-wrapper" />
      )

      expect(container.querySelector('.custom-wrapper')).toBeInTheDocument()
    })

    it('accepts textareaClassName', () => {
      render(<FormTextarea textareaClassName="custom-textarea" />)

      expect(screen.getByRole('textbox')).toHaveClass('custom-textarea')
    })
  })

  // ===========================================================================
  // ATTRIBUTS HTML
  // ===========================================================================

  describe('Attributs HTML', () => {
    it('passes rows attribute', () => {
      render(<FormTextarea rows={10} />)

      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '10')
    })

    it('passes name attribute', () => {
      render(<FormTextarea name="description" />)

      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'description')
    })
  })
})
