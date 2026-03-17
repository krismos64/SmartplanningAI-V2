/**
 * Tests unitaires pour PasswordStrengthIndicator
 *
 * @ticket SP-273
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { PasswordStrengthIndicator } from '@/app/app/profil/password/_components/PasswordStrengthIndicator'

describe('PasswordStrengthIndicator', () => {
  // ============================================
  // RENDU
  // ============================================
  describe('Rendu', () => {
    it('should not render when password is empty', () => {
      render(<PasswordStrengthIndicator password="" />)
      expect(
        screen.queryByTestId('password-strength-indicator')
      ).not.toBeInTheDocument()
    })

    it('should render strength bar when password is provided', () => {
      render(<PasswordStrengthIndicator password="test" />)
      expect(
        screen.getByTestId('password-strength-indicator')
      ).toBeInTheDocument()
      expect(screen.getByTestId('password-strength-bar')).toBeInTheDocument()
    })

    it('should render all 5 criteria', () => {
      render(<PasswordStrengthIndicator password="a" />)
      expect(screen.getByTestId('criterion-0')).toBeInTheDocument()
      expect(screen.getByTestId('criterion-1')).toBeInTheDocument()
      expect(screen.getByTestId('criterion-2')).toBeInTheDocument()
      expect(screen.getByTestId('criterion-3')).toBeInTheDocument()
      expect(screen.getByTestId('criterion-4')).toBeInTheDocument()
    })
  })

  // ============================================
  // NIVEAUX DE FORCE
  // ============================================
  describe('Niveaux de force', () => {
    it('should show "Faible" for password with only lowercase', () => {
      render(<PasswordStrengthIndicator password="abc" />)
      const label = screen.getByTestId('password-strength-label')
      expect(label).toHaveTextContent('Faible')
      expect(label).toHaveClass('text-red-500')
    })

    it('should show "Moyen" for password with lower + upper + number (3 criteria)', () => {
      // abcABC1 = 3 critères : minuscule, majuscule, chiffre (pas 8 chars)
      render(<PasswordStrengthIndicator password="abcABC1" />)
      const label = screen.getByTestId('password-strength-label')
      expect(label).toHaveTextContent('Moyen')
      expect(label).toHaveClass('text-yellow-500')
    })

    it('should show "Fort" for password with lower + upper + number + length', () => {
      render(<PasswordStrengthIndicator password="abcABC123" />)
      const label = screen.getByTestId('password-strength-label')
      expect(label).toHaveTextContent('Fort')
      expect(label).toHaveClass('text-blue-500')
    })

    it('should show "Très fort" for password meeting all criteria', () => {
      render(<PasswordStrengthIndicator password="abcABC123!" />)
      const label = screen.getByTestId('password-strength-label')
      expect(label).toHaveTextContent('Très fort')
      expect(label).toHaveClass('text-green-500')
    })
  })

  // ============================================
  // CRITÈRES INDIVIDUELS
  // ============================================
  describe('Critères individuels', () => {
    it('should mark 8+ characters criterion as met', () => {
      render(<PasswordStrengthIndicator password="12345678" />)
      const criterion = screen.getByTestId('criterion-0')
      expect(criterion).toHaveClass('text-green-600')
      expect(criterion).toHaveTextContent('Au moins 8 caractères')
    })

    it('should not mark 8+ characters criterion when less than 8', () => {
      render(<PasswordStrengthIndicator password="1234567" />)
      const criterion = screen.getByTestId('criterion-0')
      expect(criterion).toHaveClass('text-muted-foreground')
    })

    it('should mark uppercase criterion as met', () => {
      render(<PasswordStrengthIndicator password="A" />)
      const criterion = screen.getByTestId('criterion-1')
      expect(criterion).toHaveClass('text-green-600')
      expect(criterion).toHaveTextContent('Au moins une majuscule')
    })

    it('should mark lowercase criterion as met', () => {
      render(<PasswordStrengthIndicator password="a" />)
      const criterion = screen.getByTestId('criterion-2')
      expect(criterion).toHaveClass('text-green-600')
      expect(criterion).toHaveTextContent('Au moins une minuscule')
    })

    it('should mark number criterion as met', () => {
      render(<PasswordStrengthIndicator password="1" />)
      const criterion = screen.getByTestId('criterion-3')
      expect(criterion).toHaveClass('text-green-600')
      expect(criterion).toHaveTextContent('Au moins un chiffre')
    })

    it('should mark special character criterion as met', () => {
      render(<PasswordStrengthIndicator password="!" />)
      const criterion = screen.getByTestId('criterion-4')
      expect(criterion).toHaveClass('text-green-600')
      expect(criterion).toHaveTextContent('Au moins un caractère spécial')
    })
  })

  // ============================================
  // PROGRESSBAR
  // ============================================
  describe('Progressbar', () => {
    it('should have 25% width for level 1 (Faible)', () => {
      render(<PasswordStrengthIndicator password="abc" />)
      const bar = screen.getByTestId('password-strength-bar')
      expect(bar).toHaveStyle({ width: '25%' })
    })

    it('should have 50% width for level 2 (Moyen)', () => {
      // abcABC1 = 3 critères : minuscule, majuscule, chiffre (pas 8 chars)
      render(<PasswordStrengthIndicator password="abcABC1" />)
      const bar = screen.getByTestId('password-strength-bar')
      expect(bar).toHaveStyle({ width: '50%' })
    })

    it('should have 75% width for level 3 (Fort)', () => {
      render(<PasswordStrengthIndicator password="abcABC123" />)
      const bar = screen.getByTestId('password-strength-bar')
      expect(bar).toHaveStyle({ width: '75%' })
    })

    it('should have 100% width for level 4 (Très fort)', () => {
      render(<PasswordStrengthIndicator password="abcABC123!" />)
      const bar = screen.getByTestId('password-strength-bar')
      expect(bar).toHaveStyle({ width: '100%' })
    })
  })

  // ============================================
  // ACCESSIBILITÉ
  // ============================================
  describe('Accessibilité', () => {
    it('should have correct role and aria attributes on progressbar', () => {
      render(<PasswordStrengthIndicator password="test" />)
      const bar = screen.getByTestId('password-strength-bar')
      expect(bar).toHaveAttribute('role', 'progressbar')
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', '4')
    })

    it('should have aria-label on criteria list', () => {
      render(<PasswordStrengthIndicator password="test" />)
      const list = screen.getByRole('list', {
        name: 'Critères du mot de passe',
      })
      expect(list).toBeInTheDocument()
    })
  })
})
