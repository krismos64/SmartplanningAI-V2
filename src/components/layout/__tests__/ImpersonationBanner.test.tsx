/**
 * Tests unitaires pour ImpersonationBanner
 *
 * @ticket SP-453
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockPush = vi.fn()
const mockUpdateSession = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}))

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    update: mockUpdateSession,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from 'sonner'
import { ImpersonationBanner } from '../ImpersonationBanner'

// ============================================================================
// Helpers
// ============================================================================

const defaultProps = {
  companyName: 'TechCorp',
  userEmail: 'director@techcorp.com',
}

// ============================================================================
// Tests
// ============================================================================

describe('ImpersonationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("affiche la bannière avec le nom de l'entreprise et l'email", () => {
    render(<ImpersonationBanner {...defaultProps} />)

    expect(screen.getByTestId('impersonation-banner')).toBeInTheDocument()
    expect(screen.getByTestId('impersonation-banner-text')).toHaveTextContent(
      'TechCorp'
    )
    expect(screen.getByTestId('impersonation-banner-text')).toHaveTextContent(
      'director@techcorp.com'
    )
  })

  it('affiche le bouton "Quitter le mode support"', () => {
    render(<ImpersonationBanner {...defaultProps} />)

    const button = screen.getByTestId('quit-impersonation-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Quitter le mode support')
  })

  it('appelle DELETE /api/admin/impersonate au clic sur quitter', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
    global.fetch = mockFetch
    mockUpdateSession.mockResolvedValue(undefined)

    render(<ImpersonationBanner {...defaultProps} />)

    fireEvent.click(screen.getByTestId('quit-impersonation-button'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/impersonate', {
        method: 'DELETE',
      })
    })
  })

  it('met à jour la session et redirige après succès', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
    mockUpdateSession.mockResolvedValue(undefined)

    render(<ImpersonationBanner {...defaultProps} />)

    fireEvent.click(screen.getByTestId('quit-impersonation-button'))

    await waitFor(() => {
      expect(mockUpdateSession).toHaveBeenCalledWith({
        isImpersonating: false,
        originalAdminId: null,
        impersonatedUserId: null,
        impersonatedCompanyId: null,
        impersonatedUserEmail: null,
        impersonatedCompanyName: null,
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/app/admin/companies')
    })
  })

  it('affiche un spinner pendant le chargement', async () => {
    // fetch qui ne se résout jamais pendant le test
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))

    render(<ImpersonationBanner {...defaultProps} />)

    const button = screen.getByTestId('quit-impersonation-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })
  })

  it("affiche un toast d'erreur si l'API échoue", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Aucune impersonation active' }),
    })

    render(<ImpersonationBanner {...defaultProps} />)

    fireEvent.click(screen.getByTestId('quit-impersonation-button'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erreur', {
        description: 'Aucune impersonation active',
      })
    })
  })

  it("a le rôle status pour l'accessibilité", () => {
    render(<ImpersonationBanner {...defaultProps} />)

    expect(screen.getByTestId('impersonation-banner')).toHaveAttribute(
      'role',
      'status'
    )
  })
})
