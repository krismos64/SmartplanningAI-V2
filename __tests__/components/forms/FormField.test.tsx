/**
 * Tests unitaires pour FormField
 *
 * FormField est le wrapper générique pour tous les champs de formulaire.
 * Il gère : label, erreur, texte d'aide, et attributs d'accessibilité.
 *
 * @ticket SP-126
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { FormField } from '@/components/forms/FormField'

describe('FormField', () => {
  // =========================================================================
  // RENDU DE BASE
  // =========================================================================

  describe('Rendu de base', () => {
    it('renders children correctly', () => {
      render(
        <FormField>
          <input data-testid="test-input" />
        </FormField>
      )

      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })

    it('renders without label when not provided', () => {
      render(
        <FormField>
          <input />
        </FormField>
      )

      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })
  })

  // =========================================================================
  // LABEL
  // =========================================================================

  describe('Label', () => {
    it('renders label when provided', () => {
      render(
        <FormField label="Email">
          <input />
        </FormField>
      )

      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('renders required indicator when required=true', () => {
      render(
        <FormField label="Email" required>
          <input />
        </FormField>
      )

      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByLabelText('requis')).toBeInTheDocument()
    })

    it('does not render required indicator when required=false', () => {
      render(
        <FormField label="Email" required={false}>
          <input />
        </FormField>
      )

      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })
  })

  // =========================================================================
  // MESSAGE D'ERREUR
  // =========================================================================

  describe('Message d\'erreur', () => {
    it('renders error message when error is provided', () => {
      render(
        <FormField label="Email" error="Email invalide">
          <input />
        </FormField>
      )

      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })

    it('error message has role="alert" for accessibility', () => {
      render(
        <FormField label="Email" error="Champ requis">
          <input />
        </FormField>
      )

      expect(screen.getByRole('alert')).toHaveTextContent('Champ requis')
    })

    it('does not render error when not provided', () => {
      render(
        <FormField label="Email">
          <input />
        </FormField>
      )

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  // =========================================================================
  // TEXTE D'AIDE
  // =========================================================================

  describe('Texte d\'aide', () => {
    it('renders help text when provided', () => {
      render(
        <FormField label="Email" helpText="Nous ne partagerons jamais votre email">
          <input />
        </FormField>
      )

      expect(
        screen.getByText('Nous ne partagerons jamais votre email')
      ).toBeInTheDocument()
    })

    it('hides help text when error is present', () => {
      render(
        <FormField
          label="Email"
          helpText="Texte d'aide"
          error="Erreur présente"
        >
          <input />
        </FormField>
      )

      expect(screen.queryByText("Texte d'aide")).not.toBeInTheDocument()
      expect(screen.getByText('Erreur présente')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // ACCESSIBILITÉ (ARIA)
  // =========================================================================

  describe('Accessibilité', () => {
    it('sets aria-invalid="true" on child when error is present', () => {
      render(
        <FormField label="Email" error="Email invalide">
          <input data-testid="test-input" />
        </FormField>
      )

      expect(screen.getByTestId('test-input')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    })

    it('sets aria-invalid="false" on child when no error', () => {
      render(
        <FormField label="Email">
          <input data-testid="test-input" />
        </FormField>
      )

      expect(screen.getByTestId('test-input')).toHaveAttribute(
        'aria-invalid',
        'false'
      )
    })

    it('sets aria-describedby pointing to error message', () => {
      render(
        <FormField label="Email" error="Email invalide">
          <input data-testid="test-input" />
        </FormField>
      )

      const input = screen.getByTestId('test-input')
      const errorId = input.getAttribute('aria-describedby')

      expect(errorId).toBeTruthy()
      expect(document.getElementById(errorId!)).toHaveTextContent('Email invalide')
    })

    it('sets aria-describedby pointing to help text when no error', () => {
      render(
        <FormField label="Email" helpText="Aide contextuelle">
          <input data-testid="test-input" />
        </FormField>
      )

      const input = screen.getByTestId('test-input')
      const helpId = input.getAttribute('aria-describedby')

      expect(helpId).toBeTruthy()
      expect(document.getElementById(helpId!)).toHaveTextContent(
        'Aide contextuelle'
      )
    })

    it('generates unique IDs for each instance', () => {
      render(
        <>
          <FormField label="Email">
            <input data-testid="input-1" />
          </FormField>
          <FormField label="Password">
            <input data-testid="input-2" />
          </FormField>
        </>
      )

      const input1 = screen.getByTestId('input-1')
      const input2 = screen.getByTestId('input-2')

      expect(input1.id).not.toBe(input2.id)
    })

    it('uses custom id when provided', () => {
      render(
        <FormField label="Email" id="custom-email-field">
          <input data-testid="test-input" />
        </FormField>
      )

      expect(screen.getByTestId('test-input')).toHaveAttribute(
        'id',
        'custom-email-field'
      )
    })
  })

  // =========================================================================
  // CLASSES CSS
  // =========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <FormField label="Email" className="custom-class">
          <input />
        </FormField>
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
