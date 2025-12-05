/**
 * Tests unitaires pour FormCheckbox
 *
 * FormCheckbox est un composant checkbox stylisé avec label cliquable,
 * états visuels et intégration react-hook-form.
 *
 * @ticket SP-126
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { FormCheckbox } from '@/components/forms/FormCheckbox'

describe('FormCheckbox', () => {
  // =========================================================================
  // RENDU DE BASE
  // =========================================================================

  describe('Rendu de base', () => {
    it('renders checkbox element', () => {
      render(<FormCheckbox label="J'accepte les CGU" />)

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders label text', () => {
      render(<FormCheckbox label="J'accepte les CGU" />)

      expect(screen.getByText("J'accepte les CGU")).toBeInTheDocument()
    })

    it('checkbox is unchecked by default', () => {
      render(<FormCheckbox label="J'accepte" />)

      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('renders as checked when defaultChecked', () => {
      render(<FormCheckbox label="J'accepte" defaultChecked />)

      expect(screen.getByRole('checkbox')).toBeChecked()
    })
  })

  // =========================================================================
  // LABEL CLIQUABLE
  // =========================================================================

  describe('Label cliquable', () => {
    it('clicking label toggles checkbox', async () => {
      const user = setupUser()

      render(<FormCheckbox label="J'accepte les CGU" />)

      const label = screen.getByText("J'accepte les CGU")
      await user.click(label)

      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('label has correct htmlFor linking to checkbox', () => {
      render(<FormCheckbox label="J'accepte" id="custom-id" />)

      const label = screen.getByText("J'accepte")
      expect(label).toHaveAttribute('for', 'custom-id')
    })
  })

  // =========================================================================
  // MESSAGE D'ERREUR
  // =========================================================================

  describe('Message d\'erreur', () => {
    it('renders error message when error is provided', () => {
      render(
        <FormCheckbox label="J'accepte" error="Vous devez accepter les CGU" />
      )

      expect(screen.getByText('Vous devez accepter les CGU')).toBeInTheDocument()
    })

    it('error message has role="alert"', () => {
      render(<FormCheckbox label="J'accepte" error="Erreur" />)

      expect(screen.getByRole('alert')).toHaveTextContent('Erreur')
    })

    it('checkbox has error styling when error is present', () => {
      render(<FormCheckbox label="J'accepte" error="Erreur" />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('border-red-500')
    })
  })

  // =========================================================================
  // TEXTE D'AIDE
  // =========================================================================

  describe('Texte d\'aide', () => {
    it('renders help text when provided', () => {
      render(
        <FormCheckbox
          label="Newsletter"
          helpText="Recevez nos actualités par email"
        />
      )

      expect(
        screen.getByText('Recevez nos actualités par email')
      ).toBeInTheDocument()
    })

    it('hides help text when error is present', () => {
      render(
        <FormCheckbox
          label="Newsletter"
          helpText="Texte d'aide"
          error="Erreur présente"
        />
      )

      expect(screen.queryByText("Texte d'aide")).not.toBeInTheDocument()
      expect(screen.getByText('Erreur présente')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ÉTAT DISABLED
  // =========================================================================

  describe('État disabled', () => {
    it('is disabled when disabled=true', () => {
      render(<FormCheckbox label="J'accepte" disabled />)

      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('label has disabled styling when disabled', () => {
      render(<FormCheckbox label="J'accepte" disabled />)

      const label = screen.getByText("J'accepte")
      expect(label).toHaveClass('cursor-not-allowed', 'opacity-60')
    })

    it('cannot be toggled when disabled', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(
        <FormCheckbox label="J'accepte" disabled onChange={handleChange} />
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(handleChange).not.toHaveBeenCalled()
      expect(checkbox).not.toBeChecked()
    })
  })

  // =========================================================================
  // INTERACTIONS UTILISATEUR
  // =========================================================================

  describe('Interactions utilisateur', () => {
    it('calls onChange when clicked', async () => {
      const user = setupUser()
      const handleChange = vi.fn()

      render(<FormCheckbox label="J'accepte" onChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(handleChange).toHaveBeenCalled()
    })

    it('toggles checked state when clicked', async () => {
      const user = setupUser()

      render(<FormCheckbox label="J'accepte" />)

      const checkbox = screen.getByRole('checkbox')

      // Initially unchecked
      expect(checkbox).not.toBeChecked()

      // Click to check
      await user.click(checkbox)
      expect(checkbox).toBeChecked()

      // Click to uncheck
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('can be focused with Tab', async () => {
      const user = setupUser()

      render(<FormCheckbox label="J'accepte" />)

      const checkbox = screen.getByRole('checkbox')

      await user.tab()
      expect(checkbox).toHaveFocus()
    })

    it('can be toggled with Space when focused', async () => {
      const user = setupUser()

      render(<FormCheckbox label="J'accepte" />)

      const checkbox = screen.getByRole('checkbox')

      await user.tab()
      expect(checkbox).toHaveFocus()

      await user.keyboard(' ')
      expect(checkbox).toBeChecked()
    })
  })

  // =========================================================================
  // ACCESSIBILITÉ
  // =========================================================================

  describe('Accessibilité', () => {
    it('has aria-invalid="true" when error is present', () => {
      render(<FormCheckbox label="J'accepte" error="Erreur" />)

      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    })

    it('has aria-invalid="false" when no error', () => {
      render(<FormCheckbox label="J'accepte" />)

      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-invalid',
        'false'
      )
    })

    it('has aria-describedby linking to error message', () => {
      render(<FormCheckbox label="J'accepte" error="Erreur test" />)

      const checkbox = screen.getByRole('checkbox')
      const describedBy = checkbox.getAttribute('aria-describedby')

      expect(describedBy).toBeTruthy()
      expect(document.getElementById(describedBy!)).toHaveTextContent(
        'Erreur test'
      )
    })

    it('has aria-describedby linking to help text when no error', () => {
      render(<FormCheckbox label="J'accepte" helpText="Aide contextuelle" />)

      const checkbox = screen.getByRole('checkbox')
      const describedBy = checkbox.getAttribute('aria-describedby')

      expect(describedBy).toBeTruthy()
      expect(document.getElementById(describedBy!)).toHaveTextContent(
        'Aide contextuelle'
      )
    })

    it('generates unique ID when not provided', () => {
      render(
        <>
          <FormCheckbox label="Checkbox 1" />
          <FormCheckbox label="Checkbox 2" />
        </>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]?.id).not.toBe(checkboxes[1]?.id)
    })

    it('uses custom ID when provided', () => {
      render(<FormCheckbox label="J'accepte" id="my-custom-checkbox" />)

      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'id',
        'my-custom-checkbox'
      )
    })
  })

  // =========================================================================
  // FORWARD REF
  // =========================================================================

  describe('forwardRef', () => {
    it('forwards ref to checkbox input element', () => {
      const ref = React.createRef<HTMLInputElement>()

      render(<FormCheckbox label="J'accepte" ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.type).toBe('checkbox')
    })
  })

  // =========================================================================
  // CLASSES CSS CUSTOM
  // =========================================================================

  describe('Classes CSS custom', () => {
    it('accepts wrapperClassName', () => {
      const { container } = render(
        <FormCheckbox label="J'accepte" wrapperClassName="custom-wrapper" />
      )

      expect(container.firstChild).toHaveClass('custom-wrapper')
    })

    it('accepts checkboxClassName', () => {
      render(
        <FormCheckbox label="J'accepte" checkboxClassName="custom-checkbox" />
      )

      expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox')
    })

    it('accepts labelClassName', () => {
      render(<FormCheckbox label="J'accepte" labelClassName="custom-label" />)

      expect(screen.getByText("J'accepte")).toHaveClass('custom-label')
    })
  })
})
