/**
 * Tests unitaires pour SettingsHeader
 * @ticket SP-274
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsHeader } from '../SettingsHeader'

describe('SettingsHeader', () => {
  it('should render the title', () => {
    render(<SettingsHeader />)
    expect(screen.getByText('Paramètres')).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(<SettingsHeader />)
    expect(
      screen.getByText(/préférences et paramètres de compte/i)
    ).toBeInTheDocument()
  })

  it('should have the correct testid', () => {
    render(<SettingsHeader />)
    expect(screen.getByTestId('settings-header')).toBeInTheDocument()
  })

  it('should render the settings icon', () => {
    render(<SettingsHeader />)
    const header = screen.getByTestId('settings-header')
    expect(header.querySelector('svg')).toBeInTheDocument()
  })

  it('should have proper heading hierarchy with h1', () => {
    render(<SettingsHeader />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Paramètres'
    )
  })
})
