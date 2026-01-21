import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { withLoading, type WithLoadingInjectedProps } from '../with-loading'

// Mock the Spinner component
vi.mock('@/components/loading/Spinner', () => ({
  Spinner: ({ size, variant }: { size?: string; variant?: string }) => (
    <div data-testid="spinner" data-size={size} data-variant={variant}>
      Loading...
    </div>
  ),
}))

// Simple test component
interface TestComponentProps {
  title: string
  count: number
}

const TestComponent = ({ title, count }: TestComponentProps) => (
  <div data-testid="test-component">
    <h1>{title}</h1>
    <span>{count}</span>
  </div>
)

describe('withLoading HOC', () => {
  describe('Basic functionality', () => {
    it('renders wrapped component when not loading', () => {
      const WrappedComponent = withLoading(TestComponent)
      render(<WrappedComponent title="Test" count={5} isLoading={false} />)

      expect(screen.getByTestId('test-component')).toBeInTheDocument()
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders loading state when isLoading is true (replace mode)', () => {
      const WrappedComponent = withLoading(TestComponent)
      render(<WrappedComponent title="Test" count={5} isLoading={true} />)

      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument()
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('defaults isLoading to false', () => {
      const WrappedComponent = withLoading(TestComponent)
      render(<WrappedComponent title="Test" count={5} />)

      expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })
  })

  describe('Loading text', () => {
    it('uses default loading text', () => {
      const WrappedComponent = withLoading(TestComponent)
      render(<WrappedComponent title="Test" count={5} isLoading={true} />)

      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })

    it('uses custom loading text from props', () => {
      const WrappedComponent = withLoading(TestComponent)
      render(
        <WrappedComponent
          title="Test"
          count={5}
          isLoading={true}
          loadingText="Patientez..."
        />
      )

      expect(screen.getByText('Patientez...')).toBeInTheDocument()
    })

    it('uses custom default loading text from options', () => {
      const WrappedComponent = withLoading(TestComponent, {
        defaultLoadingText: 'Veuillez patienter',
      })
      render(<WrappedComponent title="Test" count={5} isLoading={true} />)

      expect(screen.getByText('Veuillez patienter')).toBeInTheDocument()
    })

    it('props loadingText overrides options defaultLoadingText', () => {
      const WrappedComponent = withLoading(TestComponent, {
        defaultLoadingText: 'Default text',
      })
      render(
        <WrappedComponent
          title="Test"
          count={5}
          isLoading={true}
          loadingText="Override text"
        />
      )

      expect(screen.getByText('Override text')).toBeInTheDocument()
      expect(screen.queryByText('Default text')).not.toBeInTheDocument()
    })
  })

  describe('Overlay mode', () => {
    it('shows both content and loading overlay', () => {
      const WrappedComponent = withLoading(TestComponent, { mode: 'overlay' })
      render(<WrappedComponent title="Test" count={5} isLoading={true} />)

      expect(screen.getByTestId('test-component')).toBeInTheDocument()
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('applies opacity to content when loading', () => {
      const WrappedComponent = withLoading(TestComponent, { mode: 'overlay' })
      render(<WrappedComponent title="Test" count={5} isLoading={true} />)

      const content = screen.getByTestId('test-component').parentElement
      expect(content).toHaveClass('opacity-50')
      expect(content).toHaveClass('pointer-events-none')
    })

    it('does not show overlay when not loading', () => {
      const WrappedComponent = withLoading(TestComponent, { mode: 'overlay' })
      render(<WrappedComponent title="Test" count={5} isLoading={false} />)

      expect(screen.getByTestId('test-component')).toBeInTheDocument()
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })
  })

  describe('Custom loading component', () => {
    it('uses custom loading component', () => {
      const CustomLoader = ({ message }: { message?: string }) => (
        <div data-testid="custom-loader">{message}</div>
      )

      const WrappedComponent = withLoading(TestComponent, {
        LoadingComponent: CustomLoader,
      })
      render(<WrappedComponent title="Test" count={5} isLoading={true} />)

      expect(screen.getByTestId('custom-loader')).toBeInTheDocument()
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes when loading', () => {
      const WrappedComponent = withLoading(TestComponent)
      render(
        <WrappedComponent
          title="Test"
          count={5}
          isLoading={true}
          loadingText="Loading data"
        />
      )

      const loadingContainer = screen.getByRole('status')
      expect(loadingContainer).toHaveAttribute('aria-busy', 'true')
      expect(loadingContainer).toHaveAttribute('aria-label', 'Loading data')
    })

    it('has correct ARIA attributes in overlay mode', () => {
      const WrappedComponent = withLoading(TestComponent, { mode: 'overlay' })
      render(
        <WrappedComponent
          title="Test"
          count={5}
          isLoading={true}
          loadingText="Loading"
        />
      )

      const loadingOverlay = screen.getByRole('status')
      expect(loadingOverlay).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('DisplayName', () => {
    it('sets correct displayName with named component', () => {
      const WrappedComponent = withLoading(TestComponent)
      expect(WrappedComponent.displayName).toBe('withLoading(TestComponent)')
    })

    it('handles anonymous component', () => {
      const AnonymousComponent = () => <div>Anonymous</div>
      const WrappedComponent = withLoading(AnonymousComponent)
      expect(WrappedComponent.displayName).toBe(
        'withLoading(AnonymousComponent)'
      )
    })

    it('handles component with displayName', () => {
      const ComponentWithDisplayName = () => <div>Test</div>
      ComponentWithDisplayName.displayName = 'MyCustomName'
      const WrappedComponent = withLoading(ComponentWithDisplayName)
      expect(WrappedComponent.displayName).toBe('withLoading(MyCustomName)')
    })
  })

  describe('Props forwarding', () => {
    it('forwards all props to wrapped component', () => {
      const WrappedComponent = withLoading(TestComponent)
      render(<WrappedComponent title="Forwarded Title" count={42} />)

      expect(screen.getByText('Forwarded Title')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('does not forward loading-specific props', () => {
      const PropsChecker = (props: Record<string, unknown>) => (
        <div data-testid="props">{Object.keys(props).join(',')}</div>
      )

      const WrappedComponent = withLoading(PropsChecker)
      render(
        <WrappedComponent
          isLoading={false}
          loadingText="Loading"
          customProp="value"
        />
      )

      const propsText = screen.getByTestId('props').textContent
      expect(propsText).toContain('customProp')
      expect(propsText).not.toContain('isLoading')
      expect(propsText).not.toContain('loadingText')
    })
  })

  describe('Custom styling', () => {
    it('applies loadingClassName', () => {
      const WrappedComponent = withLoading(TestComponent, {
        loadingClassName: 'my-loading-class',
      })
      render(<WrappedComponent title="Test" count={5} isLoading={true} />)

      const loadingContainer = screen.getByRole('status')
      expect(loadingContainer).toHaveClass('my-loading-class')
    })

    it('applies minHeight', () => {
      const WrappedComponent = withLoading(TestComponent, {
        minHeight: '200px',
      })
      render(<WrappedComponent title="Test" count={5} isLoading={true} />)

      const loadingContainer = screen.getByRole('status')
      expect(loadingContainer).toHaveStyle({ minHeight: '200px' })
    })
  })

  describe('Type safety', () => {
    it('preserves original component props type', () => {
      const WrappedComponent = withLoading(TestComponent)

      // This should type-check correctly
      const props: TestComponentProps & WithLoadingInjectedProps = {
        title: 'Test',
        count: 5,
        isLoading: false,
        loadingText: 'Loading...',
      }

      render(<WrappedComponent {...props} />)
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })
})
