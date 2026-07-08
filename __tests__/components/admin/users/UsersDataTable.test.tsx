/**
 * Tests unitaires pour UsersDataTable
 *
 * Couvre :
 * 1. Rendu initial — affiche le skeleton de chargement
 * 2. Après chargement — affiche les utilisateurs mockés
 * 3. Champ recherche — déclenche le fetch avec debounce
 * 4. Bouton export CSV — génère le téléchargement
 * 5. Badge de vérification email (SP-543)
 * 6. Renvoi d'email de vérification (SP-543)
 *
 * @ticket SP-472, SP-543
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockGetAllUsersAdmin = vi.fn()
const mockGetCompanyOptionsAdmin = vi.fn()
const mockResendVerificationEmailAdmin = vi.fn()

vi.mock('@/lib/actions/admin-users', () => ({
  getAllUsersAdmin: (...args: unknown[]) => mockGetAllUsersAdmin(...args),
  getCompanyOptionsAdmin: (...args: unknown[]) =>
    mockGetCompanyOptionsAdmin(...args),
  resendVerificationEmailAdmin: (...args: unknown[]) =>
    mockResendVerificationEmailAdmin(...args),
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

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    update: vi.fn(),
    data: null,
    status: 'authenticated',
  }),
}))

const mockImpersonate = vi.fn()
vi.mock('@/hooks', () => ({
  useIsImpersonating: () => false,
  useImpersonate: () => ({ impersonate: mockImpersonate }),
}))

const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
  }),
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
      emailVerified: new Date('2025-06-02'),
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
      emailVerified: null,
      companyId: 'comp-2',
      companyName: 'TechCorp',
      createdAt: new Date('2025-09-15'),
      lastLoginAt: null,
    },
    {
      id: 'user-3',
      email: 'carol@acme.com',
      name: 'Carol Lambert',
      role: 'MANAGER',
      isActive: true,
      emailVerified: null,
      companyId: 'comp-1',
      companyName: 'Acme Corp',
      createdAt: new Date('2026-01-10'),
      lastLoginAt: null,
    },
  ],
  total: 3,
}

// ============================================================================
// Tests
// ============================================================================

describe('UsersDataTable (SP-472)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllUsersAdmin.mockResolvedValue(mockUsersData)
    mockGetCompanyOptionsAdmin.mockResolvedValue([
      { id: 'comp-1', name: 'Acme Corp' },
      { id: 'comp-2', name: 'TechCorp' },
    ])
    mockResendVerificationEmailAdmin.mockResolvedValue({ success: true })
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
  // Note: table desktop + cards mobile sont dans le DOM (jsdom ignore CSS media queries)
  // donc on utilise getAllByText pour les éléments dupliqués
  it('affiche les utilisateurs après chargement', async () => {
    render(<UsersDataTable />)

    await waitFor(() => {
      expect(screen.getAllByText('Alice Martin').length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText('alice@acme.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob Dupont').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Actif').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Inactif').length).toBeGreaterThan(0)
  })

  // 3. Recherche avec debounce
  it('déclenche un fetch filtré après saisie dans le champ recherche', async () => {
    render(<UsersDataTable />)

    // Attendre le chargement initial
    await waitFor(() => {
      expect(screen.getAllByText('Alice Martin').length).toBeGreaterThan(0)
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
      expect(screen.getAllByText('Alice Martin').length).toBeGreaterThan(0)
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

// ============================================================================
// SP-543 — Badge de vérification + renvoi email
// ============================================================================

describe('UsersDataTable (SP-543)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllUsersAdmin.mockResolvedValue(mockUsersData)
    mockGetCompanyOptionsAdmin.mockResolvedValue([
      { id: 'comp-1', name: 'Acme Corp' },
    ])
    mockResendVerificationEmailAdmin.mockResolvedValue({ success: true })
  })

  it('affiche les badges de vérification email', async () => {
    render(<UsersDataTable />)

    await waitFor(() => {
      expect(screen.getAllByText('Alice Martin').length).toBeGreaterThan(0)
    })

    // Alice vérifiée, Bob et Carol non vérifiés (x2 : table + cards mobile)
    expect(screen.getAllByText('Vérifié').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Non vérifié').length).toBeGreaterThan(0)
  })

  it("le bouton de renvoi n'apparaît que pour les comptes actifs non vérifiés", async () => {
    render(<UsersDataTable />)

    await waitFor(() => {
      expect(screen.getAllByText('Carol Lambert').length).toBeGreaterThan(0)
    })

    // Seule Carol (non vérifiée + active) a le bouton — Alice est vérifiée,
    // Bob est désactivé. x2 pour table desktop + card mobile.
    const resendButtons = screen.getAllByTestId('resend-verification-btn')
    expect(resendButtons).toHaveLength(2)
    resendButtons.forEach((btn) => {
      expect(btn).toHaveAttribute(
        'aria-label',
        expect.stringContaining('carol@acme.com')
      )
    })
  })

  it("renvoie l'email de vérification au clic et affiche le toast succès", async () => {
    render(<UsersDataTable />)

    await waitFor(() => {
      expect(screen.getAllByText('Carol Lambert').length).toBeGreaterThan(0)
    })

    const resendButton = screen.getAllByTestId('resend-verification-btn')[0]
    fireEvent.click(resendButton!)

    await waitFor(() => {
      expect(mockResendVerificationEmailAdmin).toHaveBeenCalledWith('user-3')
    })
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringContaining('carol@acme.com')
      )
    })
  })

  it("affiche le toast d'erreur si le renvoi échoue (rate limit)", async () => {
    mockResendVerificationEmailAdmin.mockResolvedValue({
      success: false,
      error:
        'Limite atteinte : 3 renvois maximum par heure pour cet utilisateur',
    })

    render(<UsersDataTable />)

    await waitFor(() => {
      expect(screen.getAllByText('Carol Lambert').length).toBeGreaterThan(0)
    })

    const resendButton = screen.getAllByTestId('resend-verification-btn')[0]
    fireEvent.click(resendButton!)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining('Limite atteinte')
      )
    })
  })

  it("affiche le bouton d'impersonation pour les utilisateurs rattachés à une entreprise", async () => {
    render(<UsersDataTable />)

    await waitFor(() => {
      expect(screen.getAllByText('Alice Martin').length).toBeGreaterThan(0)
    })

    // Les 3 users ont un companyId et ne sont pas SYSTEM_ADMIN
    // → 3 users x2 (table + cards) = 6 boutons
    const impersonateButtons = screen.getAllByTestId('impersonate-user-btn')
    expect(impersonateButtons.length).toBeGreaterThan(0)
  })
})
