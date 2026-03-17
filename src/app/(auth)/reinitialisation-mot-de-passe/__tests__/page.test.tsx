/**
 * Tests unitaires pour ResetPasswordPage
 *
 * @ticket SP-263
 * @description Tests de rendu selon la présence du token
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock du composant ResetPasswordForm
vi.mock('@/components/auth', () => ({
  ResetPasswordForm: ({ token }: { token: string }) => (
    <div data-testid="reset-password-form" data-token={token}>
      Mocked ResetPasswordForm
    </div>
  ),
}))

// Mock de next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

// Import après les mocks - on doit tester le composant directement
// car c'est un Server Component async
describe('ResetPasswordPage', () => {
  // ==========================================================================
  // TESTS DE RENDU AVEC TOKEN
  // ==========================================================================

  describe('Avec token valide', () => {
    it('renders ResetPasswordForm when token is present', async () => {
      // Import dynamique du composant
      const { default: ResetPasswordPage } = await import('../page')

      // Render avec searchParams contenant un token
      render(
        await ResetPasswordPage({
          searchParams: Promise.resolve({ token: 'valid-token-123' }),
        })
      )

      expect(screen.getByTestId('reset-password-form')).toBeInTheDocument()
    })

    it('passes token to ResetPasswordForm', async () => {
      const { default: ResetPasswordPage } = await import('../page')

      render(
        await ResetPasswordPage({
          searchParams: Promise.resolve({ token: 'my-token-abc' }),
        })
      )

      const form = screen.getByTestId('reset-password-form')
      expect(form).toHaveAttribute('data-token', 'my-token-abc')
    })

    it('renders page header with token', async () => {
      const { default: ResetPasswordPage } = await import('../page')

      render(
        await ResetPasswordPage({
          searchParams: Promise.resolve({ token: 'valid-token' }),
        })
      )

      expect(
        screen.getByRole('heading', { name: /nouveau mot de passe/i })
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // TESTS DE RENDU SANS TOKEN
  // ==========================================================================

  describe('Sans token', () => {
    it('shows error when token is missing', async () => {
      const { default: ResetPasswordPage } = await import('../page')

      render(
        await ResetPasswordPage({
          searchParams: Promise.resolve({}),
        })
      )

      expect(
        screen.getByRole('heading', { name: /lien invalide/i })
      ).toBeInTheDocument()
    })

    it('shows link to request new token', async () => {
      const { default: ResetPasswordPage } = await import('../page')

      render(
        await ResetPasswordPage({
          searchParams: Promise.resolve({}),
        })
      )

      const newLinkButton = screen.getByRole('link', {
        name: /demander un nouveau lien/i,
      })
      expect(newLinkButton).toHaveAttribute('href', '/mot-de-passe-oublie')
    })

    it('shows link back to login when token missing', async () => {
      const { default: ResetPasswordPage } = await import('../page')

      render(
        await ResetPasswordPage({
          searchParams: Promise.resolve({}),
        })
      )

      const loginLink = screen.getByRole('link', { name: /retour/i })
      expect(loginLink).toHaveAttribute('href', '/connexion')
    })

    it('does not render ResetPasswordForm when token missing', async () => {
      const { default: ResetPasswordPage } = await import('../page')

      render(
        await ResetPasswordPage({
          searchParams: Promise.resolve({}),
        })
      )

      expect(
        screen.queryByTestId('reset-password-form')
      ).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // TESTS AVEC TOKEN UNDEFINED
  // ==========================================================================

  describe('Avec token undefined', () => {
    it('shows error when token is undefined', async () => {
      const { default: ResetPasswordPage } = await import('../page')

      render(
        await ResetPasswordPage({
          searchParams: Promise.resolve({ token: undefined }),
        })
      )

      expect(
        screen.getByRole('heading', { name: /lien invalide/i })
      ).toBeInTheDocument()
    })
  })
})
