/**
 * Tests unitaires pour ContactModal
 *
 * Couvre :
 * 1. Bouton "Contacter" visible
 * 2. Le dialog s'ouvre au clic
 * 3. Validation — sujet vide → message d'erreur visible
 * 4. Soumission valide → appelle sendAdminMessageToCompany()
 *
 * @ticket SP-474
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const { mockSendAdminMessage, MockAdminMessageSchema } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { z } = require('zod') as typeof import('zod')
  return {
    mockSendAdminMessage: vi.fn(),
    MockAdminMessageSchema: z.object({
      companyId: z.string().min(1),
      subject: z.string().min(3).max(150),
      message: z.string().min(10).max(2000),
      category: z.enum(['information', 'facturation', 'technique', 'autre']),
    }),
  }
})

vi.mock('@/lib/actions/admin-contact', () => ({
  AdminMessageSchema: MockAdminMessageSchema,
  sendAdminMessageToCompany: (...args: unknown[]) =>
    mockSendAdminMessage(...args),
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
  usePathname: () => '/app/admin/companies/comp-1',
}))

vi.mock('@/components/toast/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    message: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
    custom: vi.fn(),
    getHistory: vi.fn(() => []),
    getToasts: vi.fn(() => []),
  }),
}))

// Import après mocks
import { ContactModal } from '@/app/app/admin/companies/[id]/_components/ContactModal'

// ============================================================================
// Tests
// ============================================================================

describe('ContactModal (SP-474)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendAdminMessage.mockResolvedValue({
      success: true,
      sentCount: 1,
      errors: [],
    })
  })

  // 1. Bouton "Contacter" visible
  it('affiche le bouton Contacter', () => {
    render(<ContactModal companyId="comp-1" companyName="Test Corp" />)

    expect(screen.getByTestId('contact-button')).toBeInTheDocument()
    expect(screen.getByText('Contacter')).toBeInTheDocument()
  })

  // 2. Dialog s'ouvre au clic
  it('ouvre le dialog au clic sur Contacter', async () => {
    render(<ContactModal companyId="comp-1" companyName="Test Corp" />)

    fireEvent.click(screen.getByTestId('contact-button'))

    await waitFor(() => {
      expect(screen.getByText('Contacter Test Corp')).toBeInTheDocument()
    })

    expect(screen.getByTestId('contact-subject')).toBeInTheDocument()
    expect(screen.getByTestId('contact-message')).toBeInTheDocument()
    expect(screen.getByTestId('contact-submit')).toBeInTheDocument()
  })

  // 3. Validation — sujet vide → erreur
  it('affiche une erreur si le sujet est vide', async () => {
    render(<ContactModal companyId="comp-1" companyName="Test Corp" />)

    fireEvent.click(screen.getByTestId('contact-button'))

    await waitFor(() => {
      expect(screen.getByTestId('contact-submit')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('contact-submit'))

    await waitFor(() => {
      const errorMessages = screen.getAllByText(/at least/i)
      expect(errorMessages.length).toBeGreaterThan(0)
    })
  })

  // 4. Soumission valide → appelle la Server Action
  it('appelle sendAdminMessageToCompany avec les bonnes données', async () => {
    render(<ContactModal companyId="comp-1" companyName="Test Corp" />)

    fireEvent.click(screen.getByTestId('contact-button'))

    await waitFor(() => {
      expect(screen.getByTestId('contact-subject')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('contact-subject'), {
      target: { value: 'Test sujet important' },
    })

    fireEvent.change(screen.getByTestId('contact-message'), {
      target: {
        value:
          'Ceci est un message de test assez long pour passer la validation.',
      },
    })

    fireEvent.click(screen.getByTestId('contact-submit'))

    await waitFor(() => {
      expect(mockSendAdminMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'comp-1',
          subject: 'Test sujet important',
          message:
            'Ceci est un message de test assez long pour passer la validation.',
          category: 'information',
        })
      )
    })
  })
})
