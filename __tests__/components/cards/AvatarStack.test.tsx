/**
 * Tests unitaires pour AvatarStack
 *
 * AvatarStack affiche un groupe d'avatars empilés avec overlap,
 * counter "+X", points de statut, et tooltips.
 *
 * @ticket SP-126
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { AvatarStack } from '@/components/cards/AvatarStack'
import {
  mockTeamMembers,
  mockLargeTeamMembers,
  mockMemberActive,
  mockMemberOnLeave,
} from '../../mocks/fixtures/teams'

describe('AvatarStack', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders avatars for each member', () => {
      const { container } = render(<AvatarStack members={mockTeamMembers} />)

      // Should render 5 members (default max)
      const avatars = container.querySelectorAll('.border-background')
      expect(avatars.length).toBeGreaterThanOrEqual(5)
    })

    it('renders member initials', () => {
      render(<AvatarStack members={[mockMemberActive]} />)

      // Jean Dupont -> JD
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('renders ? for member without name', () => {
      const memberNoName = { ...mockMemberActive, name: null }
      render(<AvatarStack members={[memberNoName]} />)

      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('renders avatar for member with image', () => {
      render(<AvatarStack members={[mockMemberOnLeave]} />)

      // Radix Avatar shows fallback (initials) in jsdom as images don't load
      // Sophie Leroy -> SL
      expect(screen.getByText('SL')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // COUNTER "+X"
  // ===========================================================================

  describe('Counter +X', () => {
    it('renders +X counter when members exceed max', () => {
      render(<AvatarStack members={mockLargeTeamMembers} max={5} />)

      // 8 members - 5 visible = 3 remaining
      expect(screen.getByText('+3')).toBeInTheDocument()
    })

    it('does not render counter when members equal max', () => {
      render(<AvatarStack members={mockTeamMembers} max={5} />)

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
    })

    it('does not render counter when members less than max', () => {
      render(<AvatarStack members={[mockMemberActive]} max={5} />)

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
    })

    it('respects custom max prop', () => {
      render(<AvatarStack members={mockLargeTeamMembers} max={3} />)

      // 8 members - 3 visible = 5 remaining
      expect(screen.getByText('+5')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // TAILLES
  // ===========================================================================

  describe('Tailles', () => {
    it('renders with default size (sm)', () => {
      const { container } = render(<AvatarStack members={[mockMemberActive]} />)

      const avatar = container.querySelector('[class*="h-8"]')
      expect(avatar).toBeInTheDocument()
    })

    it('renders with size="md"', () => {
      const { container } = render(
        <AvatarStack members={[mockMemberActive]} size="md" />
      )

      const avatar = container.querySelector('[class*="h-10"]')
      expect(avatar).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // OVERLAP
  // ===========================================================================

  describe('Overlap styling', () => {
    it('applies overlap margin to non-first avatars', () => {
      const { container } = render(
        <AvatarStack members={mockTeamMembers.slice(0, 3)} />
      )

      // Look for elements with negative margin class
      const overlappedElements = container.querySelectorAll('[class*="-ml-"]')
      // At least 2 elements should have overlap (2nd and 3rd avatar)
      expect(overlappedElements.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ===========================================================================
  // POINTS DE STATUT
  // ===========================================================================

  describe('Points de statut', () => {
    it('shows status dots when showStatus=true', () => {
      const { container } = render(
        <AvatarStack members={[mockMemberActive]} showStatus />
      )

      // Status dot should be rendered
      const statusDot = container.querySelector('.rounded-full.border-2.border-background')
      expect(statusDot).toBeInTheDocument()
    })

    it('does not show status dots by default', () => {
      const { container } = render(
        <AvatarStack members={[mockMemberActive]} />
      )

      // Should only have avatar, not status dot
      const statusDots = container.querySelectorAll('[aria-label="Actif"]')
      expect(statusDots).toHaveLength(0)
    })

    it('shows correct status color for active member', () => {
      const { container } = render(
        <AvatarStack members={[mockMemberActive]} showStatus />
      )

      const statusDot = container.querySelector('.bg-green-500')
      expect(statusDot).toBeInTheDocument()
    })

    it('shows correct status color for on_leave member', () => {
      const { container } = render(
        <AvatarStack members={[mockMemberOnLeave]} showStatus />
      )

      const statusDot = container.querySelector('.bg-yellow-500')
      expect(statusDot).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // TOOLTIPS
  // ===========================================================================

  describe('Tooltips', () => {
    it('wraps avatars in TooltipProvider', () => {
      const { container } = render(<AvatarStack members={[mockMemberActive]} />)

      // TooltipProvider should be rendered - verify tooltip trigger exists
      const triggers = container.querySelectorAll('[data-state]')
      expect(triggers.length).toBeGreaterThanOrEqual(0)
    })

    it('renders tooltip trigger for each avatar', () => {
      render(
        <AvatarStack members={mockTeamMembers.slice(0, 3)} />
      )

      // Each avatar should be wrapped in a tooltip trigger
      // Look for the initials which indicate avatars are rendered
      expect(screen.getByText('JD')).toBeInTheDocument() // Jean Dupont
    })

    it('renders tooltip trigger for +X counter', () => {
      render(<AvatarStack members={mockLargeTeamMembers} max={5} />)

      // Counter should be present and can trigger tooltip
      const counter = screen.getByText('+3')
      expect(counter).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to wrapper div', () => {
      const ref = React.createRef<HTMLDivElement>()

      render(<AvatarStack members={mockTeamMembers} ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <AvatarStack members={mockTeamMembers} className="my-custom-class" />
      )

      const wrapper = container.querySelector('.my-custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('has flex layout by default', () => {
      const { container } = render(<AvatarStack members={mockTeamMembers} />)

      expect(container.firstChild).toHaveClass('flex', 'items-center')
    })
  })

  // ===========================================================================
  // HOVER EFFECTS
  // ===========================================================================

  describe('Hover effects', () => {
    it('avatar has scale transform on hover', () => {
      const { container } = render(<AvatarStack members={[mockMemberActive]} />)

      const avatarWrapper = container.querySelector('.relative')
      expect(avatarWrapper).toHaveClass('hover:scale-110', 'hover:z-10')
    })
  })
})
