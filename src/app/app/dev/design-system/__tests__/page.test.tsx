/**
 * Tests - Design System Demo Page
 *
 * @see SP-259 - Design Tokens Enhancement
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DesignSystemPage from '../page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode
      className?: string
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  HTMLMotionProps: {},
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

describe('DesignSystemPage', () => {
  it('renders the page title', () => {
    render(<DesignSystemPage />)
    expect(
      screen.getByText(/Design System - Cyber Glass 3D/i)
    ).toBeInTheDocument()
  })

  it('renders Glass Morphism section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Glass Morphism/i)).toBeInTheDocument()
    expect(screen.getByText(/Glass Standard/i)).toBeInTheDocument()
    // Glass Strong appears multiple times (demo card + premium card)
    expect(screen.getAllByText(/Glass Strong/i).length).toBeGreaterThan(0)
  })

  it('renders Effets 3D section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Effets 3D/i)).toBeInTheDocument()
    // Card 3D appears multiple times
    expect(screen.getAllByText(/Card 3D/i).length).toBeGreaterThan(0)
    // Hover Lift appears in multiple places
    expect(screen.getAllByText(/Hover Lift/i).length).toBeGreaterThan(0)
  })

  it('renders Glow Effects section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Glow Effects/i)).toBeInTheDocument()
    // Glow variants appear multiple times (demo cards + buttons)
    expect(screen.getAllByText(/Glow Primary/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Glow Accent/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Glow Cyan/i).length).toBeGreaterThan(0)
  })

  it('renders Text Neon section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Text Neon/i)).toBeInTheDocument()
    expect(screen.getByText(/Texte Neon Primary/i)).toBeInTheDocument()
    expect(screen.getByText(/Texte Neon Accent/i)).toBeInTheDocument()
  })

  it('renders Bordures Animées section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Bordures Animées/i)).toBeInTheDocument()
    expect(screen.getByText(/Border Gradient Static/i)).toBeInTheDocument()
    expect(screen.getByText(/Border Gradient Animated/i)).toBeInTheDocument()
  })

  it('renders Animations CSS section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Animations CSS/i)).toBeInTheDocument()
    // These may appear in multiple places
    expect(screen.getAllByText(/Shimmer Premium/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pulse Glow/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /Float/i })).toBeInTheDocument()
  })

  it('renders AnimatedContainer section', () => {
    render(<DesignSystemPage />)
    expect(
      screen.getByText(/AnimatedContainer \(Framer Motion\)/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Stagger Container/i)).toBeInTheDocument()
  })

  it('renders Boutons section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Boutons avec effets/i)).toBeInTheDocument()
  })

  it('renders Badges section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Badges avec effets/i)).toBeInTheDocument()
  })

  it('renders Cards section', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Cards avec effets/i)).toBeInTheDocument()
    expect(screen.getByText(/Card Glass/i)).toBeInTheDocument()
    expect(screen.getByText(/Card Premium/i)).toBeInTheDocument()
  })

  it('renders stat cards for all colors', () => {
    render(<DesignSystemPage />)
    // Colors appear in stat cards section - use getAllBy since they appear elsewhere too
    expect(screen.getAllByText(/blue/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/violet/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/cyan/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/emerald/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/amber/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/rose/i).length).toBeGreaterThan(0)
  })

  it('renders replay button for stagger animation', () => {
    render(<DesignSystemPage />)
    expect(screen.getByText(/Rejouer/i)).toBeInTheDocument()
  })

  it('renders footer with CDA reference', () => {
    render(<DesignSystemPage />)
    // "Soutenance CDA" appears in header badge and footer
    expect(screen.getAllByText(/Soutenance CDA/i).length).toBeGreaterThan(0)
  })
})
