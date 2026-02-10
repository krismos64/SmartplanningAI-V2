/**
 * Tests unitaires pour EmployeeFilters
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeFilters } from '@/components/admin/employees/EmployeeFilters'

// ============================================================================
// Fixtures
// ============================================================================

const mockTeams = [
  { id: 'clteam000001', name: 'Équipe Frontend' },
  { id: 'clteam000002', name: 'Équipe Backend' },
]

const mockCompanies = [
  { id: 'clcmp0000001', name: 'Acme Corp' },
  { id: 'clcmp0000002', name: 'Tech Solutions' },
]

// ============================================================================
// Tests
// ============================================================================

describe('EmployeeFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Affichage de base', () => {
    it('affiche le champ de recherche', () => {
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={vi.fn()}
        />
      )
      expect(
        screen.getByPlaceholderText('Rechercher un employe...')
      ).toBeInTheDocument()
    })

    it('affiche le filtre statut', () => {
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={vi.fn()}
        />
      )
      // Le SelectTrigger contient le texte "Tous" par défaut
      expect(screen.getByText('Tous')).toBeInTheDocument()
    })

    it('n affiche pas le filtre équipe sans teams', () => {
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={vi.fn()}
          teams={[]}
        />
      )
      expect(
        screen.queryByText('Toutes equipes')
      ).not.toBeInTheDocument()
    })

    it('affiche le filtre équipe avec des teams', () => {
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={vi.fn()}
          teams={mockTeams}
        />
      )
      expect(screen.getByText('Toutes equipes')).toBeInTheDocument()
    })

    it('n affiche pas le filtre entreprise par défaut', () => {
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={vi.fn()}
          companies={mockCompanies}
        />
      )
      expect(
        screen.queryByText('Toutes les entreprises')
      ).not.toBeInTheDocument()
    })

    it('affiche le filtre entreprise quand showCompanyFilter=true', () => {
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={vi.fn()}
          showCompanyFilter={true}
          companies={mockCompanies}
        />
      )
      expect(
        screen.getByText('Toutes les entreprises')
      ).toBeInTheDocument()
    })
  })

  describe('Recherche avec debounce', () => {
    it('met à jour la valeur du champ immédiatement', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={vi.fn()}
        />
      )

      await user.type(
        screen.getByPlaceholderText('Rechercher un employe...'),
        'Jean'
      )

      expect(
        screen.getByPlaceholderText('Rechercher un employe...')
      ).toHaveValue('Jean')
    })

    it('appelle onFiltersChange après le debounce de 300ms', () => {
      const onFiltersChange = vi.fn()
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={onFiltersChange}
        />
      )

      fireEvent.change(
        screen.getByPlaceholderText('Rechercher un employe...'),
        { target: { value: 'Jean' } }
      )

      // Pas encore appelé avant le debounce
      expect(onFiltersChange).not.toHaveBeenCalled()

      // Avancer le timer de 300ms
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Jean' })
      )
    })

    it('envoie undefined pour search vide', () => {
      const onFiltersChange = vi.fn()
      render(
        <EmployeeFilters
          filters={{ search: 'existant' }}
          onFiltersChange={onFiltersChange}
        />
      )

      fireEvent.change(
        screen.getByPlaceholderText('Rechercher un employe...'),
        { target: { value: '' } }
      )

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: undefined })
      )
    })
  })

  describe('Bouton réinitialiser', () => {
    it('n affiche pas le bouton sans filtres actifs', () => {
      render(
        <EmployeeFilters
          filters={{}}
          onFiltersChange={vi.fn()}
        />
      )
      expect(
        screen.queryByText('Reinitialiser')
      ).not.toBeInTheDocument()
    })

    it('affiche le bouton avec des filtres actifs (search)', () => {
      render(
        <EmployeeFilters
          filters={{ search: 'test' }}
          onFiltersChange={vi.fn()}
        />
      )
      expect(screen.getByText('Reinitialiser')).toBeInTheDocument()
    })

    it('affiche le bouton avec des filtres actifs (teamId)', () => {
      render(
        <EmployeeFilters
          filters={{ teamId: 'clteam000001' }}
          onFiltersChange={vi.fn()}
          teams={mockTeams}
        />
      )
      expect(screen.getByText('Reinitialiser')).toBeInTheDocument()
    })

    it('affiche le bouton avec des filtres actifs (isActive)', () => {
      render(
        <EmployeeFilters
          filters={{ isActive: true }}
          onFiltersChange={vi.fn()}
        />
      )
      expect(screen.getByText('Reinitialiser')).toBeInTheDocument()
    })

    it('réinitialise les filtres au clic', () => {
      const onFiltersChange = vi.fn()
      render(
        <EmployeeFilters
          filters={{ search: 'test', teamId: 'clteam000001' }}
          onFiltersChange={onFiltersChange}
          teams={mockTeams}
        />
      )

      fireEvent.click(screen.getByText('Reinitialiser'))

      expect(onFiltersChange).toHaveBeenCalledWith({})
    })
  })

  describe('État disabled', () => {
    it('désactive les filtres quand disabled=true', () => {
      render(
        <EmployeeFilters
          filters={{ search: 'test' }}
          onFiltersChange={vi.fn()}
          disabled={true}
          teams={mockTeams}
        />
      )
      expect(screen.getByText('Reinitialiser').closest('button')).toBeDisabled()
    })
  })

  describe('Synchronisation', () => {
    it('synchronise la valeur de recherche quand filters.search change', () => {
      const { rerender } = render(
        <EmployeeFilters
          filters={{ search: 'initial' }}
          onFiltersChange={vi.fn()}
        />
      )

      expect(
        screen.getByPlaceholderText('Rechercher un employe...')
      ).toHaveValue('initial')

      rerender(
        <EmployeeFilters
          filters={{ search: 'updated' }}
          onFiltersChange={vi.fn()}
        />
      )

      expect(
        screen.getByPlaceholderText('Rechercher un employe...')
      ).toHaveValue('updated')
    })
  })
})
