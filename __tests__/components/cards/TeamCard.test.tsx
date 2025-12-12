/**
 * Tests unitaires pour TeamCard
 *
 * TeamCard affiche les informations d'une équipe avec variants compact/detailed,
 * bordure colorée, manager, AvatarStack des membres, et stats.
 *
 * @ticket SP-126
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { TeamCard } from '@/components/cards/TeamCard'
import {
  mockTeamFrontend,
  mockTeamBackend,
  mockTeamMinimal,
  mockManager,
  mockManagerWithAvatar,
  mockTeamMembers,
  mockLargeTeamMembers,
  mockTeamStats,
  mockTeamStatsNoLeave,
  createMockTeamActions,
} from '../../mocks/fixtures/teams'

describe('TeamCard', () => {
  // ===========================================================================
  // RENDU DE BASE (VARIANT COMPACT)
  // ===========================================================================

  describe('Rendu de base (compact)', () => {
    it('renders team name', () => {
      render(<TeamCard team={mockTeamFrontend} members={[]} />)

      expect(screen.getByText('Équipe Frontend')).toBeInTheDocument()
    })

    it('renders member count badge', () => {
      render(<TeamCard team={mockTeamFrontend} members={mockTeamMembers} />)

      expect(screen.getByText('5 membres')).toBeInTheDocument()
    })

    it('renders singular "membre" for 1 member', () => {
      render(
        <TeamCard team={mockTeamFrontend} members={[mockTeamMembers[0]!]} />
      )

      expect(screen.getByText('1 membre')).toBeInTheDocument()
    })

    it('renders colored left border', () => {
      const { container } = render(
        <TeamCard team={mockTeamFrontend} members={[]} />
      )

      const borderedElement = container.querySelector(
        '[style*="border-left: 4px solid"]'
      )
      expect(borderedElement).toBeInTheDocument()
    })

    it('renders manager name when provided', () => {
      render(
        <TeamCard team={mockTeamFrontend} members={[]} manager={mockManager} />
      )

      expect(screen.getByText(/Manager : Marie Martin/)).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // VARIANT DETAILED
  // ===========================================================================

  describe('Variant detailed', () => {
    it('renders team description in detailed variant', () => {
      render(
        <TeamCard team={mockTeamFrontend} members={[]} variant="detailed" />
      )

      expect(
        screen.getByText(
          'Développement des interfaces utilisateur React/Next.js'
        )
      ).toBeInTheDocument()
    })

    it('does not render description when null', () => {
      render(
        <TeamCard team={mockTeamMinimal} members={[]} variant="detailed" />
      )

      // Should not have description paragraph
      expect(screen.queryByText(/Développement/)).not.toBeInTheDocument()
    })

    it('renders manager with avatar in detailed variant', () => {
      render(
        <TeamCard
          team={mockTeamFrontend}
          members={[]}
          manager={mockManagerWithAvatar}
          variant="detailed"
        />
      )

      expect(screen.getByText('Pierre Bernard')).toBeInTheDocument()
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })

    it('renders stats when provided', () => {
      render(
        <TeamCard
          team={mockTeamFrontend}
          members={mockTeamMembers}
          stats={mockTeamStats}
          variant="detailed"
        />
      )

      expect(screen.getByText('12')).toBeInTheDocument() // activeCount
      expect(screen.getByText('actifs')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument() // onLeaveCount
      expect(screen.getByText('en congé')).toBeInTheDocument()
    })

    it('does not render on leave stats when 0', () => {
      render(
        <TeamCard
          team={mockTeamFrontend}
          members={mockTeamMembers}
          stats={mockTeamStatsNoLeave}
          variant="detailed"
        />
      )

      expect(screen.queryByText('en congé')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // TOTAL MEMBERS
  // ===========================================================================

  describe('Total members', () => {
    it('uses totalMembers when provided', () => {
      render(
        <TeamCard
          team={mockTeamFrontend}
          members={mockTeamMembers}
          totalMembers={25}
        />
      )

      expect(screen.getByText('25 membres')).toBeInTheDocument()
    })

    it('falls back to members.length when totalMembers not provided', () => {
      render(<TeamCard team={mockTeamFrontend} members={mockTeamMembers} />)

      expect(screen.getByText('5 membres')).toBeInTheDocument()
    })

    it('shows +X counter in detailed variant when more than 5 members', () => {
      render(
        <TeamCard
          team={mockTeamFrontend}
          members={mockLargeTeamMembers}
          totalMembers={10}
          variant="detailed"
        />
      )

      // +5 autres (10 - 5 = 5)
      expect(screen.getByText(/\+5 autres/)).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // AVATAR STACK
  // ===========================================================================

  describe('AvatarStack', () => {
    it('renders AvatarStack when members provided', () => {
      render(<TeamCard team={mockTeamFrontend} members={mockTeamMembers} />)

      // AvatarStack renders avatars - look for the avatar stack initials
      // Members have initials like AM, JD, etc.
      const hasAvatarContent = mockTeamMembers.some((member) => {
        if (member.name) {
          const initials = member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
          return screen.queryByText(initials) !== null
        }
        return false
      })
      expect(hasAvatarContent).toBeTruthy()
    })

    it('does not render AvatarStack when no members', () => {
      render(<TeamCard team={mockTeamFrontend} members={[]} />)

      // No avatar elements from team members
      expect(screen.queryByText('JD')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ACTIONS DROPDOWN
  // ===========================================================================

  describe('Actions dropdown', () => {
    it('renders actions button when actions provided', () => {
      const actions = createMockTeamActions(vi.fn(), vi.fn(), vi.fn())
      render(
        <TeamCard team={mockTeamFrontend} members={[]} actions={actions} />
      )

      expect(screen.getByLabelText('Actions')).toBeInTheDocument()
    })

    it('opens dropdown menu on click', async () => {
      const user = setupUser()
      const actions = createMockTeamActions(vi.fn(), vi.fn(), vi.fn())
      render(
        <TeamCard team={mockTeamFrontend} members={[]} actions={actions} />
      )

      await user.click(screen.getByLabelText('Actions'))

      expect(screen.getByText('Voir équipe')).toBeInTheDocument()
      expect(screen.getByText('Modifier')).toBeInTheDocument()
      expect(screen.getByText('Supprimer')).toBeInTheDocument()
    })

    it('calls action onClick when clicked', async () => {
      const user = setupUser()
      const onView = vi.fn()
      const actions = createMockTeamActions(onView, vi.fn(), vi.fn())
      render(
        <TeamCard team={mockTeamFrontend} members={[]} actions={actions} />
      )

      await user.click(screen.getByLabelText('Actions'))
      await user.click(screen.getByText('Voir équipe'))

      expect(onView).toHaveBeenCalledTimes(1)
    })

    it('does not render actions button when no actions', () => {
      render(<TeamCard team={mockTeamFrontend} members={[]} />)

      expect(screen.queryByLabelText('Actions')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // CLICKABLE CARD
  // ===========================================================================

  describe('Clickable card', () => {
    it('calls onClick when card is clicked', async () => {
      const user = setupUser()
      const onClick = vi.fn()
      render(
        <TeamCard team={mockTeamFrontend} members={[]} onClick={onClick} />
      )

      await user.click(screen.getByText('Équipe Frontend'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('has cursor-pointer when onClick is provided', () => {
      const { container } = render(
        <TeamCard team={mockTeamFrontend} members={[]} onClick={() => {}} />
      )

      const card = container.firstChild
      expect(card).toHaveClass('cursor-pointer')
    })

    it('clicking actions button does not trigger card click', async () => {
      const user = setupUser()
      const onClick = vi.fn()
      const actions = createMockTeamActions(vi.fn(), vi.fn(), vi.fn())
      render(
        <TeamCard
          team={mockTeamFrontend}
          members={[]}
          onClick={onClick}
          actions={actions}
        />
      )

      await user.click(screen.getByLabelText('Actions'))

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  // ===========================================================================
  // ÉTAT LOADING
  // ===========================================================================

  describe('État loading', () => {
    it('renders skeleton when isLoading=true', () => {
      const { container } = render(
        <TeamCard team={mockTeamFrontend} members={[]} isLoading />
      )

      // Skeleton uses TeamCardSkeleton
      const skeleton =
        container.querySelector('[class*="skeleton"]') ||
        container.querySelector('[class*="animate"]')
      expect(
        skeleton || screen.queryByText('Équipe Frontend') === null
      ).toBeTruthy()
    })

    it('does not render team content when loading', () => {
      render(<TeamCard team={mockTeamFrontend} members={[]} isLoading />)

      expect(screen.queryByText('Équipe Frontend')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ÉQUIPES VARIÉES
  // ===========================================================================

  describe('Équipes variées', () => {
    it('renders team with different color in border', () => {
      const { container } = render(
        <TeamCard team={mockTeamBackend} members={[]} />
      )

      // Check that the team name is rendered (color is applied via inline style)
      expect(screen.getByText('Équipe Backend')).toBeInTheDocument()

      // Verify border element exists with a style attribute
      const borderedElement = container.querySelector('[style]')
      expect(borderedElement).toBeInTheDocument()
    })

    it('renders team without description', () => {
      render(<TeamCard team={mockTeamMinimal} members={[]} />)

      expect(screen.getByText('Équipe Support')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to card element', () => {
      const ref = React.createRef<HTMLDivElement>()

      render(<TeamCard team={mockTeamFrontend} members={[]} ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <TeamCard
          team={mockTeamFrontend}
          members={[]}
          className="my-custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('my-custom-class')
    })
  })
})
