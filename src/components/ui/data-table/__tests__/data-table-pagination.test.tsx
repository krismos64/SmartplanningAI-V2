/**
 * Tests DataTablePagination - Pagination responsive mobile
 *
 * @ticket SP-387
 *
 * ✅ Source : Context7 - TanStack Table v8 pagination patterns
 *
 * Tests couverts :
 * 1. Rendering de base
 * 2. Layout desktop (inline)
 * 3. Layout mobile (vertical stack)
 * 4. Touch targets 44px on mobile
 * 5. Simplified text on mobile
 * 6. First/Last buttons visibility
 * 7. Page size options
 * 8. Navigation functionality
 * 9. Disabled states
 * 10. Accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DataTablePagination } from '../data-table-pagination'
import type { Table } from '@tanstack/react-table'

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  const listeners: Array<(event: MediaQueryListEvent) => void> = []

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(
        (_: string, handler: (event: MediaQueryListEvent) => void) =>
          listeners.push(handler)
      ),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  return { listeners }
}

// Create mock table
const createMockTable = (options: {
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  totalRows?: number
  canPreviousPage?: boolean
  canNextPage?: boolean
}) => {
  const {
    pageIndex = 0,
    pageSize = 10,
    pageCount = 5,
    totalRows = 45,
    canPreviousPage = false,
    canNextPage = true,
  } = options

  return {
    getState: () => ({
      pagination: { pageIndex, pageSize },
    }),
    getPageCount: () => pageCount,
    getFilteredRowModel: () => ({
      rows: Array.from({ length: totalRows }, (_, i) => ({ id: i })),
    }),
    getCanPreviousPage: () => canPreviousPage,
    getCanNextPage: () => canNextPage,
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
  } as unknown as Table<unknown>
}

describe('DataTablePagination (SP-387)', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // Test 1: Basic Rendering
  // =========================================================================
  describe('Basic Rendering', () => {
    it('should render pagination controls', () => {
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('data-table-pagination')).toBeInTheDocument()
      expect(screen.getByTestId('pagination-prev')).toBeInTheDocument()
      expect(screen.getByTestId('pagination-next')).toBeInTheDocument()
      expect(screen.getByTestId('pagination-info')).toBeInTheDocument()
    })

    it('should display correct page info', () => {
      const table = createMockTable({ pageIndex: 2, pageCount: 5 })
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-info')).toHaveTextContent(
        'Page 3 sur 5'
      )
    })

    it('should display total rows on desktop', () => {
      mockMatchMedia(false)
      const table = createMockTable({ totalRows: 45 })
      render(<DataTablePagination table={table} />)

      expect(screen.getByText('45 ligne(s) au total')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Test 2: Desktop Layout
  // =========================================================================
  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockMatchMedia(false)
    })

    it('should show first/last page buttons on desktop', () => {
      const table = createMockTable({
        canPreviousPage: true,
        canNextPage: true,
      })
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-first')).toBeInTheDocument()
      expect(screen.getByTestId('pagination-last')).toBeInTheDocument()
    })

    it('should display full text labels', () => {
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      expect(screen.getByText('Lignes par page')).toBeInTheDocument()
      expect(screen.getByText(/Page \d+ sur \d+/)).toBeInTheDocument()
    })

    it('should use inline layout', () => {
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      const container = screen.getByTestId('data-table-pagination')
      expect(container).toHaveClass('flex-row')
    })
  })

  // =========================================================================
  // Test 3: Mobile Layout
  // =========================================================================
  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    it('should hide first/last page buttons on mobile', () => {
      const table = createMockTable({
        canPreviousPage: true,
        canNextPage: true,
      })
      render(<DataTablePagination table={table} />)

      expect(screen.queryByTestId('pagination-first')).not.toBeInTheDocument()
      expect(screen.queryByTestId('pagination-last')).not.toBeInTheDocument()
    })

    it('should display compact page info (X/Y format)', () => {
      const table = createMockTable({ pageIndex: 2, pageCount: 5 })
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-info')).toHaveTextContent('3/5')
    })

    it('should display shortened text labels', () => {
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      expect(screen.getByText('Par page')).toBeInTheDocument()
    })

    it('should use vertical layout', () => {
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      const container = screen.getByTestId('data-table-pagination')
      expect(container).toHaveClass('flex-col')
    })

    it('should display compact total rows', () => {
      const table = createMockTable({ totalRows: 45 })
      render(<DataTablePagination table={table} />)

      expect(screen.getByText('45 résultat(s)')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Test 4: Touch Targets on Mobile
  // =========================================================================
  describe('Touch Targets (Mobile)', () => {
    beforeEach(() => {
      mockMatchMedia(true)
    })

    it('should have 44px touch targets for nav buttons', () => {
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      const prevBtn = screen.getByTestId('pagination-prev')
      const nextBtn = screen.getByTestId('pagination-next')

      // TouchableButton applies min-h-[44px] on mobile
      expect(prevBtn).toHaveClass('min-h-[44px]')
      expect(nextBtn).toHaveClass('min-h-[44px]')
    })

    it('should have larger select trigger on mobile', () => {
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      const selectTrigger = screen.getByTestId('pagination-page-size')
      expect(selectTrigger).toHaveClass('h-11')
      expect(selectTrigger).toHaveClass('min-h-[44px]')
    })
  })

  // =========================================================================
  // Test 5: Navigation Functionality
  // =========================================================================
  describe('Navigation Functionality', () => {
    it('should call previousPage when prev button clicked', () => {
      const table = createMockTable({ canPreviousPage: true })
      render(<DataTablePagination table={table} />)

      fireEvent.click(screen.getByTestId('pagination-prev'))
      expect(table.previousPage).toHaveBeenCalledTimes(1)
    })

    it('should call nextPage when next button clicked', () => {
      const table = createMockTable({ canNextPage: true })
      render(<DataTablePagination table={table} />)

      fireEvent.click(screen.getByTestId('pagination-next'))
      expect(table.nextPage).toHaveBeenCalledTimes(1)
    })

    it('should call setPageIndex(0) when first button clicked', () => {
      mockMatchMedia(false) // Desktop only
      const table = createMockTable({ canPreviousPage: true })
      render(<DataTablePagination table={table} />)

      fireEvent.click(screen.getByTestId('pagination-first'))
      expect(table.setPageIndex).toHaveBeenCalledWith(0)
    })

    it('should call setPageIndex(last) when last button clicked', () => {
      mockMatchMedia(false) // Desktop only
      const table = createMockTable({ canNextPage: true, pageCount: 5 })
      render(<DataTablePagination table={table} />)

      fireEvent.click(screen.getByTestId('pagination-last'))
      expect(table.setPageIndex).toHaveBeenCalledWith(4)
    })
  })

  // =========================================================================
  // Test 6: Disabled States
  // =========================================================================
  describe('Disabled States', () => {
    it('should disable prev button when on first page', () => {
      const table = createMockTable({ pageIndex: 0, canPreviousPage: false })
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-prev')).toBeDisabled()
    })

    it('should disable next button when on last page', () => {
      const table = createMockTable({ pageIndex: 4, canNextPage: false })
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-next')).toBeDisabled()
    })

    it('should disable first button when on first page (desktop)', () => {
      mockMatchMedia(false)
      const table = createMockTable({ canPreviousPage: false })
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-first')).toBeDisabled()
    })

    it('should disable last button when on last page (desktop)', () => {
      mockMatchMedia(false)
      const table = createMockTable({ canNextPage: false })
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-last')).toBeDisabled()
    })
  })

  // =========================================================================
  // Test 7: Page Size Options
  // =========================================================================
  describe('Page Size Options', () => {
    it('should show all options on desktop', () => {
      mockMatchMedia(false)
      const table = createMockTable({})
      render(
        <DataTablePagination
          table={table}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )

      const trigger = screen.getByTestId('pagination-page-size')
      fireEvent.click(trigger)

      // Use getAllByText since the current value also shows in the trigger
      const options10 = screen.getAllByText('10')
      const options20 = screen.getAllByText('20')
      const options50 = screen.getAllByText('50')
      const options100 = screen.getAllByText('100')

      expect(options10.length).toBeGreaterThanOrEqual(1)
      expect(options20.length).toBeGreaterThanOrEqual(1)
      expect(options50.length).toBeGreaterThanOrEqual(1)
      expect(options100.length).toBeGreaterThanOrEqual(1)
    })

    it('should show reduced options on mobile', () => {
      mockMatchMedia(true)
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      const trigger = screen.getByTestId('pagination-page-size')
      fireEvent.click(trigger)

      // On mobile, we have 10, 25, 50 but NOT 100
      const options10 = screen.getAllByText('10')
      const options25 = screen.getAllByText('25')
      const options50 = screen.getAllByText('50')

      expect(options10.length).toBeGreaterThanOrEqual(1)
      expect(options25.length).toBeGreaterThanOrEqual(1)
      expect(options50.length).toBeGreaterThanOrEqual(1)
      expect(screen.queryByText('100')).not.toBeInTheDocument()
    })
  })

  // =========================================================================
  // Test 8: Accessibility
  // =========================================================================
  describe('Accessibility', () => {
    it('should have aria-labels for navigation buttons', () => {
      const table = createMockTable({})
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-prev')).toHaveAttribute(
        'aria-label',
        'Page précédente'
      )
      expect(screen.getByTestId('pagination-next')).toHaveAttribute(
        'aria-label',
        'Page suivante'
      )
    })

    it('should have aria-labels for first/last buttons (desktop)', () => {
      mockMatchMedia(false)
      const table = createMockTable({
        canPreviousPage: true,
        canNextPage: true,
      })
      render(<DataTablePagination table={table} />)

      expect(screen.getByTestId('pagination-first')).toHaveAttribute(
        'aria-label',
        'Première page'
      )
      expect(screen.getByTestId('pagination-last')).toHaveAttribute(
        'aria-label',
        'Dernière page'
      )
    })
  })
})
