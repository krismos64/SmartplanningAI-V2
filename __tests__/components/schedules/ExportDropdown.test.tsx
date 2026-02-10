/**
 * Tests unitaires pour ExportDropdown
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportDropdown } from '@/components/schedules/ExportDropdown'

// ============================================================================
// Mocks
// ============================================================================

const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}))

const mockExportSchedulesCsv = vi.fn()

vi.mock('@/lib/actions/schedules', () => ({
  exportSchedulesCsv: (...args: unknown[]) => mockExportSchedulesCsv(...args),
}))

// Mock URL.createObjectURL / revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn().mockReturnValue('blob:test-url'),
  writable: true,
})
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
})

// ============================================================================
// Fixtures
// ============================================================================

const defaultProps = {
  startDate: new Date('2026-01-05'),
  endDate: new Date('2026-01-11'),
  viewMode: 'week' as const,
}

// ============================================================================
// Tests
// ============================================================================

describe('ExportDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExportSchedulesCsv.mockResolvedValue({
      success: true,
      data: {
        data: 'col1,col2\nval1,val2',
        filename: 'planning-export.csv',
        mimeType: 'text/csv',
      },
    })
  })

  describe('Affichage', () => {
    it('affiche le bouton Exporter', () => {
      render(<ExportDropdown {...defaultProps} />)
      expect(screen.getByTestId('export-button')).toBeInTheDocument()
      expect(screen.getByText('Exporter')).toBeInTheDocument()
    })

    it('affiche les 3 options d export au clic', async () => {
      const user = userEvent.setup()
      render(<ExportDropdown {...defaultProps} />)

      await user.click(screen.getByTestId('export-button'))

      expect(screen.getByText('Export PDF')).toBeInTheDocument()
      expect(screen.getByText('Export Excel')).toBeInTheDocument()
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
    })

    it('a les data-testid pour chaque option', async () => {
      const user = userEvent.setup()
      render(<ExportDropdown {...defaultProps} />)

      await user.click(screen.getByTestId('export-button'))

      expect(screen.getByTestId('export-pdf')).toBeInTheDocument()
      expect(screen.getByTestId('export-excel')).toBeInTheDocument()
      expect(screen.getByTestId('export-csv')).toBeInTheDocument()
    })

    it('affiche l icône Download', () => {
      const { container } = render(<ExportDropdown {...defaultProps} />)
      const downloadIcon = container.querySelector('.lucide-download')
      expect(downloadIcon).toBeTruthy()
    })
  })

  describe('Export CSV (Server Action)', () => {
    it('appelle la server action CSV avec les dates', async () => {
      const user = userEvent.setup()
      render(<ExportDropdown {...defaultProps} />)

      await user.click(screen.getByTestId('export-button'))
      await user.click(screen.getByTestId('export-csv'))

      await waitFor(() => {
        expect(mockExportSchedulesCsv).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: expect.any(String),
            endDate: expect.any(String),
          })
        )
      })
    })

    it('affiche un toast succès après export CSV', async () => {
      const user = userEvent.setup()
      render(<ExportDropdown {...defaultProps} />)

      await user.click(screen.getByTestId('export-button'))
      await user.click(screen.getByTestId('export-csv'))

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith(
          'Le fichier CSV a été téléchargé.'
        )
      })
    })

    it('gère les erreurs CSV', async () => {
      mockExportSchedulesCsv.mockResolvedValue({
        success: false,
        error: 'Pas de données',
      })

      const user = userEvent.setup()
      render(<ExportDropdown {...defaultProps} />)

      await user.click(screen.getByTestId('export-button'))
      await user.click(screen.getByTestId('export-csv'))

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Pas de données')
      })
    })

    it('passe teamId du prop dans la requête CSV', async () => {
      const user = userEvent.setup()
      render(
        <ExportDropdown {...defaultProps} teamId="clteam000001" />
      )

      await user.click(screen.getByTestId('export-button'))
      await user.click(screen.getByTestId('export-csv'))

      await waitFor(() => {
        expect(mockExportSchedulesCsv).toHaveBeenCalledWith(
          expect.objectContaining({
            teamId: 'clteam000001',
          })
        )
      })
    })

    it('passe employeeId des filtres dans la requête CSV', async () => {
      const user = userEvent.setup()
      render(
        <ExportDropdown
          {...defaultProps}
          filters={{ employeeId: 'emp-1' }}
        />
      )

      await user.click(screen.getByTestId('export-button'))
      await user.click(screen.getByTestId('export-csv'))

      await waitFor(() => {
        expect(mockExportSchedulesCsv).toHaveBeenCalledWith(
          expect.objectContaining({
            employeeId: 'emp-1',
          })
        )
      })
    })

    it('utilise le teamId des filtres en priorité', async () => {
      const user = userEvent.setup()
      render(
        <ExportDropdown
          {...defaultProps}
          teamId="team-prop"
          filters={{ teamId: 'team-filter' }}
        />
      )

      await user.click(screen.getByTestId('export-button'))
      await user.click(screen.getByTestId('export-csv'))

      await waitFor(() => {
        expect(mockExportSchedulesCsv).toHaveBeenCalledWith(
          expect.objectContaining({
            teamId: 'team-filter',
          })
        )
      })
    })
  })

  describe('Props viewMode', () => {
    it('accepte le viewMode week', () => {
      render(<ExportDropdown {...defaultProps} viewMode="week" />)
      expect(screen.getByTestId('export-button')).toBeInTheDocument()
    })

    it('accepte le viewMode month', () => {
      render(<ExportDropdown {...defaultProps} viewMode="month" />)
      expect(screen.getByTestId('export-button')).toBeInTheDocument()
    })
  })
})
