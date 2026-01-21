/**
 * Tests unitaires - AnimatedList Component
 *
 * @see SP-379 - Animations System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import {
  AnimatedList,
  QuickAnimatedList,
  GridAnimatedList,
  AnimatedOrderedList,
} from '../../components/AnimatedList'

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    motion: {
      ul: React.forwardRef(
        (
          {
            children,
            ...props
          }: React.HTMLAttributes<HTMLUListElement>,
          ref: React.Ref<HTMLUListElement>
        ) => (
          <ul ref={ref} data-testid="motion-ul" {...props}>
            {children}
          </ul>
        )
      ),
      ol: React.forwardRef(
        (
          {
            children,
            ...props
          }: React.HTMLAttributes<HTMLOListElement>,
          ref: React.Ref<HTMLOListElement>
        ) => (
          <ol ref={ref} data-testid="motion-ol" {...props}>
            {children}
          </ol>
        )
      ),
      li: React.forwardRef(
        (
          {
            children,
            ...props
          }: React.HTMLAttributes<HTMLLIElement>,
          ref: React.Ref<HTMLLIElement>
        ) => (
          <li ref={ref} data-testid="motion-li" {...props}>
            {children}
          </li>
        )
      ),
      div: React.forwardRef(
        (
          {
            children,
            ...props
          }: React.HTMLAttributes<HTMLDivElement>,
          ref: React.Ref<HTMLDivElement>
        ) => (
          <div ref={ref} data-testid="motion-div" {...props}>
            {children}
          </div>
        )
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  }
})

interface TestItem {
  id: string
  name: string
}

describe('AnimatedList Component', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>
  const testItems: TestItem[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ]

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AnimatedList', () => {
    it('should render all items', () => {
      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
        />
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render as ul by default', () => {
      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
        />
      )

      expect(screen.getByTestId('motion-ul')).toBeInTheDocument()
    })

    it('should apply className to container', () => {
      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
          className="custom-list"
        />
      )

      const list = screen.getByTestId('motion-ul')
      expect(list).toHaveClass('custom-list')
    })

    it('should apply itemClassName to items', () => {
      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
          itemClassName="custom-item"
        />
      )

      const items = screen.getAllByTestId('motion-li')
      items.forEach((item) => {
        expect(item).toHaveClass('custom-item')
      })
    })

    it('should handle empty list', () => {
      const { container } = render(
        <AnimatedList
          items={[]}
          keyExtractor={(item: TestItem) => item.id}
          renderItem={(item: TestItem) => <span>{item.name}</span>}
        />
      )

      // Empty list returns null
      expect(container.firstChild).toBeNull()
    })

    it('should support custom stagger delay', () => {
      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
          staggerDelay={0.2}
        />
      )

      expect(screen.getAllByTestId('motion-li')).toHaveLength(3)
    })

    it('should support default item variant', () => {
      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
          itemVariant="default"
        />
      )

      expect(screen.getAllByTestId('motion-li')).toHaveLength(3)
    })

    it('should pass index to renderItem', () => {
      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item, index) => (
            <span>
              {item.name} - {index}
            </span>
          )}
        />
      )

      expect(screen.getByText('Item 1 - 0')).toBeInTheDocument()
      expect(screen.getByText('Item 2 - 1')).toBeInTheDocument()
      expect(screen.getByText('Item 3 - 2')).toBeInTheDocument()
    })
  })

  describe('QuickAnimatedList', () => {
    it('should render with quick stagger', () => {
      render(
        <QuickAnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
        />
      )

      expect(screen.getAllByTestId('motion-li')).toHaveLength(3)
    })
  })

  describe('GridAnimatedList', () => {
    it('should render as grid container', () => {
      render(
        <GridAnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
          className="grid grid-cols-3"
        />
      )

      // Get the first motion-div (the container)
      const grids = screen.getAllByTestId('motion-div')
      expect(grids[0]).toHaveClass('grid')
    })

    it('should render items as grid children', () => {
      render(
        <GridAnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
        />
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('AnimatedOrderedList', () => {
    it('should render as ol', () => {
      render(
        <AnimatedOrderedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
        />
      )

      expect(screen.getByTestId('motion-ol')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should use reduced motion when preference is set', () => {
      matchMediaMock.mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))

      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
        />
      )

      // Should still render all items
      expect(screen.getAllByTestId('motion-li')).toHaveLength(3)
    })

    it('should pass through aria attributes', () => {
      render(
        <AnimatedList
          items={testItems}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <span>{item.name}</span>}
          aria-label="Test list"
        />
      )

      const list = screen.getByTestId('motion-ul')
      expect(list).toHaveAttribute('aria-label', 'Test list')
    })
  })
})
