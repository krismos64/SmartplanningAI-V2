/**
 * Tests unitaires pour SettingsSection
 * @ticket SP-274
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsSection } from '../SettingsSection'
import { User } from 'lucide-react'

const defaultProps = {
  icon: User,
  title: 'Test Section',
  description: 'Test description',
  href: '/test',
  testId: 'test-section',
}

describe('SettingsSection', () => {
  it('should render title and description', () => {
    render(<SettingsSection {...defaultProps} />)
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render as a link when no badge', () => {
    render(<SettingsSection {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should not render as a link when badge is present', () => {
    render(<SettingsSection {...defaultProps} badge="Bientôt" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('should render the badge when provided', () => {
    render(<SettingsSection {...defaultProps} badge="Bientôt" />)
    expect(screen.getByText('Bientôt')).toBeInTheDocument()
  })

  it('should have the correct testid', () => {
    render(<SettingsSection {...defaultProps} />)
    expect(screen.getByTestId('test-section')).toBeInTheDocument()
  })

  it('should apply disabled styles when badge is present', () => {
    render(<SettingsSection {...defaultProps} badge="Bientôt" />)
    const card = screen.getByTestId('test-section')
    expect(card).toHaveClass('opacity-60')
  })

  it('should apply hover styles when enabled', () => {
    render(<SettingsSection {...defaultProps} />)
    const card = screen.getByTestId('test-section')
    expect(card).toHaveClass('hover-lift')
  })

  it('should render the icon', () => {
    render(<SettingsSection {...defaultProps} />)
    const card = screen.getByTestId('test-section')
    expect(card.querySelector('svg')).toBeInTheDocument()
  })

  it('should render chevron icon', () => {
    render(<SettingsSection {...defaultProps} />)
    // ChevronRight should be present (2 SVGs: icon + chevron)
    const card = screen.getByTestId('test-section')
    const svgs = card.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2)
  })

  it('should have focus styles for accessibility', () => {
    render(<SettingsSection {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('focus-visible:ring-2')
  })
})
