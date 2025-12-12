/**
 * Tests unitaires pour FormSelect
 *
 * FormSelect est un composant select (dropdown) stylisé avec
 * options, optgroups, placeholder et intégration react-hook-form.
 *
 * @ticket SP-126
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { FormSelect } from '@/components/forms/FormSelect'

const mockOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
]

const mockOptGroups = [
  {
    label: 'Groupe A',
    options: [
      { value: 'a1', label: 'Option A1' },
      { value: 'a2', label: 'Option A2' },
    ],
  },
  {
    label: 'Groupe B',
    options: [
      { value: 'b1', label: 'Option B1' },
      { value: 'b2', label: 'Option B2' },
    ],
  },
]

describe('FormSelect', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders select element', () => {
      render(<FormSelect options={mockOptions} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders label when provided', () => {
      render(<FormSelect label="Département" options={mockOptions} />)

      expect(screen.getByText('Département')).toBeInTheDocument()
    })

    it('renders placeholder option when provided', () => {
      render(
        <FormSelect
          options={mockOptions}
          placeholder="Sélectionnez une option"
        />
      )

      expect(
        screen.getByRole('option', { name: 'Sélectionnez une option' })
      ).toBeInTheDocument()
    })

    it('renders all options', () => {
      render(<FormSelect options={mockOptions} />)

      expect(
        screen.getByRole('option', { name: 'Option 1' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Option 2' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Option 3' })
      ).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // OPT GROUPS
  // ===========================================================================

  describe('OptGroups', () => {
    it('renders option groups', () => {
      render(<FormSelect optGroups={mockOptGroups} />)

      expect(
        screen.getByRole('group', { name: 'Groupe A' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('group', { name: 'Groupe B' })
      ).toBeInTheDocument()
    })

    it('renders options within groups', () => {
      render(<FormSelect optGroups={mockOptGroups} />)

      expect(
        screen.getByRole('option', { name: 'Option A1' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Option B2' })
      ).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ÉTATS VISUELS (VARIANTS)
  // ===========================================================================

  describe('États visuels', () => {
    it('shows error state with error message', () => {
      render(
        <FormSelect
          label="Département"
          options={mockOptions}
          error="Veuillez sélectionner un département"
        />
      )

      expect(
        screen.getByText('Veuillez sélectionner un département')
      ).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has error styling when error is present', () => {
      render(<FormSelect options={mockOptions} error="Erreur" />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveClass('border-red-500')
    })

    it('shows success variant styling', () => {
      render(<FormSelect options={mockOptions} variant="success" />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveClass('border-green-500')
    })

    it('shows default variant styling by default', () => {
      render(<FormSelect options={mockOptions} />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveClass('border-gray-300')
    })
  })

  // ===========================================================================
  // ÉTAT DISABLED
  // ===========================================================================

  describe('État disabled', () => {
    it('is disabled when disabled=true', () => {
      render(<FormSelect options={mockOptions} disabled />)

      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('has disabled styling when disabled', () => {
      render(<FormSelect options={mockOptions} disabled />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  // ===========================================================================
  // OPTIONS DISABLED
  // ===========================================================================

  describe('Options disabled', () => {
    it('renders disabled option', () => {
      const optionsWithDisabled = [
        { value: '1', label: 'Enabled' },
        { value: '2', label: 'Disabled', disabled: true },
      ]
      render(<FormSelect options={optionsWithDisabled} />)

      const disabledOption = screen.getByRole('option', { name: 'Disabled' })
      expect(disabledOption).toBeDisabled()
    })

    it('placeholder option is disabled', () => {
      render(
        <FormSelect
          options={mockOptions}
          placeholder="Choisir..."
          defaultValue=""
        />
      )

      const placeholder = screen.getByRole('option', { name: 'Choisir...' })
      expect(placeholder).toBeDisabled()
    })
  })

  // ===========================================================================
  // LABEL ET REQUIRED
  // ===========================================================================

  describe('Label et required', () => {
    it('shows required indicator when required=true', () => {
      render(<FormSelect label="Département" options={mockOptions} required />)

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('renders without label when not provided', () => {
      render(<FormSelect options={mockOptions} />)

      expect(screen.queryByText('Département')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // TEXTE D'AIDE
  // ===========================================================================

  describe("Texte d'aide", () => {
    it('shows help text when provided', () => {
      render(
        <FormSelect
          label="Département"
          options={mockOptions}
          helpText="Sélectionnez votre département principal"
        />
      )

      expect(
        screen.getByText('Sélectionnez votre département principal')
      ).toBeInTheDocument()
    })

    it('hides help text when error is present', () => {
      render(
        <FormSelect
          label="Département"
          options={mockOptions}
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
    it('calls onChange when option selected', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(<FormSelect options={mockOptions} onChange={handleChange} />)

      await user.selectOptions(screen.getByRole('combobox'), '2')

      expect(handleChange).toHaveBeenCalled()
    })

    it('updates value when option selected', async () => {
      const user = setupUser()

      render(<FormSelect options={mockOptions} />)

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, '2')

      expect(select).toHaveValue('2')
    })

    it('can be focused', async () => {
      const user = setupUser()

      render(<FormSelect options={mockOptions} />)

      const select = screen.getByRole('combobox')
      await user.click(select)

      expect(select).toHaveFocus()
    })
  })

  // ===========================================================================
  // ICÔNE CHEVRON
  // ===========================================================================

  describe('Icône chevron', () => {
    it('renders chevron icon', () => {
      const { container } = render(<FormSelect options={mockOptions} />)

      // Chevron should be rendered inside the component
      const chevron = container.querySelector('svg')
      expect(chevron).toBeInTheDocument()
    })

    it('chevron has error color when error present', () => {
      const { container } = render(
        <FormSelect options={mockOptions} error="Erreur" />
      )

      const chevron = container.querySelector('svg')
      expect(chevron).toHaveClass('text-red-500')
    })

    it('chevron has success color for success variant', () => {
      const { container } = render(
        <FormSelect options={mockOptions} variant="success" />
      )

      const chevron = container.querySelector('svg')
      expect(chevron).toHaveClass('text-green-500')
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to select element', () => {
      const ref = React.createRef<HTMLSelectElement>()

      render(<FormSelect options={mockOptions} ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLSelectElement)
    })
  })

  // ===========================================================================
  // CLASSES CSS CUSTOM
  // ===========================================================================

  describe('Classes CSS custom', () => {
    it('accepts wrapperClassName', () => {
      const { container } = render(
        <FormSelect
          label="Test"
          options={mockOptions}
          wrapperClassName="custom-wrapper"
        />
      )

      expect(container.querySelector('.custom-wrapper')).toBeInTheDocument()
    })

    it('accepts selectClassName', () => {
      render(
        <FormSelect options={mockOptions} selectClassName="custom-select" />
      )

      expect(screen.getByRole('combobox')).toHaveClass('custom-select')
    })
  })
})
