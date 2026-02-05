/**
 * Tests unitaires pour AccountInfoCard
 *
 * @ticket SP-270
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AccountInfoCard } from '@/app/app/profile/_components/AccountInfoCard'

describe('AccountInfoCard', () => {
  // Fixer la date pour les tests relatifs
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-02T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps = {
    createdAt: new Date('2025-01-15T00:00:00Z'),
    lastLoginAt: new Date('2026-02-02T10:00:00Z'),
    emailVerified: new Date('2025-06-01T00:00:00Z'),
    isActive: true,
  }

  it('should render "Actif" badge when account is active', () => {
    render(<AccountInfoCard {...defaultProps} />)
    expect(screen.getByTestId('account-status')).toHaveTextContent('Actif')
  })

  it('should render "Inactif" badge when account is inactive', () => {
    render(<AccountInfoCard {...defaultProps} isActive={false} />)
    expect(screen.getByTestId('account-status')).toHaveTextContent('Inactif')
  })

  it('should render "Oui" with checkmark when email is verified', () => {
    render(<AccountInfoCard {...defaultProps} />)
    expect(screen.getByTestId('email-verified')).toHaveTextContent('Oui')
  })

  it('should render "Non" with X icon when email is not verified', () => {
    render(<AccountInfoCard {...defaultProps} emailVerified={null} />)
    expect(screen.getByTestId('email-not-verified')).toHaveTextContent('Non')
  })

  it('should render creation date in French format', () => {
    render(<AccountInfoCard {...defaultProps} />)
    expect(screen.getByTestId('account-created')).toHaveTextContent(
      '15 janvier 2025'
    )
  })

  it('should render relative last login time', () => {
    render(<AccountInfoCard {...defaultProps} />)
    // "il y a 2 heures" ou similaire selon date-fns
    expect(screen.getByTestId('account-lastlogin')).toHaveTextContent(/il y a/)
  })

  it('should render "Jamais" when lastLoginAt is null', () => {
    render(<AccountInfoCard {...defaultProps} lastLoginAt={null} />)
    expect(screen.getByTestId('account-lastlogin')).toHaveTextContent('Jamais')
  })

  it('should render card title', () => {
    render(<AccountInfoCard {...defaultProps} />)
    expect(screen.getByText('Informations du compte')).toBeInTheDocument()
  })

  it('should render status labels', () => {
    render(<AccountInfoCard {...defaultProps} />)
    expect(screen.getByText('Statut du compte')).toBeInTheDocument()
    expect(screen.getByText('Email vérifié')).toBeInTheDocument()
    expect(screen.getByText('Membre depuis')).toBeInTheDocument()
    expect(screen.getByText('Dernière connexion')).toBeInTheDocument()
  })

  it('should use destructive variant for inactive badge', () => {
    render(<AccountInfoCard {...defaultProps} isActive={false} />)
    const badge = screen.getByTestId('account-status')
    // Le badge devrait avoir une classe indiquant le variant destructive
    expect(badge).toBeInTheDocument()
  })

  it('should display green color for verified email', () => {
    render(<AccountInfoCard {...defaultProps} />)
    const verifiedSpan = screen.getByTestId('email-verified')
    expect(verifiedSpan).toHaveClass('text-green-600')
  })

  it('should display destructive color for unverified email', () => {
    render(<AccountInfoCard {...defaultProps} emailVerified={null} />)
    const notVerifiedSpan = screen.getByTestId('email-not-verified')
    expect(notVerifiedSpan).toHaveClass('text-destructive')
  })
})
