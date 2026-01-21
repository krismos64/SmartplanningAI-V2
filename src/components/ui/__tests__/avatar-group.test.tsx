/**
 * Tests unitaires - AvatarGroup Component
 *
 * @see SP-260 - Extension composants UI
 * Tests du composant AvatarGroup avec overlap, max, sizes
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  avatarVariants,
} from '../avatar'

describe('Avatar Extensions', () => {
  describe('Avatar size variants', () => {
    it('applies xs size', () => {
      render(
        <Avatar size="xs" data-testid="avatar">
          <AvatarFallback>XS</AvatarFallback>
        </Avatar>
      )
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-6')
      expect(avatar).toHaveClass('w-6')
    })

    it('applies sm size', () => {
      render(
        <Avatar size="sm" data-testid="avatar">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
      )
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-8')
      expect(avatar).toHaveClass('w-8')
    })

    it('applies default size', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>DF</AvatarFallback>
        </Avatar>
      )
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-10')
      expect(avatar).toHaveClass('w-10')
    })

    it('applies lg size', () => {
      render(
        <Avatar size="lg" data-testid="avatar">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      )
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-12')
      expect(avatar).toHaveClass('w-12')
    })

    it('applies xl size', () => {
      render(
        <Avatar size="xl" data-testid="avatar">
          <AvatarFallback>XL</AvatarFallback>
        </Avatar>
      )
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-16')
      expect(avatar).toHaveClass('w-16')
    })
  })

  describe('avatarVariants function', () => {
    it('generates size classes', () => {
      expect(avatarVariants({ size: 'xs' })).toContain('h-6')
      expect(avatarVariants({ size: 'sm' })).toContain('h-8')
      expect(avatarVariants({ size: 'default' })).toContain('h-10')
      expect(avatarVariants({ size: 'lg' })).toContain('h-12')
      expect(avatarVariants({ size: 'xl' })).toContain('h-16')
    })
  })
})

describe('AvatarGroup', () => {
  const createAvatars = (count: number) =>
    Array.from({ length: count }, (_, i) => (
      <Avatar key={i}>
        <AvatarFallback>{`U${i + 1}`}</AvatarFallback>
      </Avatar>
    ))

  describe('basic rendering', () => {
    it('renders all avatars when count is less than max', () => {
      render(<AvatarGroup>{createAvatars(3)}</AvatarGroup>)

      expect(screen.getByText('U1')).toBeInTheDocument()
      expect(screen.getByText('U2')).toBeInTheDocument()
      expect(screen.getByText('U3')).toBeInTheDocument()
    })

    it('has correct role and aria-label', () => {
      render(<AvatarGroup>{createAvatars(3)}</AvatarGroup>)

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-label', 'Groupe de 3 avatars')
    })
  })

  describe('max prop', () => {
    it('limits displayed avatars to max', () => {
      render(<AvatarGroup max={3}>{createAvatars(5)}</AvatarGroup>)

      expect(screen.getByText('U1')).toBeInTheDocument()
      expect(screen.getByText('U2')).toBeInTheDocument()
      expect(screen.getByText('U3')).toBeInTheDocument()
      expect(screen.queryByText('U4')).not.toBeInTheDocument()
      expect(screen.queryByText('U5')).not.toBeInTheDocument()
    })

    it('shows remaining count indicator', () => {
      render(<AvatarGroup max={3}>{createAvatars(5)}</AvatarGroup>)

      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('caps remaining count at 99', () => {
      render(<AvatarGroup max={1}>{createAvatars(150)}</AvatarGroup>)

      expect(screen.getByText('+99')).toBeInTheDocument()
    })

    it('does not show indicator when all avatars fit', () => {
      render(<AvatarGroup max={5}>{createAvatars(3)}</AvatarGroup>)

      expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument()
    })

    it('defaults to max=5', () => {
      render(<AvatarGroup>{createAvatars(7)}</AvatarGroup>)

      expect(screen.getByText('+2')).toBeInTheDocument()
    })
  })

  describe('size prop', () => {
    it('applies size to all avatars', () => {
      render(<AvatarGroup size="lg">{createAvatars(2)}</AvatarGroup>)

      const avatars = screen.getAllByText(/U\d/)
      avatars.forEach((avatar) => {
        const avatarRoot = avatar.closest('[class*="h-12"]')
        expect(avatarRoot).toBeInTheDocument()
      })
    })

    it('applies size to remaining count indicator', () => {
      render(
        <AvatarGroup size="sm" max={2}>
          {createAvatars(5)}
        </AvatarGroup>
      )

      const indicator = screen.getByText('+3').closest('[class*="h-8"]')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('spacing prop', () => {
    it('applies tight spacing', () => {
      render(<AvatarGroup spacing="tight">{createAvatars(3)}</AvatarGroup>)

      const group = screen.getByRole('group')
      // Second avatar should have tighter overlap
      const avatars = group.querySelectorAll('[class*="ring-2"]')
      expect(avatars.length).toBeGreaterThan(1)
    })

    it('applies loose spacing', () => {
      render(<AvatarGroup spacing="loose">{createAvatars(3)}</AvatarGroup>)

      const group = screen.getByRole('group')
      expect(group).toBeInTheDocument()
    })
  })

  describe('overlap styling', () => {
    it('applies ring to create border between overlapping avatars', () => {
      render(<AvatarGroup>{createAvatars(3)}</AvatarGroup>)

      const group = screen.getByRole('group')
      const avatarsWithRing = group.querySelectorAll('.ring-2.ring-background')
      expect(avatarsWithRing.length).toBe(3)
    })

    it('applies z-index for proper stacking', () => {
      render(<AvatarGroup>{createAvatars(3)}</AvatarGroup>)

      const u1 = screen.getByText('U1').closest('[style*="z-index"]')
      const u2 = screen.getByText('U2').closest('[style*="z-index"]')
      const u3 = screen.getByText('U3').closest('[style*="z-index"]')

      // First avatar should have highest z-index
      expect(u1?.getAttribute('style')).toContain('z-index: 3')
      expect(u2?.getAttribute('style')).toContain('z-index: 2')
      expect(u3?.getAttribute('style')).toContain('z-index: 1')
    })
  })

  describe('className prop', () => {
    it('applies custom className to container', () => {
      render(
        <AvatarGroup className="custom-class">{createAvatars(2)}</AvatarGroup>
      )

      const group = screen.getByRole('group')
      expect(group).toHaveClass('custom-class')
    })
  })

  describe('edge cases', () => {
    it('handles empty children', () => {
      render(<AvatarGroup>{[]}</AvatarGroup>)

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-label', 'Groupe de 0 avatars')
    })

    it('handles single child', () => {
      render(
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      )

      expect(screen.getByText('U1')).toBeInTheDocument()
      expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument()
    })

    it('handles max=0', () => {
      render(<AvatarGroup max={0}>{createAvatars(5)}</AvatarGroup>)

      // Should show +5 indicator
      expect(screen.getByText('+5')).toBeInTheDocument()
    })
  })

  describe('combined with Avatar components', () => {
    it('works with AvatarImage and Fallback', () => {
      render(
        <AvatarGroup>
          <Avatar>
            <AvatarImage src="/test.jpg" alt="Test" />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      )

      // Radix Avatar shows fallback in tests (no image loading)
      // Just verify the component renders correctly
      expect(screen.getByText('T')).toBeInTheDocument()
      expect(screen.getByText('U2')).toBeInTheDocument()
    })
  })
})
