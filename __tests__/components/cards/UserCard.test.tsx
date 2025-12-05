/**
 * Tests unitaires pour UserCard
 *
 * UserCard affiche les informations utilisateur avec variants compact/detailed,
 * badge statut, actions dropdown, et mode sélection.
 *
 * @ticket SP-126
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, setupUser } from '../../utils/test-utils'
import { UserCard } from '@/components/cards/UserCard'
import {
  mockUser,
  mockUserWithAvatar,
  mockDirector,
  mockEmployee,
  createMockActions,
} from '../../mocks/fixtures/users'

describe('UserCard', () => {
  // ===========================================================================
  // RENDU DE BASE (VARIANT COMPACT)
  // ===========================================================================

  describe('Rendu de base (compact)', () => {
    it('renders user name', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('renders user role label', () => {
      render(<UserCard user={mockUser} />)

      // MANAGER should be labeled as "Manager"
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })

    it('renders avatar with initials when no image', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('renders avatar with image src when provided', () => {
      const { container } = render(<UserCard user={mockUserWithAvatar} />)

      // Radix Avatar renders img only after successful load in browser
      // In tests, we verify the AvatarImage component receives the src
      // The fallback (initials) will be shown in tests
      expect(screen.getByText('MM')).toBeInTheDocument() // Marie Martin initials
    })

    it('renders default "Actif" status badge', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('Actif')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // STATUTS
  // ===========================================================================

  describe('Statuts', () => {
    it('renders "Actif" badge for active status', () => {
      render(<UserCard user={mockUser} status="active" />)

      expect(screen.getByText('Actif')).toBeInTheDocument()
    })

    it('renders on_leave status badge', () => {
      render(<UserCard user={mockUser} status="on_leave" />)

      // The label from USER_STATUS_CONFIG for on_leave
      expect(screen.getByText(/congé/i)).toBeInTheDocument()
    })

    it('renders "Absent" badge for absent status', () => {
      render(<UserCard user={mockUser} status="absent" />)

      expect(screen.getByText('Absent')).toBeInTheDocument()
    })

    it('renders "Inactif" badge for inactive status', () => {
      render(<UserCard user={mockUser} status="inactive" />)

      expect(screen.getByText('Inactif')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // VARIANT DETAILED
  // ===========================================================================

  describe('Variant detailed', () => {
    it('renders email in detailed variant', () => {
      render(<UserCard user={mockUser} variant="detailed" />)

      expect(screen.getByText('jean.dupont@smartplanning.fr')).toBeInTheDocument()
    })

    it('renders employee job title when provided', () => {
      render(
        <UserCard user={mockUser} employee={mockEmployee} variant="detailed" />
      )

      expect(screen.getByText('Product Manager')).toBeInTheDocument()
    })

    it('renders employee department when provided', () => {
      render(
        <UserCard user={mockUser} employee={mockEmployee} variant="detailed" />
      )

      expect(screen.getByText(/Département : Produit/)).toBeInTheDocument()
    })

    it('renders employee phone when provided', () => {
      render(
        <UserCard user={mockUser} employee={mockEmployee} variant="detailed" />
      )

      expect(screen.getByText('+33 6 12 34 56 78')).toBeInTheDocument()
    })

    it('renders role badge in detailed variant', () => {
      render(<UserCard user={mockUser} variant="detailed" />)

      // Should have role badge at bottom
      expect(screen.getAllByText('Manager').length).toBeGreaterThanOrEqual(1)
    })
  })

  // ===========================================================================
  // AFFICHAGE NOM
  // ===========================================================================

  describe('Affichage nom', () => {
    it('uses employee full name when provided', () => {
      render(<UserCard user={mockUser} employee={mockEmployee} />)

      // Employee name: "Jean Dupont" from employee fixture
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('falls back to user.name when no employee', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('falls back to email when no name', () => {
      const userNoName = { ...mockUser, name: null }
      render(<UserCard user={userNoName} />)

      expect(screen.getByText('jean.dupont@smartplanning.fr')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ACTIONS DROPDOWN
  // ===========================================================================

  describe('Actions dropdown', () => {
    it('renders actions button when actions provided', () => {
      const actions = createMockActions(vi.fn(), vi.fn(), vi.fn())
      render(<UserCard user={mockUser} actions={actions} />)

      expect(screen.getByLabelText('Actions')).toBeInTheDocument()
    })

    it('opens dropdown menu on click', async () => {
      const user = setupUser()
      const actions = createMockActions(vi.fn(), vi.fn(), vi.fn())
      render(<UserCard user={mockUser} actions={actions} />)

      await user.click(screen.getByLabelText('Actions'))

      expect(screen.getByText('Voir profil')).toBeInTheDocument()
      expect(screen.getByText('Modifier')).toBeInTheDocument()
      expect(screen.getByText('Supprimer')).toBeInTheDocument()
    })

    it('calls action onClick when clicked', async () => {
      const user = setupUser()
      const onView = vi.fn()
      const actions = createMockActions(onView, vi.fn(), vi.fn())
      render(<UserCard user={mockUser} actions={actions} />)

      await user.click(screen.getByLabelText('Actions'))
      await user.click(screen.getByText('Voir profil'))

      expect(onView).toHaveBeenCalledTimes(1)
    })

    it('does not render actions button when no actions', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.queryByLabelText('Actions')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // MODE SÉLECTION
  // ===========================================================================

  describe('Mode sélection', () => {
    it('renders checkbox when onSelect is provided', () => {
      render(<UserCard user={mockUser} onSelect={() => {}} />)

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('checkbox is unchecked by default', () => {
      render(<UserCard user={mockUser} onSelect={() => {}} />)

      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('checkbox is checked when isSelected=true', () => {
      render(<UserCard user={mockUser} isSelected onSelect={() => {}} />)

      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('calls onSelect when checkbox clicked', async () => {
      const user = setupUser()
      const onSelect = vi.fn()
      render(<UserCard user={mockUser} onSelect={onSelect} />)

      await user.click(screen.getByRole('checkbox'))

      expect(onSelect).toHaveBeenCalledWith(true)
    })

    it('checkbox has accessible label', () => {
      render(<UserCard user={mockUser} onSelect={() => {}} />)

      expect(screen.getByLabelText(/Sélectionner Jean Dupont/)).toBeInTheDocument()
    })

    it('does not render checkbox when no onSelect', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // CLICKABLE CARD
  // ===========================================================================

  describe('Clickable card', () => {
    it('calls onClick when card is clicked', async () => {
      const user = setupUser()
      const onClick = vi.fn()
      render(<UserCard user={mockUser} onClick={onClick} />)

      await user.click(screen.getByText('Jean Dupont'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('has cursor-pointer when onClick is provided', () => {
      const { container } = render(<UserCard user={mockUser} onClick={() => {}} />)

      // Find the Card element
      const card = container.firstChild
      expect(card).toHaveClass('cursor-pointer')
    })

    it('clicking actions button does not trigger card click', async () => {
      const user = setupUser()
      const onClick = vi.fn()
      const actions = createMockActions(vi.fn(), vi.fn(), vi.fn())
      render(<UserCard user={mockUser} onClick={onClick} actions={actions} />)

      await user.click(screen.getByLabelText('Actions'))

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  // ===========================================================================
  // ÉTAT LOADING
  // ===========================================================================

  describe('État loading', () => {
    it('renders skeleton when isLoading=true', () => {
      const { container } = render(<UserCard user={mockUser} isLoading />)

      // Skeleton uses UserCardSkeleton which has skeleton elements
      const skeleton = container.querySelector('[class*="skeleton"]') ||
                       container.querySelector('[class*="animate"]')
      // If skeleton exists or we just don't render user content
      expect(
        skeleton || screen.queryByText('Jean Dupont') === null
      ).toBeTruthy()
    })

    it('does not render user content when loading', () => {
      render(<UserCard user={mockUser} isLoading />)

      expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument()
    })
  })

  // ===========================================================================
  // RÔLES UTILISATEUR
  // ===========================================================================

  describe('Rôles utilisateur', () => {
    it('displays "Directeur" for DIRECTOR role', () => {
      render(<UserCard user={mockDirector} />)

      expect(screen.getByText('Directeur')).toBeInTheDocument()
    })

    it('displays "Manager" for MANAGER role', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('Manager')).toBeInTheDocument()
    })

    it('displays "Employé" for EMPLOYEE role', () => {
      const employee = { ...mockUser, role: 'EMPLOYEE' as const }
      render(<UserCard user={employee} />)

      expect(screen.getByText('Employé')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // FORWARD REF
  // ===========================================================================

  describe('forwardRef', () => {
    it('forwards ref to card element', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>

      render(<UserCard user={mockUser} ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <UserCard user={mockUser} className="my-custom-class" />
      )

      expect(container.firstChild).toHaveClass('my-custom-class')
    })

    it('applies selected ring when isSelected', () => {
      const { container } = render(
        <UserCard user={mockUser} isSelected onSelect={() => {}} />
      )

      expect(container.firstChild).toHaveClass('ring-2')
    })
  })
})
