/**
 * Tests unitaires pour UsersDataTable
 *
 * Couvre :
 * 1. Rendu initial — affiche le skeleton de chargement
 * 2. Après chargement — affiche les utilisateurs mockés
 * 3. Champ recherche — déclenche le fetch avec debounce
 * 4. Bouton export CSV — génère le téléchargement
 *
 * @ticket SP-472
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockGetAllUsersAdmin = vi.fn()

vi.mock('@/lib/actions/admin-users', () => ({
  getAllUsersAdmin: (...args: unknown[]) => mockGetAllUsersAdmin(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/app/admin/users',
}))

// Import après mocks
import { UsersDataTable } from '@/app/app/admin/users/_components/UsersDataTable'

// ============================================================================
// Fixtures
// ============================================================================

const mockUsersData = {
  users: [
    {
      id: 'user-1',
      email: 'alice@acme.com',
      name: 'Alice Martin',
      role: 'DIRECTOR',
      isActive: true,
      companyId: 'comp-1',
      companyName: 'Acme Corp',
      createdAt: new Date('2025-06-01'),
      lastLoginAt: new Date('2026-02-20'),
    },
    {
      id: 'user-2',
      email: 'bob@techcorp.com',
      name: 'Bob Dupont',
      role: 'EMPLOYEE',
      isActive: false,
      companyId: 'comp-2',
      companyName: 'TechCorp',
      createdAt: new Date('2025-09-15'),
      lastLoginAt: null,
    },
  ],
  total: 2,
}

// ============================================================================
// Tests
// ============================================================================

describe('UsersDataTable (SP-472)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllUsersAdmin.mockResolvedValue(mockUsersData)
  })

  // 1. Rendu initial — skeleton de chargement
  it('affiche le skeleton de chargement au montage', () => {
    // Ne résoudre jamais pour rester en loading
    mockGetAllUsersAdmin.mockReturnValue(new Promise(() => {}))

    render(<UsersDataTable />)

    expect(
      screen.getByRole('status', { name: /chargement des utilisateurs/i })
    ).toBeInTheDocument()
  })

  // 2. Après chargement — affiche les utilisateurs
  it('affiche les utilisateurs après chargement', async () => {
    render(<UsersDataTable />)

    await waitFor(() => {
      expect(screen.getByText('Alice Martin')).toBeInTheDocument()
    })

    expect(screen.getByText('alice@acme.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Dupont')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Actif')).toBeInTheDocument()
    expect(screen.getByText('Inactif')).toBeInTheDocument()
  })

  // 3. Recherche avec debounce
  it('déclenche un fetch filtré après saisie dans le champ recherche', async () => {
    render(<UsersDataTable />)

    // Attendre le chargement initial
    await waitFor(() => {
      expect(screen.getByText('Alice Martin')).toBeInTheDocument()
    })

    // Reset pour compter uniquement les appels suivants
    mockGetAllUsersAdmin.mockClear()
    mockGetAllUsersAdmin.mockResolvedValue({ users: [], total: 0 })

    // Taper dans le champ recherche
    const searchInput = screen.getByTestId('users-search')
    fireEvent.change(searchInput, { target: { value: 'alice' } })

    // Attendre que le debounce se déclenche (300ms) et que le fetch soit appelé
    await waitFor(() => {
      expect(mockGetAllUsersAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'alice',
          page: 1,
        })
      )
    })
  })

  // 4. Export CSV
  it('génère un téléchargement CSV au clic sur Export', async () => {
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    const mockAnchorClick = vi.fn()

    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    // Sauvegarder l'original et monkey-patch pour intercepter la création de <a>
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = ((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        el.click = mockAnchorClick
      }
      return el
    }) as typeof document.createElement

    render(<UsersDataTable />)

    await waitFor(() => {
      expect(screen.getByText('Alice Martin')).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: /export csv/i })
    fireEvent.click(exportButton)

    expect(mockCreateObjectURL).toHaveBeenCalledOnce()
    expect(mockAnchorClick).toHaveBeenCalledOnce()
    expect(mockRevokeObjectURL).toHaveBeenCalledOnce()

    // Restaurer
    document.createElement = originalCreateElement
  })
})
