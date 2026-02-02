/**
 * Tests unitaires pour ProfileHeader
 *
 * @ticket SP-270
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProfileHeader } from '@/app/app/profile/_components/ProfileHeader'

describe('ProfileHeader', () => {
  const defaultProps = {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    role: 'EMPLOYEE',
    avatarUrl: null,
  }

  it('should render user name', () => {
    render(<ProfileHeader {...defaultProps} />)
    expect(screen.getByTestId('profile-name')).toHaveTextContent('Jean Dupont')
  })

  it('should render user email', () => {
    render(<ProfileHeader {...defaultProps} />)
    expect(screen.getByTestId('profile-email')).toHaveTextContent(
      'jean@example.com'
    )
  })

  it('should render EMPLOYEE role with correct label', () => {
    render(<ProfileHeader {...defaultProps} />)
    expect(screen.getByTestId('profile-role')).toHaveTextContent('Employé')
  })

  it('should render DIRECTOR role correctly', () => {
    render(<ProfileHeader {...defaultProps} role="DIRECTOR" />)
    expect(screen.getByTestId('profile-role')).toHaveTextContent('Directeur')
  })

  it('should render MANAGER role correctly', () => {
    render(<ProfileHeader {...defaultProps} role="MANAGER" />)
    expect(screen.getByTestId('profile-role')).toHaveTextContent('Manager')
  })

  it('should render SYSTEM_ADMIN role correctly', () => {
    render(<ProfileHeader {...defaultProps} role="SYSTEM_ADMIN" />)
    expect(screen.getByTestId('profile-role')).toHaveTextContent(
      'Administrateur Système'
    )
  })

  it('should display initials when no avatar (two words)', () => {
    render(<ProfileHeader {...defaultProps} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should handle single name for initials', () => {
    render(<ProfileHeader {...defaultProps} name="Admin" />)
    // Un seul mot = une seule initiale
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('should handle three words name for initials (max 2 letters)', () => {
    render(<ProfileHeader {...defaultProps} name="Jean Pierre Dupont" />)
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('should render unknown role as-is', () => {
    render(<ProfileHeader {...defaultProps} role="UNKNOWN_ROLE" />)
    expect(screen.getByTestId('profile-role')).toHaveTextContent('UNKNOWN_ROLE')
  })

  it('should render with glass-strong class', () => {
    render(<ProfileHeader {...defaultProps} />)
    const container = screen.getByTestId('profile-name').closest('div')?.parentElement
    expect(container).toHaveClass('glass-strong')
  })

  it('should render avatar fallback with correct classes', () => {
    render(<ProfileHeader {...defaultProps} />)
    const fallback = screen.getByText('JD')
    expect(fallback).toHaveClass('bg-primary/10')
    expect(fallback).toHaveClass('text-primary')
  })
})
