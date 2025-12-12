/**
 * Tests unitaires pour SkeletonTable
 *
 * SkeletonTable simule le chargement d'un DataTable avec header et rows.
 *
 * @ticket SP-126
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { SkeletonTable } from '@/components/loading/SkeletonTable'

describe('SkeletonTable', () => {
  // ===========================================================================
  // RENDU DE BASE
  // ===========================================================================

  describe('Rendu de base', () => {
    it('renders with role="status"', () => {
      render(<SkeletonTable />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('has accessible aria-label', () => {
      render(<SkeletonTable />)

      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveAttribute('aria-label', 'Chargement du tableau...')
    })

    it('renders table element', () => {
      render(<SkeletonTable />)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // ROWS ET COLONNES
  // ===========================================================================

  describe('Rows et colonnes', () => {
    it('uses default 5 rows', () => {
      render(<SkeletonTable />)

      // Default 5 rows
      const rows = screen.getAllByRole('row')
      // 1 header row + 5 data rows = 6
      expect(rows).toHaveLength(6)
    })

    it('uses default 4 columns', () => {
      render(<SkeletonTable />)

      // Get header cells
      const headerCells = screen.getAllByRole('columnheader')
      expect(headerCells).toHaveLength(4)
    })

    it('respects custom rows count', () => {
      render(<SkeletonTable rows={10} />)

      const rows = screen.getAllByRole('row')
      // 1 header + 10 data = 11
      expect(rows).toHaveLength(11)
    })

    it('respects custom columns count', () => {
      render(<SkeletonTable columns={6} />)

      const headerCells = screen.getAllByRole('columnheader')
      expect(headerCells).toHaveLength(6)
    })

    it('renders 1 row correctly', () => {
      render(<SkeletonTable rows={1} />)

      const rows = screen.getAllByRole('row')
      // 1 header + 1 data = 2
      expect(rows).toHaveLength(2)
    })
  })

  // ===========================================================================
  // HEADER
  // ===========================================================================

  describe('Header', () => {
    it('renders header by default', () => {
      render(<SkeletonTable />)

      const thead = document.querySelector('thead')
      expect(thead).toBeInTheDocument()
    })

    it('does not render header when withHeader=false', () => {
      render(<SkeletonTable withHeader={false} />)

      const thead = document.querySelector('thead')
      expect(thead).not.toBeInTheDocument()
    })

    it('header has correct number of columns', () => {
      render(<SkeletonTable columns={5} />)

      const headerCells = screen.getAllByRole('columnheader')
      expect(headerCells).toHaveLength(5)
    })
  })

  // ===========================================================================
  // ACTIONS COLUMN
  // ===========================================================================

  describe('Actions column', () => {
    it('does not render actions column by default', () => {
      render(<SkeletonTable columns={4} />)

      const headerCells = screen.getAllByRole('columnheader')
      expect(headerCells).toHaveLength(4)
    })

    it('adds extra column when withActions=true', () => {
      render(<SkeletonTable columns={4} withActions />)

      const headerCells = screen.getAllByRole('columnheader')
      // 4 columns + 1 actions column = 5
      expect(headerCells).toHaveLength(5)
    })

    it('actions column renders circular buttons', () => {
      const { container } = render(<SkeletonTable withActions />)

      // Actions column has circle skeletons
      // Looking for the skeleton elements that represent buttons
      const skeletons = container.querySelectorAll('span')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  // ===========================================================================
  // CLASSES CSS
  // ===========================================================================

  describe('Classes CSS', () => {
    it('accepts custom className', () => {
      const { container } = render(
        <SkeletonTable className="my-skeleton-table" />
      )

      const wrapper = container.querySelector('.my-skeleton-table')
      expect(wrapper).toBeInTheDocument()
    })

    it('has border styling', () => {
      const { container } = render(<SkeletonTable />)

      const wrapper = container.querySelector('.border')
      expect(wrapper).toBeInTheDocument()
    })

    it('has rounded corners', () => {
      const { container } = render(<SkeletonTable />)

      const wrapper = container.querySelector('.rounded-lg')
      expect(wrapper).toBeInTheDocument()
    })

    it('has overflow-x-auto for horizontal scroll', () => {
      const { container } = render(<SkeletonTable />)

      const scrollContainer = container.querySelector('.overflow-x-auto')
      expect(scrollContainer).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // COMBINAISONS
  // ===========================================================================

  describe('Combinaisons', () => {
    it('renders large table with actions', () => {
      render(<SkeletonTable rows={20} columns={8} withActions />)

      const rows = screen.getAllByRole('row')
      // 1 header + 20 data = 21
      expect(rows).toHaveLength(21)

      const headerCells = screen.getAllByRole('columnheader')
      // 8 columns + 1 actions = 9
      expect(headerCells).toHaveLength(9)
    })

    it('renders without header and with actions', () => {
      render(<SkeletonTable withHeader={false} withActions columns={3} />)

      const thead = document.querySelector('thead')
      expect(thead).not.toBeInTheDocument()

      // Body rows only, 5 default rows
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(5)
    })

    it('renders minimal table', () => {
      render(<SkeletonTable rows={1} columns={1} withHeader={false} />)

      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(1)
    })
  })
})
