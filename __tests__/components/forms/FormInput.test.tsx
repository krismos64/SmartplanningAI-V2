/**
 * Tests unitaires pour FormInput
 *
 * FormInput est le composant d'input générique avec support multi-types,
 * icônes, variants visuels et intégration react-hook-form.
 *
 * @ticket SP-126
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { FormInput } from '@/components/forms/FormInput'
import { Mail, Check, Eye } from 'lucide-react'

describe('FormInput', () => {
  // =========================================================================
  // RENDU DE BASE
  // =========================================================================

  describe('Rendu de base', () => {
    it('renders input element', () => {
      render(<FormInput />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with default type="text"', () => {
      render(<FormInput />)

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('renders with label when provided', () => {
      render(<FormInput label="Email" />)

      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('renders without wrapper when no label/error/helpText', () => {
      const { container } = render(<FormInput placeholder="Test" />)

      // Should render just the input wrapper div, not FormField
      expect(container.querySelector('.flex.flex-col')).not.toBeInTheDocument()
    })

    it('renders placeholder correctly', () => {
      render(<FormInput placeholder="Entrez votre email" />)

      expect(
        screen.getByPlaceholderText('Entrez votre email')
      ).toBeInTheDocument()
    })
  })

  // =========================================================================
  // TYPES D'INPUT
  // =========================================================================

  describe("Types d'input", () => {
    it('renders email type', () => {
      render(<FormInput type="email" label="Email" />)

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('renders password type', () => {
      const { container } = render(
        <FormInput type="password" label="Mot de passe" />
      )

      // Password inputs don't have textbox role, use querySelector
      const passwordInput = container.querySelector('input[type="password"]')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('renders number type', () => {
      render(<FormInput type="number" label="Âge" />)

      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
    })

    it('renders tel type', () => {
      render(<FormInput type="tel" label="Téléphone" />)

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
    })

    it('renders url type', () => {
      render(<FormInput type="url" label="Site web" />)

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'url')
    })
  })

  // =========================================================================
  // ICÔNES
  // =========================================================================

  describe('Icônes', () => {
    it('renders left icon when provided', () => {
      render(
        <FormInput
          label="Email"
          leftIcon={<Mail data-testid="left-icon" className="h-4 w-4" />}
        />
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders right icon when provided', () => {
      render(
        <FormInput
          label="Mot de passe"
          rightIcon={<Eye data-testid="right-icon" className="h-4 w-4" />}
        />
      )

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('renders both icons when provided', () => {
      render(
        <FormInput
          label="Email"
          leftIcon={<Mail data-testid="left-icon" className="h-4 w-4" />}
          rightIcon={<Check data-testid="right-icon" className="h-4 w-4" />}
        />
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ÉTATS VISUELS (VARIANTS)
  // =========================================================================

  describe('États visuels', () => {
    it('shows error state with error message', () => {
      render(<FormInput label="Email" error="Email invalide" />)

      expect(screen.getByText('Email invalide')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('error takes precedence over success variant', () => {
      render(
        <FormInput label="Email" variant="success" error="Email invalide" />
      )

      // Input should have error styling, not success
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-500')
    })

    it('shows success variant styling', () => {
      render(<FormInput label="Email" variant="success" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-green-500')
    })

    it('shows default variant styling by default', () => {
      render(<FormInput label="Email" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-gray-300')
    })
  })

  // =========================================================================
  // ÉTAT DISABLED
  // =========================================================================

  describe('État disabled', () => {
    it('is disabled when disabled=true', () => {
      render(<FormInput label="Email" disabled />)

      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('has disabled styling when disabled', () => {
      render(<FormInput label="Email" disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  // =========================================================================
  // LABEL ET REQUIRED
  // =========================================================================

  describe('Label et required', () => {
    it('shows required indicator when required=true', () => {
      render(<FormInput label="Email" required />)

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('links label to wrapper div via htmlFor/id (FormField behavior)', () => {
      const { container } = render(<FormInput label="Email" />)

      const label = screen.getByText('Email')
      const labelFor = label.getAttribute('for')

      // FormField links label to the wrapper div, not the input directly
      expect(labelFor).toBeTruthy()
      expect(container.querySelector(`#${labelFor}`)).toBeInTheDocument()
    })
  })

  // =========================================================================
  // TEXTE D'AIDE
  // =========================================================================

  describe("Texte d'aide", () => {
    it('shows help text when provided', () => {
      render(<FormInput label="Email" helpText="Format: exemple@mail.com" />)

      expect(screen.getByText('Format: exemple@mail.com')).toBeInTheDocument()
    })

    it('hides help text when error is present', () => {
      render(
        <FormInput
          label="Email"
          helpText="Format valide"
          error="Email invalide"
        />
      )

      expect(screen.queryByText('Format valide')).not.toBeInTheDocument()
      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // INTERACTIONS UTILISATEUR
  // =========================================================================

  describe('Interactions utilisateur', () => {
    it('calls onChange when typing', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(<FormInput label="Email" onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'test@example.com')

      expect(handleChange).toHaveBeenCalled()
    })

    it('updates value when typing', async () => {
      const user = setupUser()

      render(<FormInput label="Email" />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'hello')

      expect(input).toHaveValue('hello')
    })

    it('can be focused', async () => {
      const user = setupUser()

      render(<FormInput label="Email" />)

      const input = screen.getByRole('textbox')
      await user.click(input)

      expect(input).toHaveFocus()
    })

    it('does not receive input when disabled', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(<FormInput label="Email" disabled onChange={handleChange} />)

      const input = screen.getByRole('textbox')

      // userEvent.type ne fait rien sur un input disabled
      await user.type(input, 'test')

      expect(handleChange).not.toHaveBeenCalled()
      expect(input).toHaveValue('')
    })
  })

  // =========================================================================
  // ACCESSIBILITÉ
  // =========================================================================

  describe('Accessibilité', () => {
    it('wrapper has aria-invalid="true" when error is present', () => {
      const { container } = render(
        <FormInput label="Email" error="Email invalide" />
      )

      // FormField sets aria-invalid on the wrapper div, not the input
      const inputWrapper = container.querySelector('[aria-invalid]')
      expect(inputWrapper).toHaveAttribute('aria-invalid', 'true')
    })

    it('wrapper has aria-invalid="false" when no error', () => {
      const { container } = render(<FormInput label="Email" />)

      const inputWrapper = container.querySelector('[aria-invalid]')
      expect(inputWrapper).toHaveAttribute('aria-invalid', 'false')
    })

    it('wrapper has aria-describedby linking to error message', () => {
      const { container } = render(
        <FormInput label="Email" error="Email invalide" />
      )

      const inputWrapper = container.querySelector('[aria-describedby]')
      const describedBy = inputWrapper?.getAttribute('aria-describedby')

      expect(describedBy).toBeTruthy()
      expect(document.getElementById(describedBy!)).toHaveTextContent(
        'Email invalide'
      )
    })
  })

  // =========================================================================
  // FORWARD REF
  // =========================================================================

  describe('forwardRef', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>()

      render(<FormInput label="Email" ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  // =========================================================================
  // CLASSES CSS CUSTOM
  // =========================================================================

  describe('Classes CSS custom', () => {
    it('accepts wrapperClassName', () => {
      const { container } = render(
        <FormInput label="Email" wrapperClassName="custom-wrapper" />
      )

      expect(container.querySelector('.custom-wrapper')).toBeInTheDocument()
    })

    it('accepts inputClassName', () => {
      render(<FormInput label="Email" inputClassName="custom-input" />)

      expect(screen.getByRole('textbox')).toHaveClass('custom-input')
    })
  })
})
