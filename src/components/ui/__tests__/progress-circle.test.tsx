import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressCircle } from '../progress-circle'

// Mock useReducedMotion hook
vi.mock('@/lib/animations', () => ({
  useReducedMotion: vi.fn(() => false),
}))

describe('ProgressCircle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ProgressCircle value={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toBeInTheDocument()
    })

    it('renders in indeterminate mode when value is undefined', () => {
      render(<ProgressCircle />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-busy', 'true')
      expect(progressbar).not.toHaveAttribute('aria-valuenow')
    })

    it('renders in determinate mode when value is provided', () => {
      render(<ProgressCircle value={75} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '75')
      expect(progressbar).toHaveAttribute('aria-busy', 'false')
    })

    it('renders SVG element', () => {
      const { container } = render(<ProgressCircle value={50} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders two circle elements (track and progress)', () => {
      const { container } = render(<ProgressCircle value={50} />)
      const circles = container.querySelectorAll('circle')
      expect(circles).toHaveLength(2)
    })
  })

  describe('Sizes', () => {
    it('applies sm size (32px)', () => {
      render(<ProgressCircle value={50} size="sm" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveStyle({ width: '32px', height: '32px' })
    })

    it('applies md size (48px - default)', () => {
      render(<ProgressCircle value={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveStyle({ width: '48px', height: '48px' })
    })

    it('applies lg size (64px)', () => {
      render(<ProgressCircle value={50} size="lg" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveStyle({ width: '64px', height: '64px' })
    })
  })

  describe('Colors', () => {
    it('applies primary color (default)', () => {
      const { container } = render(<ProgressCircle value={50} />)
      const progressCircle = container.querySelectorAll('circle')[1]
      expect(progressCircle).toHaveClass('stroke-primary')
    })

    it('applies success color', () => {
      const { container } = render(
        <ProgressCircle value={50} color="success" />
      )
      const progressCircle = container.querySelectorAll('circle')[1]
      expect(progressCircle).toHaveClass('stroke-emerald-500')
    })

    it('applies warning color', () => {
      const { container } = render(
        <ProgressCircle value={50} color="warning" />
      )
      const progressCircle = container.querySelectorAll('circle')[1]
      expect(progressCircle).toHaveClass('stroke-amber-500')
    })

    it('applies destructive color', () => {
      const { container } = render(
        <ProgressCircle value={50} color="destructive" />
      )
      const progressCircle = container.querySelectorAll('circle')[1]
      expect(progressCircle).toHaveClass('stroke-rose-500')
    })

    it('applies info color', () => {
      const { container } = render(<ProgressCircle value={50} color="info" />)
      const progressCircle = container.querySelectorAll('circle')[1]
      expect(progressCircle).toHaveClass('stroke-cyan-500')
    })
  })

  describe('Value display', () => {
    it('does not show value by default', () => {
      render(<ProgressCircle value={50} />)
      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })

    it('shows value when showValue is true', () => {
      render(<ProgressCircle value={50} showValue />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('shows custom centerLabel when provided', () => {
      render(<ProgressCircle value={50} centerLabel={<span>Done</span>} />)
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('does not show value in indeterminate mode even with showValue', () => {
      render(<ProgressCircle showValue />)
      expect(screen.queryByText('%')).not.toBeInTheDocument()
    })

    it('rounds displayed percentage', () => {
      render(<ProgressCircle value={33.333} showValue />)
      expect(screen.getByText('33%')).toBeInTheDocument()
    })

    it('prefers centerLabel over showValue', () => {
      render(
        <ProgressCircle
          value={50}
          showValue
          centerLabel={<span>Custom</span>}
        />
      )
      expect(screen.getByText('Custom')).toBeInTheDocument()
      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })
  })

  describe('Value normalization', () => {
    it('normalizes value below 0 to 0', () => {
      render(<ProgressCircle value={-10} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '0')
    })

    it('normalizes value above 100 to 100', () => {
      render(<ProgressCircle value={150} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '100')
    })

    it('handles 0% correctly', () => {
      render(<ProgressCircle value={0} showValue />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('handles 100% correctly', () => {
      render(<ProgressCircle value={100} showValue />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<ProgressCircle value={50} aria-label="Upload progress" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '50')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
      expect(progressbar).toHaveAttribute('aria-label', 'Upload progress')
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <ProgressCircle value={50} aria-describedby="progress-description" />
          <span id="progress-description">Uploading files...</span>
        </>
      )
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute(
        'aria-describedby',
        'progress-description'
      )
    })

    it('uses default aria-label when not provided', () => {
      render(<ProgressCircle value={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-label', 'Progression')
    })

    it('SVG is hidden from screen readers', () => {
      const { container } = render(<ProgressCircle value={50} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Custom strokeWidth', () => {
    it('allows custom strokeWidth', () => {
      const { container } = render(
        <ProgressCircle value={50} strokeWidth={8} />
      )
      const circles = container.querySelectorAll('circle')
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '8')
      })
    })
  })

  describe('Callbacks', () => {
    it('calls onComplete when value reaches 100', () => {
      const onComplete = vi.fn()
      render(<ProgressCircle value={100} onComplete={onComplete} />)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('does not call onComplete when value is less than 100', () => {
      const onComplete = vi.fn()
      render(<ProgressCircle value={99} onComplete={onComplete} />)
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('Custom styling', () => {
    it('applies custom className', () => {
      render(<ProgressCircle value={50} className="my-custom-class" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('my-custom-class')
    })
  })

  describe('Ref forwarding', () => {
    it('forwards ref to container element', () => {
      const ref = vi.fn()
      render(<ProgressCircle value={50} ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('DisplayName', () => {
    it('has correct displayName', () => {
      expect(ProgressCircle.displayName).toBe('ProgressCircle')
    })
  })
})
