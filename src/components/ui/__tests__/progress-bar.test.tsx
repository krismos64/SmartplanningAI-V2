import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from '../progress-bar'

// Mock useReducedMotion hook
vi.mock('@/lib/animations', () => ({
  useReducedMotion: vi.fn(() => false),
}))

describe('ProgressBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ProgressBar value={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toBeInTheDocument()
    })

    it('renders in indeterminate mode when value is undefined', () => {
      render(<ProgressBar />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-busy', 'true')
      expect(progressbar).not.toHaveAttribute('aria-valuenow')
    })

    it('renders in determinate mode when value is provided', () => {
      render(<ProgressBar value={75} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '75')
      expect(progressbar).toHaveAttribute('aria-busy', 'false')
    })
  })

  describe('Sizes', () => {
    it('applies sm size class', () => {
      render(<ProgressBar value={50} size="sm" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('h-1')
    })

    it('applies md size class (default)', () => {
      render(<ProgressBar value={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('h-2')
    })

    it('applies lg size class', () => {
      render(<ProgressBar value={50} size="lg" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('h-3')
    })
  })

  describe('Colors', () => {
    it('applies primary color (default)', () => {
      render(<ProgressBar value={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('bg-primary/20')
    })

    it('applies success color', () => {
      render(<ProgressBar value={50} color="success" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('bg-emerald-500/20')
    })

    it('applies warning color', () => {
      render(<ProgressBar value={50} color="warning" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('bg-amber-500/20')
    })

    it('applies destructive color', () => {
      render(<ProgressBar value={50} color="destructive" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('bg-rose-500/20')
    })

    it('applies info color', () => {
      render(<ProgressBar value={50} color="info" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('bg-cyan-500/20')
    })
  })

  describe('Labels', () => {
    it('does not show label by default', () => {
      render(<ProgressBar value={50} />)
      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })

    it('shows label when showLabel is true', () => {
      render(<ProgressBar value={50} showLabel />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('shows custom label when provided', () => {
      render(<ProgressBar value={50} showLabel customLabel="Custom Label" />)
      expect(screen.getByText('Custom Label')).toBeInTheDocument()
    })

    it('shows "Chargement..." for indeterminate mode with showLabel', () => {
      render(<ProgressBar showLabel />)
      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })

    it('rounds displayed percentage', () => {
      render(<ProgressBar value={33.333} showLabel />)
      expect(screen.getByText('33%')).toBeInTheDocument()
    })
  })

  describe('Value normalization', () => {
    it('normalizes value below 0 to 0', () => {
      render(<ProgressBar value={-10} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '0')
    })

    it('normalizes value above 100 to 100', () => {
      render(<ProgressBar value={150} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '100')
    })

    it('handles 0% correctly', () => {
      render(<ProgressBar value={0} showLabel />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('handles 100% correctly', () => {
      render(<ProgressBar value={100} showLabel />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<ProgressBar value={50} aria-label="Upload progress" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '50')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
      expect(progressbar).toHaveAttribute('aria-label', 'Upload progress')
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <ProgressBar value={50} aria-describedby="progress-description" />
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
      render(<ProgressBar value={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-label', 'Progression')
    })
  })

  describe('Callbacks', () => {
    it('calls onComplete when value reaches 100', () => {
      const onComplete = vi.fn()
      render(<ProgressBar value={100} onComplete={onComplete} />)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('does not call onComplete when value is less than 100', () => {
      const onComplete = vi.fn()
      render(<ProgressBar value={99} onComplete={onComplete} />)
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('Custom styling', () => {
    it('applies custom className to container', () => {
      render(<ProgressBar value={50} className="my-custom-class" />)
      const container = screen.getByRole('progressbar').parentElement
      expect(container).toHaveClass('my-custom-class')
    })

    it('applies custom barClassName to progress bar', () => {
      const { container } = render(
        <ProgressBar value={50} barClassName="my-bar-class" />
      )
      const bar = container.querySelector('.my-bar-class')
      expect(bar).toBeInTheDocument()
    })
  })

  describe('Ref forwarding', () => {
    it('forwards ref to container element', () => {
      const ref = vi.fn()
      render(<ProgressBar value={50} ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('DisplayName', () => {
    it('has correct displayName', () => {
      expect(ProgressBar.displayName).toBe('ProgressBar')
    })
  })
})
