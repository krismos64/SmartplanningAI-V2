/**
 * Tests unitaires - Input Extensions
 *
 * @see SP-260 - Extension composants UI
 * Tests des extensions : leftIcon, rightIcon, isLoading, showCount, size, error
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import React from 'react'
import { Input } from '../input'

// Icône mock pour les tests
const MockIcon = () => <svg data-testid="mock-icon" />
const MockRightIcon = () => <svg data-testid="mock-right-icon" />

describe('Input Extensions', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<Input placeholder="Test" />)
      expect(screen.getByPlaceholderText('Test')).toBeInTheDocument()
    })

    it('accepts input value', async () => {
      render(<Input placeholder="Test" />)
      const input = screen.getByPlaceholderText('Test')
      await userEvent.type(input, 'Hello')
      expect(input).toHaveValue('Hello')
    })
  })

  describe('leftIcon prop', () => {
    it('renders left icon', () => {
      render(<Input leftIcon={<MockIcon />} placeholder="With icon" />)
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('icon has aria-hidden', () => {
      render(<Input leftIcon={<MockIcon />} placeholder="With icon" />)
      const iconContainer = screen.getByTestId('mock-icon').parentElement
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies padding when left icon present', () => {
      render(<Input leftIcon={<MockIcon />} placeholder="With icon" />)
      const input = screen.getByPlaceholderText('With icon')
      expect(input).toHaveClass('pl-9')
    })
  })

  describe('rightIcon prop', () => {
    it('renders right icon', () => {
      render(<Input rightIcon={<MockRightIcon />} placeholder="With icon" />)
      expect(screen.getByTestId('mock-right-icon')).toBeInTheDocument()
    })

    it('icon has aria-hidden', () => {
      render(<Input rightIcon={<MockRightIcon />} placeholder="With icon" />)
      const iconContainer = screen.getByTestId('mock-right-icon').parentElement
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies padding when right icon present', () => {
      render(<Input rightIcon={<MockRightIcon />} placeholder="With icon" />)
      const input = screen.getByPlaceholderText('With icon')
      expect(input).toHaveClass('pr-9')
    })
  })

  describe('isLoading prop', () => {
    it('shows loader when isLoading is true', () => {
      render(<Input isLoading placeholder="Loading" />)
      // Loader2 icon should be present with animate-spin class
      const container = screen.getByPlaceholderText('Loading').parentElement
      const loader = container?.querySelector('.animate-spin')
      expect(loader).toBeInTheDocument()
    })

    it('loader replaces right icon', () => {
      render(
        <Input
          isLoading
          rightIcon={<MockRightIcon />}
          placeholder="Loading"
        />
      )
      // Right icon should not be rendered when loading
      expect(screen.queryByTestId('mock-right-icon')).not.toBeInTheDocument()
    })

    it('applies padding when loading', () => {
      render(<Input isLoading placeholder="Loading" />)
      const input = screen.getByPlaceholderText('Loading')
      expect(input).toHaveClass('pr-9')
    })
  })

  describe('showCount and maxLength', () => {
    it('shows character count when showCount and maxLength are set', () => {
      render(<Input showCount maxLength={100} placeholder="Count" />)
      expect(screen.getByText('0/100')).toBeInTheDocument()
    })

    it('does not show count without maxLength', () => {
      render(<Input showCount placeholder="No max" />)
      expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument()
    })

    it('updates count as user types', async () => {
      render(<Input showCount maxLength={10} placeholder="Count" />)
      const input = screen.getByPlaceholderText('Count')

      await userEvent.type(input, 'Hello')
      expect(screen.getByText('5/10')).toBeInTheDocument()
    })

    it('shows warning color at 90% of limit', async () => {
      render(<Input showCount maxLength={10} placeholder="Count" />)
      const input = screen.getByPlaceholderText('Count')

      await userEvent.type(input, '123456789') // 9 chars = 90%
      const counter = screen.getByText('9/10')
      expect(counter).toHaveClass('text-warning')
    })

    it('shows error color at limit', async () => {
      render(<Input showCount maxLength={5} placeholder="Count" />)
      const input = screen.getByPlaceholderText('Count')

      await userEvent.type(input, '12345')
      const counter = screen.getByText('5/5')
      expect(counter).toHaveClass('text-destructive')
    })

    it('counter has aria-live for accessibility', () => {
      render(<Input showCount maxLength={100} placeholder="Count" />)
      const counter = screen.getByText('0/100')
      expect(counter).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('size variants', () => {
    it('applies default size', () => {
      render(<Input placeholder="Default" />)
      const input = screen.getByPlaceholderText('Default')
      expect(input).toHaveClass('h-9')
    })

    it('applies sm size', () => {
      render(<Input size="sm" placeholder="Small" />)
      const input = screen.getByPlaceholderText('Small')
      expect(input).toHaveClass('h-8')
    })

    it('applies lg size', () => {
      render(<Input size="lg" placeholder="Large" />)
      const input = screen.getByPlaceholderText('Large')
      expect(input).toHaveClass('h-11')
    })
  })

  describe('error prop', () => {
    it('applies error styling', () => {
      render(<Input error placeholder="Error" />)
      const input = screen.getByPlaceholderText('Error')
      expect(input).toHaveClass('border-destructive')
    })

    it('sets aria-invalid when error', () => {
      render(<Input error placeholder="Error" />)
      const input = screen.getByPlaceholderText('Error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('no aria-invalid when no error', () => {
      render(<Input placeholder="No error" />)
      const input = screen.getByPlaceholderText('No error')
      expect(input).not.toHaveAttribute('aria-invalid')
    })
  })

  describe('controlled vs uncontrolled', () => {
    it('works as controlled input', async () => {
      const onChange = vi.fn()
      render(
        <Input value="controlled" onChange={onChange} placeholder="Controlled" />
      )
      const input = screen.getByPlaceholderText('Controlled')
      expect(input).toHaveValue('controlled')

      await userEvent.type(input, 'x')
      expect(onChange).toHaveBeenCalled()
    })

    it('works as uncontrolled input', async () => {
      render(<Input defaultValue="initial" placeholder="Uncontrolled" />)
      const input = screen.getByPlaceholderText('Uncontrolled')
      expect(input).toHaveValue('initial')

      await userEvent.type(input, ' more')
      expect(input).toHaveValue('initial more')
    })

    it('count works with controlled input', () => {
      render(
        <Input
          showCount
          maxLength={100}
          value="Hello"
          onChange={() => {}}
          placeholder="Controlled count"
        />
      )
      expect(screen.getByText('5/100')).toBeInTheDocument()
    })
  })

  describe('combined features', () => {
    it('left icon + right icon', () => {
      render(
        <Input
          leftIcon={<MockIcon />}
          rightIcon={<MockRightIcon />}
          placeholder="Both icons"
        />
      )
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      expect(screen.getByTestId('mock-right-icon')).toBeInTheDocument()
    })

    it('left icon + loading', () => {
      render(
        <Input leftIcon={<MockIcon />} isLoading placeholder="Icon + Loading" />
      )
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      const container = screen.getByPlaceholderText('Icon + Loading').parentElement
      expect(container?.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('count + right icon (count takes priority in display)', () => {
      render(
        <Input
          showCount
          maxLength={50}
          rightIcon={<MockRightIcon />}
          placeholder="Count + Icon"
        />
      )
      expect(screen.getByText('0/50')).toBeInTheDocument()
      expect(screen.getByTestId('mock-right-icon')).toBeInTheDocument()
    })

    it('error + size + left icon', () => {
      render(
        <Input
          error
          size="lg"
          leftIcon={<MockIcon />}
          placeholder="Combo"
        />
      )
      const input = screen.getByPlaceholderText('Combo')
      expect(input).toHaveClass('border-destructive')
      expect(input).toHaveClass('h-11')
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} placeholder="Ref test" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('native props passthrough', () => {
    it('passes disabled prop', () => {
      render(<Input disabled placeholder="Disabled" />)
      expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
    })

    it('passes type prop', () => {
      render(<Input type="password" placeholder="Password" />)
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute(
        'type',
        'password'
      )
    })

    it('passes maxLength prop', () => {
      render(<Input maxLength={10} placeholder="Max" />)
      expect(screen.getByPlaceholderText('Max')).toHaveAttribute(
        'maxLength',
        '10'
      )
    })
  })
})
