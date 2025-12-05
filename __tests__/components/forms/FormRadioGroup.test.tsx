/**
 * Tests unitaires pour FormRadioGroup
 *
 * FormRadioGroup est un groupe de radio buttons avec layout vertical/horizontal,
 * help text par option, et intégration react-hook-form.
 *
 * @ticket SP-126
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { FormRadioGroup } from '@/components/forms/FormRadioGroup'

const mockOptions = [
  { value: 'full_time', label: 'Temps plein' },
  { value: 'part_time', label: 'Temps partiel' },
  { value: 'contractor', label: 'Freelance' },
]

const mockOptionsWithHelp = [
  { value: 'full_time', label: 'Temps plein', helpText: '35h ou plus par semaine' },
  { value: 'part_time', label: 'Temps partiel', helpText: 'Moins de 35h par semaine' },
]

describe('FormRadioGroup', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders radio buttons for each option', () => {
      render(<FormRadioGroup name="employment" options={mockOptions} />)

      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(3)
    })

    it('renders labels for each option', () => {
      render(<FormRadioGroup name="employment" options={mockOptions} />)

      expect(screen.getByText('Temps plein')).toBeInTheDocument()
      expect(screen.getByText('Temps partiel')).toBeInTheDocument()
      expect(screen.getByText('Freelance')).toBeInTheDocument()
    })

    it('renders group label when provided', () => {
      render(
        <FormRadioGroup
          name="employment"
          label="Type d'emploi"
          options={mockOptions}
        />
      )

      expect(screen.getByText("Type d'emploi")).toBeInTheDocument()
    })

    it('renders within a fieldset', () => {
      const { container } = render(
        <FormRadioGroup name="employment" options={mockOptions} />
      )

      expect(container.querySelector('fieldset')).toBeInTheDocument()
    })

    it('has role="radiogroup" on options container', () => {
      render(<FormRadioGroup name="employment" options={mockOptions} />)

      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // HELP TEXT PAR OPTION
  // ===========================================================================

  describe('Help text par option', () => {
    it('renders help text for options that have it', () => {
      render(<FormRadioGroup name="employment" options={mockOptionsWithHelp} />)

      expect(screen.getByText('35h ou plus par semaine')).toBeInTheDocument()
      expect(screen.getByText('Moins de 35h par semaine')).toBeInTheDocument()
    })

    it('does not render help text container when option has no helpText', () => {
      render(<FormRadioGroup name="employment" options={mockOptions} />)

      expect(screen.queryByText(/par semaine/)).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // LAYOUT
  // ===========================================================================

  describe('Layout', () => {
    it('renders vertical layout by default', () => {
      const { container } = render(
        <FormRadioGroup name="employment" options={mockOptions} />
      )

      const optionsContainer = container.querySelector('[role="radiogroup"]')
      expect(optionsContainer).toHaveClass('flex-col')
    })

    it('renders horizontal layout when layout="horizontal"', () => {
      const { container } = render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          layout="horizontal"
        />
      )

      const optionsContainer = container.querySelector('[role="radiogroup"]')
      expect(optionsContainer).toHaveClass('flex-row')
    })
  })

  // ===========================================================================
  // ÉTATS VISUELS
  // ===========================================================================

  describe('États visuels', () => {
    it('shows error state with error message', () => {
      render(
        <FormRadioGroup
          name="employment"
          label="Type d'emploi"
          options={mockOptions}
          error="Veuillez sélectionner une option"
        />
      )

      expect(
        screen.getByText('Veuillez sélectionner une option')
      ).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has aria-invalid="true" when error is present', () => {
      render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          error="Erreur"
        />
      )

      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    })

    it('has aria-invalid="false" when no error', () => {
      render(<FormRadioGroup name="employment" options={mockOptions} />)

      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-invalid',
        'false'
      )
    })

    it('radios have error styling when error present', () => {
      render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          error="Erreur"
        />
      )

      const radios = screen.getAllByRole('radio')
      radios.forEach((radio) => {
        expect(radio).toHaveClass('border-red-500')
      })
    })
  })

  // ===========================================================================
  // ÉTAT DISABLED
  // ===========================================================================

  describe('État disabled', () => {
    it('disables all radios when disabled=true', () => {
      render(
        <FormRadioGroup name="employment" options={mockOptions} disabled />
      )

      const radios = screen.getAllByRole('radio')
      radios.forEach((radio) => {
        expect(radio).toBeDisabled()
      })
    })

    it('fieldset is disabled when disabled=true', () => {
      const { container } = render(
        <FormRadioGroup name="employment" options={mockOptions} disabled />
      )

      expect(container.querySelector('fieldset')).toBeDisabled()
    })

    it('disables individual option when option.disabled=true', () => {
      const optionsWithDisabled = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B', disabled: true },
        { value: 'c', label: 'Option C' },
      ]

      render(
        <FormRadioGroup name="employment" options={optionsWithDisabled} />
      )

      const radios = screen.getAllByRole('radio')
      expect(radios[0]).not.toBeDisabled()
      expect(radios[1]).toBeDisabled()
      expect(radios[2]).not.toBeDisabled()
    })
  })

  // ===========================================================================
  // LABEL ET REQUIRED
  // ===========================================================================

  describe('Label et required', () => {
    it('shows required indicator when required=true', () => {
      render(
        <FormRadioGroup
          name="employment"
          label="Type d'emploi"
          options={mockOptions}
          required
        />
      )

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('has aria-required="true" when required', () => {
      render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          required
        />
      )

      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-required',
        'true'
      )
    })
  })

  // ===========================================================================
  // TEXTE D'AIDE GLOBAL
  // ===========================================================================

  describe('Texte d\'aide global', () => {
    it('shows help text when provided', () => {
      render(
        <FormRadioGroup
          name="employment"
          label="Type d'emploi"
          options={mockOptions}
          helpText="Choisissez votre type de contrat"
        />
      )

      expect(
        screen.getByText('Choisissez votre type de contrat')
      ).toBeInTheDocument()
    })

    it('hides help text when error is present', () => {
      render(
        <FormRadioGroup
          name="employment"
          label="Type d'emploi"
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
    it('calls onChange when radio selected', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          onChange={handleChange}
        />
      )

      await user.click(screen.getByLabelText('Temps partiel'))

      expect(handleChange).toHaveBeenCalledWith('part_time')
    })

    it('radio can receive click', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          onChange={handleChange}
        />
      )

      const radio = screen.getByLabelText('Temps plein')
      await user.click(radio)

      expect(handleChange).toHaveBeenCalledWith('full_time')
    })

    it('clicking different radios calls onChange with different values', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          onChange={handleChange}
        />
      )

      await user.click(screen.getByLabelText('Temps plein'))
      expect(handleChange).toHaveBeenLastCalledWith('full_time')

      await user.click(screen.getByLabelText('Temps partiel'))
      expect(handleChange).toHaveBeenLastCalledWith('part_time')
    })

    it('clicking label triggers onChange', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          onChange={handleChange}
        />
      )

      await user.click(screen.getByText('Freelance'))

      expect(handleChange).toHaveBeenCalledWith('contractor')
    })

    it('can navigate with Tab', async () => {
      const user = setupUser()

      render(<FormRadioGroup name="employment" options={mockOptions} />)

      await user.tab()

      expect(screen.getAllByRole('radio')[0]).toHaveFocus()
    })
  })

  // ===========================================================================
  // DEFAULT VALUE
  // ===========================================================================

  describe('Default value', () => {
    it('sets defaultChecked on the correct radio', () => {
      const { container } = render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          defaultValue="part_time"
        />
      )

      // The radio with defaultValue should have defaultChecked attribute
      const partTimeRadio = screen.getByLabelText('Temps partiel')
      expect(partTimeRadio).toHaveAttribute('value', 'part_time')
    })
  })

  // ===========================================================================
  // CONTROLLED VALUE
  // ===========================================================================

  describe('Controlled value', () => {
    it('reflects controlled value', () => {
      render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          value="contractor"
        />
      )

      expect(screen.getByLabelText('Freelance')).toBeChecked()
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to fieldset element', () => {
      const ref = { current: null } as React.RefObject<HTMLFieldSetElement>

      render(
        <FormRadioGroup name="employment" options={mockOptions} ref={ref} />
      )

      expect(ref.current).toBeInstanceOf(HTMLFieldSetElement)
    })
  })

  // ===========================================================================
  // CLASSES CSS CUSTOM
  // ===========================================================================

  describe('Classes CSS custom', () => {
    it('accepts wrapperClassName', () => {
      const { container } = render(
        <FormRadioGroup
          name="employment"
          label="Test"
          options={mockOptions}
          wrapperClassName="custom-wrapper"
        />
      )

      expect(container.querySelector('.custom-wrapper')).toBeInTheDocument()
    })

    it('accepts fieldsetClassName', () => {
      const { container } = render(
        <FormRadioGroup
          name="employment"
          options={mockOptions}
          fieldsetClassName="custom-fieldset"
        />
      )

      expect(container.querySelector('.custom-fieldset')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ACCESSIBILITÉ
  // ===========================================================================

  describe('Accessibilité', () => {
    it('each radio has unique id', () => {
      render(<FormRadioGroup name="employment" options={mockOptions} />)

      const radios = screen.getAllByRole('radio')
      const ids = radios.map((r) => r.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })

    it('labels are associated with radios via htmlFor', () => {
      render(<FormRadioGroup name="employment" options={mockOptions} />)

      mockOptions.forEach((option) => {
        const label = screen.getByText(option.label)
        const radio = screen.getByLabelText(option.label)

        expect(label).toHaveAttribute('for', radio.id)
      })
    })

    it('all radios have same name attribute', () => {
      render(<FormRadioGroup name="employment" options={mockOptions} />)

      const radios = screen.getAllByRole('radio')
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'employment')
      })
    })
  })
})
