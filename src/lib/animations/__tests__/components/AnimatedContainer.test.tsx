/**
 * Tests unitaires - AnimatedContainer Component
 *
 * @see SP-379 - Animations System
 */

/* eslint-disable react/display-name */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Mock framer-motion - must be before imports that use it
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  const ReactMock = await import('react')

  return {
    ...actual,
    motion: {
      div: ReactMock.forwardRef(
        (
          props: React.HTMLAttributes<HTMLDivElement> & {
            initial?: string
            animate?: string
            exit?: string
            variants?: unknown
          },
          ref: React.Ref<HTMLDivElement>
        ) => {
          const {
            children,
            initial,
            animate,
            exit,
            variants: _variants,
            ...rest
          } = props
          return ReactMock.createElement(
            'div',
            {
              ref,
              'data-initial': initial,
              'data-animate': animate,
              'data-exit': exit,
              'data-testid': 'motion-div',
              ...rest,
            },
            children
          )
        }
      ),
      section: ReactMock.forwardRef(
        (
          props: React.HTMLAttributes<HTMLElement>,
          ref: React.Ref<HTMLElement>
        ) => {
          const { children, ...rest } = props
          return ReactMock.createElement(
            'section',
            { ref, 'data-testid': 'motion-section', ...rest },
            children
          )
        }
      ),
      ul: ReactMock.forwardRef(
        (
          props: React.HTMLAttributes<HTMLUListElement>,
          ref: React.Ref<HTMLUListElement>
        ) => {
          const { children, ...rest } = props
          return ReactMock.createElement(
            'ul',
            { ref, 'data-testid': 'motion-ul', ...rest },
            children
          )
        }
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})

import {
  AnimatedContainer,
  FadeContainer,
  SlideUpContainer,
  ScaleContainer,
  StaggerContainer,
} from '../../components/AnimatedContainer'

describe('AnimatedContainer Component', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>

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

  describe('AnimatedContainer', () => {
    it('should render children', () => {
      render(
        <AnimatedContainer>
          <span>Test content</span>
        </AnimatedContainer>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(
        <AnimatedContainer className="custom-class">
          <span>Content</span>
        </AnimatedContainer>
      )

      const container = screen.getByTestId('motion-div')
      expect(container).toHaveClass('custom-class')
    })

    it('should use hidden initial state', () => {
      render(
        <AnimatedContainer variant="fade">
          <span>Content</span>
        </AnimatedContainer>
      )

      const container = screen.getByTestId('motion-div')
      expect(container).toHaveAttribute('data-initial', 'hidden')
    })

    it('should use visible animate state', () => {
      render(
        <AnimatedContainer variant="fade">
          <span>Content</span>
        </AnimatedContainer>
      )

      const container = screen.getByTestId('motion-div')
      expect(container).toHaveAttribute('data-animate', 'visible')
    })

    it('should support different variants', () => {
      const variants = [
        'fade',
        'slideUp',
        'slideDown',
        'slideLeft',
        'slideRight',
        'scale',
        'fadeSlideUp',
        'fadeScale',
      ] as const

      variants.forEach((variant) => {
        const { unmount } = render(
          <AnimatedContainer variant={variant}>
            <span>Content</span>
          </AnimatedContainer>
        )

        expect(screen.getByTestId('motion-div')).toBeInTheDocument()
        unmount()
      })
    })

    it('should render with conditional show prop', () => {
      const { rerender } = render(
        <AnimatedContainer show={true}>
          <span>Visible</span>
        </AnimatedContainer>
      )

      expect(screen.getByText('Visible')).toBeInTheDocument()

      rerender(
        <AnimatedContainer show={false}>
          <span>Hidden</span>
        </AnimatedContainer>
      )

      // AnimatePresence should handle exit animation
    })

    it('should support delay prop', () => {
      render(
        <AnimatedContainer delay={0.5}>
          <span>Delayed</span>
        </AnimatedContainer>
      )

      expect(screen.getByText('Delayed')).toBeInTheDocument()
    })
  })

  describe('FadeContainer', () => {
    it('should render with fade animation', () => {
      render(
        <FadeContainer>
          <span>Fade content</span>
        </FadeContainer>
      )

      expect(screen.getByText('Fade content')).toBeInTheDocument()
    })
  })

  describe('SlideUpContainer', () => {
    it('should render with slideUp animation', () => {
      render(
        <SlideUpContainer>
          <span>Slide up content</span>
        </SlideUpContainer>
      )

      expect(screen.getByText('Slide up content')).toBeInTheDocument()
    })
  })

  describe('ScaleContainer', () => {
    it('should render with scale animation', () => {
      render(
        <ScaleContainer>
          <span>Scale content</span>
        </ScaleContainer>
      )

      expect(screen.getByText('Scale content')).toBeInTheDocument()
    })
  })

  describe('StaggerContainer', () => {
    it('should render with stagger animation for children', () => {
      render(
        <StaggerContainer>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </StaggerContainer>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should use reduced motion variants when preference is set', () => {
      matchMediaMock.mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))

      render(
        <AnimatedContainer variant="slideUp">
          <span>Accessible content</span>
        </AnimatedContainer>
      )

      // Component should still render
      expect(screen.getByText('Accessible content')).toBeInTheDocument()
    })

    it('should pass through aria attributes', () => {
      render(
        <AnimatedContainer aria-label="Test label" role="region">
          <span>Content</span>
        </AnimatedContainer>
      )

      const container = screen.getByTestId('motion-div')
      expect(container).toHaveAttribute('aria-label', 'Test label')
      expect(container).toHaveAttribute('role', 'region')
    })
  })
})
